"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SideNavBar from "@/app/components/side-nav-bar"

const AREAS = [
  { key: "nlp-i", label: "NP I", description: "Community Health", icon: "groups", accent: "bg-primary-fixed" },
  { key: "nlp-ii", label: "NP II", description: "Mother & Child", icon: "pregnant_woman", accent: "bg-secondary-fixed" },
  { key: "nlp-iii", label: "NP III", description: "Adult Health I", icon: "monitor_heart", accent: "bg-tertiary-fixed" },
  { key: "nlp-iv", label: "NP IV", description: "Adult Health II", icon: "medical_services", accent: "bg-primary-fixed-dim" },
  { key: "nlp-v", label: "NP V", description: "Mental Health", icon: "psychology", accent: "bg-outline-variant" },
] as const

interface Props {
  firstName: string
  imageUrl: string | null
}

const DIFFICULTIES = [
  { key: "all", label: "All", description: "Mix of easy to hard" },
  { key: "easy", label: "Easy", description: "Recall & basic application" },
  { key: "medium", label: "Medium", description: "Analysis & priority setting" },
  { key: "hard", label: "Hard", description: "Complex multi-step reasoning" },
] as const

export default function PracticeSetup({ firstName, imageUrl }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [questionCount, setQuestionCount] = useState(20)
  const [difficulty, setDifficulty] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function toggle(key: string) {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelected(next)
    setError(null)
  }

  function splitCount(areas: string[]): number[] {
    const n = areas.length
    const base = Math.floor(questionCount / n)
    const remainder = questionCount % n
    return areas.map((_, i) => base + (i < remainder ? 1 : 0))
  }

  async function generateQuestions(areas: string[]) {
    setGenerating(true)
    const counts = splitCount(areas)
    try {
      for (let i = 0; i < areas.length; i++) {
        const body: Record<string, unknown> = { contentArea: areas[i], count: counts[i] }
        if (difficulty !== "all") body.difficulty = difficulty
        const res = await fetch("/api/questions/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
      }
      setGenerating(false)
      createSession(areas)
    } catch {
      setGenerating(false)
      setError("Failed to generate questions. Please try again.")
    }
  }

  async function createSession(areas: string[]) {
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { type: "practice", contentAreas: areas, questionCount }
      if (difficulty !== "all") body.difficulty = difficulty
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error === "no_questions_found") {
        generateQuestions(areas)
        return
      }
      if (!res.ok) throw new Error("Failed to create session")
      router.push(`/practice/session/${data.session.id}`)
    } catch {
      setLoading(false)
      setError("Something went wrong. Try again.")
    }
  }

  async function beginSession() {
    if (selected.size === 0) return
    createSession([...selected])
  }

  const count = selected.size

  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-4 md:py-6">
          <div className="mb-3 md:mb-4 shrink-0">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] bg-primary-fixed px-3 py-1 rounded-full inline-block mb-1.5">
              Practice Mode
            </span>
            <h1 className="font-display-lg text-display-lg text-primary leading-[1.1]">
              CHOOSE CONTENT AREA
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
              Select nursing domains to focus your practice.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                          <h3 className="font-title-md text-title-md text-primary truncate">{area.label}</h3>
                          {isSelected && (
                            <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>check_circle</span>
                          )}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5 line-clamp-2">{area.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-4 md:pb-6 space-y-3">
        <div className="max-w-4xl mx-auto w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.1em] text-[11px] block mb-2">
                Questions: <span className="text-primary font-bold">{questionCount}</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="font-body-sm text-[11px] text-on-surface-variant w-5 text-right">10</span>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1 accent-primary h-1.5 appearance-none cursor-pointer rounded-full bg-outline-variant [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                />
                <span className="font-body-sm text-[11px] text-on-surface-variant w-5">50</span>
              </div>
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.1em] text-[11px] block mb-2">
                Difficulty
              </label>
              <div className="flex gap-1 bg-surface-variant rounded-lg p-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`flex-1 px-3 py-2 rounded-md text-[11px] font-label-caps tracking-wider transition-all ${
                      difficulty === d.key
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-5 py-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,218,213,0.6)" }}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${count > 0 ? "bg-primary" : "bg-secondary"}`} />
            <p className="font-title-md text-title-md text-primary uppercase tracking-wider text-sm">
              {error ? "ERROR" : count > 0 ? `${count} Domain${count > 1 ? "s" : ""} Selected` : "Select a focus area"}
            </p>
          </div>
          <button
            onClick={beginSession}
            disabled={count === 0 || loading || generating}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-title-md text-sm transition-all active:scale-[0.97] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ boxShadow: "0 3px 0 #6E1818, 0 4px 12px rgba(149,35,35,0.2)" }}
          >
            {loading || generating ? (
              <><span>{generating ? "Generating..." : "Creating..."}</span><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span></>
            ) : (
              <><span>Begin Practice Session</span><span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span></>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
