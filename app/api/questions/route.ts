import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql, unsafesql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { createQuestionSchema, questionListSchema } from "@/app/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const raw = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = questionListSchema.safeParse(raw)
    if (!parsed.success) throw new AppError("Invalid query params", 400)

    const { contentArea, difficulty, reviewed, limit, offset } = parsed.data

    const conditions: string[] = []
    const params: unknown[] = []

    if (contentArea) {
      params.push(contentArea)
      conditions.push(`content_area = $${params.length}`)
    }
    if (difficulty) {
      params.push(difficulty)
      conditions.push(`difficulty = $${params.length}`)
    }
    if (reviewed !== undefined) {
      params.push(reviewed)
      conditions.push(`reviewed = $${params.length}`)
    }

    const where = conditions.length > 0
      ? "WHERE " + conditions.join(" AND ")
      : ""

    params.push(limit)
    params.push(offset)

    const result = await unsafesql(
      `SELECT * FROM questions ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    )

    return NextResponse.json({
      questions: result.rows,
      limit,
      offset,
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = createQuestionSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const q = parsed.data
    const result = await sql`
      INSERT INTO questions (content_area, difficulty, text, choices, correct_answer, rationale, wrong_choice_rationales)
      VALUES (${q.contentArea}, ${q.difficulty}, ${q.text}, ${JSON.stringify(q.choices)}, ${q.correctAnswer}, ${q.rationale}, ${JSON.stringify(q.wrongChoiceRationales || {})})
      RETURNING *
    `

    return NextResponse.json({ question: result.rows[0] }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
