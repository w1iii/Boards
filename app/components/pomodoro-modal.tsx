"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { usePomodoro, POMODORO_PRESETS } from "@/app/contexts/pomodoro-context"
import { getRandomQuote } from "@/app/data/break-quotes"

interface Quote {
  text: string
  author: string
}

const QUOTE_INTERVAL_MS = 30_000

export default function PomodoroModal() {
  const {
    isBreakModalOpen,
    isActive,
    isFocusPhase,
    isBreakActive,
    remainingSeconds,
    phaseTotalSeconds,
    roundCount,
    focusMinutes,
    breakMinutes,
    startPomodoro,
    closeModal,
    dismissModal,
    endPomodoro,
  } = usePomodoro()

  const [quote, setQuote] = useState<Quote>({ text: "", author: "" })
  const quoteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pickRandomQuote = useCallback(() => {
    setQuote(getRandomQuote())
  }, [])

  useEffect(() => {
    if (!isBreakModalOpen || !isBreakActive) {
      if (quoteIntervalRef.current !== null) {
        clearInterval(quoteIntervalRef.current)
        quoteIntervalRef.current = null
      }
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    pickRandomQuote()
    quoteIntervalRef.current = setInterval(pickRandomQuote, QUOTE_INTERVAL_MS)
    return () => {
      if (quoteIntervalRef.current !== null) {
        clearInterval(quoteIntervalRef.current)
        quoteIntervalRef.current = null
      }
    }
  }, [isBreakModalOpen, isBreakActive, pickRandomQuote])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || !isBreakModalOpen) return
      if (isActive) {
        dismissModal()
      } else {
        closeModal()
      }
    }
    if (isBreakModalOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isBreakModalOpen, isActive, dismissModal, closeModal])

  if (!isBreakModalOpen) return null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const totalSeconds = phaseTotalSeconds > 0 ? phaseTotalSeconds : 1
  const pct = remainingSeconds / totalSeconds
  const circumference = 2 * Math.PI * 100
  const offset = circumference * (1 - pct)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return
    if (isActive) {
      dismissModal()
    } else {
      closeModal()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-outline-variant/30">
        {!isActive ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-5xl text-primary mb-3">
                timer
              </span>
              <h2 className="font-headline-lg text-2xl text-on-surface mb-1">Pomodoro</h2>
              <p className="font-body-md text-sm text-secondary">
                Focus hard, then step away and reset.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {POMODORO_PRESETS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => startPomodoro(d.focus, d.break)}
                  className="py-4 px-4 bg-surface-container-high hover:bg-primary-fixed/30 rounded-2xl border border-outline-variant/30 transition-all hover:border-primary/40 font-label-caps text-on-surface text-sm active:scale-[0.97]"
                >
                  <span className="block font-headline-lg text-xl">{d.label}</span>
                  <span className="block text-[10px] font-normal text-secondary mt-1">
                    {d.focus} min focus · {d.break} min break
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={closeModal}
              className="w-full mt-4 py-2.5 font-label-caps text-sm text-secondary hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex justify-end -mt-3 -mr-3">
              <button
                onClick={dismissModal}
                aria-label="Minimize pomodoro"
                className="w-9 h-9 flex items-center justify-center rounded-full font-label-caps text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span
                className={`px-3 py-1 rounded-full font-label-caps text-[10px] tracking-widest border ${
                  isFocusPhase
                    ? "bg-primary-fixed/30 text-primary border-primary/40"
                    : "bg-tertiary-fixed/30 text-tertiary border-tertiary/40"
                }`}
              >
                {isFocusPhase ? "FOCUS" : "BREAK"}
              </span>
              <span className="font-label-caps text-[10px] text-secondary">
                ROUND {roundCount} · {focusMinutes}/{breakMinutes}
              </span>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                  <circle
                    cx="110" cy="110" r="100" fill="transparent"
                    stroke="currentColor" strokeWidth="6"
                    className="text-surface-variant"
                  />
                  <circle
                    cx="110" cy="110" r="100" fill="transparent"
                    stroke="currentColor" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`transition-all duration-300 ease-linear ${
                      isFocusPhase ? "text-primary" : "text-tertiary"
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-lg text-4xl text-on-surface tabular-nums tracking-tight">
                    {formatTime(remainingSeconds)}
                  </span>
                  <span className="font-label-caps text-[10px] text-secondary mt-1">
                    {isFocusPhase ? "FOCUSING" : "REMAINING"}
                  </span>
                </div>
              </div>
            </div>

            {isBreakActive ? (
              quote.text && (
                <div className="mb-6 px-2 text-center min-h-[80px] flex flex-col justify-center">
                  <p className="font-body-lg text-sm text-on-surface leading-relaxed italic">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="font-label-caps text-[10px] text-secondary mt-2">
                    — {quote.author}
                  </p>
                </div>
              )
            ) : (
              <div className="mb-6 px-2 text-center min-h-[80px] flex flex-col justify-center">
                <p className="font-body-lg text-sm text-on-surface leading-relaxed">
                  Stay with the question.
                </p>
              </div>
            )}

            <button
              onClick={endPomodoro}
              className="w-full py-3 bg-primary text-white rounded-xl font-label-caps text-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
            >
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}