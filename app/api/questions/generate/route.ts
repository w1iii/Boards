import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { generateQuestionsSchema, generatedQuestionSchema } from "@/app/lib/validation"
import { AREA_TOPICS } from "@/app/lib/pnle-topics"
import Groq from "groq-sdk"
import { z } from "zod"

const groq = new Groq()

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = generateQuestionsSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { contentArea, count } = parsed.data
    const areaInfo = AREA_TOPICS[contentArea]
    const areaLabel = areaInfo?.label ?? contentArea
    const areaTopics = areaInfo?.topics ?? ""

    const questionTypes = shuffle([
      "prioritization: which patient to see first, which intervention takes priority",
      "delegation: what to delegate to RN vs PN vs HHA vs midwife",
      "management: next action, what to reassess, what to document",
      "critical-thinking: unexpected finding, what needs immediate reporting",
      "safety: side effects, contraindications, precautions, complications",
      "pharmacology: drug calculations, drug interactions, nursing responsibilities for specific PH meds",
      "communication: therapeutic response, patient teaching, handoff (SBAR)",
      "ethical-legal: informed consent, patient rights, do-not-resuscitate, confidentiality",
    ]).slice(0, Math.min(count, 8))

    const forbidList = shuffle([
      "fall risk interventions",
      "pre-op vital signs checking",
      "post-op repositioning for comfort",
      "standard oxygen administration",
      "basic wound dressing change steps",
      "diet advancement after surgery",
      "routine VS monitoring frequency",
    ]).slice(0, 3).join(", ")

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      temperature: 1.0,
      messages: [
        {
          role: "system",
          content: `You are a PNLE question writer for the PRC Board of Nursing. Write questions that require clinical JUDGMENT — not recall or routine tasks.

Avoid these overused scenarios: ${forbidList}. Instead write about complications, unexpected findings, subtle assessment changes, drug toxicities, and multi-system interactions.

Each scenario must feel like a real shift. Give specific: patient age, relevant history, time course, vital signs with abnormal values, specific PH meds (e.g. Biogesic, Diatabs, Loperamide, Metformin, Amlodipine), lab results with abnormal values.

Target: PNLE level of difficulty — the question should make the test-taker pause and THINK between 2-3 plausible options.

Rules:
- Every question is a clinical scenario — never a definition, recall, or "which is correct" list
- Wrong answers must be CLINICALLY PLAUSIBLE — not obviously wrong. The test-taker should hesitate.
- Never include "all of the above" or "none of the above"
- Vary correct answer position evenly across A/B/C/D
- Each wrong choice rationale explains why that option is NOT the best (specific to the scenario)
- Use Philippine brand names, DOH terminology, PhilHealth Z-benefits, local context
- Vary difficulty within batch

Respond JSON: {"questions": [...]}`,
        },
        {
          role: "user",
          content: `Generate ${count} PNLE situational questions for: ${areaLabel}

Topics:
${areaTopics}

Question types:
${questionTypes.join("\n")}

Each question:
- text: scenario ending with a specific question
- choices: 4 items, keys "A","B","C","D"
- correctAnswer: key
- rationale: detailed, references nursing principles
- wrongChoiceRationales: keys for wrong choices, each explains why not best

Example (high difficulty):
{"questions": [{"text": "Nurse Ian is monitoring a 60-year-old male with cirrhosis admitted for hepatic encephalopathy. The patient is receiving lactulose 30 mL via NG tube every 6 hours. After 24 hours, the patient has 4 loose stools. The nurse notes the patient is more confused than on admission, with asterixis. What should the nurse do FIRST?", "choices": [{"key": "A", "text": "Hold the lactulose and notify the physician"}, {"key": "B", "text": "Increase lactulose to 45 mL every 6 hours"}, {"key": "C", "text": "Check serum ammonia and electrolyte levels"}, {"key": "D", "text": "Administer a normal saline enema"},], "correctAnswer": "C", "rationale": "Four loose stools in 24 hours with lactulose is below the therapeutic goal (2-3 soft stools per dose). Worsening confusion and asterixis suggest ongoing or worsening encephalopathy. Before adjusting treatment, the nurse must assess ammonia levels and check for electrolyte imbalances (especially hypokalemia from diarrhea, which increases ammonia reabsorption). Checking labs guides the next intervention.", "wrongChoiceRationales": {"A": "Holding lactulose would worsen encephalopathy. The patient is not having excessive stools (only 4 in 24 hours — below the goal of 2-3 per dose).", "B": "Increasing the dose without knowing current ammonia or electrolyte status is premature. The patient may need a different intervention if labs show hypokalemia or other issues.", "D": "An enema may be used if lactulose is not being retained, but there is no indication the NG tube is malfunctioning. Labs should guide the decision first."}}]}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const generatedText = completion.choices[0]?.message?.content ?? ""
    if (!generatedText) throw new AppError("AI returned empty response", 502)

    let parsed_json: unknown
    try {
      parsed_json = JSON.parse(generatedText)
    } catch {
      return NextResponse.json({
        error: "AI returned malformed JSON",
        raw: generatedText,
      }, { status: 422 })
    }

    const rawArray = Array.isArray(parsed_json)
      ? parsed_json
      : (parsed_json as Record<string, unknown>)?.questions
        ?? (parsed_json as Record<string, unknown>)?.data
        ?? parsed_json

    const questions = z.array(generatedQuestionSchema).safeParse(rawArray)
    if (!questions.success) {
      return NextResponse.json({
        error: "AI response failed validation",
        raw: generatedText,
        validationErrors: questions.error.issues,
      }, { status: 422 })
    }

    const letterLabels = ["A", "B", "C", "D"] as const

    function rotateChoices<T extends { key: string }>(arr: T[], shift: number): T[] {
      const n = arr.length
      if (n === 0) return arr
      return arr.map((_, i) => ({
        ...arr[(i - shift + n) % n],
        key: letterLabels[i],
      }))
    }

    function safeCorrectKey(rawKey: string): string {
      const upper = rawKey.toUpperCase()
      return letterLabels.includes(upper as typeof letterLabels[number]) ? upper : "A"
    }

    function fillMissingWrongRationales(
      wrongRationales: Record<string, string>,
      choices: { key: string; text: string }[],
      correctAnswer: string,
      correctRationale: string,
    ): Record<string, string> {
      const filled = { ...wrongRationales }
      for (const choice of choices) {
        if (choice.key === correctAnswer) continue
        if (!filled[choice.key]) {
          filled[choice.key] = `Choice ${choice.key} ("${choice.text}") is not the best response. ${correctRationale}`
        }
      }
      return filled
    }

    const difficulties = ["easy", "medium", "hard"] as const

    const inserted = []
    for (let i = 0; i < questions.data.length; i++) {
      const q = questions.data[i]
      const shift = Math.floor(Math.random() * 4)
      const rotatedChoices = rotateChoices(q.choices, shift)
      const correctKey = safeCorrectKey(q.correctAnswer)
      const correctIdx = letterLabels.indexOf(correctKey as typeof letterLabels[number])
      const newCorrectKey = letterLabels[(correctIdx + shift) % 4]

      const rotatedWrong: Record<string, string> = {}
      for (const [key, val] of Object.entries(q.wrongChoiceRationales || {})) {
        const idx = letterLabels.indexOf(key.toUpperCase() as typeof letterLabels[number])
        if (idx !== -1) {
          rotatedWrong[letterLabels[(idx + shift) % 4]] = val
        }
      }

      const filledWrong = fillMissingWrongRationales(
        rotatedWrong,
        rotatedChoices,
        newCorrectKey,
        q.rationale,
      )

      const difficulty = difficulties[i % 3]

      const result = await sql`
        INSERT INTO questions (content_area, difficulty, text, choices, correct_answer, rationale, wrong_choice_rationales, reviewed)
        VALUES (${contentArea}, ${difficulty}, ${q.text}, ${JSON.stringify(rotatedChoices)}, ${newCorrectKey}, ${q.rationale}, ${JSON.stringify(filledWrong)}, true)
        RETURNING *
      `
      inserted.push(result.rows[0])
    }

    return NextResponse.json({
      message: `Generated ${inserted.length} questions`,
      contentArea,
      questions: inserted,
    }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
