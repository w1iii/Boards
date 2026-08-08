"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import SideNavBar from "@/app/components/side-nav-bar"

interface BankQuestion {
  id: string
  text: string
  choices: { key: string; text: string }[]
  correct_answer: string
  rationale: string
  wrong_choice_rationales: Record<string, string>
}

interface SessionSummary {
  concepts_covered: string[]
  weak_concepts: string[]
  score_pct: number
  retries: number
  first_try_correct: number
}

interface QuestionSnapshot {
  q: BankQuestion
  selectedKey: string
  correct: boolean
  rationale: string
}

interface Props {
  sessionId: string
  mode: string
  contentArea: string
  topic: string | null
  questions: BankQuestion[]
  firstName: string
  imageUrl: string | null
}

export default function StudySession({
  sessionId,
  mode,
  contentArea,
  topic,
  questions,
  firstName,
  imageUrl,
}: Props) {
  const [completed, setCompleted] = useState(false)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [error, setError] = useState(false)

  const [questionHistory, setQuestionHistory] = useState<QuestionSnapshot[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null)
  const [rationale, setRationale] = useState("")
  const [finalizing, setFinalizing] = useState(false)

  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const MAX_QUESTIONS = questions.length

  const router = useRouter()

  const isViewingPast = currentQuestionIndex < questionHistory.length
  const viewedSnapshot = isViewingPast ? questionHistory[currentQuestionIndex] : null
  const currentQ = viewedSnapshot?.q ?? questions[currentQuestionIndex]

  const persistAnswer = useCallback(
    async (qid: string, key: string) => {
      try {
        await fetch(`/api/study/sessions/${sessionId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_id: qid, selected_key: key }),
        })
      } catch {
        // Non-blocking: grading is local; persistence failure shouldn't break UX
      }
    },
    [sessionId]
  )

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
      if (selectedAnswer || answerResult || !currentQ || isViewingPast) return
      setSelectedAnswer(key)

      const correct = key === currentQ.correct_answer
      // Persist answer server-side (non-blocking)
      void persistAnswer(currentQ.id, key)

      if (correct) {
        setQuestionHistory((prev) => [
          ...prev,
          { q: currentQ, selectedKey: key, correct: true, rationale: currentQ.rationale },
        ])
        setAnswerResult("correct")
        setRationale(currentQ.rationale)
      } else {
        setAnswerResult("wrong")
        setRationale(currentQ.wrong_choice_rationales[key] ?? currentQ.rationale)
      }
    },
    [selectedAnswer, answerResult, currentQ, isViewingPast, persistAnswer]
  )

  const handleRetry = useCallback(() => {
    setSelectedAnswer(null)
    setAnswerResult(null)
    setRationale("")
  }, [])

  // If all questions answered but session not finalized, finalize.
  useEffect(() => {
    if (!completed && questionHistory.length >= MAX_QUESTIONS && MAX_QUESTIONS > 0) {
      finalizeSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionHistory.length, completed, MAX_QUESTIONS])

  async function finalizeSession() {
    if (finalizing) return
    setFinalizing(true)
    try {
      const res = await fetch(`/api/study/sessions/${sessionId}/finalize`, { method: "POST" })
      if (!res.ok) throw new Error("finalize failed")
      const data = await res.json()
      setSummary(data.summary)
      setCompleted(true)
    } catch {
      setError(true)
    } finally {
      setFinalizing(false)
    }
  }

  const handleNextQuestion = useCallback(() => {
    if (isViewingPast) {
      goToQuestion(currentQuestionIndex + 1)
      const next = questionHistory[currentQuestionIndex + 1]
      if (next) {
        setSelectedAnswer(next.selectedKey)
        setAnswerResult(next.correct ? "correct" : "wrong")
      } else {
        setSelectedAnswer(null)
        setAnswerResult(null)
      }
    } else {
      // Not viewing past, current question not yet answered correctly -> do nothing
    }
  }, [isViewingPast, currentQuestionIndex, questionHistory, goToQuestion])

  const handleGoBack = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1)
  }, [currentQuestionIndex, goToQuestion])

  const areaLabel = contentArea
  const modeLabel = mode.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())

  const answeredCount = questionHistory.length
  const progressPct = MAX_QUESTIONS > 0 ? Math.min((answeredCount / MAX_QUESTIONS) * 100, 100) : 0
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
                  <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px]">STUDY MODE</span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="font-headline-lg text-lg uppercase tracking-tight leading-none">{modeLabel}</h1>
                    <span className="px-2.5 py-0.5 bg-surface-container-high border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">{areaLabel}</span>
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
                    <span className="font-label-caps text-[9px] text-secondary">MASTERY</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                  <p className="font-display-lg text-2xl text-on-surface">{answeredCount}</p>
                  <p className="font-label-caps text-[9px] text-secondary">ANSWERED</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                  <p className="font-display-lg text-2xl text-[#1a8038]">{summary.first_try_correct ?? 0}</p>
                  <p className="font-label-caps text-[9px] text-secondary">NO-HINT</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                  <p className="font-display-lg text-2xl text-primary">{summary.retries ?? 0}</p>
                  <p className="font-label-caps text-[9px] text-secondary">RETRIES</p>
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
                      <span key={i} className="px-3 py-1.5 bg-surface-container-high border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">{c}</span>
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
                      <span key={i} className="px-3 py-1.5 bg-[#e6f4ea] border border-[#1a8038] text-[10px] font-bold uppercase tracking-wider text-[#0d3c1a]">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => router.push("/study")} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95 flex items-center justify-center gap-2">
                  NEW SESSION
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
                <button onClick={() => router.push("/")} className="flex-1 py-3 border border-outline rounded-xl font-label-caps text-[11px] hover:bg-surface-container-high transition-all active:scale-95">
                  DASHBOARD
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const displayMC = viewedSnapshot?.q ?? (questions.length ? questions[currentQuestionIndex] : null)

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 px-margin-mobile md:px-margin-desktop pt-4 pb-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px]">STUDY MODE</span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="font-headline-lg text-lg uppercase tracking-tight leading-none">{modeLabel}</h1>
                    <span className="px-2.5 py-0.5 bg-surface-container-high border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">{areaLabel}</span>
                    {topic && (
                      <span className="px-2.5 py-0.5 bg-primary-container border border-primary text-[10px] font-bold uppercase tracking-wider text-on-primary-container">{topic}</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowLeaveModal(true)} className="flex items-center gap-1.5 font-label-caps text-secondary hover:text-on-surface text-[11px] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                BACK
              </button>
            </div>
            <div className="w-full h-[3px] bg-surface-variant relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
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
                      <p className="font-body-md text-sm leading-relaxed whitespace-pre-wrap text-on-surface">{displayMC.text}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayMC.choices.map((choice) => {
                        const effectiveSelected = isViewingPast ? viewedSnapshot?.selectedKey : selectedAnswer
                        const isSelected = effectiveSelected === choice.key

                        let borderStyle = "border border-outline-variant bg-white hover:border-secondary"
                        let letterStyle = "border border-outline-variant group-hover:bg-secondary group-hover:text-white transition-colors"
                        let icon = null

                        if (isViewingPast) {
                          const pastCorrect = viewedSnapshot?.correct
                          if (isSelected && pastCorrect) {
                            borderStyle = "border-2 border-[#1a8038] bg-[#e6f4ea]"
                            letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                            icon = <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">check_circle</span>
                          } else if (isSelected && !pastCorrect) {
                            borderStyle = "border-2 border-primary bg-error-container"
                            letterStyle = "bg-primary text-white border-primary"
                            icon = <span className="material-symbols-outlined text-primary shrink-0 text-sm">cancel</span>
                          } else if (choice.key === displayMC.correct_answer) {
                            borderStyle = "border border-[#1a8038] bg-[#e6f4ea]"
                            letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                            icon = <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">check_circle</span>
                          } else {
                            borderStyle = "border border-outline-variant bg-surface opacity-40"
                            letterStyle = "border border-outline-variant text-secondary"
                          }
                        } else if (answerResult === "correct" && isSelected) {
                          borderStyle = "border-2 border-[#1a8038] bg-[#e6f4ea]"
                          letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                          icon = <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">check_circle</span>
                        } else if (answerResult === "wrong" && isSelected) {
                          borderStyle = "border-2 border-primary bg-error-container"
                          letterStyle = "bg-primary text-white border-primary"
                          icon = <span className="material-symbols-outlined text-primary shrink-0 text-sm">cancel</span>
                        } else if (answerResult === "wrong" && !isSelected) {
                          borderStyle = "border border-outline-variant bg-surface opacity-40"
                          letterStyle = "border border-outline-variant text-secondary"
                        } else if (isSelected) {
                          borderStyle = "border-2 border-primary bg-primary-fixed"
                          letterStyle = "border-primary bg-primary text-white"
                        }

                        return (
                          <button
                            key={choice.key}
                            onClick={() => handleSelectChoice(choice.key)}
                            disabled={selectedAnswer !== null || isViewingPast || finalizing}
                            className={`group flex items-center p-5 text-left transition-all duration-200 ${borderStyle} disabled:cursor-default`}
                          >
                            <div className={`w-7 h-7 flex items-center justify-center font-bold mr-3 shrink-0 text-xs ${letterStyle}`}>{choice.key}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-body">
                                <span className={`${isSelected ? (answerResult === "correct" || (isViewingPast && viewedSnapshot?.correct) ? "text-[#0d3c1a]" : "text-primary") : "text-on-surface"} font-medium`}>
                                  {choice.text}
                                </span>
                              </p>
                            </div>
                            {icon}
                          </button>
                        )
                      })}
                    </div>

                    {answerResult && !isViewingPast && (
                      <div className={`p-4 rounded-2xl border ${answerResult === "correct" ? "bg-[#e6f4ea] border-[#1a8038]" : "bg-error-container border-primary"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: answerResult === "correct" ? "#1a8038" : undefined }}>
                            {answerResult === "correct" ? "check_circle" : "cancel"}
                          </span>
                          <span className="font-label-caps text-[11px] text-on-surface">
                            {answerResult === "correct" ? "CORRECT" : "INCORRECT"}
                          </span>
                        </div>
                        {rationale && (
                          <p className="font-body-md text-sm text-on-surface mt-2">
                            <span className="font-medium">{answerResult === "correct" ? "Why correct: " : "Why wrong: "}</span>
                            {rationale}
                          </p>
                        )}
                        {answerResult === "wrong" && (
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">refresh</span>
                            TRY AGAIN
                          </button>
                        )}
                      </div>
                    )}

                    {isViewingPast && viewedSnapshot && (
                      <div className={`p-4 rounded-2xl border ${viewedSnapshot.correct ? "bg-[#e6f4ea] border-[#1a8038]" : "bg-error-container border-primary"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: viewedSnapshot.correct ? "#1a8038" : undefined }}>
                            {viewedSnapshot.correct ? "check_circle" : "cancel"}
                          </span>
                          <span className="font-label-caps text-[11px] text-on-surface">
                            {viewedSnapshot.correct ? "CORRECT" : "INCORRECT"}
                          </span>
                        </div>
                        {viewedSnapshot.rationale && (
                          <p className="font-body-md text-sm text-on-surface mt-1">{viewedSnapshot.rationale}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-md bg-error-container border border-error">
                      <p className="font-body-md text-sm text-on-error-container mb-2">Failed to finalize session. Please try again.</p>
                      <button onClick={() => finalizeSession()} className="flex items-center gap-1.5 font-label-caps text-[11px] text-on-error-container hover:opacity-80 transition-all">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                        RETRY
                      </button>
                    </div>
                  </div>
                )}

                {finalizing && !completed && (
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
                disabled={!isViewingPast}
                className="flex items-center gap-2 font-label-caps text-secondary hover:text-primary transition-colors text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
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
              <span className="font-label-caps text-primary text-[11px] uppercase tracking-wider">Leave Study Mode</span>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed mb-5">
              Your progress will be lost if you leave before finishing. Do you want to exit?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="flex-1 py-2.5 border border-outline rounded-xl font-label-caps text-[11px] hover:bg-surface-container-high transition-all">
                STAY
              </button>
              <button onClick={() => router.push("/dashboard")} className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all">
                GO HOME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
