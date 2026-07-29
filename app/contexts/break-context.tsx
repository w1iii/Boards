"use client"

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react"

interface BreakContextValue {
  isBreakModalOpen: boolean
  isBreakActive: boolean
  remainingSeconds: number
  totalMinutes: number
  openBreakModal: () => void
  closeBreakModal: () => void
  startBreak: (minutes: number) => void
  endBreak: () => void
}

const BreakContext = createContext<BreakContextValue | null>(null)

export function BreakProvider({ children }: { children: React.ReactNode }) {
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false)
  const [isBreakActive, setIsBreakActive] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const endTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTicker = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const openBreakModal = useCallback(() => {
    setIsBreakModalOpen(true)
  }, [])

  const closeBreakModal = useCallback(() => {
    clearTicker()
    setIsBreakModalOpen(false)
    setIsBreakActive(false)
    setRemainingSeconds(0)
    setTotalMinutes(0)
    endTimeRef.current = null
  }, [clearTicker])

  const startBreak = useCallback(
    (minutes: number) => {
      if (isBreakActive) return
      const seconds = minutes * 60
      setTotalMinutes(minutes)
      setRemainingSeconds(seconds)
      endTimeRef.current = Date.now() + seconds * 1000
      setIsBreakActive(true)
    },
    [isBreakActive],
  )

  const endBreak = useCallback(() => {
    clearTicker()
    setIsBreakActive(false)
    setRemainingSeconds(0)
    setTotalMinutes(0)
    endTimeRef.current = null
  }, [clearTicker])

  useEffect(() => {
    if (!isBreakActive) {
      clearTicker()
      return
    }

    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return
      const diff = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemainingSeconds(diff)

      if (diff <= 0) {
        setIsBreakActive(false)
        setRemainingSeconds(0)
        setTotalMinutes(0)
        endTimeRef.current = null
        setIsBreakModalOpen(false)
        clearTicker()
      }
    }, 250)

    return () => clearTicker()
  }, [isBreakActive, clearTicker])

  return (
    <BreakContext.Provider
      value={{
        isBreakModalOpen,
        isBreakActive,
        remainingSeconds,
        totalMinutes,
        openBreakModal,
        closeBreakModal,
        startBreak,
        endBreak,
      }}
    >
      {children}
    </BreakContext.Provider>
  )
}

export function useBreak(): BreakContextValue {
  const ctx = useContext(BreakContext)
  if (!ctx) throw new Error("useBreak must be used within BreakProvider")
  return ctx
}
