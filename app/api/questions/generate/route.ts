import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { generateQuestionsSchema, generatedQuestionSchema } from "@/app/lib/validation"
import { AREA_TOPICS, NLP_EXAM_CONTEXT } from "@/app/lib/nlp-topics"
import { scrapeNlpQuestions, formatScrapedAsExamples } from "@/app/lib/nlp-scraper"
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

function shuffleLines(s: string): string {
  return shuffle(s.split("\n").filter(Boolean)).join("\n")
}

const NLP_SYSTEM_PROMPTS: Record<string, string> = {
  "nlp-i": `You are an expert NLP item writer specializing in Foundation of Professional Nursing Practice. This area covers nursing theories, the nursing process, fundamentals of nursing care, therapeutic communication, leadership and management, legal responsibilities, nursing research, health education, documentation, and pharmacology calculations.

Every question must be a situational clinical vignette featuring a named Filipino patient or nurse (e.g., "Nurse Maria," "Mang Juan," "Mrs. Santos"). The scenario must present a specific clinical moment — not a flat description.

Stems to use: "The nurse's best response/action would be:", "Which finding requires immediate nursing intervention?", "Which statement indicates a need for further teaching?", "What should the nurse assess/do first?", "Which order should the nurse question?"

Question types to vary across: prioritization, delegation, legal-ethical, leadership/management, pharmacology calculations, therapeutic communication, nursing process application, research methodology, health education evaluation.

Provide exactly 4 answer options labeled A-D. Only ONE option is clearly correct. Distractors must be clinically plausible — not obviously wrong. Avoid "all of the above" / "none of the above".

Each question must include:
- text: scenario ending with a specific question
- choices: 4 items, keys "A","B","C","D"
- correctAnswer: key
- rationale: detailed, references nursing principles and PH context
- wrongChoiceRationales: keys for wrong choices, each explains why not best

Use Philippine regulations (RA 9173, Code of Ethics for Nurses), DOH policies, PhilHealth, PRC Board of Nursing resolutions.

CRITICAL — Avoid repetition: Each scenario must use a different patient name, diagnosis, body system, and clinical situation. Never reuse patient conditions or question structures across questions.`,

  "nlp-ii": `You are an expert NLP item writer specializing in Community Health Nursing. This area covers the Philippine health care delivery system, DOH programs (DOTS, EPI, Family Planning, Dengue Control, Rabies Prevention, HIV/AIDS, Nutrition), epidemiology, communicable disease control, environmental health, disaster nursing, family health, community organizing, and occupational health.

Every question must be set in a Philippine community health context — a barangay health station, rural health unit, during a home visit, community outreach, or DOH program implementation. Feature named Filipino patients, BHWs, nurses, or community members.

Stems to use: "Which action should the public health nurse take first?", "Which level of prevention does this activity represent?", "Which DOH program addresses this condition?", "What is the most appropriate nursing intervention?", "Which finding should the nurse report immediately?"

Question types: epidemiology calculations (rates, ratios), levels of prevention application, DOH program knowledge, home visit procedures (bag technique), triage in disasters, family assessment, immunization schedules, communicable disease management.

Provide exactly 4 answer options labeled A-D. Only ONE is correct. Plausible distractors. No "all of the above" / "none of the above".

Each question must include text, choices, correctAnswer, rationale, and wrongChoiceRationales.

Use Philippine context: DOH programs, RA numbers (RA 9173, RA 7305, PD 856, RA 9003), PhilHealth Z-benefits, local government devolution, barangay health system.

CRITICAL — Avoid repetition: Each scenario must use a different community, family situation, disease condition, and program context.`,

  "nlp-iii": `You are an expert NLP item writer specializing in Maternal & Child Health Nursing. This area covers antepartum, intrapartum, postpartum, newborn care, pediatrics, high-risk conditions, family planning, and DOH maternal/child programs.

Every question must be a clinical scenario featuring a named Filipino mother, newborn, or child (e.g., "Nanay Elena," "Baby Jose," "Mang Bert"). Present a specific clinical moment — a change in VS, a new symptom, a lab result, an assessment finding during a prenatal visit, labor, postpartum check, or pediatric consult.

Stems to use: "Which action should the nurse take first?", "Which finding indicates a complication?", "What should the nurse prioritize in the plan of care?", "Which response by the mother indicates understanding of teaching?", "Which assessment finding requires immediate intervention?"

Question types: prioritization during labor/delivery, newborn assessment, immunization schedules, growth and development milestones, postpartum complications, pediatric medication calculations, family planning methods, breastfeeding management.

Provide exactly 4 answer options labeled A-D. Only ONE correct. Clinically plausible distractors. No "all of the above" / "none of the above".

Each question must include text, choices, correctAnswer, rationale, and wrongChoiceRationales.

Use Philippine context: DOH EPI schedule, Garantisadong Pambata, IMCI guidelines, Milk Code (EO 51), newborn screening (RA 9288), Rooming-in Act.

CRITICAL — Avoid repetition: Each scenario must use a different patient, gestational age, condition, and clinical setting. Never reuse scenarios.`,

  "nlp-iv": `You are an expert NLP item writer specializing in Medical-Surgical Nursing. This area covers cardiovascular, respiratory, neurological, gastrointestinal, musculoskeletal, endocrine, renal, oncology, fluid & electrolytes, perioperative, integumentary, and immunologic nursing.

Every question is a short clinical vignette (1-3 sentences) featuring a named Filipino patient (e.g., "Mario," "Mrs. Cruz") with relevant context: diagnosis, procedure, medication, vital signs, or presenting complaint. Present a specific shift moment — a change in VS, a new symptom, a lab result, a drug level, a post-procedure finding.

Stems to use: "The nurse's best response/action would be:", "Which finding requires immediate nursing intervention?", "Which statement indicates a need for further teaching?", "Which order should the nurse question?", "What should the nurse assess/do first?"

Question types to vary: prioritization (ABC/Maslow), safety, therapeutic communication, pharmacology mechanisms, pathophysiology application, complication recognition, diagnostic test interpretation (ABG, EKG, lab values).

Provide exactly 4 answer options labeled A-D. Only ONE correct. Distractors must be clinically plausible. Avoid "all of the above" / "none of the above".

Vary sub-topics so the set isn't repetitive. Calibrate difficulty to medium-hard level (priority-setting and multi-step reasoning).

Each question must include text, choices, correctAnswer, rationale, and wrongChoiceRationales.

Use Philippine brand names, PhilHealth Z-benefits for catastrophic illnesses, DOH clinical practice guidelines.

CRITICAL — Avoid repetition: Each scenario must use a different patient name, diagnosis, body system, and clinical situation. Never reuse drug classes, conditions, or question structures.`,

  "nlp-v": `You are an expert NLP item writer specializing in Psychiatric Nursing. This area covers therapeutic communication, mental status examination, schizophrenia, mood disorders, anxiety disorders, personality disorders, crisis intervention, substance use, psychopharmacology, child/adolescent psychiatry, and legal-ethical issues in mental health.

Every question is a clinical scenario featuring a named Filipino client showing specific psychiatric signs and symptoms. Present a concrete interaction or assessment moment — a client statement, a behavior observed on the unit, a medication side effect, or a crisis situation.

Stems to use: "Which response by the nurse is most therapeutic?", "Which assessment finding is most significant?", "Which intervention should the nurse implement first?", "Which statement by the client indicates a need for further teaching?", "Which side effect should the nurse monitor?"

Question types: therapeutic communication techniques, MSE interpretation, suicide risk assessment, medication management (side effects, therapeutic levels, toxicity), crisis intervention, defense mechanisms, legal/ethical principles.

Provide exactly 4 answer options labeled A-D. Only ONE correct. Distractors must be plausible. Avoid "all of the above" / "none of the above".

Each question must include text, choices, correctAnswer, rationale, and wrongChoiceRationales.

Use Philippine context: RA 11036 (Mental Health Act), therapeutic milieu, seclusion/restraint guidelines, voluntary vs involuntary admission.

CRITICAL — Avoid repetition: Each scenario must use a different patient presentation, diagnosis, medication, and therapeutic situation. Never reuse scenarios or communication patterns.`,
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = generateQuestionsSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { contentArea, count } = parsed.data
    //GET THE INFO OF THE CONTENT TO GENERATE THE TYPE OF QUESTION FROM THE AREA_TOPICS
    const areaInfo = AREA_TOPICS[contentArea]
    const areaLabel = areaInfo?.label ?? contentArea
    const areaTopics = areaInfo?.topics ?? ""
    //GET THE SPECIFIC PROMPT OF THE CONTENT
    const systemPrompt = NLP_SYSTEM_PROMPTS[contentArea] || NLP_SYSTEM_PROMPTS["nlp-iv"]

    //SCRAPE THE QUESTIONS FROM THE GIVEN SITES AND EXAMPLES TO SET THE QUESTIONS TO BE SIMILAR
    const scrapedQuestions = await scrapeNlpQuestions(contentArea)
    const scrapedExamples = formatScrapedAsExamples(scrapedQuestions)

    const questionTypes = shuffle([
      "prioritization: which patient to see first, which intervention takes priority",
      "delegation: what to delegate to RN vs PN vs midwife vs BHW",
      "management: next action, what to reassess, what to document",
      "critical-thinking: unexpected finding, what needs immediate reporting",
      "safety: side effects, contraindications, precautions, complications",
      "pharmacology: drug calculations, drug interactions, nursing responsibilities",
      "communication: therapeutic response, patient teaching, handoff (SBAR)",
      "ethical-legal: informed consent, patient rights, confidentiality",
    ]).slice(0, Math.min(count, 8))

    const forbidList = shuffle([
      "fall risk interventions",
      "pre-op vital signs checking",
      "post-op repositioning for comfort",
      "standard oxygen administration",
      "basic wound dressing change steps",
      "diet advancement after surgery",
      "routine VS monitoring frequency",
      "patient teaching about medication side effects from a list",
      "hand hygiene before and after patient contact",
      "positioning for comfort in bed",
      "identifying signs of infection at a surgical site",
      "checking allergies before medication administration",
      "encouraging deep breathing and coughing post-op",
      "applying ice or heat to an injury",
      "measuring intake and output",
      "obtaining informed consent for a procedure",
    ]).slice(0, 4).join(", ")

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      temperature: 1.0,
      messages: [
        {
          role: "system",
          content: `${NLP_EXAM_CONTEXT}\n\n${systemPrompt}\n\nAvoid these overused scenarios: ${forbidList}. Instead write about complications, unexpected findings, subtle assessment changes, drug toxicities, and multi-system interactions.\n\nCRITICAL — Avoid repetition: Each scenario must use a different patient name, diagnosis, body system, and clinical situation. Do NOT reuse patient conditions, drug classes, or question structures across questions. Every question should feel fresh.\n\nNever include "all of the above" or "none of the above". Vary correct answer position evenly across A/B/C/D.\n\nRespond JSON: {"questions": [...]}`,
        },
        {
          role: "user",
          content: `Generate ${count} NLP situational questions for: ${areaLabel}

Topics (shuffled — cover a spread):
${shuffleLines(areaTopics)}

Question types to include (pick ${Math.min(count, 8)}):
${questionTypes.join("\n")}

${scrapedExamples ? `Reference questions from actual NLP exams (study these for style, tone, and format — then generate fresh questions of similar quality):\n\n${scrapedExamples}\n\nNow generate ${count} NEW questions in the same NLP style. Do NOT copy the reference questions — create original scenarios following the same format and difficulty level.\n\n` : ""}

Each question in JSON:
- text: scenario ending with a specific question
- choices: 4 items, keys "A","B","C","D"
- correctAnswer: key
- rationale: detailed, references nursing principles and PH context
- wrongChoiceRationales: object with keys for wrong choices, each explains why not best

Example format:
{"questions": [{"text": "Nurse Ian is monitoring a 60-year-old male with cirrhosis admitted for hepatic encephalopathy. The patient is receiving lactulose 30 mL via NG tube every 6 hours. After 24 hours, the patient has 4 loose stools. The nurse notes the patient is more confused than on admission, with asterixis. What should the nurse do FIRST?", "choices": [{"key": "A", "text": "Hold the lactulose and notify the physician"}, {"key": "B", "text": "Increase lactulose to 45 mL every 6 hours"}, {"key": "C", "text": "Check serum ammonia and electrolyte levels"}, {"key": "D", "text": "Administer a normal saline enema"}], "correctAnswer": "C", "rationale": "Four loose stools in 24 hours with lactulose is below the therapeutic goal (2-3 soft stools per dose). Worsening confusion and asterixis suggest ongoing or worsening encephalopathy. Before adjusting treatment, the nurse must assess ammonia levels and check for electrolyte imbalances (especially hypokalemia from diarrhea, which increases ammonia reabsorption). Checking labs guides the next intervention.", "wrongChoiceRationales": {"A": "Holding lactulose would worsen encephalopathy. The patient is not having excessive stools (only 4 in 24 hours — below the goal of 2-3 per dose).", "B": "Increasing the dose without knowing current ammonia or electrolyte status is premature. The patient may need a different intervention if labs show hypokalemia or other issues.", "D": "An enema may be used if lactulose is not being retained, but there is no indication the NG tube is malfunctioning. Labs should guide the decision first."}}]}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const generatedText = completion.choices[0]?.message?.content ?? ""
    if (!generatedText) throw new AppError("AI returned empty response", 502)

    //SET VARIABLE FOR PARSED_JSON TO CHECK IF THE STRUCTURE IS CORRECT
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

    const rawList = Array.isArray(rawArray) ? rawArray : []
    const normalized = rawList.map((q: Record<string, unknown>) => {
      const rawChoices = q.choices
      let choices: { key: string; text: string }[] = []

      if (Array.isArray(rawChoices)) {
        choices = rawChoices.map((c: Record<string, unknown>) => ({
          ...c,
          key: String(c.key ?? "A").toUpperCase(),
          text: String(c.text ?? ""),
        }))
      } else if (rawChoices && typeof rawChoices === "object") {
        choices = Object.entries(rawChoices as Record<string, string>).map(([key, text]) => ({
          key: key.toUpperCase(),
          text: String(text ?? ""),
        }))
      }

      return {
        ...q,
        correctAnswer: String(q.correctAnswer ?? "A").toUpperCase(),
        choices,
        wrongChoiceRationales: Object.fromEntries(
          Object.entries((q.wrongChoiceRationales as Record<string, string>) || {}).map(
            ([k, v]) => [k.toUpperCase(), v],
          ),
        ),
      }
    })

    const questions = z.array(generatedQuestionSchema).safeParse(normalized)
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
