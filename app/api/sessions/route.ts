import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { createSessionSchema } from "@/app/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = createSessionSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { type, contentAreas, questionCount } = parsed.data

    const questions = await sql`
      SELECT id FROM questions
      WHERE content_area = ANY(${contentAreas})
        AND reviewed = true
      ORDER BY RANDOM()
      LIMIT ${questionCount}
    `

    const questionIds = questions.rows.map((q: Record<string, unknown>) => q.id as string)

    if (questionIds.length === 0) {
      return NextResponse.json({
        error: "no_questions_found",
        message: "No reviewed questions found for the selected content areas. Generate questions first.",
        contentAreas,
      }, { status: 404 })
    }

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
