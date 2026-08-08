import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { z } from "zod"

const answerSchema = z.object({
  question_id: z.string().min(1),
  selected_key: z.string().length(1),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id } = await context.params
    const body = await request.json()
    const parsed = answerSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const session = await sql`
      SELECT question_ids, answers FROM study_sessions WHERE id = ${id} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const row = session.rows[0] as Record<string, unknown>
    const questionIds = (row.question_ids as string[]) ?? []
    const answers = ((row.answers as Record<string, string>) ?? {})

    const { question_id, selected_key } = parsed.data
    if (!questionIds.includes(question_id)) throw new AppError("Question not in session", 400)

    const question = await sql`
      SELECT correct_answer, rationale, wrong_choice_rationales FROM study_questions WHERE id = ${question_id}
    `
    if (question.rows.length === 0) throw new AppError("Question not found", 404)

    const q = question.rows[0] as Record<string, unknown>
    const correctAnswer = q.correct_answer as string
    const wrongChoiceRationales = (q.wrong_choice_rationales as Record<string, string>) ?? {}
    const rationale = q.rationale as string

    const correct = selected_key === correctAnswer
    const displayedRationale = correct ? rationale : (wrongChoiceRationales[selected_key] ?? rationale)

    const isFirstAttempt = !(question_id in answers)
    const newAnswers = { ...answers, [question_id]: selected_key }

    if (correct && isFirstAttempt) {
      await sql`
        UPDATE study_sessions
        SET answers = ${JSON.stringify(newAnswers)}::jsonb,
            first_try_correct = first_try_correct + 1
        WHERE id = ${id}
      `
    } else if (correct) {
      await sql`
        UPDATE study_sessions SET answers = ${JSON.stringify(newAnswers)}::jsonb WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE study_sessions SET answers = ${JSON.stringify(newAnswers)}::jsonb,
          retries = retries + 1
        WHERE id = ${id}
      `
    }

    return NextResponse.json({
      correct,
      correct_answer: correctAnswer,
      rationale: displayedRationale,
      correct_rationale: correct ? rationale : "",
      incorrect_rationale: correct ? "" : displayedRationale,
    })
  } catch (error) {
    return handleError(error)
  }
}