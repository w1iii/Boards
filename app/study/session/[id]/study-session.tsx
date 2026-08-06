"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import SideNavBar from "@/app/components/side-nav-bar"

interface TranscriptEntry {
  role: "system" | "user" | "assistant"
  content: string
}

interface SessionSummary {
  concepts_covered: string[]
  weak_concepts: string[]
  score_pct: number
}

interface MCQuestion {
  question: string
  choices: { key: string; text: string }[]
}

interface QuestionSnapshot {
  mc: MCQuestion
  selectedKey: string
  correct: boolean
  rationale: string
}

interface Props {
  sessionId: string
  mode: string
  contentArea: string
  topic: string | null
  initialTranscript: TranscriptEntry[]
  firstName: string
  imageUrl: string | null
}

function parseMCQuestion(content: string): MCQuestion | null {
  // Find the first choice line (A. or A) — everything before it is question text
  const choiceStart = content.search(/^[A-D][.)]\s/m)
  if (choiceStart === -1) {
    // Fallback: try inline choices like "A. x B. y C. z D. w"
    const inlineMatch = content.match(/A[.)]\s*(.+?)\s*B[.)]\s*(.+?)\s*C[.)]\s*(.+?)\s*D[.)]\s*(.+?)(?:\s*$)/)
    if (inlineMatch) {
      return {
        question: content.slice(0, content.indexOf("A.")).trim() || content.slice(0, content.indexOf("A)")).trim(),
        choices: [
          { key: "A", text: inlineMatch[1].trim() },
          { key: "B", text: inlineMatch[2].trim() },
          { key: "C", text: inlineMatch[3].trim() },
          { key: "D", text: inlineMatch[4].trim() },
        ],
      }
    }
    return null
  }

  const beforeChoices = content.slice(0, choiceStart)
  const fromChoices = content.slice(choiceStart)

  // Extract choices from the choice section
  const choiceRegex = /^[A-D][.)]\s*(.+)/gm
  const choices: { key: string; text: string }[] = []
  let match
  while ((match = choiceRegex.exec(fromChoices)) !== null) {
    choices.push({ key: match[0][0], text: match[1].trim() })
  }
  if (choices.length !== 4) return null

  // Question text is everything before choices, stripped of evaluation prefixes
  const questionText = beforeChoices
    .replace(/^\s*[Ii]ncorrect\.\s*[Tt]he correct answer is [A-D][.!\s]+[^.\n]*\.\s*/m, "")
    .replace(/^\s*[Cc]orrect\.?\s*(?:Next question|Here(?:'s| is) the next|Moving on)[^:]*:\s*/im, "")
    .replace(/^\s*[Cc]orrect\.?\s*/m, "")
    .replace(/^\s*(?:That'?s right|Indeed|Exactly|Correct answer|You got it)[.!]\s*/im, "")
    .replace(/^\s*Next question:\s*/im, "")
    .trim()

  return { question: questionText, choices }
}

export default function StudySession({
  sessionId,
  mode,
  contentArea,
  topic,
  initialTranscript,
  firstName,
  imageUrl,
}: Props) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(initialTranscript)
  const [completed, setCompleted] = useState(
    !!initialTranscript.find((m) => m.role === "assistant" && m.content.includes('"concepts_covered"'))
  )
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [error, setError] = useState<"start" | "send" | null>(null)

  const [currentMC, setCurrentMC] = useState<MCQuestion | null>(() => {
    if (initialTranscript.length === 0) return null
    const lastAssistant = [...initialTranscript]
      .reverse()
      .find((m) => m.role === "assistant")
    if (lastAssistant) {
      const mc = parseMCQuestion(lastAssistant.content)
      if (mc) return mc
    }
    return null
  })
  const [pendingMC, setPendingMC] = useState<MCQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null)
  const [rationale, setRationale] = useState("")

  const [questionHistory, setQuestionHistory] = useState<QuestionSnapshot[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingNext, setFetchingNext] = useState(false)
  const MAX_QUESTIONS = 10

  const sendingRef = useRef(false)
  const pendingMCRef = useRef<MCQuestion | null>(null)
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const isViewingPast = currentQuestionIndex < questionHistory.length
  const viewedSnapshot = isViewingPast ? questionHistory[currentQuestionIndex] : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMC, answerResult, completed, currentQuestionIndex])

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!completed && questionHistory.length > 0) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [completed, questionHistory.length])

  const startSession = useCallback(async () => {
    if (sendingRef.current) return
    sendingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/study/sessions/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: [] }),
      })
      if (!res.ok) throw new Error("Failed to start")
      const data = await res.json()

      const updated = [{ role: "assistant" as const, content: data.content }]
      setTranscript(updated)

      if (data.summary) {
        setSummary(data.summary)
        setCompleted(true)
      } else {
        const mc = data.question ?? parseMCQuestion(data.content)
        if (mc) {
          setCurrentMC(mc)
        } else {
          // No question found — re-request with current transcript
          setFetchingNext(true)
          try {
            const retryRes = await fetch(`/api/study/sessions/${sessionId}/message`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transcript: updated }),
            })
            if (retryRes.ok) {
              const retryData = await retryRes.json()
              const retryUpdated = [...updated, { role: "assistant" as const, content: retryData.content }]
              setTranscript(retryUpdated)
              if (retryData.summary) {
                setSummary(retryData.summary)
                setCompleted(true)
              } else {
                const retryMC = retryData.question ?? parseMCQuestion(retryData.content)
                if (retryMC) setCurrentMC(retryMC)
              }
            }
          } catch {
            // Silent fail — loading state will show
          } finally {
            setFetchingNext(false)
          }
        }
      }
    } catch {
      setError("start")
    } finally {
      sendingRef.current = false
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (initialTranscript.length === 0) {
      const id = requestAnimationFrame(() => startSession())
      return () => cancelAnimationFrame(id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const goToQuestion = useCallback(
    (idx: number) => {
      if (idx < 0 || idx > questionHistory.length) return
      setCurrentQuestionIndex(idx)
      setSelectedAnswer(null)
      setAnswerResult(null)
      setRationale("")
    },
    [questionHistory.length]
  )

  const handleSelectChoice = useCallback(
    async (key: string) => {
      if (selectedAnswer || answerResult || sendingRef.current || !currentMC || isViewingPast) return
      setSelectedAnswer(key)
      sendingRef.current = true
      setError(null)

      const userMsg = { role: "user" as const, content: key }
      const updated = [...transcript, userMsg]
      setTranscript(updated)

      try {
        const res = await fetch(`/api/study/sessions/${sessionId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: updated }),
        })
        if (!res.ok) throw new Error("Failed to send")
        const data = await res.json()

        const withReply = [...updated, { role: "assistant" as const, content: data.content }]
        setTranscript(withReply)

        if (data.summary) {
          setSummary(data.summary)
          setCompleted(true)
          setCurrentMC(null)
          setQuestionHistory((prev) => [
            ...prev,
            { mc: currentMC, selectedKey: key, correct: !!data.correct_rationale, rationale: data.correct_rationale || data.incorrect_rationale },
          ])
          setCurrentQuestionIndex((i) => i + 1)
          await fetch(`/api/study/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "completed",
              summary: data.summary,
              transcript: withReply,
            }),
          })
          return
        }

        const correct = !!data.correct_rationale
        const nextMC = data.question ?? parseMCQuestion(data.content)

        console.log("[study] correct:", correct, "nextMC:", !!nextMC, "content preview:", data.content.slice(0, 200))

        // Always capture next question — LLM includes it in every response
        if (nextMC) setPendingMC(nextMC)

        if (correct) {
          // Correct — record and auto-advance
          setQuestionHistory((prev) => [
            ...prev,
            { mc: currentMC, selectedKey: key, correct: true, rationale: data.correct_rationale },
          ])
          setCurrentQuestionIndex((i) => i + 1)
          setAnswerResult("correct")
          setRationale(data.correct_rationale)
        } else {
          // Wrong — show rationale, allow retry (don't record yet)
          setAnswerResult("wrong")
          setRationale(data.incorrect_rationale)
        }

        // If correct but no next question found, re-request from server
        if (correct && !data.summary && !nextMC) {
          setFetchingNext(true)
          try {
            const retryRes = await fetch(`/api/study/sessions/${sessionId}/message`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transcript: withReply }),
            })
            if (retryRes.ok) {
              const retryData = await retryRes.json()
              const retryWithReply = [...withReply, { role: "assistant" as const, content: retryData.content }]
              setTranscript(retryWithReply)
              if (retryData.summary) {
                setSummary(retryData.summary)
                setCompleted(true)
                setCurrentMC(null)
                await fetch(`/api/study/sessions/${sessionId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    status: "completed",
                    summary: retryData.summary,
                    transcript: retryWithReply,
                  }),
                })
              } else {
                const retryMC = retryData.question ?? parseMCQuestion(retryData.content)
                if (retryMC) {
                  setPendingMC(retryMC)
                } else {
                  // Second retry — ask server to generate next question explicitly
                  const retry2Res = await fetch(`/api/study/sessions/${sessionId}/message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ transcript: retryWithReply }),
                  })
                  if (retry2Res.ok) {
                    const retry2Data = await retry2Res.json()
                    const retry2WithReply = [...retryWithReply, { role: "assistant" as const, content: retry2Data.content }]
                    setTranscript(retry2WithReply)
                    const retry2MC = retry2Data.question ?? parseMCQuestion(retry2Data.content)
                    if (retry2MC) setPendingMC(retry2MC)
                  }
                }
              }
            }
          } catch {
            // Silent fail — loading state will show
          } finally {
            setFetchingNext(false)
          }
        }
      } catch {
        setError("send")
        setSelectedAnswer(null)
      } finally {
        sendingRef.current = false
      }
    },
    [selectedAnswer, answerResult, currentMC, transcript, sessionId, isViewingPast]
  )

  const handleRetry = useCallback(() => {
    setSelectedAnswer(null)
    setAnswerResult(null)
    setRationale("")
  }, [])

  // Keep pendingMCRef in sync with pendingMC state
  useEffect(() => {
    pendingMCRef.current = pendingMC
  }, [pendingMC])

  const handleNextQuestion = useCallback(() => {
    const latestPending = pendingMCRef.current
    console.log("[study] handleNextQuestion called, latestPending:", !!latestPending, "isViewingPast:", isViewingPast)
    if (isViewingPast) {
      goToQuestion(currentQuestionIndex + 1)
      if (currentQuestionIndex + 1 < questionHistory.length) {
        const next = questionHistory[currentQuestionIndex + 1]
        setSelectedAnswer(next.selectedKey)
        setAnswerResult(next.correct ? "correct" : "wrong")
      } else {
        setSelectedAnswer(null)
        setAnswerResult(null)
      }
    } else if (latestPending) {
      setCurrentMC(latestPending)
      setPendingMC(null)
      pendingMCRef.current = null
      setSelectedAnswer(null)
      setAnswerResult(null)
      setRationale("")
    }
  }, [isViewingPast, currentQuestionIndex, questionHistory, goToQuestion])


  const handleGoBack = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1)
  }, [currentQuestionIndex, goToQuestion])

  const areaLabel = contentArea
  const modeLabel = mode.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())

  const answeredCount = questionHistory.length
  const progressPct = MAX_QUESTIONS > 0
    ? Math.min((answeredCount / MAX_QUESTIONS) * 100, 100)
    : 0

  const correctCount = questionHistory.filter((r) => r.correct).length

  if (completed && summary) {
    const ringRadius = 54
    const ringCircumference = 2 * Math.PI * ringRadius
    const ringOffset = ringCircumference * (1 - summary.score_pct / 100)

    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <SideNavBar firstName={firstName} imageUrl={imageUrl} />
        <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
          <div className="shrink-0 px-margin-mobile md:px-margin-desktop pt-4 pb-2">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px]">
                    STUDY MODE
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="font-headline-lg text-lg uppercase tracking-tight leading-none">
                      {modeLabel}
                    </h1>
                    <span className="px-2.5 py-0.5 bg-surface-container-high border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">
                      {areaLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-[3px] bg-surface-variant relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <span className="material-symbols-outlined text-primary mb-3" style={{ fontSize: 40 }}>emoji_events</span>
                <h2 className="font-headline-lg text-2xl mb-1">Session Complete</h2>
                <p className="font-body-md text-secondary text-sm">Here&apos;s how you did</p>
              </div>

              <div className="flex justify-center mb-8">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={ringRadius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-surface-variant" />
                    <circle cx="60" cy="60" r={ringRadius} fill="transparent" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} className="transition-all duration-700 ease-out text-primary" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display-lg text-3xl text-on-surface">{Math.round(summary.score_pct)}%</span>
                    <span className="font-label-caps text-[9px] text-secondary">SCORE</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                  <p className="font-display-lg text-2xl text-on-surface">{answeredCount}</p>
                  <p className="font-label-caps text-[9px] text-secondary">ANSWERED</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                  <p className="font-display-lg text-2xl text-[#1a8038]">{correctCount}</p>
                  <p className="font-label-caps text-[9px] text-secondary">CORRECT</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                  <p className="font-display-lg text-2xl text-primary">{summary.concepts_covered.length}</p>
                  <p className="font-label-caps text-[9px] text-secondary">CONCEPTS</p>
                </div>
              </div>

              {summary.weak_concepts.length > 0 && (
                <div className="p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>warning</span>
                    <h3 className="font-label-caps text-primary text-[10px] tracking-widest">WEAK CONCEPTS</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.weak_concepts.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-surface-container-high border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summary.concepts_covered.length > 0 && (
                <div className="p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#1a8038]" style={{ fontSize: 20 }}>check_circle</span>
                    <h3 className="font-label-caps text-[#1a8038] text-[10px] tracking-widest">COVERED</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.concepts_covered.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#e6f4ea] border border-[#1a8038] text-[10px] font-bold uppercase tracking-wider text-[#0d3c1a]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/study")}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  NEW SESSION
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 py-3 border border-outline rounded-xl font-label-caps text-[11px] hover:bg-surface-container-high transition-all active:scale-95"
                >
                  DASHBOARD
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const displayMC = isViewingPast ? viewedSnapshot?.mc ?? currentMC : currentMC

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 px-margin-mobile md:px-margin-desktop pt-4 pb-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px]">
                    STUDY MODE
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="font-headline-lg text-lg uppercase tracking-tight leading-none">
                      {modeLabel}
                    </h1>
                    <span className="px-2.5 py-0.5 bg-surface-container-high border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">
                      {areaLabel}
                    </span>
                    {topic && (
                      <span className="px-2.5 py-0.5 bg-primary-container border border-primary text-[10px] font-bold uppercase tracking-wider text-on-primary-container">
                        {topic}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center gap-1.5 font-label-caps text-secondary hover:text-on-surface text-[11px] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                BACK
              </button>
            </div>
            <div className="w-full h-[3px] bg-surface-variant relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-3">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
            <section className="md:col-span-8">
              <div className="space-y-4">
                {displayMC && (
                  <div className="space-y-4">
                    <div className="p-5 border-l-4 border-primary bg-surface-container-lowest rounded-2xl rounded-bl-md">
                      <p className="font-body-md text-sm leading-relaxed whitespace-pre-wrap text-on-surface">
                        {displayMC.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayMC.choices.map((choice) => {
                        const effectiveSelected = isViewingPast ? viewedSnapshot?.selectedKey : selectedAnswer
                        const isSelected = effectiveSelected === choice.key
                        const isLoading = !isViewingPast && isSelected && selectedAnswer !== null && answerResult === null

                        let borderStyle = "border border-outline-variant bg-white hover:border-secondary"
                        let letterStyle = "border border-outline-variant group-hover:bg-secondary group-hover:text-white transition-colors"
                        let icon = null

                        if (isViewingPast) {
                          const pastCorrect = viewedSnapshot?.correct
                          if (isSelected && pastCorrect) {
                            borderStyle = "border-2 border-[#1a8038] bg-[#e6f4ea]"
                            letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                            icon = (
                              <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">
                                check_circle
                              </span>
                            )
                          } else if (isSelected && !pastCorrect) {
                            borderStyle = "border-2 border-primary bg-error-container"
                            letterStyle = "bg-primary text-white border-primary"
                            icon = (
                              <span className="material-symbols-outlined text-primary shrink-0 text-sm">
                                cancel
                              </span>
                            )
                          } else {
                            borderStyle = "border border-outline-variant bg-white opacity-40"
                            letterStyle = "border border-outline-variant text-secondary"
                          }
                        } else if (isLoading) {
                          borderStyle = "border-2 border-primary bg-primary-fixed"
                          letterStyle = "border-primary bg-primary text-white"
                          icon = (
                            <span className="material-symbols-outlined animate-spin text-primary shrink-0 text-sm">
                              progress_activity
                            </span>
                          )
                        } else if (answerResult === "correct" && isSelected) {
                          borderStyle = "border-2 border-[#1a8038] bg-[#e6f4ea]"
                          letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                          icon = (
                            <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">
                              check_circle
                            </span>
                          )
                        } else if (answerResult === "wrong" && isSelected) {
                          borderStyle = "border-2 border-primary bg-error-container"
                          letterStyle = "bg-primary text-white border-primary"
                          icon = (
                            <span className="material-symbols-outlined text-primary shrink-0 text-sm">
                              cancel
                            </span>
                          )
                        } else if (answerResult === "wrong" && !isSelected) {
                          borderStyle = "border border-outline-variant bg-white opacity-40"
                          letterStyle = "border border-outline-variant text-secondary"
                        } else if (isSelected) {
                          borderStyle = "border-2 border-primary bg-primary-fixed"
                          letterStyle = "border-primary bg-primary text-white"
                        }

                        return (
                          <button
                            key={choice.key}
                            onClick={() => handleSelectChoice(choice.key)}
                            disabled={selectedAnswer !== null || isViewingPast}
                            className={`group flex items-center p-5 text-left transition-all duration-200 ${borderStyle} disabled:cursor-default`}
                          >
                            <div className={`w-7 h-7 flex items-center justify-center font-bold mr-3 shrink-0 text-xs ${letterStyle}`}>
                              {choice.key}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-body-lg text-sm leading-snug ${
                                isViewingPast
                                  ? isSelected
                                    ? viewedSnapshot?.correct ? "text-[#0d3c1a] font-semibold" : "text-primary font-semibold"
                                    : "text-on-surface"
                                  : answerResult === "correct" && isSelected
                                    ? "text-[#0d3c1a] font-semibold"
                                    : answerResult === "wrong" && isSelected
                                      ? "text-primary font-semibold"
                                      : "text-on-surface"
                              }`}>
                                {choice.text}
                              </p>
                            </div>
                            {icon}
                          </button>
                        )
                      })}
                    </div>

                    {answerResult && !isViewingPast && (
                      <div className={`p-4 rounded-2xl border ${
                        answerResult === "correct"
                          ? "bg-[#e6f4ea] border-[#1a8038]"
                          : "bg-error-container border-primary"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: answerResult === "correct" ? "#1a8038" : undefined }}>
                            {answerResult === "correct" ? "check_circle" : "cancel"}
                          </span>
                          <span className="font-label-caps text-[11px] text-on-surface">
                            {answerResult === "correct" ? "CORRECT" : "INCORRECT"}
                          </span>
                        </div>
                        {answerResult === "correct" && rationale && (
                          <p className="font-body-md text-sm text-on-surface mb-3"> <span className="font-medium">Why correct:</span> {rationale} </p>
                        )}
                        {answerResult === "wrong" ? (
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">refresh</span>
                            TRY AGAIN
                          </button>
                        ) : fetchingNext ? (
                          <div className="flex items-center gap-2 mt-2 text-secondary">
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                            <span className="font-label-caps text-[11px]">Loading next question...</span>
                          </div>
                        ) : pendingMC && (
                          <button
                            onClick={handleNextQuestion}
                            className="flex items-center gap-1.5 mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                          >
                            NEXT QUESTION
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    )}

                    {isViewingPast && (
                      <div className={`p-4 rounded-2xl border ${
                        viewedSnapshot?.correct
                          ? "bg-[#e6f4ea] border-[#1a8038]"
                          : "bg-error-container border-primary"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: viewedSnapshot?.correct ? "#1a8038" : undefined }}>
                            {viewedSnapshot?.correct ? "check_circle" : "cancel"}
                          </span>
                          <span className="font-label-caps text-[11px] text-on-surface">
                            {viewedSnapshot?.correct ? "CORRECT" : "INCORRECT"}
                          </span>
                        </div>
                        {viewedSnapshot?.rationale && (
                          <p className="font-body-md text-sm text-on-surface mt-1">{viewedSnapshot.rationale}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {((!displayMC && loading) || fetchingNext) && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-bl-md p-4">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-md bg-error-container border border-error">
                      <p className="font-body-md text-sm text-on-error-container mb-2">
                        {error === "start" ? "Failed to start session. Please try again." : "Failed to get response. Please try again."}
                      </p>
                      <button
                        onClick={() => { setError(null); if (error === "start") startSession() }}
                        className="flex items-center gap-1.5 font-label-caps text-[11px] text-on-error-container hover:opacity-80 transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                        RETRY
                      </button>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </section>

            <aside className="md:col-span-4 md:sticky md:top-3 md:self-start space-y-4">
              <div className="p-5 border border-tertiary-fixed bg-surface-container-low">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-lg">info</span>
                  <h3 className="font-label-caps text-secondary tracking-widest text-[10px]">TIPS</h3>
                </div>
                <p className="font-body-md text-secondary text-xs leading-relaxed">
                  {mode === "drill" && "Select the best answer for each question."}
                  {mode === "case" && "Read the clinical vignette carefully. Choose the best action for each decision point."}
                  {mode === "recall" && "Quick recall round! Pick the correct answer as fast as you can."}
                  {mode === "teach_back" && "Pick the statement that best explains each concept."}
                  {mode === "weak_area" && "Focus on your weak areas. Take your time to read each question."}
                  {!["drill", "case", "recall", "teach_back", "weak_area"].includes(mode) && "Select the best answer for each question."}
                </p>
              </div>

              <div className="p-5 bg-inverse-surface text-surface border-t-8 border-primary">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                  <h3 className="font-label-caps text-primary tracking-widest text-[10px]">PROGRESS</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-label-caps text-white mb-0.5 text-[10px]">ANSWERED</p>
                    <p className="font-display-lg text-2xl text-white">{answeredCount}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-white mb-0.5 text-[10px]">CORRECT</p>
                    <p className="font-display-lg text-2xl text-[#1a8038]">{correctCount}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-surface-container-highest">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-label-caps text-white">QUESTION {answeredCount} / {MAX_QUESTIONS}</span>
                    <span className="font-label-caps text-white">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {!completed && (
          <footer className="shrink-0 bg-surface-container-high border-t border-tertiary px-margin-mobile md:px-margin-desktop py-3 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <button
                onClick={handleGoBack}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 font-label-caps text-secondary hover:text-on-surface transition-colors text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                PREVIOUS
              </button>
              <span className="font-label-caps text-secondary text-[10px]">
                Q{answeredCount} / {MAX_QUESTIONS}
              </span>
              <button
                onClick={handleNextQuestion}
                disabled={!pendingMC && (!isViewingPast || currentQuestionIndex >= questionHistory.length - 1)}
                className="flex items-center gap-2 font-label-caps text-secondary hover:text-on-surface transition-colors text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </footer>
        )}
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>warning</span>
              <span className="font-label-caps text-primary text-[11px] uppercase tracking-wider">
                Leave Session?
              </span>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed mb-5">
              Your progress will be lost and you cannot return to this session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 py-2.5 border border-outline rounded-xl font-label-caps text-[11px] hover:bg-surface-container-high transition-all"
              >
                STAY
              </button>
              <button
                onClick={() => router.push("/study")}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all"
              >
                LEAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
