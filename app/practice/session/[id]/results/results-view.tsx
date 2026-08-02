"use client"

import Link from "next/link"
import SideNavBar from "@/app/components/side-nav-bar"

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NP I — Community Health",
  "nlp-ii": "NP II — Mother & Child",
  "nlp-iii": "NP III — Adult Health (Part 1)",
  "nlp-iv": "NP IV — Adult Health (Part 2)",
  "nlp-v": "NP V — Mental Health & Psych",
}

interface Props {
  sessionId: string
  firstName: string
  imageUrl: string | null
  totalQuestions: number
  correctAnswers: number
  score: number
  areaBreakdown: Record<string, { correct: number; total: number }>
  sessionType: string
  timeTakenSeconds: number | null
}

function formatDuration(total: number): string {
  const s = Math.max(0, Math.round(total))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}h ${pad(m)}m ${pad(sec)}s` : `${pad(m)}m ${pad(sec)}s`
}

export default function ResultsView({
  sessionId,
  firstName,
  imageUrl,
  totalQuestions,
  correctAnswers,
  score,
  areaBreakdown,
  sessionType,
  timeTakenSeconds,
}: Props) {
  const pct = Math.round(score * 100)
  const isMock = sessionType === "mock-exam"

  const belowFloorAreas = Object.entries(areaBreakdown)
    .filter(([, data]) => data.total > 0 && data.correct / data.total < 0.6)
    .map(([area]) => AREA_LABELS[area] || area)

  const passing = isMock ? pct >= 75 && belowFloorAreas.length === 0 : pct >= 75

  const r = 80
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score)

  const sortedAreas = Object.entries(areaBreakdown).sort(
    ([, a], [, b]) => b.correct / b.total - a.correct / a.total,
  )

  const failReason = isMock
    ? belowFloorAreas.length > 0
      ? `Below 60% in: ${belowFloorAreas.join(", ")}`
      : pct < 75
        ? "Overall score below 75%."
        : null
    : null

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px] mb-2">
              SESSION COMPLETE
            </span>
            {isMock && (
              <span className="font-label-caps text-[10px] uppercase tracking-[0.15em] bg-primary-fixed text-primary px-3 py-1 rounded-full inline-block mb-2">
                Mock Exam
              </span>
            )}
            <h1 className="font-display-md text-4xl md:text-display-md uppercase leading-none mb-2">
              {passing ? "PASSED" : "KEEP GOING"}
            </h1>
            <p className="font-body-md text-secondary text-sm">
              {isMock && failReason
                ? failReason
                : passing
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
            <div className="mt-4 flex items-center gap-6 text-center">
              <div>
                <p className="font-display-md text-3xl font-black text-on-surface">
                  {correctAnswers}
                  <span className="text-secondary text-xl font-normal"> / {totalQuestions}</span>
                </p>
                <p className="font-label-caps text-[10px] text-secondary">CORRECT ANSWERS</p>
              </div>
              {timeTakenSeconds !== null && (
                <div className="pl-6 border-l border-outline-variant">
                  <p className="font-display-md text-3xl font-black text-on-surface">
                    {formatDuration(timeTakenSeconds)}
                  </p>
                  <p className="font-label-caps text-[10px] text-secondary">TIME TAKEN</p>
                </div>
              )}
            </div>
          </div>

          {isMock && (
            <div className={`mb-6 p-4 border ${
              passing
                ? "bg-[#e6f4ea] border-[#1a8038]/30"
                : "bg-error-container border-primary/20"
            }`}>
              <p className="font-label-caps text-[10px] uppercase tracking-widest mb-1 text-on-surface">
                Passing Standard
              </p>
              <p className="font-body-md text-sm text-on-surface">
                {isMock
                  ? "To pass the mock exam you need an overall score of at least 75% with no subject below 60% — same as the real board exam."
                  : ""}
              </p>
            </div>
          )}

          {sortedAreas.length > 0 && (
            <div className="mb-10">
              <h2 className="font-label-caps text-secondary tracking-widest text-[10px] mb-4">
                AREA BREAKDOWN
              </h2>
              <div className="space-y-3">
                {sortedAreas.map(([area, data]) => {
                  const areaPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                  const floorMet = isMock ? areaPct >= 60 : areaPct >= 75
                  return (
                    <div key={area} className="bg-surface-container-low border border-tertiary p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-headline-lg text-sm uppercase">
                          {AREA_LABELS[area] || area}
                        </span>
                        <span className={`font-mono-data text-xs ${isMock && !floorMet ? "text-primary font-bold" : ""}`}>
                          {data.correct}/{data.total} — {areaPct}%
                          {isMock && !floorMet && <span className="ml-2 font-label-caps text-[9px]">BELOW 60%</span>}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest">
                        <div
                          className={`h-full transition-all duration-700 ${floorMet ? "bg-[#1a8038]" : areaPct >= 50 ? "bg-[#e67e22]" : "bg-primary"}`}
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
              href={`/practice/session/${sessionId}/review`}
              className="px-8 py-3 bg-surface border-2 border-secondary text-on-surface font-label-caps text-[11px] uppercase text-center hover:bg-secondary-container transition-all"
            >
              Review Answers
            </Link>
            <Link
              href={isMock ? "/mock-exam" : "/practice"}
              className="px-8 py-3 bg-primary text-on-primary font-label-caps text-[11px] uppercase text-center hover:bg-on-primary-fixed-variant transition-all"
            >
              {isMock ? "New Mock Exam" : "New Practice Session"}
            </Link>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
