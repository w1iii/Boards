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

const AREA_ICONS: Record<string, string> = {
  "nlp-i": "groups",
  "nlp-ii": "pregnant_woman",
  "nlp-iii": "monitor_heart",
  "nlp-iv": "medical_services",
  "nlp-v": "psychology",
}

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
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)

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
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-3 md:py-5">
          <header className="mb-4 md:mb-5 shrink-0">
            <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-1.5">
              Study Mode
            </p>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase mb-2 leading-[1.1]">
              Pick a Mode
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Choose your study approach and content area.
            </p>
          </header>

          <div className="flex-1 overflow-y-auto -mx-3 px-3 pb-3">
            <div className="mb-5">
              <h2 className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] mb-3">Study Approach</h2>
              <div className="grid p-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                {MODES.map((m) => {
                  const isSelected = selectedMode === m.mode
                  return (
                    <button
                      key={m.mode}
                      onClick={() => setSelectedMode(m.mode)}
                      aria-pressed={isSelected}
                      className={`group cursor-pointer text-left bg-surface-container-lowest rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] border ${
                        isSelected
                          ? "border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-outline-variant/30"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors ${isSelected ? "bg-primary-container/20" : ""}`}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 26 }}>{m.icon}</span>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display-lg text-xl text-primary">{m.label}</h3>
                          {isSelected && (
                            <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>check_circle</span>
                          )}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">{m.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] mb-3">Content Area</h2>
              <div className="grid p-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {areas.map((area) => {
                  const isSelected = selectedArea === area
                  return (
                    <button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      disabled={creating}
                      aria-pressed={isSelected}
                      className={`group cursor-pointer text-left bg-surface-container-lowest rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] border disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-outline-variant/30"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors ${isSelected ? "bg-primary-container/20" : ""}`}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 26 }}>{AREA_ICONS[area] ?? "folder"}</span>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display-lg text-xl text-primary">{AREA_LABELS[area] ?? area}</h3>
                          {isSelected && (
                            <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>check_circle</span>
                          )}
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

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6">
        <div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-full border border-outline-variant/30 p-1.5 pl-4 md:pl-5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${hasSelection ? "bg-primary" : "bg-outline"}`} />
            <span className={`font-label-caps text-label-caps uppercase tracking-wider truncate ${hasSelection ? "text-on-surface" : "text-primary"}`}>
              {creating
                ? "CREATING..."
                : hasSelection
                  ? "Ready to Start"
                  : "Select a mode and area"}
            </span>
          </div>
          <button
            onClick={startSession}
            disabled={!hasSelection || creating}
            className={`px-5 md:px-6 py-2 rounded-full font-title-md text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] shrink-0 ${
              !hasSelection || creating
                ? "bg-outline-variant text-on-surface opacity-70 cursor-not-allowed"
                : "bg-primary text-on-primary candy-button-shadow-sm"
            }`}
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
