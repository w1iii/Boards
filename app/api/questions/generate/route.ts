import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { generateQuestionsSchema, generatedQuestionSchema } from "@/app/lib/validation"
import { PNLE_EXAM_CONTEXT, AREA_TOPICS } from "@/app/lib/pnle-topics"
import Groq from "groq-sdk"
import { z } from "zod"

const groq = new Groq()

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

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `${PNLE_EXAM_CONTEXT}

You are a PNLE question writer for the PRC Board of Nursing. Your questions must be:
- Situational (Socratic method) — present a clinical scenario, not a recall question
- Aligned with the nursing process (ADPIE)
- Accurate for 2025-2026 Philippine clinical practice
- Culturally appropriate for Philippine healthcare settings
- Using Philippine brand names and DOH terminology

Always respond in valid JSON only.`,
        },
        {
          role: "user",
          content: `Generate ${count} PNLE-style situational questions for: ${areaLabel}

Topics to cover (distribute questions across these topics):
${areaTopics}

Each question must have:
- text (string): clinical scenario ending with a question
- choices (array): exactly 4 items with {key: string, text: string} — keys must be "A", "B", "C", "D"
- correctAnswer (string): the key of the correct choice. IMPORTANT: Vary the correct answer across A, B, C, D evenly. Do NOT always pick A.
- rationale (string): detailed explanation of why the correct answer is right, referencing PNLE syllabus
- wrongChoiceRationales (object): keys are the wrong choice letters, values are specific explanations of why each wrong choice is incorrect. Each must be unique and explain why that specific option is wrong — never generic.

Return a JSON object with a "questions" key containing the array. Example:
{"questions": [{"text": "...", "choices": [{"key": "A", "text": "..."}, ...], "correctAnswer": "C", "rationale": "...", "wrongChoiceRationales": {"A": "This is wrong because...", "B": "...", "D": "..."}}]}`,
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

    const inserted = []
    for (const q of questions.data) {
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

      const result = await sql`
        INSERT INTO questions (content_area, difficulty, text, choices, correct_answer, rationale, wrong_choice_rationales, reviewed)
        VALUES (${contentArea}, 'medium', ${q.text}, ${JSON.stringify(rotatedChoices)}, ${newCorrectKey}, ${q.rationale}, ${JSON.stringify(filledWrong)}, true)
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
