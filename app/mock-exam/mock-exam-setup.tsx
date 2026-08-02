"use client"

import { useState } from "react"
import Link from "next/link"
import SideNavBar from "@/app/components/side-nav-bar"
import { useSessionCreation } from "@/app/lib/use-session-creation"

const AREAS = [
  { key: "nlp-i", label: "NP I", description: "Community Health", icon: "groups", accent: "bg-primary-fixed" },
  { key: "nlp-ii", label: "NP II", description: "Mother & Child", icon: "pregnant_woman", accent: "bg-secondary-fixed" },
  { key: "nlp-iii", label: "NP III", description: "Adult Health I", icon: "monitor_heart", accent: "bg-tertiary-fixed" },
  { key: "nlp-iv", label: "NP IV", description: "Adult Health II", icon: "medical_services", accent: "bg-primary-fixed-dim" },
  { key: "nlp-v", label: "NP V", description: "Mental Health", icon: "psychology", accent: "bg-outline-variant" },
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

  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-4 md:py-6">
          <div className="mb-3 md:mb-4 shrink-0">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] bg-primary-fixed px-3 py-1 rounded-full inline-block mb-1.5">
              Mock Exam
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary leading-[1.1]">
              BUILD YOUR EXAM
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
              Timed simulation at real board-exam pace. No instant feedback — answers lock at submit.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2">
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AREAS.map((area) => {
                const isSelected = selected.has(area.key)
                return (
                  <button
                    key={area.key}
                    onClick={() => toggle(area.key)}
                    className={`group cursor-pointer text-left relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary-fixed"
                        : "border-transparent bg-surface-container-lowest"
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${area.accent}`} style={{ opacity: 0.4 }} />
                    <div className="p-3 md:p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: 24 }}>{area.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-title-md text-title-md text-primary">{area.label}</h3>
                          {isSelected && (
                            <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>check_circle</span>
                          )}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5">{area.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 bg-surface-container-lowest border border-tertiary p-4 md:p-5 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: 22 }}>schedule</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-title-md text-title-md text-primary mb-2">How the real exam works</h3>
                  <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1 leading-snug list-disc pl-4">
                    <li>500 items total, 100 items per NP subject (NP I–V)</li>
                    <li>Administered over 2 days, roughly 2 hours per test</li>
                    <li>Passing: 75% general average AND no subject below 60%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6 space-y-2.5 md:space-y-3">
        <div className="max-w-4xl mx-auto w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-3 md:p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5">
            <div className="flex-1 w-full">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.1em] text-[11px] block mb-2">
                Exam Length: <span className="text-primary font-bold">{questionCount}</span> questions
              </label>
              <div className="flex items-center gap-3">
                <span className="font-body-sm text-[11px] text-on-surface-variant w-6 text-right">25</span>
                <input
                  type="range"
                  min={25}
                  max={100}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1 accent-primary h-1.5 appearance-none cursor-pointer rounded-full bg-outline-variant [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                />
                <span className="font-body-sm text-[11px] text-on-surface-variant w-6">100</span>
              </div>
            </div>
            <div className="shrink-0 bg-primary-fixed rounded-lg px-4 py-2.5 text-center min-w-[120px]">
              <p className="font-mono-data text-lg font-bold text-primary leading-none">
                ~{estimateMin} min
              </p>
              <p className="font-label-caps text-[10px] text-on-surface-variant mt-1">ESTIMATED TIME</p>
            </div>
          </div>
        </div>

        {notice && (
          <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-300 text-amber-900 text-[12px] px-4 py-2.5 rounded-lg">
            {notice}
          </div>
        )}

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-5 py-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,218,213,0.6)" }}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${count > 0 ? "bg-primary" : "bg-secondary"}`} />
            <p className="font-title-md text-title-md text-primary uppercase tracking-wider text-sm">
              {error ? "ERROR" : count > 0 ? `${count} Domain${count > 1 ? "s" : ""} Selected` : "Select at least one subject"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="px-5 py-2.5 rounded-full font-title-md text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Back to Practice
            </Link>
            <button
              onClick={beginExam}
              disabled={count === 0 || loading || generating}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-title-md text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
              style={{ boxShadow: "0 3px 0 #6E1818, 0 4px 12px rgba(149,35,35,0.2)" }}
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
