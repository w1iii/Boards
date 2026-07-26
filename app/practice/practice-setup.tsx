"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TopNavBar from "@/app/components/top-nav-bar"

const AREAS = [
  { key: "nlp-i", label: "NLP I", description: "Foundation", icon: "menu_book", accent: "bg-primary-fixed" },
  { key: "nlp-ii", label: "NLP II", description: "Community Health", icon: "groups", accent: "bg-secondary-fixed" },
  { key: "nlp-iii", label: "NLP III", description: "Mother & Child", icon: "pregnant_woman", accent: "bg-tertiary-fixed" },
  { key: "nlp-iv", label: "NLP IV", description: "Med-Surg", icon: "medical_services", accent: "bg-primary-fixed-dim" },
  { key: "nlp-v", label: "NLP V", description: "Psychiatric", icon: "psychology", accent: "bg-outline-variant" },
] as const

interface Props {
  firstName: string
  imageUrl: string | null
}

export default function PracticeSetup({ firstName, imageUrl }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
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

  async function generateQuestions(areas: string[]) {
    setGenerating(true)
    try {
      for (const area of areas) {
        const res = await fetch("/api/questions/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentArea: area, count: 10 }),
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
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "practice", contentAreas: areas, questionCount: 20 }),
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
    <div className="h-dvh flex flex-col overflow-hidden bg-surface text-on-surface">
      <TopNavBar variant="auth" firstName={firstName} imageUrl={imageUrl} />

      <div className="scallop-top w-full h-[24px] md:h-[40px] pointer-events-none shrink-0" style={{ marginTop: 64 }} />

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

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-4 md:pb-6">
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
            style={{ boxShadow: "0 3px 0 #930006, 0 4px 12px rgba(188,0,11,0.2)" }}
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
  )
}
