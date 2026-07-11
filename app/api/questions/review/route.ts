import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const { questionId, approved } = body

    if (!questionId) throw new AppError("questionId is required")

    if (approved) {
      await sql`
        UPDATE questions
        SET reviewed = true, reviewed_by = ${userId}
        WHERE id = ${questionId}
      `
    }

    return NextResponse.json({
      message: approved ? "Question approved" : "Question flagged for revision",
      questionId,
    })
  } catch (error) {
    return handleError(error)
  }
}
