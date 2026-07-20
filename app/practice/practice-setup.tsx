"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import NavHeader from "@/app/components/nav-header"

const AREAS = [
  { key: "nlp-i", label: "NLP I — Foundation", description: "Theories, Leadership, Legal, Research, Pharmacology.", icon: "menu_book" },
  { key: "nlp-ii", label: "NLP II — Community Health", description: "DOH programs, Epidemiology, Communicable diseases.", icon: "groups" },
  { key: "nlp-iii", label: "NLP III — Mother & Child", description: "OB, Pedia, Newborn, Family Planning.", icon: "pregnant_woman" },
  { key: "nlp-iv", label: "NLP IV — Med-Surg", description: "Adult health, Perioperative, Oncology, Body systems.", icon: "medical_services" },
  { key: "nlp-v", label: "NLP V — Psychiatric", description: "Mental health, Psychopharmacology, Crisis care.", icon: "psychology" },
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
  const [generatingAreas, setGeneratingAreas] = useState<string[]>([])
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
    setGeneratingAreas(areas)
    try {
      for (const area of areas) {
        const res = await fetch("/api/questions/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentArea: area, count: 10 }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Failed to generate questions for ${area}`)
        }
      }
      setGenerating(false)
      setGeneratingAreas([])
      createSession(areas)
    } catch {
      setGenerating(false)
      setGeneratingAreas([])
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
        body: JSON.stringify({
          type: "practice",
          contentAreas: areas,
          questionCount: 20,
        }),
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

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <NavHeader firstName={firstName} imageUrl={imageUrl} activeHref="/practice" />

      <main className="flex-1 overflow-hidden">
        <section className="h-full px-margin-mobile md:px-margin-desktop py-6">
          <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col">
            <div className="mb-4 shrink-0">
              <span className="font-label-caps text-primary mb-1 block tracking-[0.2em] text-[10px]">
                PRACTICE MODE
              </span>
              <h1 className="font-headline-lg text-headline-lg uppercase leading-tight mb-1">
                CHOOSE CONTENT AREA
              </h1>
              <p className="font-body-md text-secondary text-sm max-w-xl">
                Select the core nursing domains to focus your practice session. You can choose
                multiple areas to create a cross-functional assessment.
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-0">
              {AREAS.map((area) => {
                const isSelected = selected.has(area.key)
                return (
                  <button
                    key={area.key}
                    onClick={() => toggle(area.key)}
                    className={`group relative flex flex-col items-start p-4 border border-tertiary bg-surface transition-all duration-200 text-left hover:bg-surface-container-high ${
                      isSelected ? "bg-surface-container-high" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl mb-3 text-on-surface group-hover:scale-110 transition-transform">
                      {area.icon}
                    </span>
                    <h3 className="font-headline-lg text-headline-lg-mobile uppercase mb-1 leading-tight">
                      {area.label}
                    </h3>
                    <p className="font-body-md text-secondary text-xs leading-snug">{area.description}</p>
                    <div
                      className={`absolute top-3 right-3 transition-opacity duration-200 ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-primary text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface border-t border-tertiary px-margin-mobile md:px-margin-desktop py-3 shrink-0">
        <div className="max-w-[1440px] mx-auto w-full flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="font-label-caps text-secondary text-[10px]">
              {generating ? "GENERATING QUESTIONS..." : error ? "ERROR" : "READY TO BEGIN?"}
            </span>
            <p className="font-body-md text-on-surface text-xs">
              {generating
                ? `Creating ${generatingAreas.length > 0 ? generatingAreas.map((a) => AREAS.find((ar) => ar.key === a)?.label ?? a).join(", ") : ""} questions via AI...`
                : error
                  ? error
                  : "Start your nursing practice session based on selected criteria."}
            </p>
          </div>
          <button
            onClick={beginSession}
            disabled={selected.size === 0 || loading || generating}
            className="shrink-0 px-8 py-3 bg-primary text-on-primary font-label-caps uppercase text-xs hover:bg-on-primary-fixed-variant transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? "Generating..." : loading ? "Creating..." : "Begin Practice Session"}
          </button>
        </div>
      </footer>
    </div>
  )
}
