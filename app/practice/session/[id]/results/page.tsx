import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { sql } from "@/app/lib/db"
import ResultsView from "./results-view"

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const firstName = user?.firstName || "there"
  const { id: sessionId } = await params

  const session = await sql`
    SELECT * FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
  `
  if (session.rows.length === 0) notFound()

  const s = session.rows[0] as Record<string, unknown>
  const answers = (s.answers ?? {}) as Record<string, string>
  const questionIds = (s.questions ?? []) as string[]

  const questions = await sql`
    SELECT id, correct_answer, content_area FROM questions WHERE id = ANY(${questionIds})
  `

  type QuestionRow = { id: string; correct_answer: string; content_area: string }
  const questionMap = new Map<string, QuestionRow>(
    questions.rows.map((q: unknown) => {
      const row = q as QuestionRow
      return [row.id, row]
    }),
  )

  let correctCount = 0
  let existingCount = 0
  const areaBreak: Record<string, { correct: number; total: number }> = {}

  for (const qId of questionIds) {
    const q = questionMap.get(qId)
    if (!q) continue
    existingCount++

    const area = q.content_area
    if (!areaBreak[area]) areaBreak[area] = { correct: 0, total: 0 }
    areaBreak[area].total++

    const userAnswer = answers[qId]
    if (userAnswer && userAnswer === q.correct_answer) {
      correctCount++
      areaBreak[area].correct++
    }
  }

  const totalQuestions = existingCount
  const answeredQuestions = Object.keys(answers).filter((id) => questionMap.has(id)).length
  const score = totalQuestions > 0 ? correctCount / totalQuestions : 0

  return (
    <ResultsView
      sessionId={sessionId}
      firstName={firstName}
      imageUrl={user?.imageUrl ?? null}
      totalQuestions={totalQuestions}
      answeredQuestions={answeredQuestions}
      correctAnswers={correctCount}
      score={score}
      areaBreakdown={areaBreak}
    />
  )
}
