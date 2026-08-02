import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { handleError, AppError } from "@/app/lib/errors"
import { generateQuestionsSchema } from "@/app/lib/validation"
import { generateQuestionsForArea } from "@/app/lib/question-generator"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = generateQuestionsSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { contentArea, count, difficulty } = parsed.data
    const { inserted, shortfall } = await generateQuestionsForArea(contentArea, count, difficulty)

    return NextResponse.json({
      message: `Generated ${inserted.length} questions${shortfall ? ` (requested ${count})` : ""}`,
      contentArea,
      generated: inserted.length,
      shortfall,
      questions: inserted,
    }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
