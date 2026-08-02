import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { sql, getProfile } from "@/app/lib/db"
import PracticeSession from "./practice-session"
import MockExamSession from "./mock-exam-session"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  const firstName = (profile?.first_name as string) || "there"
  const { id } = await params

  const result = await sql`
    SELECT * FROM sessions WHERE id = ${id} AND user_id = ${userId}
  `
  if (result.rows.length === 0) notFound()

  const session = result.rows[0] as Record<string, unknown>
  const sessionType = (session.type as string) ?? "practice"

  if (sessionType === "mock-exam" && (session.status as string) === "completed") {
    redirect(`/practice/session/${id}/results`)
  }

  const questionIds = (session.questions as string[]) || []

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

  const existingAnswers = (session.answers as Record<string, string>) || {}
  const contentAreas = (session.content_areas as string[]) || []

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

  if (sessionType === "mock-exam") {
    const durationSeconds = (session.duration_seconds as number | null) ?? serializedQuestions.length * 72
    const startedAt = new Date(session.started_at as string).getTime()
    // eslint-disable-next-line react-hooks/purity -- dynamic server value; session deadline is authoritative at request time
    const remainingSeconds = Math.max(0, Math.floor((startedAt + durationSeconds * 1000 - Date.now()) / 1000))

    return (
      <MockExamSession
        sessionId={id}
        questions={serializedQuestions}
        existingAnswers={existingAnswers}
        firstName={firstName}
        imageUrl={null}
        contentAreas={contentAreas}
        initialRemainingSeconds={remainingSeconds}
      />
    )
  }

  return (
    <PracticeSession
      sessionId={id}
      questions={serializedQuestions}
      existingAnswers={existingAnswers}
      firstName={firstName}
      imageUrl={null}
      contentAreas={contentAreas}
    />
  )
}
