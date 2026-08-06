import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { studySessionSchema, type StudySessionResult } from "@/app/lib/study-engine"
import { AREA_LABELS, STUDY_WEIGHT } from "@/app/lib/study-concepts"
import Groq from "groq-sdk"

const groq = new Groq()

async function computeWeakConceptsLLM(
  areaLabel: string,
  results: { text: string; correct: boolean }[],
): Promise<Pick<StudySessionResult, "concepts_covered" | "weak_concepts">> {
  const listing = results
    .map((r) => `${r.correct ? "[correct]" : "[wrong]"} ${r.text}`)
    .join("\n")

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You analyze a completed nursing study session in ${areaLabel}. Identify the core concepts covered and which concepts the student still struggles with (weak concepts = topics from wrong answers, or gaps).

Respond JSON only: {"concepts_covered": ["..."], "weak_concepts": ["..."]}
Keep each concept concise (2-5 words). If the student answered everything correctly, weak_concepts may be empty.`,
      },
      {
        role: "user",
        content: `Study session results:\n${listing}`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? ""
  const parsed = JSON.parse(raw) as Partial<StudySessionResult>
  return {
    concepts_covered: Array.isArray(parsed.concepts_covered) ? parsed.concepts_covered : [],
    weak_concepts: Array.isArray(parsed.weak_concepts) ? parsed.weak_concepts : [],
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const { id } = await context.params

    const session = await sql`
      SELECT mode, content_area, question_ids, answers FROM study_sessions
      WHERE id = ${id} AND user_id = ${userId}
    `
    if (session.rows.length === 0) throw new AppError("Session not found", 404)

    const row = session.rows[0] as Record<string, unknown>
    const contentArea = row.content_area as string
    const questionIds = (row.question_ids as string[]) ?? []
    const answers = (row.answers as Record<string, string>) ?? {}

    const questions = await sql`
      SELECT id, text, correct_answer FROM study_questions WHERE id = ANY(${questionIds})
    `

    let correctCount = 0
    const results: { text: string; correct: boolean }[] = []
    for (const q of questions.rows as Array<Record<string, unknown>>) {
      const qid = q.id as string
      const selected = answers[qid]
      if (!selected) continue
      const correct = selected === (q.correct_answer as string)
      if (correct) correctCount++
      results.push({ text: q.text as string, correct })
    }

    const total = results.length || 1
    const score_pct = Math.round((correctCount / total) * 100)

    let concepts_covered: string[] = []
    let weak_concepts: string[] = []

    const areaLabel = AREA_LABELS[contentArea] ?? contentArea
    try {
      const llm = await computeWeakConceptsLLM(areaLabel, results)
      concepts_covered = llm.concepts_covered
      weak_concepts = llm.weak_concepts
    } catch {
      concepts_covered = [areaLabel]
      weak_concepts = results.filter((result) => !result.correct).map(() => "Review needed")
    }

    const summary = studySessionSchema.parse({
      concepts_covered,
      weak_concepts,
      score_pct,
    })

    await sql`
      UPDATE study_sessions
      SET completed_at = now(),
          weak_concepts = ${JSON.stringify(weak_concepts)}::jsonb,
          score_pct = ${score_pct}
      WHERE id = ${id}
    `

    for (const concept of concepts_covered) {
      const isWeak = weak_concepts.includes(concept)
      await sql`
        INSERT INTO mastery_events (user_id, content_area, weight, source, ref_id, correct)
        VALUES (${userId}, ${contentArea}, ${STUDY_WEIGHT}, 'study', ${id}, ${!isWeak})
      `
    }

    return NextResponse.json({ summary, events_written: concepts_covered.length })
  } catch (error) {
    return handleError(error)
  }
}