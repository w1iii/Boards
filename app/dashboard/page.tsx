import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const result = await sql`
    SELECT * FROM user_profiles WHERE clerk_user_id = ${userId}
  `
  const profile = result.rows[0] as Record<string, unknown> | undefined

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const firstName = (profile.first_name as string) || user?.firstName || "there"
  const contentAreas = (profile.content_areas as string[]) || []
  const dailyGoal = (profile.daily_goal as number) || 20

  const progressResult = await sql`
    SELECT COUNT(*)::int as total_answered,
           COUNT(*) FILTER (WHERE answers ? 'correct')::int as total_correct
    FROM sessions
    WHERE user_id = ${userId} AND status = 'completed'
  `

  const totalAnswered = (progressResult.rows[0] as Record<string, unknown>)?.total_answered as number || 0
  const totalCorrect = (progressResult.rows[0] as Record<string, unknown>)?.total_correct as number || 0
  const score = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-gray-600">Ready to practice?</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Questions Answered</p>
          <p className="mt-1 text-2xl font-bold">{totalAnswered}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Overall Score</p>
          <p className="mt-1 text-2xl font-bold">{score}%</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Daily Goal</p>
          <p className="mt-1 text-2xl font-bold">{dailyGoal}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Your Focus Areas</h2>
        <div className="flex flex-wrap gap-2">
          {(contentAreas as string[]).map((area: string) => (
            <span
              key={area}
              className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              {area
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="/practice"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Start Practice
        </a>
        <a
          href="/practice?type=mock-exam"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Take Mock Exam
        </a>
      </div>
    </main>
  )
}
