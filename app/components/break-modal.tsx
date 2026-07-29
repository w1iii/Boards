"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useBreak } from "@/app/contexts/break-context"
import { getRandomQuote } from "@/app/data/break-quotes"

const DURATIONS = [
  { label: "1 min", value: 1 },
  { label: "3 min", value: 3 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
]

interface Quote {
  text: string
  author: string
}

const QUOTE_INTERVAL_MS = 30_000

export default function BreakModal() {
  const {
    isBreakModalOpen,
    isBreakActive,
    remainingSeconds,
    totalMinutes,
    startBreak,
    closeBreakModal,
    endBreak,
  } = useBreak()

  const [quote, setQuote] = useState<Quote>({ text: "", author: "" })
  const quoteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pickRandomQuote = useCallback(() => {
    setQuote(getRandomQuote())
  }, [])

  useEffect(() => {
    if (!isBreakModalOpen) {
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
  }, [isBreakModalOpen, pickRandomQuote])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isBreakActive) {
          endBreak()
        }
        closeBreakModal()
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
  }, [isBreakModalOpen, isBreakActive, endBreak, closeBreakModal])

  if (!isBreakModalOpen) return null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const totalSeconds = totalMinutes * 60
  const pct = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0
  const circumference = 2 * Math.PI * 100
  const offset = circumference * (1 - pct)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isBreakActive) {
      closeBreakModal()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-outline-variant/30">
        {!isBreakActive ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-5xl text-primary mb-3">
                self_improvement
              </span>
              <h2 className="font-headline-lg text-2xl text-on-surface mb-1">Take a Break</h2>
              <p className="font-body-md text-sm text-secondary">
                Step away, breathe, and come back refreshed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => startBreak(d.value)}
                  className="py-4 px-4 bg-surface-container-high hover:bg-primary-fixed/30 rounded-2xl border border-outline-variant/30 transition-all hover:border-primary/40 font-label-caps text-on-surface text-sm active:scale-[0.97]"
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              onClick={closeBreakModal}
              className="w-full mt-4 py-2.5 font-label-caps text-sm text-secondary hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="p-8">
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
                    className="transition-all duration-300 ease-linear text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-lg text-4xl text-on-surface tabular-nums tracking-tight">
                    {formatTime(remainingSeconds)}
                  </span>
                  <span className="font-label-caps text-[10px] text-secondary mt-1">
                    REMAINING
                  </span>
                </div>
              </div>
            </div>

            {quote.text && (
              <div className="mb-6 px-2 text-center min-h-[80px] flex flex-col justify-center">
                <p className="font-body-lg text-sm text-on-surface leading-relaxed italic">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="font-label-caps text-[10px] text-secondary mt-2">
                  — {quote.author}
                </p>
              </div>
            )}

            <button
              onClick={() => { endBreak(); closeBreakModal() }}
              className="w-full py-3 bg-primary text-white rounded-xl font-label-caps text-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
            >
              End Break Early
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
