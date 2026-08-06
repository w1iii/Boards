import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { z } from "zod"
import { ensureStudyBank, getStudyBank } from "@/app/lib/study-bank"
import { STUDY_MODES, type StudyMode } from "@/app/lib/study-concepts"

const createStudySchema = z.object({
  mode: z.enum(STUDY_MODES),
  content_area: z.string().min(1),
  topic: z.string().optional(),
  concepts: z.array(z.string()).optional(),
})

const SESSION_QUESTION_COUNT = 10

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = createStudySchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { mode, content_area, topic, concepts } = parsed.data
    const modeTyped = mode as StudyMode

    await ensureStudyBank(content_area, modeTyped, SESSION_QUESTION_COUNT, concepts ?? [])

    const bank = await getStudyBank(content_area, modeTyped, SESSION_QUESTION_COUNT)

    const session = await sql`
      INSERT INTO study_sessions (user_id, mode, content_area, topic, transcript_json, weak_concepts,
        question_ids, answers)
      VALUES (${userId}, ${mode}, ${content_area}, ${topic ?? null}, '[]'::jsonb, ${JSON.stringify(concepts ?? [])}::jsonb,
        ${JSON.stringify(bank.map((q) => q.id))}::jsonb, '{}'::jsonb)
      RETURNING *
    `

    return NextResponse.json({ session: session.rows[0], questions: bank }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10")

    const result = await sql`
      SELECT id, mode, content_area, topic, score_pct, created_at, completed_at
      FROM study_sessions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({ sessions: result.rows })
  } catch (error) {
    return handleError(error)
  }
}