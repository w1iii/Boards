import Groq from "groq-sdk"
import { z } from "zod"
import { sql } from "@/app/lib/db"
import { AREA_LABELS, type StudyMode } from "./study-concepts"

const groq = new Groq()

export const studyQuestionSchema = z
  .object({
    text: z.string().min(1),
    choices: z.record(z.string(), z.string()).refine((val) => Object.keys(val).length >= 2, {
      message: "choices needs at least 2 entries",
    }),
    correctAnswer: z.string().min(1),
    rationale: z.string().min(1),
    wrongChoiceRationales: z.record(z.string(), z.string()).refine(
      (val) => Object.keys(val).length >= 1,
      { message: "wrongChoiceRationales needs at least 1 entry" },
    ),
  })
  .transform((q, ctx) => {
    const keys = Object.keys(q.choices)
    const correctKey = q.correctAnswer.toUpperCase()
    if (!keys.includes(correctKey)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `correctAnswer ${q.correctAnswer} not among choices ${keys.join(", ")}` })
      return z.NEVER
    }
    const letters = ["A", "B", "C", "D"].filter((l) => keys.includes(l))
    return {
      text: q.text,
      choices: letters.map((key) => ({ key, text: q.choices[key] })),
      correctAnswer: correctKey,
      rationale: q.rationale,
      wrongChoiceRationales: q.wrongChoiceRationales,
    }
  })

type StudyQuestion = z.infer<typeof studyQuestionSchema>

export interface StudyBankQuestion {
  id: string
  content_area: string
  study_mode: string
  text: string
  choices: { key: string; text: string }[]
  correct_answer: string
  rationale: string
  wrong_choice_rationales: Record<string, string>
}

const LABELS = ["A", "B", "C", "D"] as const

const MODE_BRIEFS: Record<StudyMode, string> = {
  drill: "A concept drill. One concept per question, clinical scenario or direct concept, concise. Keep under 80 words.",
  recall: "A rapid-fire recall round. Short direct questions, one per question, under 60 words.",
  teach_back:
    'Use the Feynman technique. Present a concept as: "Which statement best explains [concept]?". Student picks the correct explanation. Under 80 words.',
  case:
    "A case walkthrough. Present a clinical vignette featuring a named Filipino patient. Each question is one decision point with 4 choices. Under 100 words.",
  weak_area:
    "A targeted weak-area challenge. Focus tightly on weak concepts. Can be harder. One concept per question. Under 80 words.",
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPrompt(mode: StudyMode, areaLabel: string, concepts: string[]): string {
  const conceptBlock =
    concepts.length > 0
      ? `\n\nConcepts to cover (choose a spread):\n${shuffle(concepts).map((c, i) => `${i + 1}. ${c}`).join("\n")}`
      : `\n\nCover broad topics in ${areaLabel}.`
  return `You are a nursing licensure exam tutor generating multiple-choice questions for study mode "${mode}" in ${areaLabel}.

${MODE_BRIEFS[mode]}${conceptBlock}

Requirements for EVERY question:
- Exactly 4 choices, keys "A","B","C","D". Only ONE correct. Plausible distractors.
- Never "all of the above" / "none of the above".
- Vary the correct answer position across A/B/C/D.
- Include full rationales: why the correct answer is right, AND why each wrong choice is wrong.
- Use Philippine clinical context where appropriate (DOH programs, RA numbers, brand names, Filipino patient names).

Respond JSON only: {"questions":[{"text": "...", "choices":{"A":"...","B":"...","C":"...","D":"..."}, "correctAnswer":"C", "rationale":"Why C is correct.", "wrongChoiceRationales":{"A":"Why A is wrong.","B":"Why B is wrong.","D":"Why D is wrong."}}]}

Generate up to 12 questions.`
}

async function generateBatch(
  mode: StudyMode,
  contentArea: string,
  count: number,
  concepts: string[],
): Promise<{ questions: StudyQuestion[]; error?: string }> {
  const areaLabel = AREA_LABELS[contentArea] ?? contentArea

  let raw: string
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildPrompt(mode, areaLabel, concepts) },
        { role: "user", content: `Generate ${count} study questions for content area: ${areaLabel}${concepts.length ? ` covering these concepts: ${concepts.join(", ")}` : ""}` },
      ],
    })
    raw = completion.choices[0]?.message?.content ?? ""
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { questions: [], error: `Groq request failed: ${message.slice(0, 300)}` }
  }
  if (!raw) return { questions: [], error: "AI returned empty response" }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { questions: [], error: "AI returned malformed JSON" }
  }

  const rawArray = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)?.questions ?? (parsed as Record<string, unknown>)?.data ?? parsed
  const rawList = Array.isArray(rawArray) ? (rawArray as Record<string, unknown>[]) : []

  const normalized = rawList.map((q) => {
    const rawChoices = q.choices as Record<string, string> | Array<Record<string, unknown>> | undefined
    const choices: Record<string, string> = Array.isArray(rawChoices)
      ? Object.fromEntries(
          rawChoices.map((c) => [String(c.key ?? "A").toUpperCase(), String(c.text ?? "")]),
        )
      : (rawChoices ?? {})
    const wrong =
      (q.wrongChoiceRationales as Record<string, string> | undefined) ??
      (q.wrong_choice_rationales as Record<string, string> | undefined) ??
      {}
    return {
      text: String(q.text ?? ""),
      choices: Object.fromEntries(
        Object.keys(choices)
          .sort()
          .map((k) => [k.toUpperCase(), choices[k]]),
      ),
      correctAnswer: String(q.correctAnswer ?? q.correct_answer ?? "A").toUpperCase(),
      rationale: String(q.rationale ?? q.correct_rationale ?? ""),
      wrongChoiceRationales: Object.fromEntries(
        Object.entries(wrong).map(([k, v]) => [k.toUpperCase(), v]),
      ),
    }
  })

  const parsedBatch = z.array(studyQuestionSchema).safeParse(normalized)
  if (!parsedBatch.success) return { questions: [], error: "AI response failed validation" }

  return { questions: parsedBatch.data }
}

function shuffleChoices(
  choices: { key: string; text: string }[],
  shift: number,
  correctAnswer: string,
): { choices: { key: string; text: string }[]; correctAnswer: string } {
  const n = choices.length
  if (n === 0) return { choices, correctAnswer }
  const rotated = choices.map((_, i) => ({ ...choices[(i - shift + n) % n], key: LABELS[i] }))
  const correctIdx = LABELS.indexOf(correctAnswer.toUpperCase() as typeof LABELS[number])
  const newCorrect = LABELS[(correctIdx + shift) % n] ?? correctAnswer
  return { choices: rotated, correctAnswer: newCorrect }
}

function fillMissingWrong(
  choices: { key: string; text: string }[],
  correctAnswer: string,
  correctRationale: string,
  wrong: Record<string, string>,
): Record<string, string> {
  const filled = { ...wrong }
  for (const choice of choices) {
    if (choice.key === correctAnswer) continue
    if (!filled[choice.key]) {
      filled[choice.key] = `Choice ${choice.key} is not the best response. ${correctRationale}`
    }
  }
  return filled
}

const BANK_TARGET = 12

export async function ensureStudyBank(
  contentArea: string,
  mode: StudyMode,
  minCount: number,
  concepts: string[] = [],
): Promise<void> {
  const count = await sql`
    SELECT COUNT(*)::int as n FROM study_questions
    WHERE content_area = ${contentArea} AND study_mode = ${mode}
  `
  const n = Number(count.rows[0]?.n ?? 0)
  if (n >= minCount) return

  const seen = new Set<string>()
  const all: StudyQuestion[] = []
  const maxAttempts = 4

  for (let attempt = 0; attempt < maxAttempts && all.length < BANK_TARGET; attempt++) {
    const want = Math.max(4, Math.min(BANK_TARGET - all.length, 6))
    const batch = await generateBatch(mode, contentArea, want, concepts)
    for (const q of batch.questions) {
      const key = q.text.trim().toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      all.push(q)
    }
    if (batch.error && attempt === maxAttempts - 1) break
  }

  if (all.length === 0) return

  for (const q of all) {
    const shift = Math.floor(Math.random() * 4)
    const rotated = shuffleChoices(q.choices, shift, q.correctAnswer)
    const filledWrong = fillMissingWrong(rotated.choices, rotated.correctAnswer, q.rationale, q.wrongChoiceRationales)
    await sql`
      INSERT INTO study_questions (content_area, study_mode, text, choices, correct_answer, rationale, wrong_choice_rationales)
      VALUES (${contentArea}, ${mode}, ${q.text}, ${JSON.stringify(rotated.choices)}::jsonb, ${rotated.correctAnswer}, ${q.rationale}, ${JSON.stringify(filledWrong)}::jsonb)
    `
  }
}

export async function getStudyBank(
  contentArea: string,
  mode: StudyMode,
  count: number,
): Promise<StudyBankQuestion[]> {
  const result = await sql`
    SELECT * FROM study_questions
    WHERE content_area = ${contentArea} AND study_mode = ${mode}
    ORDER BY random()
    LIMIT ${count}
  `
  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content_area: row.content_area as string,
    study_mode: row.study_mode as string,
    text: row.text as string,
    choices: row.choices as StudyBankQuestion["choices"],
    correct_answer: row.correct_answer as string,
    rationale: row.rationale as string,
    wrong_choice_rationales: (row.wrong_choice_rationales as Record<string, string>) ?? {},
  }))
}