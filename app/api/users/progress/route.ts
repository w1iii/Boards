import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

type SessionRow = Record<string, unknown> & {
  answers: Record<string, string> | null
  questions: string[] | null
}

type QuestionRow = Record<string, unknown> & {
  id: string
  correct_answer: string
  content_area: string
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const sessions = await sql`
      SELECT answers, questions FROM sessions
      WHERE user_id = ${userId} AND status = 'completed'
    `

    const questions = await sql`
      SELECT id, correct_answer, content_area FROM questions
    `

    const questionMap = new Map<string, QuestionRow>(
      questions.rows.map((q: unknown) => {
        const row = q as QuestionRow
        return [row.id, row]
      }),
    )

    const areaScores: Record<string, { correct: number; total: number }> = {}
    let totalCorrect = 0
    let totalAnswered = 0

    for (const s of sessions.rows) {
      const row = s as SessionRow
      const answers: Record<string, string> = row.answers ?? {}
      const questionIds: string[] = row.questions ?? []

      for (const qId of questionIds) {
        const q = questionMap.get(qId)
        if (!q) continue

        const area = q.content_area
        if (!areaScores[area]) areaScores[area] = { correct: 0, total: 0 }
        areaScores[area].total++
        totalAnswered++

        if (answers[qId] === q.correct_answer) {
          areaScores[area].correct++
          totalCorrect++
        }
      }
    }

    const weakAreas = Object.entries(areaScores)
      .filter(([, v]) => v.total >= 5 && v.correct / v.total < 0.5)
      .map(([area]) => area)

    return NextResponse.json({
      totalQuestionsAnswered: totalAnswered,
      totalCorrect,
      overallScore: totalAnswered > 0 ? totalCorrect / totalAnswered : 0,
      areaScores: Object.fromEntries(
        Object.entries(areaScores).map(([area, v]) => [
          area,
          { ...v, score: v.total > 0 ? v.correct / v.total : 0 },
        ]),
      ),
      weakAreas,
    })
  } catch (error) {
    return handleError(error)
  }
}
