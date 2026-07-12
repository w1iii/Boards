"use client"

import { useState, useEffect, useRef } from "react"

interface Props {
  duration: number
  onExpire: () => void
  running: boolean
  resetKey: number
}

export default function QuestionTimer({ duration, onExpire, running, resetKey }: Props) {
  const [remaining, setRemaining] = useState(duration)
  const expiredRef = useRef(false)

  useEffect(() => {
    setRemaining(duration)
    expiredRef.current = false
  }, [resetKey, duration])

  useEffect(() => {
    if (!running || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, remaining, onExpire])

  const secs = remaining % 60
  const pct = remaining / duration
  const isWarning = remaining <= 15
  const isCritical = remaining <= 5

  const circumference = 2 * Math.PI * 36
  const offset = circumference * (1 - pct)

  return (
    <div className="relative w-10 h-10">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r="36" fill="transparent"
          stroke="currentColor" strokeWidth="4"
          className="text-surface-variant"
        />
        <circle
          cx="40" cy="40" r="36" fill="transparent"
          stroke="currentColor" strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-1000 ease-linear ${
            isCritical ? "text-error" : isWarning ? "text-[#e67e22]" : "text-primary"
          }`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-[10px] font-bold ${
            isCritical ? "text-error" : isWarning ? "text-[#e67e22]" : "text-on-surface"
          }`}
        >
          {secs}
        </span>
      </div>
    </div>
  )
}
