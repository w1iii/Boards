"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SideNavBar from "@/app/components/side-nav-bar"
import {
  CONCEPT_CHECKLISTS,
  AREA_LABELS,
  type StudyMode,
} from "@/app/lib/study-concepts"

const MODES: { mode: StudyMode; label: string; icon: string; desc: string }[] = [
  { mode: "drill", label: "Concept Drill", icon: "psychology", desc: "Socratic Q&A per concept" },
  { mode: "case", label: "Case Walkthrough", icon: "clinical_notes", desc: "Clinical vignette decisions" },
  { mode: "recall", label: "Rapid Recall", icon: "bolt", desc: "One-sentence fire round" },
  { mode: "teach_back", label: "Teach-It-Back", icon: "record_voice_over", desc: "Explain it back to me" },
]

interface Props {
  firstName: string
  imageUrl: string | null
}

export default function StudyPicker({
  firstName,
  imageUrl,
}: Props) {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showUnavailableModal, setShowUnavailableModal] = useState(true)

  const areas = Object.keys(CONCEPT_CHECKLISTS)

  async function startSession() {
    if (!selectedMode || !selectedArea) return
    setCreating(true)

    try {
      const res = await fetch("/api/study/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          content_area: selectedArea,
        }),
      })
      if (!res.ok) throw new Error("Failed to create session")
      const data = await res.json()
      router.push(`/study/session/${data.session.id}`)
    } catch {
      setCreating(false)
    }
  }

  const hasSelection = selectedMode && selectedArea

  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      {showUnavailableModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>warning</span>
              <span className="font-label-caps text-primary text-[11px] uppercase tracking-wider">Study Mode Unavailable</span>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed mb-5">
              Sorry, study mode is not available right now.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowUnavailableModal(false)} className="flex-1 py-2.5 border border-outline rounded-xl font-label-caps text-[11px] hover:bg-surface-container-high transition-all">
                STAY
              </button>
              <button onClick={() => router.push("/dashboard")} className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all">
                GO HOME
              </button>
            </div>
          </div>
        </div>
      )}

      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-4 md:py-6">
          <div className="mb-4 md:mb-5 shrink-0">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] bg-primary-fixed px-3 py-1 rounded-full inline-block mb-1.5">
              Study Mode
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary leading-[1.1]">
              PICK A MODE
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
              Choose your study approach and content area.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2">
            <div className="mb-4">
              <h2 className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] text-[11px] mb-2">Study Approach</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {MODES.map((m) => {
                  const isSelected = selectedMode === m.mode
                  return (
                    <button
                      key={m.mode}
                      onClick={() => setSelectedMode(m.mode)}
                      className={`group cursor-pointer text-left relative overflow-hidden rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary-fixed"
                          : "border-outline-variant bg-surface-container-lowest hover:border-secondary"
                      }`}
                    >
                      <div className="p-3.5 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: 24 }}>{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-title-md text-sm text-primary truncate">{m.label}</h3>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 16 }}>check_circle</span>
                            )}
                          </div>
                          <p className="font-body-sm text-[11px] text-on-surface-variant leading-snug mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] text-[11px] mb-2">Content Area</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {areas.map((area) => {
                  const isSelected = selectedArea === area
                  return (
                    <button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      disabled={creating}
                      className={`group cursor-pointer text-left relative overflow-hidden rounded-xl border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-primary bg-primary-fixed"
                          : "border-outline-variant bg-surface-container-lowest hover:border-secondary"
                      }`}
                    >
                      <div className="p-3.5 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: 24 }}>folder</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-title-md text-sm text-primary truncate">{AREA_LABELS[area] ?? area}</h3>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 16 }}>check_circle</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6 space-y-2.5 md:space-y-3">
        <div className="max-w-4xl mx-auto w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-3.5 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${hasSelection ? "bg-primary" : "bg-secondary"}`} />
              <p className="font-title-md text-title-md text-primary uppercase tracking-wider text-sm">
                {creating ? "CREATING..." : hasSelection
                  ? `${selectedMode?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}${selectedArea ? ` · ${AREA_LABELS[selectedArea]}` : ""}`
                  : "Select mode and area to begin"}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-6 py-3 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,218,213,0.6)" }}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${hasSelection ? "bg-primary" : "bg-secondary"}`} />
            <p className="font-title-md text-title-md text-primary uppercase tracking-wider text-sm">
              {hasSelection ? "Ready to Start" : "Select a mode and area"}
            </p>
          </div>
          <button
            onClick={startSession}
            disabled={!hasSelection || creating}
            className="bg-primary text-on-primary px-7 py-3 rounded-full font-title-md text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
            style={{ boxShadow: "0 3px 0 #6E1818, 0 4px 12px rgba(149,35,35,0.2)" }}
          >
            {creating ? (
              <><span>Creating...</span><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span></>
            ) : (
              <><span>Begin Study Session</span><span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span></>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
