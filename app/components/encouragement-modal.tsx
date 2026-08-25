"use client"

import { useState, useEffect, useCallback } from "react"

// ============================================================
// displayed after login. Shows once per browser session.
// ============================================================
const ENCOURAGEMENT_TEXT = "Discipline is painful at the time, but later yields a peaceful fruit of righteousness."
const ENCOURAGEMENT_AUTHOR = "Hebrews 12:11"
// ============================================================

const STORAGE_KEY = "encouragement-modal-seen"

export default function EncouragementModal() {
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }
    setOpen(true)
  }, [])

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // storage unavailable — still close
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [isOpen, dismiss])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss()
      }}
    >
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-outline-variant/30 p-8 text-center">
        <span
          className="material-symbols-outlined text-5xl text-primary mb-4 block"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
        <p className="font-body-lg text-on-surface leading-relaxed italic mb-4">
          &ldquo;{ENCOURAGEMENT_TEXT}&rdquo;
        </p>
        <p className="font-label-caps text-[10px] text-secondary mb-6">
          &mdash; {ENCOURAGEMENT_AUTHOR}
        </p>
        <button
          onClick={dismiss}
          className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-caps text-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
        >
          Study
        </button>
      </div>
    </div>
  )
}
