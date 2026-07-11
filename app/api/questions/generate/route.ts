import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { generateQuestionsSchema, generatedQuestionSchema } from "@/app/lib/validation"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = generateQuestionsSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { contentArea, count } = parsed.data

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
            content: `Generate ${count} NLE-style situational questions for content area: ${contentArea}. Return a JSON array ONLY — no markdown, no code fences. Each object must have: text (string), choices (array of {key: string, text: string}), correctAnswer (string), rationale (string), wrongChoiceRationales (object mapping wrong keys to explanation strings).`,
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
    if (!generatedText) throw new AppError("AI returned empty response", 502)

    let generated: unknown
    try {
      generated = JSON.parse(generatedText)
    } catch {
      return NextResponse.json({
        error: "AI returned malformed JSON",
        raw: generatedText,
      }, { status: 422 })
    }

    const questions = z.array(generatedQuestionSchema).safeParse(generated)
    if (!questions.success) {
      return NextResponse.json({
        error: "AI response failed validation",
        raw: generatedText,
        validationErrors: questions.error.issues,
      }, { status: 422 })
    }

    const inserted = []
    for (const q of questions.data) {
      const result = await sql`
        INSERT INTO questions (content_area, difficulty, text, choices, correct_answer, rationale, wrong_choice_rationales, reviewed)
        VALUES (${contentArea}, 'medium', ${q.text}, ${JSON.stringify(q.choices)}, ${q.correctAnswer}, ${q.rationale}, ${JSON.stringify(q.wrongChoiceRationales || {})}, false)
        RETURNING *
      `
      inserted.push(result.rows[0])
    }

    return NextResponse.json({
      message: `Generated ${inserted.length} questions`,
      contentArea,
      questions: inserted,
    }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
