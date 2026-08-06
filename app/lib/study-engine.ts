import Groq from "groq-sdk"
import { z } from "zod"
import type { StudyMode } from "./study-concepts"
import { AREA_LABELS } from "./study-concepts"

const groq = new Groq()

export const studySessionSchema = z.object({
  concepts_covered: z.array(z.string()),
  weak_concepts: z.array(z.string()),
  score_pct: z.number().min(0).max(100),
})

export type StudySessionResult = z.infer<typeof studySessionSchema>

const MC_FORMAT_BLOCK = `
OUTPUT FORMAT — MULTIPLE CHOICE:
Every question MUST follow this exact format:

[Question text — clinical scenario or concept question]

A. [Choice]
B. [Choice]
C. [Choice]
D. [Choice]

Exactly 4 choices A-D. Never "all of the above" or "none of the above".

EVALUATION — CRITICAL RULE:
When the student answers, you MUST do BOTH in the same response:
1. Evaluate their choice with a brief rationale:
   - If correct: "Correct. [1-2 sentence explanation of why the chosen answer is right]."
   - If incorrect: "Incorrect. The correct answer is [X]. [1-2 sentence explanation]."
2. Present the NEXT MC question with 4 choices A-D.

Your response MUST always contain 4 choices (A, B, C, D). If you do not include 4 choices, the response is invalid.
The summary JSON must NEVER be the only content — always include the next question first.

END OF SESSION — CRITICAL RULE:
When the session ends (question limit reached or all concepts covered), you MUST still evaluate the student's last answer first with the same "Correct."/"Incorrect." format, THEN on the next line output ONLY the summary JSON. Never output the summary JSON without first evaluating the last answer.

RULES:
- One question per message. Never two questions.
- Vary correct answer position across A/B/C/D.
- NEVER use asterisks, bullet points, dashes, or any special formatting characters. Use plain text only.
- NEVER answer questions outside the nursing content area. If unrelated, say: "Please focus on the question. Let us continue." and repeat the current question.`

const SYSTEM_PROMPTS: Record<StudyMode, string> = {
  drill: `You are a nursing licensure exam tutor running a concept drill.
${MC_FORMAT_BLOCK}
- One concept at a time. One question per message. Keep every message under 80 words.
- After the last concept or when you reach the question limit, evaluate the student's last answer first, then output ONLY this JSON on its own line: {"concepts_covered": [...], "weak_concepts": [...], "score_pct": N}`,

  case: `You are a nursing tutor running a case walkthrough.
${MC_FORMAT_BLOCK}
- Present a clinical vignette as a named Filipino patient. Each decision point is an MC question.
- Ask up to 10 decision points. Keep every message under 100 words.
- After the final decision or when you reach the question limit, evaluate the student's last answer first, then output ONLY this JSON on its own line: {"concepts_covered": [...], "weak_concepts": [...], "score_pct": N}`,

  recall: `You are a nursing tutor running a rapid-fire recall session.
${MC_FORMAT_BLOCK}
- Short direct questions. One per message. Keep every message under 60 words.
- Ask up to 10 questions. After the last concept or when you reach the question limit, evaluate the student's last answer first, then output ONLY this JSON on its own line: {"concepts_covered": [...], "weak_concepts": [...], "score_pct": N}`,

  weak_area: `You are a nursing tutor running a targeted weak-area challenge.
${MC_FORMAT_BLOCK}
- The student has specific weak concepts. Drill them one concept at a time. One question per message.
- Keep every message under 80 words. Ask up to 10 questions.
- After all concepts covered or when you reach the question limit, evaluate the student's last answer first, then output ONLY this JSON on its own line: {"concepts_covered": [...], "weak_concepts": [...], "score_pct": N}`,

  teach_back: `You are a nursing tutor using the Feynman technique.
${MC_FORMAT_BLOCK}
- Present a concept as an MC question: "Which statement best explains [concept]?"
- Student picks the correct explanation. One question per message. Keep every message under 80 words.
- Ask up to 10 questions. After the concept is fully explored or when you reach the question limit, evaluate the student's last answer first, then output ONLY this JSON on its own line: {"concepts_covered": [...], "weak_concepts": [...], "score_pct": N}`,
}

export interface StudyTurn {
  role: "system" | "user" | "assistant"
  content: string
}

export interface MCQuestion {
  question: string
  choices: { key: string; text: string }[]
}

export interface StudyResponse {
  content: string
  question: MCQuestion | null
  correct_rationale: string
  incorrect_rationale: string
  summary?: StudySessionResult
}

function stripThinkingTags(text: string): string {
  return text.replace(/思考标签[\s\S]*?<\/think>/g, "").trim()
}

function parseMCQuestion(content: string): MCQuestion | null {
  const choiceStart = content.search(/^[A-D][.)]\s/m)
  if (choiceStart === -1) {
    const inlineMatch = content.match(/A[.)]\s*(.+?)\s*B[.)]\s*(.+?)\s*C[.)]\s*(.+?)\s*D[.)]\s*(.+?)(?:\s*$)/)
    if (inlineMatch) {
      return {
        question: content.slice(0, content.indexOf("A.")).trim() || content.slice(0, content.indexOf("A)")).trim(),
        choices: [
          { key: "A", text: inlineMatch[1].trim() },
          { key: "B", text: inlineMatch[2].trim() },
          { key: "C", text: inlineMatch[3].trim() },
          { key: "D", text: inlineMatch[4].trim() },
        ],
      }
    }
    return null
  }

  const beforeChoices = content.slice(0, choiceStart)
  const fromChoices = content.slice(choiceStart)

  const choiceRegex = /^[A-D][.)]\s*(.+)/gm
  const choices: { key: string; text: string }[] = []
  let match
  while ((match = choiceRegex.exec(fromChoices)) !== null) {
    choices.push({ key: match[0][0], text: match[1].trim() })
  }
  if (choices.length !== 4) return null

  const questionText = beforeChoices
    .replace(/^\s*[Ii]ncorrect\.\s*[Tt]he correct answer is [A-D][.!\s]+[^.\n]*\.\s*/m, "")
    .replace(/^\s*[Cc]orrect\.?\s*(?:Next question|Here(?:'s| is) the next|Moving on)[^:]*:\s*/im, "")
    .replace(/^\s*[Cc]orrect\.?\s*/m, "")
    .replace(/^\s*(?:That'?s right|Indeed|Exactly|Correct answer|You got it)[.!]\s*/im, "")
    .replace(/^\s*Next question:\s*/im, "")
    .trim()

  return { question: questionText, choices }
}

function extractRationale(content: string): string {
  const incorrectPatterns = [
    /[Ii]ncorrect.*?[Tt]he correct answer is [A-D][.!\s]+(.+?)(?:[.\n])/,
    /[Ii]ncorrect.*?[Cc]orrect answer is [A-D][.!\s]+(.+?)(?:[.\n])/,
    /[Ii]ncorrect\.\s*(.+?)(?:\n|$)/,
  ]
  for (const pat of incorrectPatterns) {
    const m = content.match(pat)
    if (m && m[1].trim().length > 5) return m[1].trim()
  }

  const correctPatterns = [
    /^[Cc]orrect[.!]\s+(.+?)(?:\s+Here(?:'s| is)|\s+Moving on|\s+Next question|\s+Now[,.]|\s+Let(?:'s| us)|\s+Try this)/,
    /^(?:That'?s right|Indeed|Exactly|You got it)[.!]\s+(.+?)(?:\s+Here(?:'s| is)|\s+Moving on|\s+Next question|\s+Now[,.]|\s+Let(?:'s| us)|\s+Try this)/,
    /^[Cc]orrect[.!]\s+(.+)$/,
  ]
  for (const pat of correctPatterns) {
    const m = content.match(pat)
    if (m && m[1].trim().length > 10) return m[1].trim()
  }

  return ""
}

function isCorrectResponse(content: string): boolean {
  return /^\s*(?:[Cc]orrect|That'?s right|Indeed|Exactly|You got it|Correct answer)/.test(content)
}

export async function getStudyResponse(
  messages: StudyTurn[],
  mode: StudyMode,
  contentArea: string,
  options: { questionCount?: number; conceptList?: string[]; maxQuestions?: number } = {},
): Promise<StudyResponse> {
  const { questionCount = 0, conceptList = [], maxQuestions = 10 } = options

  const areaLabel = AREA_LABELS[contentArea] ?? contentArea

  const progressBlock = [
    `\n\n--- SESSION PROGRESS ---`,
    `Question ${questionCount + 1} of ${maxQuestions} max.`,
    conceptList.length > 0 ? `Concepts to cover (${conceptList.length} total):\n${conceptList.map((c, i) => `${i + 1}. ${c}`).join("\n")}` : `Cover broad topics in ${areaLabel}.`,
    `CRITICAL: You MUST output a multiple choice question with exactly 4 choices (A, B, C, D) in this response.`,
    `Do NOT output the summary JSON yet. You have only asked ${questionCount} of ${maxQuestions} questions.`,
    `--- END PROGRESS ---`,
  ].join("\n")

  const systemMessage: StudyTurn = {
    role: "system",
    content: `${SYSTEM_PROMPTS[mode]}\n\nContent area: ${areaLabel}${progressBlock}`,
  }

  const fullMessages = [systemMessage, ...messages]

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.7,
    messages: fullMessages,
  })

  const raw = stripThinkingTags(completion.choices[0]?.message?.content ?? "")

  const summaryMatch = raw.match(/\{[\s\S]*"concepts_covered"[\s\S]*"weak_concepts"[\s\S]*"score_pct"[\s\S]*\}/)
  if (summaryMatch) {
    const parsed = studySessionSchema.safeParse(JSON.parse(summaryMatch[0]))
    if (parsed.success) {
      // Server-side guard: reject early summary if questions remain and concepts not exhausted
      const allCovered = conceptList.length > 0 && parsed.data.concepts_covered.length >= conceptList.length
      if (questionCount < maxQuestions && !allCovered) {
        // LLM tried to end early — re-invoke with explicit instruction to ask a question
        const retryMessages: StudyTurn[] = [
          ...fullMessages,
          { role: "user", content: `STOP. You ended the session too early. You have only asked ${questionCount} question(s). You MUST ask question ${questionCount + 1} now. Output a multiple choice question with exactly 4 choices (A, B, C, D). Do NOT output the summary JSON. Your response MUST contain lines starting with A., B., C., D.` },
        ]
        const retry = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 4096,
          temperature: 0.7,
          messages: retryMessages,
        })
        const retryRaw = stripThinkingTags(retry.choices[0]?.message?.content ?? "")
        // Strip summary from retry response
        const retrySummary = retryRaw.match(/\{[\s\S]*"concepts_covered"[\s\S]*"weak_concepts"[\s\S]*"score_pct"[\s\S]*\}/)
        const clean = retrySummary ? retryRaw.replace(retrySummary[0], "").trim() : retryRaw
        // Validate retry response has MC choices
        const hasMC = /^[A-D][.)]\s/m.test(clean)
        if (hasMC) return buildStructuredResponse(clean)
        // Retry also failed — try one more time with even stronger instruction
        const retry2Messages: StudyTurn[] = [
          ...retryMessages,
          { role: "assistant", content: clean },
          { role: "user", content: `That response was invalid. You MUST output a question in this exact format:\n\n[Question text]\n\nA. [choice]\nB. [choice]\nC. [choice]\nD. [choice]\n\nOutput ONLY the question. No summary JSON.` },
        ]
        const retry2 = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 4096,
          temperature: 0.7,
          messages: retry2Messages,
        })
        const retry2Raw = stripThinkingTags(retry2.choices[0]?.message?.content ?? "")
        const retry2Summary = retry2Raw.match(/\{[\s\S]*"concepts_covered"[\s\S]*"weak_concepts"[\s\S]*"score_pct"[\s\S]*\}/)
        const clean2 = retry2Summary ? retry2Raw.replace(retry2Summary[0], "").trim() : retry2Raw
        return buildStructuredResponse(clean2 || "Which statement best explains this concept?\n\nA. First option\nB. Second option\nC. Third option\nD. Fourth option")
      }
      const text = raw.slice(0, summaryMatch.index).trim()
      return { ...buildStructuredResponse(text || "Session complete!"), summary: parsed.data }
    }
  }

  return buildStructuredResponse(raw)
}

function buildStructuredResponse(content: string): StudyResponse {
  const question = parseMCQuestion(content)
  const correct = isCorrectResponse(content)
  const rationale = extractRationale(content)
  return {
    content,
    question,
    correct_rationale: correct ? rationale || "Correct answer." : "",
    incorrect_rationale: correct ? "" : rationale || "Incorrect.",
  }
}
