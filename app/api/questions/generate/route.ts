import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { generateQuestionsSchema, generatedQuestionSchema } from "@/app/lib/validation"
import Groq from "groq-sdk"
import { z } from "zod"

const groq = new Groq()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = generateQuestionsSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { contentArea, count } = parsed.data

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: "You are an NLE question writer. Always respond in valid JSON.",
        },
        {
          role: "user",
          content: `Generate ${count} NLE-style situational questions for content area: ${contentArea}. Return a JSON array ONLY — no markdown, no code fences. Each object must have: text (string), choices (array of {key: string, text: string}), correctAnswer (string), rationale (string), wrongChoiceRationales (object mapping wrong keys to explanation strings).`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const generatedText = completion.choices[0]?.message?.content ?? ""
    if (!generatedText) throw new AppError("AI returned empty response", 502)

    let parsed_json: unknown
    try {
      parsed_json = JSON.parse(generatedText)
    } catch {
      return NextResponse.json({
        error: "AI returned malformed JSON",
        raw: generatedText,
      }, { status: 422 })
    }

    // Groq json_object wraps result in an object — unwrap if it has a generic key
    const rawArray = Array.isArray(parsed_json)
      ? parsed_json
      : (parsed_json as Record<string, unknown>)?.questions
        ?? (parsed_json as Record<string, unknown>)?.data
        ?? parsed_json

    const questions = z.array(generatedQuestionSchema).safeParse(rawArray)
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
