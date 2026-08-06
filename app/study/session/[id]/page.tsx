import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/app/lib/db"
import { getProfile } from "@/app/lib/db"
import StudySessionView from "./study-session"

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const { id } = await params

  const result = await sql`
    SELECT * FROM study_sessions WHERE id = ${id} AND user_id = ${userId}
  `
  if (result.rows.length === 0) redirect("/study")

  const session = result.rows[0] as Record<string, unknown>
  const questionIds = (session.question_ids as string[]) ?? []

  let questions: Array<Record<string, unknown>> = []
  if (questionIds.length > 0) {
    const q = await sql`
      SELECT id, text, choices, correct_answer, rationale, wrong_choice_rationales
      FROM study_questions
      WHERE id = ANY(${questionIds})
    `
    questions = q.rows
  }

  const profile = await getProfile(userId)

  return (
    <StudySessionView
      sessionId={id}
      mode={session.mode as string}
      contentArea={session.content_area as string}
      topic={(session.topic as string) ?? null}
      questions={questions.map((qq) => ({
        id: qq.id as string,
        text: qq.text as string,
        choices: qq.choices as { key: string; text: string }[],
        correct_answer: qq.correct_answer as string,
        rationale: qq.rationale as string,
        wrong_choice_rationales: (qq.wrong_choice_rationales as Record<string, string>) ?? {},
      }))}
      firstName={(profile?.first_name as string) || "there"}
      imageUrl={null}
    />
  )
}