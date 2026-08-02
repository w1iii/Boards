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

    const { type, contentAreas, questionCount, difficulty, allowShortfall } = parsed.data

    const questionRows = difficulty
      ? await sql`
          SELECT id FROM questions
          WHERE content_area = ANY(${contentAreas})
            AND reviewed = true
            AND difficulty = ${difficulty}
          ORDER BY RANDOM()
          LIMIT ${questionCount}
        `
      : await sql`
          SELECT id FROM questions
          WHERE content_area = ANY(${contentAreas})
            AND reviewed = true
          ORDER BY RANDOM()
          LIMIT ${questionCount}
        `
    const questionIds = questionRows.rows.map((q: Record<string, unknown>) => q.id as string)

    if (questionIds.length === 0) {
      return NextResponse.json({
        error: "no_questions_found",
        message: "No reviewed questions found for the selected content areas. Generate questions first.",
        contentAreas,
      }, { status: 404 })
    }

    //POOL IS SHORT — DON'T CREATE A SESSION YET. TELL CLIENT HOW MANY ARE MISSING SO IT CAN GENERATE AND RETRY.
    if (questionIds.length < questionCount && !allowShortfall) {
      return NextResponse.json({
        error: "insufficient_questions",
        message: "Not enough reviewed questions for the requested count.",
        available: questionIds.length,
        questionCount,
      }, { status: 409 })
    }

    const session = await sql`
      INSERT INTO sessions (user_id, type, content_areas, questions, status)
      VALUES (${userId}, ${type}, ${JSON.stringify(contentAreas)}, ${JSON.stringify(questionIds)}, 'in-progress')
      RETURNING *
    `

    return NextResponse.json({
      session: session.rows[0],
      shortfall: questionIds.length < questionCount,
    }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
