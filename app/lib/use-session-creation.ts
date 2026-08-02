"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function splitCount(areas: string[], total: number): number[] {
  const n = areas.length
  const base = Math.floor(total / n)
  const remainder = total % n
  return areas.map((_, i) => base + (i < remainder ? 1 : 0))
}

interface Options {
  type: "practice" | "mock-exam"
  questionCount: number
  difficulty: string | null
}

export function useSessionCreation({ type, questionCount, difficulty }: Options) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const router = useRouter()

  const MAX_SESSION_ATTEMPTS = 3

  async function callGenerate(area: string, count: number) {
    const body: Record<string, unknown> = { contentArea: area, count }
    if (difficulty && difficulty !== "all") body.difficulty = difficulty
    const res = await fetch("/api/questions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Generation failed")
    return res.json()
  }

  async function generateQuestions(areas: string[], onDone: () => void) {
    setGenerating(true)
    const counts = splitCount(areas, questionCount)
    const shortfalls: string[] = []
    try {
      for (let i = 0; i < areas.length; i++) {
        const data = await callGenerate(areas[i], counts[i])
        if (data.shortfall) shortfalls.push(`${counts[i]}→${data.generated}`)
      }
      setGenerating(false)
      if (shortfalls.length > 0) {
        setNotice(`Could only generate ${shortfalls.join(", ")} questions. Starting with what's available.`)
      }
      onDone()
    } catch {
      setGenerating(false)
      setError("Failed to generate questions. Please try again.")
    }
  }

  async function generateMissing(areas: string[], missing: number): Promise<boolean> {
    setGenerating(true)
    const counts = splitCount(areas, missing)
    try {
      for (let i = 0; i < areas.length; i++) {
        if (counts[i] <= 0) continue
        await callGenerate(areas[i], counts[i])
      }
      setGenerating(false)
      return true
    } catch {
      setGenerating(false)
      setError("Failed to generate questions. Please try again.")
      return false
    }
  }

  async function postCreateSession(areas: string[], allowShortfall: boolean) {
    const body: Record<string, unknown> = { type, contentAreas: areas, questionCount, allowShortfall }
    if (difficulty && difficulty !== "all") body.difficulty = difficulty
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function createSession(areas: string[], attempt = 0) {
    setLoading(true)
    setError(null)
    try {
      const data = await postCreateSession(areas, attempt >= MAX_SESSION_ATTEMPTS)
      if (data.error === "no_questions_found") {
        generateQuestions(areas, () => createSession(areas, attempt))
        return
      }
      if (data.error === "insufficient_questions") {
        const ok = await generateMissing(areas, data.questionCount - data.available)
        if (!ok) return
        createSession(areas, attempt + 1)
        return
      }
      if (data.error || !data.session) throw new Error("Failed to create session")
      if (data.shortfall) {
        setNotice(`Could only gather ${data.session.questions?.length ?? 0} of ${questionCount} questions. Starting with what's available.`)
      }
      router.push(`/practice/session/${data.session.id}`)
    } catch {
      setLoading(false)
      setError("Something went wrong. Try again.")
    }
  }

  return { loading, generating, error, notice, createSession }
}
