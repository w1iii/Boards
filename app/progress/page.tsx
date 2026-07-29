import { auth } from "@clerk/nextjs/server"
import { sql, getProfile, getProgressAgg, getAreaBreakdown } from "@/app/lib/db"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import AppLayout from "@/app/components/app-layout"

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NP I — Community Health",
  "nlp-ii": "NP II — Mother & Child",
  "nlp-iii": "NP III — Adult Health (Part 1)",
  "nlp-iv": "NP IV — Adult Health (Part 2)",
  "nlp-v": "NP V — Mental Health & Psych",
}

const AREA_ICONS: Record<string, string> = {
  "nlp-i": "psychology",
  "nlp-ii": "groups",
  "nlp-iii": "pregnancy",
  "nlp-iv": "monitor_heart",
  "nlp-v": "mindfulness",
}

const AREA_DESCRIPTIONS: Record<string, string> = {
  "nlp-i": "Community health, environmental sanitation, population groups.",
  "nlp-ii": "Maternal and child health, obstetrics, pediatrics.",
  "nlp-iii": "Adult health — oxygenation, F&E, nutrition, metabolism, perioperative.",
  "nlp-iv": "Acute crises, emergency/disaster, cellular aberrations, immunologic.",
  "nlp-v": "Mental health, psychiatric nursing, leadership, legal/ethical.",
}

function ScoreRing({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? 200 : 120
  const r = size === "lg" ? 80 : 48
  const stroke = size === "lg" ? 12 : 8
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(score, 100) / 100)
  const textSize = size === "lg" ? "text-5xl" : "text-2xl"

  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dim} ${dim}`}>
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="transparent" stroke="currentColor" strokeWidth={stroke} className="text-surface-container-highest" />
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="transparent" stroke="currentColor" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={score >= 75 ? "text-[#1a8038]" : "text-primary"} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display-md ${textSize} font-black ${score >= 75 ? "text-[#1a8038]" : "text-primary"}`}>{Math.round(score)}%</span>
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
  const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  const passed = score >= 75

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-surface-container-low border border-tertiary hover:bg-surface-container transition-colors rounded-xl">
      <div className="w-8 text-center shrink-0">
        <span className="font-mono-data text-secondary text-xs">#{index}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-label-caps text-[10px] px-1.5 py-0.5 ${type === "mock-exam" ? "bg-primary text-white" : "bg-surface-container-highest text-secondary"} rounded`}>
            {type === "mock-exam" ? "MOCK EXAM" : "PRACTICE"}
          </span>
          <span className="font-mono-data text-xs text-secondary truncate">{formatted}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono-data text-sm ${passed ? "text-[#1a8038]" : "text-primary"}`}>{Math.round(score)}%</span>
          <span className="text-secondary text-xs">{correctAnswers}/{totalQuestions} correct</span>
        </div>
      </div>
      <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${passed ? "bg-[#1a8038]" : "bg-primary"}`} />
    </div>
  )
}

async function ProgressHero({ userId }: { userId: string }) {
  const profile = await getProfile(userId)
  const firstName = (profile?.first_name as string) || "there"
  const targetExamDate = profile?.target_exam_date as string | null

  const examDaysLeft: number | null = targetExamDate
    ? (() => {
        const diff = new Date(targetExamDate).getTime() - new Date().getTime()
        return Math.max(0, Math.ceil(diff / 86400000))
      })()
    : null

  const { totalAnswered, totalCorrect } = await getProgressAgg(userId)
  const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <section className="mb-10">
      <div className="glass-jar p-8 md:p-10 rounded-3xl border border-white/50 backdrop-blur-md">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="font-display-lg text-display-lg text-primary mb-2">Progress & Analytics</h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl">
              {examDaysLeft !== null ? (
                <>Your NLE Board Exam is in <strong className="text-primary">{examDaysLeft} days</strong>. Track your mastery.</>
              ) : (
                <>Monitor your performance and identify areas for improvement.</>
              )}
            </p>
            <div className="flex gap-4 mt-6">
              <Link href="/practice" className="px-6 py-3 bg-primary text-on-primary rounded-full font-title-md text-sm candy-button-shadow hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">play_circle</span>
                Start Practice
              </Link>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center">
            <p className="font-label-caps text-on-surface-variant mb-2">OVERALL MASTERY</p>
            <ScoreRing score={overallScore} size="lg" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgressHeroFallback() {
  return (
    <section className="mb-10">
      <div className="glass-jar p-8 md:p-10 rounded-3xl border border-white/50 backdrop-blur-md">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-3">
            <div className="w-72 h-9 rounded shimmer bg-surface-container-high" />
            <div className="w-96 h-5 rounded shimmer bg-surface-container-high" />
            <div className="flex gap-4 mt-6">
              <div className="w-36 h-11 rounded-full shimmer bg-primary-fixed" />
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center space-y-2">
            <div className="w-28 h-3 rounded shimmer bg-surface-container-high" />
            <div className="w-[200px] h-[200px] rounded-full shimmer bg-surface-container-high" />
          </div>
        </div>
      </div>
    </section>
  )
}

async function ProgressStats({ userId }: { userId: string }) {
  const { totalAnswered, totalCorrect } = await getProgressAgg(userId)
  const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const areaBreakdown = await getAreaBreakdown(userId)
  const profile = await getProfile(userId)
  const contentAreas = (profile?.content_areas as string[]) || []

  const sessionCountResult = await sql`
    SELECT COUNT(*)::int as count FROM sessions
    WHERE user_id = ${userId} AND status = 'completed'
  `
  const sessionCount = (sessionCountResult.rows[0] as Record<string, unknown>)?.count as number || 0

  const areaScores = new Map<string, { score: number; total: number; correct: number }>()
  for (const area of contentAreas) {
    const found = areaBreakdown.find((a) => a.content_area === area)
    if (found && found.total > 0) {
      areaScores.set(area, { score: Math.round((found.correct / found.total) * 100), total: found.total, correct: found.correct })
    } else {
      areaScores.set(area, { score: 0, total: 0, correct: 0 })
    }
  }

  const weakAreas = [...areaScores.entries()]
    .filter(([, v]) => v.total >= 5 && v.score < 50)
    .map(([area]) => area)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="glass-jar p-6 rounded-2xl">
          <p className="font-label-caps text-on-surface-variant mb-1">TOTAL QUESTIONS</p>
          <h2 className="font-display-lg text-3xl md:text-4xl text-primary">{totalAnswered.toLocaleString()}</h2>
          <p className="font-mono-data text-on-surface-variant text-xs mt-2">{totalCorrect} correct</p>
        </div>
        <div className="glass-jar p-6 rounded-2xl">
          <p className="font-label-caps text-on-surface-variant mb-1">SESSIONS</p>
          <h2 className="font-display-lg text-3xl md:text-4xl text-primary">{sessionCount}</h2>
          <p className="font-mono-data text-on-surface-variant text-xs mt-2">completed</p>
        </div>
        <div className="glass-jar p-6 rounded-2xl">
          <p className="font-label-caps text-on-surface-variant mb-1">ACCURACY</p>
          <h2 className={`font-display-lg text-3xl md:text-4xl ${overallScore >= 75 ? "text-[#1a8038]" : "text-primary"}`}>{overallScore}%</h2>
          <p className="font-mono-data text-on-surface-variant text-xs mt-2">{overallScore >= 75 ? "On track" : "Needs improvement"}</p>
        </div>
        <div className="glass-jar p-6 rounded-2xl">
          <p className="font-label-caps text-on-surface-variant mb-1">WEAK AREAS</p>
          <h2 className="font-display-lg text-3xl md:text-4xl text-primary">{weakAreas.length.toString().padStart(2, "0")}</h2>
          <p className="font-mono-data text-on-surface-variant text-xs mt-2">{weakAreas.length > 0 ? "Needs focus" : "None detected"}</p>
        </div>
      </div>

      {weakAreas.length > 0 && (
        <div className="mb-10 bg-primary-container p-6 rounded-2xl border-l-4 border-primary text-on-primary-container">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <div>
              <h3 className="font-title-md">Areas Requiring Attention</h3>
              <p className="font-body-md opacity-90">
                {weakAreas.length} content area{weakAreas.length > 1 ? "s" : ""} below 50% mastery. Focused practice recommended.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {weakAreas.map((area) => (
              <Link
                key={area}
                href={`/practice?area=${area}`}
                className="bg-on-primary-container text-primary-container px-4 py-2 font-label-caps text-xs uppercase rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">{AREA_ICONS[area] || "school"}</span>
                {AREA_LABELS[area] || area}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function ProgressStatsFallback() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-jar p-6 rounded-2xl space-y-2">
          <div className="w-20 h-3 rounded shimmer bg-surface-container-high" />
          <div className="w-24 h-8 rounded shimmer bg-surface-container-high" />
          <div className="w-16 h-3 rounded shimmer bg-surface-container-high mt-2" />
        </div>
      ))}
    </div>
  )
}

async function ProgressAreas({ userId }: { userId: string }) {
  const areaBreakdown = await getAreaBreakdown(userId)
  const profile = await getProfile(userId)
  const contentAreas = (profile?.content_areas as string[]) || []

  const areaScores = new Map<string, { score: number; total: number; correct: number }>()
  for (const area of contentAreas) {
    const found = areaBreakdown.find((a) => a.content_area === area)
    if (found && found.total > 0) {
      areaScores.set(area, { score: Math.round((found.correct / found.total) * 100), total: found.total, correct: found.correct })
    } else {
      areaScores.set(area, { score: 0, total: 0, correct: 0 })
    }
  }

  const sortedAreas = [...areaScores.entries()]
    .map(([area, v]) => ({ area, ...v }))
    .sort((a, b) => a.score - b.score)

  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-headline-lg text-headline-lg text-primary">Content Area Mastery</h2>
        <span className="font-label-caps text-on-surface-variant text-xs">Sorted weakest to strongest</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedAreas.map(({ area, score, total, correct }) => {
          const label = AREA_LABELS[area] || area
          const icon = AREA_ICONS[area] || "school"
          const description = AREA_DESCRIPTIONS[area]
          const scoreColor = score >= 75 ? "text-[#1a8038]" : score >= 50 ? "text-[#e67e22]" : "text-primary"
          const barColor = score >= 75 ? "bg-[#1a8038]" : score >= 50 ? "bg-[#e67e22]" : "bg-primary"

          return (
            <div key={area} className="glass-jar p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-secondary">{icon}</span>
                  <div>
                    <h3 className="font-title-md text-sm uppercase">{label}</h3>
                    {description && <p className="font-mono-data text-xs text-on-surface-variant">{description}</p>}
                  </div>
                </div>
                <span className={`font-display-md text-2xl font-black ${scoreColor}`}>{score}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
              </div>
              {total > 0 && (
                <div className="flex justify-between mt-3">
                  <span className="font-mono-data text-xs text-on-surface-variant">{correct}/{total} correct</span>
                  <Link href={`/practice?area=${area}`} className="font-label-caps text-[10px] text-primary hover:underline">PRACTICE THIS AREA</Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressAreasFallback() {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <div className="w-48 h-7 rounded shimmer bg-surface-container-high" />
        <div className="w-32 h-3 rounded shimmer bg-surface-container-high" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-jar p-6 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-outline-variant/30">school</span>
                <div className="space-y-1">
                  <div className="w-36 h-4 rounded shimmer bg-surface-container-high" />
                  <div className="w-48 h-3 rounded shimmer bg-surface-container-high" />
                </div>
              </div>
              <div className="w-16 h-7 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="h-2 w-full rounded-full shimmer bg-surface-container-high" />
            <div className="flex justify-between">
              <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
              <div className="w-28 h-3 rounded shimmer bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function ProgressSessions({ userId }: { userId: string }) {
  const sessionsResult = await sql`
    SELECT id, type, questions, answers, completed_at
    FROM sessions
    WHERE user_id = ${userId} AND status = 'completed'
    ORDER BY completed_at DESC
    LIMIT 20
  `

  if (sessionsResult.rows.length === 0) {
    return (
      <div className="mb-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-headline-lg text-headline-lg text-primary">Session History</h2>
          <span className="font-label-caps text-on-surface-variant text-xs">Last 0 sessions</span>
        </div>
        <div className="glass-jar p-10 rounded-2xl text-center">
          <span className="material-symbols-outlined text-4xl text-secondary mb-4 block">timeline</span>
          <p className="font-body-md text-on-surface-variant mb-4">No completed sessions yet. Start practicing to see your progress.</p>
          <Link href="/practice" className="bg-primary text-on-primary px-6 py-2.5 font-label-caps text-xs rounded-xl candy-button-shadow-sm inline-block">Start Your First Session</Link>
        </div>
      </div>
    )
  }

  const allQuestionIds = [...new Set(sessionsResult.rows.flatMap(
    (s: Record<string, unknown>) => (s.questions as string[]) || [],
  ))]

  let questionMap = new Map<string, { id: string; correct_answer: string }>()
  if (allQuestionIds.length > 0) {
    const questions = await sql`
      SELECT id, correct_answer FROM questions WHERE id = ANY(${allQuestionIds})
    `
    questionMap = new Map(
      (questions.rows as Array<{ id: string; correct_answer: string }>).map((q) => [q.id, q]),
    )
  }

  const recentSessions = (sessionsResult.rows as Array<Record<string, unknown>>).map((s) => {
    const answers = (s.answers ?? {}) as Record<string, string>
    const questionIds = (s.questions ?? []) as string[]
    let correctCount = 0
    for (const qId of questionIds) {
      const q = questionMap.get(qId)
      if (q && answers[qId] === q.correct_answer) correctCount++
    }
    return {
      id: s.id as string,
      score: questionIds.length > 0 ? (correctCount / questionIds.length) * 100 : 0,
      totalQuestions: questionIds.length,
      correctAnswers: correctCount,
      type: s.type as string,
      completedAt: s.completed_at as string,
    }
  })

  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-headline-lg text-headline-lg text-primary">Session History</h2>
        <span className="font-label-caps text-on-surface-variant text-xs">Last {recentSessions.length} sessions</span>
      </div>
      <div className="space-y-2">
        {recentSessions.map((session, i) => (
          <Link key={session.id} href={`/practice/session/${session.id}/results`}>
            <SessionTimelineItem
              sessionId={session.id}
              score={Math.round(session.score)}
              totalQuestions={session.totalQuestions}
              correctAnswers={session.correctAnswers}
              type={session.type}
              completedAt={session.completedAt}
              index={recentSessions.length - i}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

function ProgressSessionsFallback() {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <div className="w-36 h-7 rounded shimmer bg-surface-container-high" />
        <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 px-4 bg-surface-container-low rounded-xl">
            <div className="w-8 text-center shrink-0">
              <div className="w-4 h-3 rounded shimmer bg-surface-container-high mx-auto" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-16 h-4 rounded shimmer bg-surface-container-high" />
                <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-4 rounded shimmer bg-surface-container-high" />
                <div className="w-16 h-3 rounded shimmer bg-surface-container-high" />
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full shimmer bg-surface-container-high shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ProgressPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getProfile(userId)
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <AppLayout
      firstName={(profile.first_name as string) || "there"}
      imageUrl={null}
    >
      <Suspense fallback={<ProgressHeroFallback />}>
        <ProgressHero userId={userId} />
      </Suspense>
      <Suspense fallback={<ProgressStatsFallback />}>
        <ProgressStats userId={userId} />
      </Suspense>
      <Suspense fallback={<ProgressAreasFallback />}>
        <ProgressAreas userId={userId} />
      </Suspense>
      <Suspense fallback={<ProgressSessionsFallback />}>
        <ProgressSessions userId={userId} />
      </Suspense>
    </AppLayout>
  )
}
