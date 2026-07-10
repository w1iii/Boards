import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id: sessionId } = await context.params
    const body = await request.json()
    const { questionId, answer } = body

    if (!questionId || !answer) {
      throw new AppError("questionId and answer are required")
    }

    const session = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const question = await sql`
      SELECT correct_answer, rationale, wrong_choice_rationales FROM questions WHERE id = ${questionId}
    `
    if (question.rows.length === 0) throw new AppError("Question not found", 404)

    const q = question.rows[0]
    const isCorrect = answer === q.correct_answer
    const rationale = isCorrect
      ? q.rationale
      : q.wrong_choice_rationales?.[answer] ?? q.rationale

    const currentAnswers = session.rows[0].answers ?? {}
    currentAnswers[questionId] = answer

    await sql`
      UPDATE sessions SET answers = ${JSON.stringify(currentAnswers)}::jsonb
      WHERE id = ${sessionId}
    `

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: q.correct_answer,
      rationale,
    })
  } catch (error) {
    return handleError(error)
  }
}
