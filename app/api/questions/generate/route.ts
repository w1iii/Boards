import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { handleError, AppError } from "@/app/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const { contentArea, count = 10 } = body

    if (!contentArea) throw new AppError("contentArea is required")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: `Generate ${count} NLE-style situational questions for content area: ${contentArea}. Return JSON array with fields: text, choices (array of {key, text}), correctAnswer, rationale, wrongChoiceRationales (object mapping wrong keys to explanations).`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new AppError(`AI generation failed: ${err}`, 502)
    }

    const data = await response.json()
    const generatedText = data.content?.[0]?.text ?? ""

    return NextResponse.json({
      message: "Questions generated",
      contentArea,
      count,
      raw: generatedText,
    })
  } catch (error) {
    return handleError(error)
  }
}
