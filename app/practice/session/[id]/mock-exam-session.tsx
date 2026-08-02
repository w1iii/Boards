"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import MockExamTimer from "./mock-exam-timer"

interface Question {
  id: string
  text: string
  choices: { key: string; text: string }[]
  correct_answer: string
  rationale: string
  wrong_choice_rationales: Record<string, string>
  content_area: string
  difficulty: string
}

interface Props {
  sessionId: string
  questions: Question[]
  existingAnswers: Record<string, string>
  firstName: string
  imageUrl: string | null
  contentAreas: string[]
  initialRemainingSeconds: number
}

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NP I — Community Health",
  "nlp-ii": "NP II — Mother & Child",
  "nlp-iii": "NP III — Adult Health (Part 1)",
  "nlp-iv": "NP IV — Adult Health (Part 2)",
  "nlp-v": "NP V — Mental Health & Psych",
}

export default function MockExamSession({
  sessionId,
  questions,
  existingAnswers,
  contentAreas,
  initialRemainingSeconds,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const completingRef = useRef(false)
  const router = useRouter()

  const question = questions[currentIdx]
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length

  const handleSelect = useCallback(
    async (key: string) => {
      if (!question) return
      setAnswers((prev) => ({ ...prev, [question.id]: key }))
      try {
        await fetch(`/api/sessions/${sessionId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id, answer: key }),
        })
      } catch {
        // ignore transient save errors; answers remain local and re-sent on submit
      }
    },
    [question, sessionId],
  )

  const finish = useCallback(async () => {
    if (completingRef.current) return
    completingRef.current = true
    setCompleting(true)
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })
    } catch {
      // proceed even if patch fails
    }
    router.push(`/practice/session/${sessionId}/results`)
  }, [sessionId, router])

  const handleSubmitClick = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirm(false)
    setSubmitting(true)
    finish()
  }, [finish])

  const handleTimeExpire = useCallback(() => {
    if (completingRef.current) return
    setTimedOut(true)
    finish()
  }, [finish])

  useEffect(() => {
    if (initialRemainingSeconds === 0 && !completingRef.current) {
      setTimedOut(true)
      finish()
    }
  }, [initialRemainingSeconds, finish])

  const goToQuestion = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalQuestions) return
      setCurrentIdx(idx)
    },
    [totalQuestions],
  )

  const unanswered = totalQuestions - answeredCount

  if (!question) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <p className="font-body-lg text-secondary">No questions available.</p>
      </div>
    )
  }

  const choices = (question.choices || [])
    .filter((c) => c && c.key && c.text)
    .sort((a, b) => ["A", "B", "C", "D"].indexOf(a.key) - ["A", "B", "C", "D"].indexOf(b.key))

  const areaLabel =
    contentAreas.length > 0
      ? contentAreas.map((a) => AREA_LABELS[a] ?? a).join(", ")
      : "Mock Exam"

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-surface-container-low">
      <header className="shrink-0 bg-white border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-label-caps text-primary tracking-[0.2em] text-[10px] uppercase">
              Mock Exam
            </p>
            <h1 className="font-headline-lg text-base truncate">
              Question {currentIdx + 1}{" "}
              <span className="text-secondary opacity-50">/ {totalQuestions}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs text-on-surface-variant">
              <span className={`w-2 h-2 rounded-full ${answeredCount === totalQuestions ? "bg-[#1a8038]" : "bg-[#e67e22]"}`} />
              <span className="font-mono-data">{answeredCount}/{totalQuestions} answered</span>
            </div>
            <MockExamTimer
              initialRemaining={initialRemainingSeconds}
              running={!timedOut && !completing}
              onExpire={handleTimeExpire}
            />
            <button
              onClick={handleSubmitClick}
              disabled={completing}
              className="bg-primary text-on-primary px-5 py-2 font-label-caps text-[11px] uppercase hover:bg-on-primary-fixed-variant transition-all active:scale-95 disabled:opacity-50"
            >
              {completing ? "SUBMITTING..." : "SUBMIT EXAM"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-5">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="px-2.5 py-1 bg-surface-container-highest border border-outline-variant text-[10px] font-bold uppercase tracking-tight text-on-surface">
                {areaLabel}
              </span>
              <span className="font-mono-data text-xs capitalize text-on-surface-variant">
                {question.difficulty}
              </span>
            </div>

            <div className="p-5 bg-white border border-outline-variant">
              <h2 className="font-headline-lg text-lg leading-tight mb-4">{question.text}</h2>
            </div>

            <div className="mt-4 space-y-3">
              {choices.map((choice) => {
                const isSelected = answers[question.id] === choice.key
                return (
                  <button
                    key={choice.key}
                    onClick={() => handleSelect(choice.key)}
                    className={`group flex items-center p-4 w-full text-left transition-all duration-150 border-2 ${
                      isSelected
                        ? "border-primary bg-primary-fixed"
                        : "border-outline-variant bg-white hover:border-secondary"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 flex items-center justify-center font-bold mr-3 shrink-0 text-xs border ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "border-outline-variant text-secondary group-hover:bg-secondary group-hover:text-white"
                      }`}
                    >
                      {choice.key}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-lg text-sm leading-snug text-on-surface">{choice.text}</p>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary shrink-0 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => goToQuestion(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 font-label-caps text-secondary hover:text-on-surface transition-colors text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                PREVIOUS
              </button>
              {currentIdx < totalQuestions - 1 ? (
                <button
                  onClick={() => goToQuestion(currentIdx + 1)}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                >
                  NEXT QUESTION
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmitClick}
                  className="flex items-center gap-2 bg-secondary text-white px-6 py-2 font-label-caps text-[11px] hover:opacity-90 transition-all active:scale-95"
                >
                  FINISH EXAM
                  <span className="material-symbols-outlined text-base">check</span>
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-surface-container-lowest border-l border-outline-variant p-4">
          <p className="font-label-caps text-on-surface-variant tracking-widest text-[10px] mb-3 uppercase">
            Question Navigator
          </p>
          <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-2 content-start">
            {questions.map((q, i) => {
              const answered = !!answers[q.id]
              const isCurrent = i === currentIdx
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(i)}
                  className={`h-9 flex items-center justify-center font-mono-data text-xs border transition-all ${
                    isCurrent
                      ? "border-primary bg-primary text-on-primary"
                      : answered
                        ? "border-primary bg-primary-fixed text-primary"
                        : "border-outline-variant bg-white text-on-surface-variant hover:border-secondary"
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant">
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary-fixed border border-primary inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-white border border-outline-variant inline-block" /> Unanswered
              </span>
            </div>
          </div>
        </aside>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 28 }}>
                {unanswered > 0 ? "help" : "task_alt"}
              </span>
              <h3 className="font-headline-lg text-lg">Submit exam?</h3>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant mb-5">
              {unanswered > 0
                ? `You still have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Unanswered items count as wrong.`
                : "All questions answered. Ready to see your results."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 bg-surface border-2 border-outline-variant text-on-surface font-label-caps text-[11px] uppercase hover:bg-surface-container-high transition-all"
              >
                Keep Working
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-primary text-on-primary font-label-caps text-[11px] uppercase hover:bg-on-primary-fixed-variant transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
