"use client"

import { useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

const DISMISSED_KEY = "study-available-dismissed"

let listeners: Array<() => void> = []

function subscribe(callback: () => void) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

function getSnapshot() {
  return sessionStorage.getItem(DISMISSED_KEY) === null
}

function getServerSnapshot() {
  return false
}

function dismissStore() {
  sessionStorage.setItem(DISMISSED_KEY, "true")
  listeners.forEach((l) => l())
}

export default function StudyAvailableModal() {
  const router = useRouter()
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissStore()
      }}
    >
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-outline-variant/30">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-tertiary-fixed/30 rounded-2xl flex items-center justify-center border border-tertiary/40">
            <span className="material-symbols-outlined text-tertiary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <span className="inline-block px-3 py-1 rounded-full font-label-caps text-[10px] tracking-widest bg-primary-fixed/30 text-primary border border-primary/40 mb-3">
            NEW FEATURE
          </span>
          <h2 className="font-headline-lg text-2xl text-on-surface mb-2">
            Study Mode is Now Available
          </h2>
          <p className="font-body-md text-sm text-secondary leading-relaxed mb-6">
            Dive deeper with AI-powered tutoring. Socratic drills, clinical case
            walkthroughs, and rapid recall — built to master each concept.
          </p>
          <button
            onClick={() => router.push("/study")}
            className="w-full py-3 bg-tertiary text-white rounded-xl font-label-caps text-sm hover:bg-tertiary/90 transition-all active:scale-[0.97] flex items-center justify-center gap-2 mb-3"
          >
            <span>Try Study Mode</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
          <button
            onClick={dismissStore}
            className="w-full py-2.5 font-label-caps text-sm text-secondary hover:text-on-surface transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}