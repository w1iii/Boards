"use client"

import Link from "next/link"
import UserMenu from "@/app/dashboard/user-menu"

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NLP I — Foundation",
  "nlp-ii": "NLP II — Community Health",
  "nlp-iii": "NLP III — Mother & Child",
  "nlp-iv": "NLP IV — Med-Surg",
  "nlp-v": "NLP V — Psychiatric",
}

interface Props {
  sessionId: string
  firstName: string
  imageUrl: string | null
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  score: number
  areaBreakdown: Record<string, { correct: number; total: number }>
}

export default function ResultsView({
  sessionId,
  firstName,
  imageUrl,
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  score,
  areaBreakdown,
}: Props) {
  const pct = Math.round(score * 100)
  const passing = pct >= 75

  const r = 80
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score)

  const sortedAreas = Object.entries(areaBreakdown).sort(
    ([, a], [, b]) => b.correct / b.total - a.correct / a.total,
  )

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-surface">
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-2 bg-surface border-b border-tertiary shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-display-md text-[20px] font-black tracking-tighter text-on-surface">
            BOARDS.
          </span>
          <nav className="hidden md:flex gap-4">
            <Link className="font-label-caps text-[11px] text-on-secondary-fixed-variant hover:text-on-surface transition-colors duration-200" href="/dashboard">
              Dashboard
            </Link>
            <Link className="font-label-caps text-[11px] text-primary border-b-2 border-primary" href="/practice">
              Practice
            </Link>
            <Link className="font-label-caps text-[11px] text-on-secondary-fixed-variant hover:text-on-surface transition-colors duration-200" href="/progress">
              Progress
            </Link>
            <Link className="font-label-caps text-[11px] text-on-secondary-fixed-variant hover:text-on-surface transition-colors duration-200" href="/pricing">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="material-symbols-outlined p-1.5 hover:bg-surface-container transition-colors duration-200 rounded-full text-lg">
            notifications
          </button>
          <UserMenu imageUrl={imageUrl} firstName={firstName} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px] mb-2">
              SESSION COMPLETE
            </span>
            <h1 className="font-display-md text-display-md uppercase leading-none mb-2">
              {passing ? "PASSED" : "KEEP GOING"}
            </h1>
            <p className="font-body-md text-secondary text-sm">
              {passing
                ? "Great work! You're on track for the boards."
                : "Review the areas below and try again."}
            </p>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100" cy="100" r={r} fill="transparent"
                  stroke="currentColor" strokeWidth="12"
                  className="text-surface-container-highest"
                />
                <circle
                  cx="100" cy="100" r={r} fill="transparent"
                  stroke="currentColor" strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={passing ? "text-[#1a8038]" : "text-primary"}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display-md text-4xl font-black ${passing ? "text-[#1a8038]" : "text-primary"}`}>
                  {pct}%
                </span>
                <span className="font-label-caps text-[10px] text-secondary">
                  SCORE
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="font-display-md text-3xl font-black text-on-surface">
                {correctAnswers}
                <span className="text-secondary text-xl font-normal"> / {totalQuestions}</span>
              </p>
              <p className="font-label-caps text-[10px] text-secondary">CORRECT ANSWERS</p>
            </div>
          </div>

          {sortedAreas.length > 0 && (
            <div className="mb-10">
              <h2 className="font-label-caps text-secondary tracking-widest text-[10px] mb-4">
                AREA BREAKDOWN
              </h2>
              <div className="space-y-3">
                {sortedAreas.map(([area, data]) => {
                  const areaPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                  return (
                    <div key={area} className="bg-surface-container-low border border-tertiary p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-headline-lg text-sm uppercase">
                          {AREA_LABELS[area] || area}
                        </span>
                        <span className="font-mono-data text-xs">
                          {data.correct}/{data.total} — {areaPct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest">
                        <div
                          className={`h-full transition-all duration-700 ${areaPct >= 75 ? "bg-[#1a8038]" : areaPct >= 50 ? "bg-[#e67e22]" : "bg-primary"}`}
                          style={{ width: `${areaPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/practice/session/${sessionId}?review=1`}
              className="px-8 py-3 bg-surface border-2 border-secondary text-on-surface font-label-caps text-[11px] uppercase text-center hover:bg-secondary-container transition-all"
            >
              Review Questions
            </Link>
            <Link
              href="/practice"
              className="px-8 py-3 bg-primary text-on-primary font-label-caps text-[11px] uppercase text-center hover:bg-on-primary-fixed-variant transition-all"
            >
              New Practice Session
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
