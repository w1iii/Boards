import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import AppLayout from "@/app/components/app-layout"
import { getProfile, getProgressAgg, getAreaBreakdown } from "@/app/lib/db"

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NP I — Community Health",
  "nlp-ii": "NP II — Mother & Child",
  "nlp-iii": "NP III — Adult Health (Part 1)",
  "nlp-iv": "NP IV — Adult Health (Part 2)",
  "nlp-v": "NP V — Mental Health & Psych",
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const r = 36
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score / 100)
  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="transparent" stroke="currentColor" strokeWidth="4" className="text-surface-container-highest" />
        <circle cx="40" cy="40" r={r} fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} className="text-primary" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono-data text-xs">{label}</div>
    </div>
  )
}

async function DashboardHero({ userId }: { userId: string }) {
  const profile = await getProfile(userId)
  const firstName = (profile?.first_name as string) || "there"
  const targetExamDate = profile?.target_exam_date as string | null

  const examDaysLeft: number | null = targetExamDate
    ? (() => {
        const diff = new Date(targetExamDate).getTime() - new Date().getTime()
        return Math.max(0, Math.ceil(diff / 86400000))
      })()
    : null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <section className="mb-10 relative">
      <div className="glass-jar p-8 md:p-10 rounded-3xl border border-white/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-display-lg text-display-lg text-primary mb-2">
              {greeting}, {firstName}!
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl">
              {examDaysLeft !== null ? (
                <>Your NLE Board Exam is in <strong className="text-primary">{examDaysLeft} days</strong>. Keep the momentum going!</>
              ) : (
                <>Stay consistent with your <strong>daily practice</strong> to build mastery.</>
              )}
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link href="/practice" className="px-6 py-3 bg-primary text-on-primary rounded-full font-title-md text-sm candy-button-shadow hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Start Practice
            </Link>
            <Link href="/practice?type=mock-exam" className="px-6 py-3 bg-secondary text-on-secondary rounded-full font-title-md text-sm candy-button-shadow hover:bg-secondary-container hover:text-on-secondary-container active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">assignment</span>
              Mock Exam
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardHeroFallback() {
  return (
    <section className="mb-10 relative">
      <div className="glass-jar p-8 md:p-10 rounded-3xl border border-white/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="w-64 h-9 rounded shimmer bg-surface-container-high" />
            <div className="w-96 h-5 rounded shimmer bg-surface-container-high" />
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="w-36 h-11 rounded-full shimmer bg-primary-fixed" />
            <div className="w-36 h-11 rounded-full shimmer bg-surface-container-high" />
          </div>
        </div>
      </div>
    </section>
  )
}

async function DashboardStats({ userId }: { userId: string }) {
  const { totalAnswered, totalCorrect } = await getProgressAgg(userId)
  const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const areaBreakdown = await getAreaBreakdown(userId)

  const profile = await getProfile(userId)
  const contentAreas = (profile?.content_areas as string[]) || []

  const areaScores = new Map<string, number>()
  for (const area of contentAreas) {
    const found = areaBreakdown.find((a) => a.content_area === area)
    if (found && found.total > 0) {
      areaScores.set(area, Math.round((found.correct / found.total) * 100))
    } else {
      areaScores.set(area, 0)
    }
  }

  const weakAreas = [...areaScores.entries()]
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
  const weakestArea = weakAreas[0]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-jar p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="font-label-caps text-on-surface-variant mb-1">OVERALL MASTERY</p>
            <h2 className="font-display-lg text-4xl text-primary">{overallScore}%</h2>
          </div>
          <ScoreCircle score={overallScore} label="TOP" />
        </div>
        <div className="glass-jar p-6 rounded-2xl">
          <p className="font-label-caps text-on-surface-variant mb-1">TOTAL QUESTIONS</p>
          <h2 className="font-display-lg text-4xl text-primary">{totalAnswered.toLocaleString()}</h2>
          <p className="font-mono-data text-on-surface-variant text-xs mt-2">
            {totalAnswered > 0 ? `${totalCorrect} correct — keep building!` : "Start your first session"}
          </p>
        </div>
        <div className="glass-jar p-6 rounded-2xl flex items-center justify-between group cursor-help">
          <div>
            <p className="font-label-caps text-on-surface-variant mb-1">WEAK AREAS</p>
            <h2 className="font-display-lg text-4xl text-primary">{weakAreas.length.toString().padStart(2, "0")}</h2>
          </div>
          <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">warning</span>
        </div>
      </div>

      {weakestArea && (
        <div className="mb-10 bg-primary-container p-6 rounded-2xl border-l-4 border-primary text-on-primary-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <div>
                <h3 className="font-title-md">Urgent Review Needed</h3>
                <p className="font-body-md opacity-90">
                  Your score in <strong>{AREA_LABELS[weakestArea[0]] || weakestArea[0]}</strong> is {weakestArea[1]}%. Focused drill recommended.
                </p>
              </div>
            </div>
            <Link href="/practice" className="shrink-0 px-6 py-2.5 bg-on-primary-container text-primary-container rounded-xl font-label-caps hover:opacity-90 transition-all">
              Fix This Now
            </Link>
          </div>
        </div>
      )}

      <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Content Areas</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-8 space-y-6">
          {contentAreas.map((area) => {
            const score = areaScores.get(area) || 0
            const label = AREA_LABELS[area] || area
            return (
              <div key={area} className="glass-jar p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-title-md text-primary">{label}</h3>
                  <span className="font-mono-data text-on-surface-variant">{score}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${score}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="md:col-span-4 space-y-6">
          <div className="bg-primary p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <h3 className="font-headline-lg mb-4 italic">Study Tip</h3>
            <p className="font-body-md italic opacity-90 leading-relaxed">&ldquo;Just like a patient assessment, some questions require a deeper look. Read the rationale before discharging your focus.&rdquo;</p>
            <div className="mt-4 flex justify-end">
              <span className="material-symbols-outlined text-3xl opacity-50">format_quote</span>
            </div>
          </div>
          <div className="glass-jar p-6 rounded-3xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <h4 className="font-title-md text-primary">Keep Going!</h4>
            <p className="font-label-caps text-on-surface-variant text-xs mt-1">Consistency is key to passing the NLE.</p>
          </div>
        </div>
      </div>
    </>
  )
}

function DashboardStatsFallback() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-jar p-6 rounded-2xl space-y-2">
            <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
            <div className="w-20 h-9 rounded shimmer bg-surface-container-high" />
          </div>
        ))}
      </div>
      <div className="w-48 h-7 rounded shimmer bg-surface-container-high mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-8 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-jar p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-40 h-4 rounded shimmer bg-surface-container-high" />
                <div className="w-10 h-4 rounded shimmer bg-surface-container-high" />
              </div>
              <div className="h-2 w-full rounded-full shimmer bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <AppLayout
      firstName={(profile.first_name as string) || "there"}
      imageUrl={null}
    >
      <Suspense fallback={<DashboardHeroFallback />}>
        <DashboardHero userId={userId} />
      </Suspense>
      <Suspense fallback={<DashboardStatsFallback />}>
        <DashboardStats userId={userId} />
      </Suspense>
    </AppLayout>
  )
}
