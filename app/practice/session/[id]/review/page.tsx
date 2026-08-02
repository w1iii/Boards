import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { sql, getProfile } from "@/app/lib/db"
import ReviewView from "./review-view"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  const firstName = (profile?.first_name as string) || "there"
  const { id: sessionId } = await params

  const session = await sql`
    SELECT * FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
  `
  if (session.rows.length === 0) notFound()

  const s = session.rows[0] as Record<string, unknown>
  const answers = (s.answers ?? {}) as Record<string, string>
  const questionIds = (s.questions ?? []) as string[]

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

  const serializedQuestions = questions.map((q) => ({
    id: (q.id as string) ?? "",
    text: (q.text as string) ?? "",
    choices: (Array.isArray(q.choices) ? q.choices : []) as { key: string; text: string }[],
    correct_answer: (q.correct_answer as string) ?? "",
    rationale: (q.rationale as string) ?? "",
    wrong_choice_rationales: (q.wrong_choice_rationales as Record<string, string>) ?? {},
    content_area: (q.content_area as string) ?? "",
    difficulty: (q.difficulty as string) ?? "medium",
  }))

  return (
    <ReviewView
      sessionId={sessionId}
      firstName={firstName}
      imageUrl={null}
      questions={serializedQuestions}
      answers={answers}
    />
  )
}
