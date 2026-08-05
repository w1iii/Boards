import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { getStudyResponse, type StudyTurn } from "@/app/lib/study-engine"
import { z } from "zod"

const messageSchema = z.object({
  transcript: z.array(z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string(),
  })),
})

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts) throw err
      const isRetryable =
        err instanceof Error && (
          err.message.includes("429") ||
          err.message.includes("500") ||
          err.message.includes("502") ||
          err.message.includes("503") ||
          err.message.includes("rate") ||
          err.message.includes("overloaded") ||
          err.message.includes("timeout")
        )
      if (!isRetryable) throw err
      const delay = attempt === 1 ? 500 : 1500
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw new Error("unreachable")
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id } = await context.params
    const body = await request.json()
    const parsed = messageSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const session = await sql`
      SELECT * FROM study_sessions WHERE id = ${id} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const sessionRow = session.rows[0] as Record<string, unknown>
    const mode = sessionRow.mode as string
    const contentArea = sessionRow.content_area as string
    const concepts = (sessionRow.concepts as string[]) ?? []

    const transcript = parsed.data.transcript as StudyTurn[]

    let apiMessages: StudyTurn[]
    let persistedTranscript: StudyTurn[]

    if (transcript.length === 0) {
      const topic = (sessionRow.topic as string) || "all topics in this area"
      const conceptList = concepts.length > 0 ? `\n\nSpecific concepts to drill:\n${concepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}` : ""
      apiMessages = [{ role: "user", content: `Let's start. I'm ready for the first concept on ${topic}.${conceptList}` }]
      persistedTranscript = []
    } else {
      apiMessages = transcript
      persistedTranscript = [...transcript]
    }

    const { content, summary } = await withRetry(() =>
      getStudyResponse(
        apiMessages,
        mode as "drill" | "case" | "recall" | "weak_area" | "teach_back",
        contentArea,
      ),
    )

    const updatedTranscript = [...persistedTranscript, { role: "assistant" as const, content }]

    await sql`
      UPDATE study_sessions
      SET transcript_json = ${JSON.stringify(updatedTranscript)}::jsonb
      WHERE id = ${id}
    `

    return NextResponse.json({ content, summary: summary ?? null })
  } catch (error) {
    return handleError(error)
  }
}
