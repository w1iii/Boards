import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id } = await context.params

    const result = await sql`
      SELECT * FROM sessions WHERE id = ${id} AND user_id = ${userId}
    `
    if (result.rows.length === 0) throw new AppError("Session not found", 404)

    const session = result.rows[0] as Record<string, unknown>
    const questionIds = (session.questions as string[]) || []

    let questions: Record<string, unknown>[] = []
    if (questionIds.length > 0) {
      const qResult = await sql`
        SELECT * FROM questions WHERE id = ANY(${questionIds})
      `
      const qMap = new Map<string, Record<string, unknown>>()
      for (const row of qResult.rows as Record<string, unknown>[]) {
        qMap.set(row.id as string, row)
      }
      questions = questionIds.map((qId) => qMap.get(qId)).filter(Boolean) as Record<string, unknown>[]
    }

    return NextResponse.json({ session: { ...session, questions } })
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
      SELECT * FROM sessions WHERE id = ${id} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    if (body.status === "completed") {
      const result = await sql`
        UPDATE sessions
        SET status = 'completed', completed_at = now()
        WHERE id = ${id}
        RETURNING *
      `
      return NextResponse.json({ session: result.rows[0] })
    }

    throw new AppError("No valid fields to update", 400)
  } catch (error) {
    return handleError(error)
  }
}
