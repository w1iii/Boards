import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import NavHeader from "@/app/components/nav-header"

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NLP I — Foundation",
  "nlp-ii": "NLP II — Community Health",
  "nlp-iii": "NLP III — Mother & Child",
  "nlp-iv": "NLP IV — Medical-Surgical",
  "nlp-v": "NLP V — Psychiatric",
}

const AREA_ICONS: Record<string, string> = {
  "nlp-i": "psychology",
  "nlp-ii": "groups",
  "nlp-iii": "pregnancy",
  "nlp-iv": "monitor_heart",
  "nlp-v": "mindfulness",
}

const AREA_DESCRIPTIONS: Record<string, string> = {
  "nlp-i": "Nursing fundamentals, ethics, legal aspects.",
  "nlp-ii": "Community health, epidemiology, nursing research.",
  "nlp-iii": "Maternal, child, and family health nursing.",
  "nlp-iv": "Adult health, perioperative care, body systems.",
  "nlp-v": "Mental health, therapeutic communication, psych disorders.",
}

function ScoreRing({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? 200 : 120
  const r = size === "lg" ? 80 : 48
  const stroke = size === "lg" ? 12 : 8
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(score, 100) / 100)
  const textSize = size === "lg" ? "text-5xl" : "text-2xl"

  return (
    <div className={`relative`} style={{ width: dim, height: dim }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={dim / 2} cy={dim / 2} r={r} fill="transparent"
          stroke="currentColor" strokeWidth={stroke}
          className="text-surface-container-highest"
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={r} fill="transparent"
          stroke="currentColor" strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={score >= 75 ? "text-[#1a8038]" : "text-primary"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display-md ${textSize} font-black ${score >= 75 ? "text-[#1a8038]" : "text-primary"}`}>
          {Math.round(score)}%
        </span>
      </div>
    </div>
  )
}

function SessionTimelineItem({
  sessionId,
  score,
  totalQuestions,
  correctAnswers,
  type,
  completedAt,
  index,
}: {
  sessionId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  type: string
  completedAt: string
  index: number
}) {
  const date = new Date(completedAt)
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const passed = score >= 75

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-surface-container-low border border-tertiary hover:bg-surface-container transition-colors">
      <div className="w-8 text-center shrink-0">
        <span className="font-mono-data text-secondary text-xs">#{index}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-label-caps text-[10px] px-1.5 py-0.5 ${type === "mock-exam" ? "bg-primary text-white" : "bg-surface-container-highest text-secondary"}`}>
            {type === "mock-exam" ? "MOCK EXAM" : "PRACTICE"}
          </span>
          <span className="font-mono-data text-xs text-secondary truncate">{formatted}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono-data text-sm ${passed ? "text-[#1a8038]" : "text-primary"}`}>
            {Math.round(score)}%
          </span>
          <span className="text-secondary text-xs">
            {correctAnswers}/{totalQuestions} correct
          </span>
        </div>
      </div>
      <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${passed ? "bg-[#1a8038]" : "bg-primary"}`} />
    </div>
  )
}

export default async function ProgressPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const profileResult = await sql`
    SELECT * FROM user_profiles WHERE clerk_user_id = ${userId}
  `
  const profile = profileResult.rows[0] as Record<string, unknown> | undefined

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const firstName = (profile.first_name as string) || user?.firstName || "there"
  const contentAreas = (profile.content_areas as string[]) || []
  const targetExamDate = profile.target_exam_date as string | null

  const examDaysLeft: number | null = targetExamDate
    ? (() => {
        const diff = new Date(targetExamDate).getTime() - new Date().getTime()
        return Math.max(0, Math.ceil(diff / 86400000))
      })()
    : null

  const progressResult = await sql`
    SELECT COUNT(*)::int as total_answered,
           COUNT(*) FILTER (WHERE s.answers->>q.id::text = q.correct_answer)::int as total_correct
    FROM sessions s
    CROSS JOIN LATERAL jsonb_array_elements_text(s.questions) AS qid(qid_txt)
    JOIN questions q ON q.id::text = qid.qid_txt
    WHERE s.user_id = ${userId} AND s.status = 'completed'
  `
  const totalAnswered =
    (progressResult.rows[0] as Record<string, unknown>)?.total_answered as number || 0
  const totalCorrect =
    (progressResult.rows[0] as Record<string, unknown>)?.total_correct as number || 0
  const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const sessionCountResult = await sql`
    SELECT COUNT(*)::int as count FROM sessions
    WHERE user_id = ${userId} AND status = 'completed'
  `
  const sessionCount =
    (sessionCountResult.rows[0] as Record<string, unknown>)?.count as number || 0

  let areaBreakdown: Array<{ content_area: string; total: number; correct: number }> = []
  try {
    const areaResult = await sql`
      SELECT q.content_area,
             COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE s.answers->>q.id::text = q.correct_answer)::int as correct
      FROM sessions s
      CROSS JOIN LATERAL jsonb_array_elements_text(s.questions) AS qid(qid_txt)
      JOIN questions q ON q.id::text = qid.qid_txt
      WHERE s.user_id = ${userId} AND s.status = 'completed'
      GROUP BY q.content_area
    `
    areaBreakdown = areaResult.rows as Array<{
      content_area: string
      total: number
      correct: number
    }>
  } catch {
    // area breakdown unavailable
  }

  const areaScores = new Map<string, { score: number; total: number; correct: number }>()
  for (const area of contentAreas) {
    const found = areaBreakdown.find((a) => a.content_area === area)
    if (found && found.total > 0) {
      areaScores.set(area, {
        score: Math.round((found.correct / found.total) * 100),
        total: found.total,
        correct: found.correct,
      })
    } else {
      areaScores.set(area, { score: 0, total: 0, correct: 0 })
    }
  }

  const weakAreas = [...areaScores.entries()]
    .filter(([, v]) => v.total >= 5 && v.score < 50)
    .map(([area]) => area)

  let recentSessions: Array<{
    id: string
    score: number
    totalQuestions: number
    correctAnswers: number
    type: string
    completedAt: string
  }> = []

  try {
    const questions = await sql`
      SELECT id, correct_answer, content_area FROM questions
    `
    const questionMap = new Map<string, { id: string; correct_answer: string }>(
      questions.rows.map((q: unknown) => {
        const row = q as { id: string; correct_answer: string }
        return [row.id, row]
      }),
    )

    const sessionsResult = await sql`
      SELECT id, type, questions, answers, completed_at
      FROM sessions
      WHERE user_id = ${userId} AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 20
    `

    recentSessions = sessionsResult.rows.map((s: unknown) => {
      const row = s as Record<string, unknown>
      const answers = (row.answers ?? {}) as Record<string, string>
      const questionIds = (row.questions ?? []) as string[]
      let correctCount = 0
      for (const qId of questionIds) {
        const q = questionMap.get(qId)
        if (q && answers[qId] === q.correct_answer) correctCount++
      }
      return {
        id: row.id as string,
        score: questionIds.length > 0 ? (correctCount / questionIds.length) * 100 : 0,
        totalQuestions: questionIds.length,
        correctAnswers: correctCount,
        type: row.type as string,
        completedAt: row.completed_at as string,
      }
    })
  } catch {
    // session history unavailable
  }

  const sortedAreas = [...areaScores.entries()]
    .map(([area, v]) => ({ area, ...v }))
    .sort((a, b) => a.score - b.score)

  return (
    <>
      <NavHeader firstName={firstName} imageUrl={user?.imageUrl ?? null} activeHref="/progress" />

      <main className="min-h-screen grid-pattern">
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-12">
            <div className="md:col-span-8 bg-surface-container border-l-4 border-primary p-10">
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 uppercase tracking-tighter">
                Progress & Analytics
              </h1>
              <p className="font-body-lg text-secondary mb-8 max-w-2xl">
                {examDaysLeft !== null ? (
                  <>
                    Your NLE Board Exam is in{" "}
                    <span className="font-bold text-on-surface">{examDaysLeft} days</span>.
                    Track your mastery across all content areas.
                  </>
                ) : (
                  <>
                    Monitor your performance and identify areas for improvement.
                  </>
                )}
              </p>
              <div className="flex gap-4">
                <Link
                  href="/practice"
                  className="bg-primary text-white px-8 py-3 font-label-caps hover:bg-opacity-90 transition-all uppercase flex items-center gap-2"
                >
                  Start Practice{" "}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="md:col-span-4 bg-surface border border-tertiary p-8 flex flex-col items-center justify-center">
              <p className="font-label-caps text-secondary mb-4">OVERALL MASTERY</p>
              <ScoreRing score={overallScore} size="lg" />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-12">
            <div className="bg-surface border border-tertiary p-6">
              <p className="font-label-caps text-secondary mb-1">TOTAL QUESTIONS</p>
              <h2 className="font-display-md text-3xl md:text-4xl">{totalAnswered.toLocaleString()}</h2>
              <p className="font-mono-data text-secondary text-xs mt-2">
                {totalCorrect} correct
              </p>
            </div>
            <div className="bg-surface border border-tertiary p-6">
              <p className="font-label-caps text-secondary mb-1">SESSIONS</p>
              <h2 className="font-display-md text-3xl md:text-4xl">{sessionCount}</h2>
              <p className="font-mono-data text-secondary text-xs mt-2">
                completed
              </p>
            </div>
            <div className="bg-surface border border-tertiary p-6">
              <p className="font-label-caps text-secondary mb-1">ACCURACY</p>
              <h2 className={`font-display-md text-3xl md:text-4xl ${overallScore >= 75 ? "text-[#1a8038]" : "text-primary"}`}>
                {overallScore}%
              </h2>
              <p className="font-mono-data text-secondary text-xs mt-2">
                {overallScore >= 75 ? "On track" : "Needs improvement"}
              </p>
            </div>
            <div className="bg-surface border border-tertiary p-6">
              <p className="font-label-caps text-secondary mb-1">WEAK AREAS</p>
              <h2 className="font-display-md text-3xl md:text-4xl text-primary">
                {weakAreas.length.toString().padStart(2, "0")}
              </h2>
              <p className="font-mono-data text-secondary text-xs mt-2">
                {weakAreas.length > 0 ? "Needs focus" : "None detected"}
              </p>
            </div>
          </div>

          {/* Weak Areas Alert */}
          {weakAreas.length > 0 && (
            <div className="mb-12 border-2 border-primary bg-error-container p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <div>
                  <h3 className="font-label-caps text-primary">AREAS REQUIRING ATTENTION</h3>
                  <p className="font-body-md text-on-error-container">
                    {weakAreas.length} content area{weakAreas.length > 1 ? "s" : ""} below 50% mastery.
                    Focused practice recommended.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {weakAreas.map((area) => (
                  <Link
                    key={area}
                    href={`/practice?area=${area}`}
                    className="bg-primary text-white px-4 py-2 font-label-caps text-xs uppercase flex items-center gap-2 hover:bg-opacity-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">{AREA_ICONS[area] || "school"}</span>
                    {AREA_LABELS[area] || area}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Area Mastery Breakdown */}
          <div className="mb-12">
            <div className="flex items-end justify-between border-b border-tertiary pb-4 mb-8">
              <h2 className="font-headline-lg uppercase tracking-tight">
                Content Area Mastery
              </h2>
              <span className="font-label-caps text-secondary text-xs">
                Sorted weakest to strongest
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {sortedAreas.map(({ area, score, total, correct }) => {
                const label = AREA_LABELS[area] || area
                const icon = AREA_ICONS[area] || "school"
                const description = AREA_DESCRIPTIONS[area]
                const scoreColor =
                  score >= 75 ? "text-[#1a8038]" : score >= 50 ? "text-[#e67e22]" : "text-primary"
                const barColor =
                  score >= 75 ? "bg-[#1a8038]" : score >= 50 ? "bg-[#e67e22]" : "bg-primary"

                return (
                  <div key={area} className="bg-surface border border-tertiary p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-secondary">
                          {icon}
                        </span>
                        <div>
                          <h3 className="font-headline-lg text-sm uppercase">{label}</h3>
                          {description && (
                            <p className="font-mono-data text-xs text-secondary">{description}</p>
                          )}
                        </div>
                      </div>
                      <span className={`font-display-md text-2xl font-black ${scoreColor}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest">
                      <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${score}%` }} />
                    </div>
                    {total > 0 && (
                      <div className="flex justify-between mt-3">
                        <span className="font-mono-data text-xs text-secondary">
                          {correct}/{total} correct
                        </span>
                        <Link
                          href={`/practice?area=${area}`}
                          className="font-label-caps text-[10px] text-primary hover:underline"
                        >
                          PRACTICE THIS AREA
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Session History */}
          <div className="mb-12">
            <div className="flex items-end justify-between border-b border-tertiary pb-4 mb-8">
              <h2 className="font-headline-lg uppercase tracking-tight">
                Session History
              </h2>
              <span className="font-label-caps text-secondary text-xs">
                Last {recentSessions.length} sessions
              </span>
            </div>

            {recentSessions.length > 0 ? (
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2">
                  <span className="font-label-caps text-[10px] text-secondary">#</span>
                  <span className="font-label-caps text-[10px] text-secondary">SESSION</span>
                  <span className="font-label-caps text-[10px] text-secondary">SCORE</span>
                </div>
                {recentSessions.map((session, i) => {
                  const sessionScore = Math.round(session.score)
                  return (
                    <Link key={session.id} href={`/practice/session/${session.id}/results`}>
                      <SessionTimelineItem
                        sessionId={session.id}
                        score={sessionScore}
                        totalQuestions={session.totalQuestions}
                        correctAnswers={session.correctAnswers}
                        type={session.type}
                        completedAt={session.completedAt}
                        index={recentSessions.length - i}
                      />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bg-surface-container-low border border-tertiary p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary mb-4 block">
                  timeline
                </span>
                <p className="font-body-md text-secondary mb-4">
                  No completed sessions yet. Start practicing to see your progress.
                </p>
                <Link
                  href="/practice"
                  className="bg-primary text-white px-6 py-2 font-label-caps text-xs uppercase inline-block"
                >
                  Start Your First Session
                </Link>
              </div>
            )}
          </div>

          {/* Trend Chart Placeholder */}
          {recentSessions.length >= 3 && (
            <div className="mb-12">
              <div className="flex items-end justify-between border-b border-tertiary pb-4 mb-8">
                <h2 className="font-headline-lg uppercase tracking-tight">
                  Recent Performance Trend
                </h2>
              </div>

              <div className="bg-surface border border-tertiary p-8">
                <div className="flex items-end gap-2 h-40">
                  {recentSessions.slice(0, 10).reverse().map((session, i) => {
                    const sessionScore = Math.round(session.score)
                    const height = Math.max(sessionScore, 4)
                    return (
                      <div key={session.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className={`w-full rounded-t ${sessionScore >= 75 ? "bg-[#1a8038]" : sessionScore >= 50 ? "bg-[#e67e22]" : "bg-primary"} opacity-80 hover:opacity-100 transition-all`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white px-2 py-0.5 font-mono-data text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {sessionScore}%
                        </div>
                        <span className="font-mono-data text-[8px] text-secondary mt-1">
                          {new Date(session.completedAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-tertiary">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-1.5 bg-[#1a8038]" />
                      <span className="font-mono-data text-[10px] text-secondary">Passing (≥75%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-1.5 bg-primary" />
                      <span className="font-mono-data text-[10px] text-secondary">Below passing</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-[10px] text-secondary">
                    Last 10 sessions
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-secondary text-on-primary border-t border-tertiary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-section-gap w-full max-w-[1440px] mx-auto">
          <div className="col-span-1 md:col-span-1">
            <span className="font-display-md text-headline-lg-mobile text-on-primary mb-4 block">
              BOARDS.
            </span>
            <p className="font-body-md text-secondary-fixed-dim opacity-80 max-w-xs leading-tight">
              Empowering the next generation of Filipino nurses with editorial-grade precision and
              educational excellence.
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="font-label-caps text-white mb-6 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">
                  Curriculum
                </Link>
              </li>
              <li>
                <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">
                  Mock Exams
                </Link>
              </li>
              <li>
                <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">
                  Flashcards
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-label-caps text-white mb-6 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-label-caps text-white mb-6 uppercase tracking-widest">Support</h4>
            <p className="font-body-md text-secondary-fixed-dim mb-4">
              Need help preparing for the boards?
            </p>
            <a className="font-headline-lg text-primary-fixed-dim underline underline-offset-8 decoration-1" href="mailto:support@boards.edu">
              Contact Support
            </a>
          </div>
        </div>
        <div className="px-margin-mobile md:px-margin-desktop py-8 border-t border-on-secondary-fixed-variant flex flex-col md:flex-row justify-between gap-4 max-w-[1440px] mx-auto">
          <span className="font-body-md text-secondary-fixed-dim opacity-60">
            &copy; 2024 BOARDS. Nursing Excellence Platform. All rights reserved.
          </span>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-secondary-fixed-dim cursor-pointer hover:text-white">face_nod</span>
            <span className="material-symbols-outlined text-secondary-fixed-dim cursor-pointer hover:text-white">language</span>
            <span className="material-symbols-outlined text-secondary-fixed-dim cursor-pointer hover:text-white">school</span>
          </div>
        </div>
      </footer>
    </>
  )
}
