import { NextResponse } from "next/server"
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

    const result = await sql`SELECT * FROM questions WHERE id = ${id}`
    if (result.rows.length === 0) throw new AppError("Question not found", 404)

    return NextResponse.json({ question: result.rows[0] })
  } catch (error) {
    return handleError(error)
  }
}
