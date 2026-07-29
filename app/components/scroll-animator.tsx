"use client"

import { useEffect, useRef } from "react"

export default function ScrollAnimator({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sections = el.querySelectorAll("section")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0")
            entry.target.classList.remove("opacity-0", "translate-y-10")
          }
        })
      },
      { threshold: 0.1 },
    )
    sections.forEach((s) => {
      s.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10")
      observer.observe(s)
    })
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}
