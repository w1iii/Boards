import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const { type, contentAreas, questionCount = 20 } = body

    if (!type || !contentAreas?.length) {
      throw new AppError("type and contentAreas are required")
    }

    const questions = await sql`
      SELECT id FROM questions
      WHERE content_area = ANY(${contentAreas})
        AND reviewed = true
      ORDER BY RANDOM()
      LIMIT ${questionCount}
    `

    const questionIds = questions.rows.map((q: Record<string, unknown>) => q.id as string)

    const session = await sql`
      INSERT INTO sessions (user_id, type, content_areas, questions, status)
      VALUES (${userId}, ${type}, ${JSON.stringify(contentAreas)}, ${JSON.stringify(questionIds)}, 'in-progress')
      RETURNING *
    `

    return NextResponse.json({ session: session.rows[0] }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
