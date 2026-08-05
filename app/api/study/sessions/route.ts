import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { z } from "zod"

const createStudySchema = z.object({
  mode: z.enum(["drill", "case", "recall", "weak_area", "teach_back"]),
  content_area: z.string().min(1),
  topic: z.string().optional(),
  concepts: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = createStudySchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { mode, content_area, topic, concepts } = parsed.data

    const session = await sql`
      INSERT INTO study_sessions (user_id, mode, content_area, topic, transcript_json, weak_concepts)
      VALUES (${userId}, ${mode}, ${content_area}, ${topic ?? null}, '[]'::jsonb, ${JSON.stringify(concepts ?? [])}::jsonb)
      RETURNING *
    `

    return NextResponse.json({ session: session.rows[0] }, { status: 201 })
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
