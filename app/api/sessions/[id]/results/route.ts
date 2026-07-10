import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id: sessionId } = await context.params

    const session = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const s = session.rows[0]
    const answers = s.answers ?? {}
    const questionIds = s.questions ?? []

    const questions = await sql`
      SELECT id, correct_answer, content_area FROM questions WHERE id = ANY(${questionIds})
    `

    type QuestionRow = { id: string; correct_answer: string; content_area: string }
    const questionMap = new Map<string, QuestionRow>(
      questions.rows.map((q: unknown) => {
        const row = q as QuestionRow
        return [row.id, row]
      }),
    )

    let correctCount = 0
    const areaBreak: Record<string, { correct: number; total: number }> = {}

    for (const qId of questionIds) {
      const q = questionMap.get(qId)
      if (!q) continue

      const area = q.content_area
      if (!areaBreak[area]) areaBreak[area] = { correct: 0, total: 0 }
      areaBreak[area].total++

      if (answers[qId] === q.correct_answer) {
        correctCount++
        areaBreak[area].correct++
      }
    }

    return NextResponse.json({
      sessionId: s.id,
      totalQuestions: questionIds.length,
      answeredQuestions: Object.keys(answers).length,
      correctAnswers: correctCount,
      score: questionIds.length > 0 ? correctCount / questionIds.length : 0,
      areaBreakdown: areaBreak,
    })
  } catch (error) {
    return handleError(error)
  }
}
