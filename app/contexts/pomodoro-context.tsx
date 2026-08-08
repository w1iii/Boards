"use client"

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react"

export const POMODORO_PRESETS = [
  { focus: 20, break: 5, label: "20/5" },
  { focus: 30, break: 10, label: "30/10" },
] as const

const BASE_TITLE = "BOARDS. | Master the NLE Nursing Board Exam"
const STORAGE_KEY = "pomodoro-state"

interface PersistedState {
  phase: Phase
  endTime: number
  roundCount: number
  focusMinutes: number
  breakMinutes: number
  isBreakModalOpen: boolean
}

type Phase = "focus" | "break" | null

interface PomodoroContextValue {
  isBreakModalOpen: boolean
  isActive: boolean
  isFocusPhase: boolean
  isBreakActive: boolean
  remainingSeconds: number
  phaseTotalSeconds: number
  roundCount: number
  focusMinutes: number
  breakMinutes: number
  startPomodoro: (focusMinutes: number, breakMinutes: number) => void
  setPreset: (focusMinutes: number, breakMinutes: number) => void
  endPomodoro: () => void
  openModal: () => void
  dismissModal: () => void
  closeModal: () => void
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function updateTitle(text: string) {
  if (typeof document === "undefined") return
  document.title = text
}

function titleForPhase(phase: Phase, seconds: number) {
  if (phase === "focus") updateTitle(`FOCUS ${formatClock(seconds)}`)
  else if (phase === "break") updateTitle(`BREAK ${formatClock(seconds)}`)
}

function playChime() {
  if (typeof window === "undefined") return
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return
  let ctx: AudioContext
  try {
    ctx = new AudioCtx()
  } catch {
    return
  }
  if (ctx.state !== "running") {
    // Autoplay policy: no sound if AudioContext is suspended.
    void ctx.close()
    return
  }
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.55)
    osc.onended = () => void ctx.close()
  } catch {
    void ctx.close()
  }
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(1)
  const [roundCount, setRoundCount] = useState(0)
  const [focusMinutes, setFocusMinutes] = useState(20)
  const [breakMinutes, setBreakMinutes] = useState(5)

  const phaseRef = useRef<Phase>(null)
  const focusMinutesRef = useRef(20)
  const breakMinutesRef = useRef(5)
  const roundCountRef = useRef(0)
  const endTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  const setRoundBoth = useCallback((r: number) => {
    roundCountRef.current = r
    setRoundCount(r)
  }, [])

  const setMinutesBoth = useCallback((f: number, b: number) => {
    focusMinutesRef.current = f
    breakMinutesRef.current = b
    setFocusMinutes(f)
    setBreakMinutes(b)
  }, [])

  const clearTicker = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const clearPersisted = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage unavailable
    }
  }, [])

  const beginFocus = useCallback(
    (round: number) => {
      const total = focusMinutesRef.current * 60
      setPhaseBoth("focus")
      setRoundBoth(round)
      setPhaseTotalSeconds(total)
      setRemainingSeconds(total)
      endTimeRef.current = Date.now() + total * 1000
      playChime()
      updateTitle(`FOCUS ${formatClock(total)}`)
    },
    [setPhaseBoth, setRoundBoth],
  )

  const beginBreak = useCallback(() => {
    const total = breakMinutesRef.current * 60
    setPhaseBoth("break")
    setPhaseTotalSeconds(total)
    setRemainingSeconds(total)
    endTimeRef.current = Date.now() + total * 1000
    playChime()
    updateTitle(`BREAK ${formatClock(total)}`)
  }, [setPhaseBoth])

  const startPomodoro = useCallback(
    (focusMin: number, breakMin: number) => {
      if (phaseRef.current !== null) return
      clearTicker()
      setMinutesBoth(focusMin, breakMin)
      setRoundBoth(0)
      endTimeRef.current = null
      setIsBreakModalOpen(true)
      beginFocus(1)
    },
    [clearTicker, setMinutesBoth, setRoundBoth, beginFocus],
  )

  const setPreset = useCallback(
    (focusMin: number, breakMin: number) => {
      if (phaseRef.current === null) return
      setMinutesBoth(focusMin, breakMin)
      clearTicker()
      beginFocus(roundCountRef.current || 1)
    },
    [setMinutesBoth, clearTicker, beginFocus],
  )

  const endPomodoro = useCallback(() => {
    clearTicker()
    setPhaseBoth(null)
    setRoundBoth(0)
    setRemainingSeconds(0)
    setPhaseTotalSeconds(1)
    endTimeRef.current = null
    setIsBreakModalOpen(false)
    clearPersisted()
    if (typeof document !== "undefined") document.title = BASE_TITLE
  }, [clearTicker, setPhaseBoth, setRoundBoth, clearPersisted])

  const openModal = useCallback(() => {
    setIsBreakModalOpen(true)
  }, [])

  const dismissModal = useCallback(() => {
    setIsBreakModalOpen(false)
  }, [])

  const closeModal = useCallback(() => {
    clearTicker()
    setPhaseBoth(null)
    setRoundBoth(0)
    setRemainingSeconds(0)
    setPhaseTotalSeconds(1)
    endTimeRef.current = null
    setIsBreakModalOpen(false)
    clearPersisted()
    if (typeof document !== "undefined") document.title = BASE_TITLE
  }, [clearTicker, setPhaseBoth, setRoundBoth, clearPersisted])

  useEffect(() => {
    if (phase === null) {
      clearTicker()
      return
    }

    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return
      const diff = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemainingSeconds(diff)
      titleForPhase(phaseRef.current, diff)

      if (diff <= 0) {
        if (phaseRef.current === "focus") {
          beginBreak()
        } else if (phaseRef.current === "break") {
          beginFocus((roundCountRef.current || 1) + 1)
        }
      }
    }, 250)

    return () => clearTicker()
  }, [phase, clearTicker, beginFocus, beginBreak])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as Partial<PersistedState>
      const endTime = typeof saved.endTime === "number" ? saved.endTime : NaN
      const phaseSaved = saved.phase
      const savedRound = typeof saved.roundCount === "number" ? saved.roundCount : 1
      const focusMin = typeof saved.focusMinutes === "number" ? saved.focusMinutes : 20
      const breakMin = typeof saved.breakMinutes === "number" ? saved.breakMinutes : 5

      if (phaseSaved !== "focus" && phaseSaved !== "break") return
      if (!Number.isFinite(endTime) || endTime <= Date.now()) return

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMinutesBoth(focusMin, breakMin)
      setRoundBoth(savedRound)
      setPhaseTotalSeconds(phaseSaved === "break" ? breakMin * 60 : focusMin * 60)
      setRemainingSeconds(Math.max(0, Math.round((endTime - Date.now()) / 1000)))
      endTimeRef.current = endTime
      setIsBreakModalOpen(saved.isBreakModalOpen === true)
      setPhaseBoth(phaseSaved)
      titleForPhase(phaseSaved, Math.max(0, Math.round((endTime - Date.now()) / 1000)))
    } catch {
      clearPersisted()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (phase === null || endTimeRef.current === null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        const state: PersistedState = {
          phase,
          endTime: endTimeRef.current,
          roundCount,
          focusMinutes,
          breakMinutes,
          isBreakModalOpen,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
    } catch {
      // storage unavailable
    }
  }, [phase, roundCount, focusMinutes, breakMinutes, isBreakModalOpen])

  return (
    <PomodoroContext.Provider
      value={{
        isBreakModalOpen,
        isActive: phase !== null,
        isFocusPhase: phase === "focus",
        isBreakActive: phase === "break",
        remainingSeconds,
        phaseTotalSeconds,
        roundCount,
        focusMinutes,
        breakMinutes,
        startPomodoro,
        setPreset,
        endPomodoro,
        openModal,
        dismissModal,
        closeModal,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider")
  return ctx
}