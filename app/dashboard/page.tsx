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

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const r = 36
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score / 100)
  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r={r} fill="transparent"
          stroke="currentColor" strokeWidth="4"
          className="text-surface-container-highest"
        />
        <circle
          cx="40" cy="40" r={r} fill="transparent"
          stroke="currentColor" strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono-data text-xs">
        {label}
      </div>
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
        <h3 className={`font-headline-lg text-headline-lg-mobile mb-4 ${variant === "alert" ? "text-white" : ""}`}>
          {label}
        </h3>
        {description && (
          <p className="text-secondary max-w-lg mb-6">{description}</p>
        )}
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
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary shrink-0" /> Therapeutic Communication
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary shrink-0" /> Personality Disorders
            </li>
          </ul>
        )}
        {variant === "dark" && (
          <p className="mt-6 font-label-caps text-xs">EXPERT PROFICIENCY ACHIEVED</p>
        )}
        {variant === "alert" && (
          <>
            <p className="mt-8 font-label-caps text-xs">ACTION REQUIRED: WEAK PERFORMANCE</p>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:scale-110 transition-transform">
              priority_high
            </span>
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
  const totalAnswered =
    (progressResult.rows[0] as Record<string, unknown>)?.total_answered as number || 0
  const totalCorrect =
    (progressResult.rows[0] as Record<string, unknown>)?.total_correct as number || 0
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
    areaBreakdown = areaResult.rows as Array<{
      content_area: string
      total: number
      correct: number
    }>
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
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const areaOrder = [
    "nlp-iv",
    "nlp-v",
    "nlp-ii",
    "nlp-i",
    "nlp-iii",
  ]

  return (
    <>
      <NavHeader firstName={firstName} imageUrl={user?.imageUrl ?? null} activeHref="/dashboard" />

      <main className="min-h-screen grid-pattern">
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          {/* Hero Welcome Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-12">
            <div className="md:col-span-8 bg-surface-container border-l-4 border-primary p-10">
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 uppercase tracking-tighter">
                {greeting}, {firstName}.
              </h1>
              <p className="font-body-lg text-secondary mb-8 max-w-2xl">
                {examDaysLeft !== null ? (
                  <>
                    Your NLE Board Exam is in{" "}
                    <span className="font-bold text-on-surface">{examDaysLeft} days</span>. Keep
                    the momentum going to secure your license.
                  </>
                ) : (
                  <>
                    Stay consistent with your{" "}
                    <span className="font-bold text-on-surface">daily practice</span> to build
                    mastery before exam day.
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
                <Link
                  href="/practice?type=mock-exam"
                  className="border-2 border-secondary px-8 py-3 font-label-caps hover:bg-secondary-container transition-all uppercase"
                >
                  Take Mock Exam
                </Link>
              </div>
            </div>
            <div className="md:col-span-4 bg-secondary text-white p-10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="font-label-caps opacity-70">DAILY STREAK</span>
                <span
                  className="material-symbols-outlined text-primary-fixed-dim"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
              </div>
              <div>
                <div className="font-display-md text-6xl">1</div>
                <p className="font-label-caps">DAY ACTIVE</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            <div className="bg-surface border border-tertiary p-8 flex items-center justify-between">
              <div>
                <p className="font-label-caps text-secondary mb-1">OVERALL MASTERY</p>
                <h2 className="font-display-md text-[42px]">{overallScore}%</h2>
              </div>
              <ScoreCircle score={overallScore} label="TOP" />
            </div>
            <div className="bg-surface border border-tertiary p-8">
              <p className="font-label-caps text-secondary mb-1">TOTAL QUESTIONS</p>
              <h2 className="font-display-md text-[42px]">{totalAnswered.toLocaleString()}</h2>
              <p className="font-mono-data text-secondary mt-2">
                {totalAnswered > 0 ? "Keep building momentum" : "Start your first session"}
              </p>
            </div>
            <div className="bg-surface border border-tertiary p-8 flex items-center justify-between group cursor-help">
              <div>
                <p className="font-label-caps text-secondary mb-1">WEAK AREAS</p>
                <h2 className="font-display-md text-[42px] text-primary">
                  {weakAreas.length.toString().padStart(2, "0")}
                </h2>
              </div>
              <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">
                warning
              </span>
            </div>
          </div>

          {/* Weak Areas Alert */}
          {weakestArea && (
            <div className="mb-12 border-2 border-primary bg-error-container p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span
                  className="material-symbols-outlined text-primary text-3xl shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
                <div>
                  <h3 className="font-label-caps text-primary">URGENT REVIEW NEEDED</h3>
                  <p className="font-body-md text-on-error-container">
                    Your score in{" "}
                    <span className="font-bold">
                      {AREA_LABELS[weakestArea[0]] || weakestArea[0]}
                    </span>{" "}
                    is {weakestArea[1]}%. We recommend a focused 50-question drill.
                  </p>
                </div>
              </div>
              <Link
                href="/practice"
                className="bg-primary text-white px-6 py-2 font-label-caps uppercase whitespace-nowrap shrink-0"
              >
                Fix This Now
              </Link>
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
                <Link
                  className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300"
                  href="#"
                >
                  Curriculum
                </Link>
              </li>
              <li>
                <Link
                  className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300"
                  href="#"
                >
                  Mock Exams
                </Link>
              </li>
              <li>
                <Link
                  className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300"
                  href="#"
                >
                  Flashcards
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-label-caps text-white mb-6 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300"
                  href="#"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300"
                  href="#"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300"
                  href="#"
                >
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
            <a
              className="font-headline-lg text-primary-fixed-dim underline underline-offset-8 decoration-1"
              href="mailto:support@boards.edu"
            >
              Contact Support
            </a>
          </div>
        </div>
        <div className="px-margin-mobile md:px-margin-desktop py-8 border-t border-on-secondary-fixed-variant flex flex-col md:flex-row justify-between gap-4 max-w-[1440px] mx-auto">
          <span className="font-body-md text-secondary-fixed-dim opacity-60">
            &copy; 2024 BOARDS. Nursing Excellence Platform. All rights reserved.
          </span>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-secondary-fixed-dim cursor-pointer hover:text-white">
              face_nod
            </span>
            <span className="material-symbols-outlined text-secondary-fixed-dim cursor-pointer hover:text-white">
              language
            </span>
            <span className="material-symbols-outlined text-secondary-fixed-dim cursor-pointer hover:text-white">
              school
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
