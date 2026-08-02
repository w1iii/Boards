"use client"

import { useState, useEffect, useRef } from "react"

interface Props {
  initialRemaining: number
  running: boolean
  onExpire: () => void
}

function format(total: number): string {
  const s = Math.max(0, total)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

export default function MockExamTimer({ initialRemaining, running, onExpire }: Props) {
  const [remaining, setRemaining] = useState(initialRemaining)
  const expiredRef = useRef(false)

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

  const isWarning = remaining <= 600
  const isCritical = remaining <= 120
  const colorClass = isCritical
    ? "text-[#dc2626]"
    : isWarning
      ? "text-[#e67e22]"
      : "text-primary"

  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>timer</span>
      <span className={`font-mono-data text-xl font-bold tabular-nums ${colorClass}`}>
        {format(remaining)}
      </span>
    </div>
  )
}
