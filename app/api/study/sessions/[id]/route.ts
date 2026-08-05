import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { STUDY_WEIGHT } from "@/app/lib/study-concepts"
import { studySessionSchema } from "@/app/lib/study-engine"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id } = await context.params

    const result = await sql`
      SELECT * FROM study_sessions WHERE id = ${id} AND user_id = ${userId}
    `
    if (result.rows.length === 0) throw new AppError("Session not found", 404)

    return NextResponse.json({ session: result.rows[0] })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id } = await context.params
    const body = await request.json()

    const session = await sql`
      SELECT * FROM study_sessions WHERE id = ${id} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const sessionRow = session.rows[0] as Record<string, unknown>

    if (body.status === "completed" && body.summary) {
      const parsed = studySessionSchema.safeParse(body.summary)
      if (!parsed.success) throw new AppError("Invalid summary data", 400)

      const { concepts_covered, weak_concepts, score_pct } = parsed.data
      const contentArea = sessionRow.content_area as string

      await sql`
        UPDATE study_sessions
        SET status = 'completed',
            completed_at = now(),
            transcript_json = ${JSON.stringify(body.transcript ?? [])}::jsonb,
            weak_concepts = ${JSON.stringify(weak_concepts)}::jsonb,
            score_pct = ${score_pct}
        WHERE id = ${id}
      `

      const conceptCount = concepts_covered.length
      for (const concept of concepts_covered) {
        const isWeak = weak_concepts.includes(concept)
        await sql`
          INSERT INTO mastery_events (user_id, content_area, weight, source, ref_id, correct)
          VALUES (${userId}, ${contentArea}, ${STUDY_WEIGHT}, 'study', ${id}, ${!isWeak})
        `
      }

      return NextResponse.json({ session: id, events_written: conceptCount })
    }

    throw new AppError("No valid fields to update", 400)
  } catch (error) {
    return handleError(error)
  }
}
