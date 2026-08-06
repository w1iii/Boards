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

    const result = await sql`
      WITH s AS (
        SELECT type, answers, started_at, duration_seconds
        FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
      ),
      u AS (
        UPDATE sessions
        SET answers = COALESCE(s.answers, '{}'::jsonb) || jsonb_build_object(${questionId}::text, ${answer}::text)
        FROM s
        WHERE sessions.id = ${sessionId}
        RETURNING 1
      )
      SELECT s.type AS session_type,
             s.started_at,
             s.duration_seconds,
             q.correct_answer,
             q.rationale,
             q.wrong_choice_rationales,
             q.choices
      FROM s
      CROSS JOIN questions q
      WHERE q.id = ${questionId}
    `

    if (result.rows.length === 0) throw new AppError("Session or question not found", 404)

    const row = result.rows[0] as Record<string, unknown>
    const sessionType = row.session_type as string

    if (sessionType === "mock-exam") {
      const durationSeconds = row.duration_seconds as number | null
      const startedAt = row.started_at as string
      if (durationSeconds && startedAt) {
        const deadline = new Date(startedAt).getTime() + durationSeconds * 1000
        if (Date.now() > deadline) throw new AppError("Exam time has expired", 410)
      }
      return NextResponse.json({ saved: true })
    }

    const correctAnswer = row.correct_answer as string
    const isCorrect = answer === correctAnswer

    let rationale: string
    if (isCorrect) {
      rationale = row.rationale as string
    } else {
      const wrongRationales = row.wrong_choice_rationales as Record<string, string> | null
      const specificRationale = wrongRationales?.[answer]
      if (specificRationale) {
        rationale = specificRationale
      } else {
        const choices = (row.choices as Array<{ key: string; text: string }>) ?? []
        const chosenText = choices.find((c) => c.key === answer)?.text ?? "selected"
        const correctText = choices.find((c) => c.key === correctAnswer)?.text ?? ""
        rationale = `Choice ${answer} ("${chosenText}") is not the best response. The correct answer is ${correctAnswer} ("${correctText}"): ${row.rationale as string}`
      }
    }

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer,
      rationale,
    })
  } catch (error) {
    return handleError(error)
  }
}
