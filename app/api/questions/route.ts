import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const searchParams = request.nextUrl.searchParams
    const contentArea = searchParams.get("contentArea")
    const difficulty = searchParams.get("difficulty")
    const reviewed = searchParams.get("reviewed")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
    const offset = Number(searchParams.get("offset")) || 0

    let query = sql`SELECT * FROM questions WHERE 1=1`
    const conditions: string[] = []
    const params: unknown[] = []

    if (contentArea) {
      query = sql`SELECT * FROM questions WHERE content_area = ${contentArea}`
    }

    const result = await query

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

    const result = await sql`
      INSERT INTO questions (content_area, difficulty, text, choices, correct_answer, rationale, wrong_choice_rationales)
      VALUES (${body.contentArea}, ${body.difficulty}, ${body.text}, ${JSON.stringify(body.choices)}, ${body.correctAnswer}, ${body.rationale}, ${JSON.stringify(body.wrongChoiceRationales || {})})
      RETURNING *
    `

    return NextResponse.json({ question: result.rows[0] }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
