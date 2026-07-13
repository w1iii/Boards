import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { answerQuestionSchema } from "@/app/lib/validation"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id: sessionId } = await context.params
    const body = await request.json()
    const parsed = answerQuestionSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { questionId, answer } = parsed.data

    const session = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const question = await sql`
      SELECT correct_answer, rationale, wrong_choice_rationales, choices, text FROM questions WHERE id = ${questionId}
    `
    if (question.rows.length === 0) throw new AppError("Question not found", 404)

    const q = question.rows[0] as Record<string, unknown>
    const correctAnswer = q.correct_answer as string
    const isCorrect = answer === correctAnswer

    let rationale: string
    if (isCorrect) {
      rationale = q.rationale as string
    } else {
      const wrongRationales = q.wrong_choice_rationales as Record<string, string> | null
      const specificRationale = wrongRationales?.[answer]
      if (specificRationale) {
        rationale = specificRationale
      } else {
        const choices = (q.choices as Array<{ key: string; text: string }>) ?? []
        const chosenText = choices.find((c) => c.key === answer)?.text ?? "selected"
        const correctText = choices.find((c) => c.key === correctAnswer)?.text ?? ""
        rationale = `Choice ${answer} ("${chosenText}") is not the best response. The correct answer is ${correctAnswer} ("${correctText}"): ${q.rationale as string}`
      }
    }

    const currentAnswers = (session.rows[0] as Record<string, unknown>).answers as Record<string, string> ?? {}
    currentAnswers[questionId] = answer

    await sql`
      UPDATE sessions SET answers = ${JSON.stringify(currentAnswers)}::jsonb
      WHERE id = ${sessionId}
    `

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer,
      rationale,
    })
  } catch (error) {
    return handleError(error)
  }
}
