import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const result = await sql`
      SELECT content_area,
             COUNT(*)::int as total,
             COALESCE(SUM(CASE WHEN correct THEN weight ELSE 0 END), 0)::numeric as correct
      FROM mastery_events
      WHERE user_id = ${userId}
      GROUP BY content_area
    `

    const areaScores: Record<string, { correct: number; total: number; score: number }> = {}
    let totalAnswered = 0
    let totalCorrect = 0

    for (const row of result.rows) {
      const r = row as Record<string, unknown>
      const area = r.content_area as string
      const total = r.total as number
      const correct = Number(r.correct)
      areaScores[area] = { correct, total, score: total > 0 ? correct / total : 0 }
      totalAnswered += total
      totalCorrect += correct
    }

    const weakAreas = Object.entries(areaScores)
      .filter(([, v]) => v.total >= 5 && v.score < 0.5)
      .map(([area]) => area)

    return NextResponse.json({
      totalQuestionsAnswered: totalAnswered,
      totalCorrect,
      overallScore: totalAnswered > 0 ? totalCorrect / totalAnswered : 0,
      areaScores,
      weakAreas,
    })
  } catch (error) {
    return handleError(error)
  }
}
