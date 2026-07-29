import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import AppLayout from "@/app/components/app-layout"

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

function AreaCard({
  label,
  score,
  description,
  strengths,
  challenges,
  variant = "default",
}: {
  label: string
  score: number
  description?: string
  strengths?: { label: string; value: string }[]
  challenges?: { label: string; value: string }[]
  variant?: "default" | "surface-container" | "dark" | "alert"
}) {
  const bgMap = {
    default: "bg-surface border border-tertiary",
    "surface-container": "bg-surface-container border border-tertiary",
    dark: "bg-secondary text-white",
    alert: "bg-primary text-white",
  }
  const barBgMap: Record<string, string> = {
    default: "bg-surface-container-highest",
    "surface-container": "bg-tertiary-fixed",
    dark: "bg-on-secondary-fixed-variant",
    alert: "bg-on-primary-fixed-variant",
  }
  const barFillMap: Record<string, string> = {
    default: "bg-primary",
    "surface-container": "bg-on-surface",
    dark: "bg-primary-fixed",
    alert: "bg-white",
  }

  return (
    <div className={`${bgMap[variant]} p-8 ${variant === "alert" ? "relative overflow-hidden group" : ""}`}>
      <div className={variant === "alert" ? "relative z-10" : ""}>
        <h3 className={`font-headline-lg text-headline-lg-mobile mb-4 ${variant === "alert" ? "text-white" : ""}`}>{label}</h3>
        {description && <p className="text-secondary max-w-lg mb-6">{description}</p>}
        <div className="flex justify-between font-mono-data mb-2">
          <span>Current Score</span>
          <span className={variant === "alert" ? "font-bold" : ""}>{score}%</span>
        </div>
        <div className={`h-1 w-full ${variant === "alert" ? "h-1.5" : ""} ${barBgMap[variant]}`}>
          <div className={`h-full ${barFillMap[variant]}`} style={{ width: `${score}%` }} />
        </div>
        {strengths && challenges && (
          <div className="mt-12 flex gap-12">
            <div>
              <p className="font-label-caps text-secondary text-[10px]">STRENGTH</p>
              <p className="font-mono-data">{strengths[0]?.value}</p>
            </div>
            <div>
              <p className="font-label-caps text-secondary text-[10px]">CHALLENGE</p>
              <p className="font-mono-data">{challenges[0]?.value}</p>
            </div>
          </div>
        )}
        {variant === "surface-container" && (
          <ul className="space-y-3 font-mono-data text-sm text-secondary mt-8">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary shrink-0" /> Therapeutic Communication</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary shrink-0" /> Personality Disorders</li>
          </ul>
        )}
        {variant === "dark" && <p className="mt-6 font-label-caps text-xs">EXPERT PROFICIENCY ACHIEVED</p>}
        {variant === "alert" && (
          <>
            <p className="mt-8 font-label-caps text-xs">ACTION REQUIRED: WEAK PERFORMANCE</p>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:scale-110 transition-transform">priority_high</span>
          </>
        )}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
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
  const totalAnswered = (progressResult.rows[0] as Record<string, unknown>)?.total_answered as number || 0
  const totalCorrect = (progressResult.rows[0] as Record<string, unknown>)?.total_correct as number || 0
  const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

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
    areaBreakdown = areaResult.rows as Array<{ content_area: string; total: number; correct: number }>
  } catch {
    // area breakdown unavailable
  }

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

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <>
      <AppLayout firstName={firstName} imageUrl={user?.imageUrl ?? null}>
        {/* Hero Welcome Section */}
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

        {/* Stats Row */}
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

        {/* Weak Areas Alert */}
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

        {/* Area Breakdown */}
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
      </AppLayout>
    </>
  )
}
