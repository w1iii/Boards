"use client"

import { useState } from "react"
import Link from "next/link"
import SideNavBar from "@/app/components/side-nav-bar"
import { useSessionCreation } from "@/app/lib/use-session-creation"

const AREAS = [
  { key: "nlp-i", label: "NP I", description: "Community Health", icon: "groups" },
  { key: "nlp-ii", label: "NP II", description: "Mother & Child", icon: "pregnant_woman" },
  { key: "nlp-iii", label: "NP III", description: "Adult Health I", icon: "monitor_heart" },
  { key: "nlp-iv", label: "NP IV", description: "Adult Health II", icon: "medical_services" },
  { key: "nlp-v", label: "NP V", description: "Mental Health", icon: "psychology" },
] as const

const SECONDS_PER_QUESTION = 72

interface Props {
  firstName: string
  imageUrl: string | null
}

export default function MockExamSetup({ firstName, imageUrl }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [questionCount, setQuestionCount] = useState(50)

  const { loading, generating, error, notice, createSession } = useSessionCreation({
    type: "mock-exam",
    questionCount,
    difficulty: null,
  })

  function toggle(key: string) {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelected(next)
  }

  async function beginExam() {
    if (selected.size === 0) return
    createSession([...selected])
  }

  const count = selected.size
  const estimateMin = Math.round((questionCount * SECONDS_PER_QUESTION) / 60)
  const pct = ((questionCount - 25) / (100 - 25)) * 100

  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-3 md:py-5">
          <header className="mb-4 md:mb-5 shrink-0">
            <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-1.5">
              Mock Exam
            </p>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase mb-2 leading-[1.1]">
              Build Your Exam
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Timed simulation at real board-exam pace. No instant feedback — answers lock at submit.
            </p>
          </header>

          <div className="flex-1 overflow-y-auto -mx-3 px-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {AREAS.map((area) => {
                const isSelected = selected.has(area.key)
                return (
                  <button
                    key={area.key}
                    onClick={() => toggle(area.key)}
                    aria-pressed={isSelected}
                    className={`group cursor-pointer text-left bg-surface-container-lowest rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] border ${
                      isSelected
                        ? "border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-outline-variant/30"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors ${isSelected ? "bg-primary-container/20" : ""}`}>
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 26 }}>{area.icon}</span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display-lg text-xl text-primary">{area.label}</h3>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>check_circle</span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant">{area.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 px-1">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: 18 }}>schedule</span>
                <p className="text-error leading-snug" style={{ fontSize: 13, lineHeight: 1.4 }}>
                  500 items total · 100 per NP subject (NP I–V) · 2 days · Passing: 75% avg, no subject below 60%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6 space-y-3">
        <div className="max-w-7xl mx-auto w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 md:p-5 shadow-sm flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center">
          <div className="flex-1 w-full md:pr-6 md:border-r border-outline-variant/20">
            <div className="flex justify-between items-baseline mb-3">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.15em]">
                Exam Length
              </label>
              <div className="flex items-baseline gap-1">
                <span className="font-display-lg text-2xl text-primary leading-none">{questionCount}</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Questions</span>
              </div>
            </div>
            <div className="relative flex items-center group">
              <span className="font-label-caps text-label-caps text-on-surface-variant/60 mr-4">25</span>
              <div className="relative flex-1 h-6 flex items-center">
                <div className="absolute w-full h-1 bg-surface-variant rounded-full" />
                <div className="absolute h-1 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                <input
                  type="range"
                  min={25}
                  max={100}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute w-4 h-4 bg-primary rounded-full shadow-sm border-2 border-surface-container-lowest pointer-events-none transition-transform group-hover:scale-110"
                  style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                />
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant/60 ml-4">100</span>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto md:pl-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.15em] block mb-3">
              Estimated Time
            </label>
            <div className="bg-primary-container/10 border border-primary/20 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
              <p className="font-display-lg text-xl text-primary leading-none">~{estimateMin} min</p>
            </div>
          </div>
        </div>

        {notice && (
          <div className="max-w-7xl mx-auto bg-amber-50 border border-amber-300 text-amber-900 text-[12px] px-4 py-2.5 rounded-lg">
            {notice}
          </div>
        )}

        <div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-full border border-outline-variant/30 p-1.5 pl-4 md:pl-5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${error ? "bg-error" : count > 0 ? "bg-primary" : "bg-outline"}`} />
            <span className={`font-label-caps text-label-caps uppercase tracking-wider truncate ${error ? "text-error" : count > 0 ? "text-on-surface" : "text-primary"}`}>
              {error ? "ERROR" : count > 0 ? "Ready to Begin" : "Select at least one subject"}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/practice"
              className="px-3 py-2 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              Back to Practice
            </Link>
            <button
              onClick={beginExam}
              disabled={count === 0 || loading || generating}
              className={`px-5 md:px-6 py-2 rounded-full font-title-md text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] shrink-0 ${
                count === 0 || loading || generating
                  ? "bg-outline-variant text-on-surface opacity-70 cursor-not-allowed"
                  : "bg-primary text-on-primary candy-button-shadow-sm"
              }`}
            >
              {loading || generating ? (
                <><span>{generating ? "Generating..." : "Creating..."}</span><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span></>
              ) : (
                <><span>Start Mock Exam</span><span className="material-symbols-outlined" style={{ fontSize: 18 }}>timer</span></>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
