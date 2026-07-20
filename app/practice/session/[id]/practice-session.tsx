"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import NavHeader from "@/app/components/nav-header"
import QuestionTimer from "./timer"

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

interface AnswerState {
  selected: string | null
  correct: boolean | null
  correctAnswer: string | null
  rationale: string | null
  timedOut: boolean
}

interface Props {
  sessionId: string
  questions: Question[]
  existingAnswers: Record<string, string>
  firstName: string
  imageUrl: string | null
  contentAreas: string[]
}

export default function PracticeSession({
  sessionId,
  questions,
  existingAnswers,
  firstName,
  imageUrl,
  contentAreas,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers)
  function buildInitialStates() {
    const states: Record<string, AnswerState> = {}
    for (const q of questions) {
      const selected = existingAnswers[q.id]
      if (selected) {
        const correct = selected === q.correct_answer
        states[q.id] = {
          selected,
          correct,
          correctAnswer: q.correct_answer,
          rationale: correct
            ? q.rationale
            : (q.wrong_choice_rationales?.[selected] ?? q.rationale),
          timedOut: false,
        }
      }
    }
    return states
  }

  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>(buildInitialStates)
  const [showFeedback, setShowFeedback] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timerRunning, setTimerRunning] = useState(true)
  const [timerResetKey, setTimerResetKey] = useState(0)
  const [completing, setCompleting] = useState(false)
  const completingRef = useRef(false)
  const router = useRouter()

  const question = questions[currentIdx]
  const totalQuestions = questions.length

  const goToQuestion = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalQuestions) return
      setCurrentIdx(idx)
      setShowFeedback(!!answerStates[questions[idx]?.id])
      setTimerRunning(!answerStates[questions[idx]?.id])
      setTimerResetKey((k) => k + 1)
    },
    [totalQuestions, answerStates, questions],
  )

  const handleTimeExpire = useCallback(() => {
    if (!question || answerStates[question.id]) return
    setAnswerStates((prev) => ({
      ...prev,
      [question.id]: {
        selected: null,
        correct: false,
        correctAnswer: question.correct_answer,
        rationale: question.rationale,
        timedOut: true,
      },
    }))
    setShowFeedback(true)
    setTimerRunning(false)
  }, [question, answerStates])

  const safeChoices = useCallback(
    (q: Question): { key: string; text: string }[] => {
      const labels = ["A", "B", "C", "D"]
      return (q.choices || [])
        .filter((c) => c && c.key && c.text)
        .sort((a, b) => labels.indexOf(a.key) - labels.indexOf(b.key))
    },
    [],
  )

  const handleSelect = useCallback(
    async (key: string) => {
      if (showFeedback || !question || answerStates[question.id]) return
      setSubmitting(true)
      setTimerRunning(false)

      try {
        const res = await fetch(`/api/sessions/${sessionId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id, answer: key }),
        })
        if (!res.ok) throw new Error("Failed to submit")
        const data = await res.json()

        const state: AnswerState = {
          selected: key,
          correct: data.correct,
          correctAnswer: data.correctAnswer,
          rationale: data.rationale,
          timedOut: false,
        }

        setAnswerStates((prev) => ({ ...prev, [question.id]: state }))
        setAnswers((prev) => ({ ...prev, [question.id]: key }))
        setShowFeedback(true)
      } catch {
        setTimerRunning(true)
      } finally {
        setSubmitting(false)
      }
    },
    [showFeedback, question, answerStates, sessionId],
  )

  const handleNext = useCallback(() => {
    if (currentIdx < totalQuestions - 1) {
      goToQuestion(currentIdx + 1)
    }
  }, [currentIdx, totalQuestions, goToQuestion])

  const handleFinish = useCallback(async () => {
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

  const handleViewResults = useCallback(() => {
    handleFinish()
  }, [handleFinish])

  const isLastQuestion = currentIdx === totalQuestions - 1

  const areaLabel =
    contentAreas.length > 0
      ? contentAreas
          .map(
            (a) =>
              ({
                "nlp-i": "NLP I — Foundation",
                "nlp-ii": "NLP II — Community Health",
                "nlp-iii": "NLP III — Mother & Child",
                "nlp-iv": "NLP IV — Med-Surg",
                "nlp-v": "NLP V — Psychiatric",
              })[a] ?? a,
          )
          .join(", ")
      : "Practice"

  if (!question) {
    return (
      <div className="h-dvh flex items-center justify-center bg-surface">
        <p className="font-body-lg text-secondary">No questions available.</p>
      </div>
    )
  }

  const choices = safeChoices(question)
  const feedbackState = showFeedback ? answerStates[question.id] : null

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-surface">
      <NavHeader firstName={firstName} imageUrl={imageUrl} activeHref="/practice" />

      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pt-4 pb-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px]">
                NURSING BOARD EXAM PREP
              </span>
              <h1 className="font-headline-lg text-lg uppercase tracking-tight leading-none">
                Question {currentIdx + 1}{" "}
                <span className="text-secondary opacity-30">/ {totalQuestions}</span>
              </h1>
            </div>
            <QuestionTimer
              key={timerResetKey}
              duration={60}
              onExpire={handleTimeExpire}
              running={timerRunning && !feedbackState}
            />
          </div>
          <div className="w-full h-[3px] bg-surface-variant relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-3">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 md:grid-cols-12 gap-5">
          <section className="md:col-span-7 flex flex-col min-h-0">
            <div className="p-5 border-l-4 border-primary bg-surface-container-lowest shrink-0">
              <h2 className="font-headline-lg text-xl leading-tight mb-3">
                {question.text}
              </h2>
              <p className="font-body-lg text-secondary border-t border-surface-variant pt-3 text-sm italic">
                Select the best response according to NLP standards.
              </p>
            </div>

            <div className="flex-1 min-h-0 mt-2 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 content-start">
                {choices.map((choice) => {
                  const isSelected = feedbackState?.selected === choice.key
                  const isCorrectChoice = feedbackState?.correctAnswer === choice.key
                  const wasWrong =
                    isSelected && feedbackState && !feedbackState.correct

                  let borderStyle = "border border-outline-variant bg-white hover:border-secondary"
                  let letterStyle =
                    "border border-outline-variant group-hover:bg-secondary group-hover:text-white"
                  let icon = null

                  if (feedbackState) {
                    if (isCorrectChoice) {
                      borderStyle = "border-2 border-[#1a8038] bg-[#e6f4ea]"
                      letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                      icon = (
                        <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">
                          check_circle
                        </span>
                      )
                    } else if (wasWrong) {
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
                  } else {
                    letterStyle =
                      "border border-outline-variant group-hover:bg-secondary group-hover:text-white transition-colors"
                  }

                  return (
                    <button
                      key={choice.key}
                      onClick={() => handleSelect(choice.key)}
                      disabled={!!feedbackState || submitting}
                      className={`group flex items-center p-5 text-left transition-all duration-200 ${borderStyle} disabled:cursor-default`}
                    >
                      <div
                        className={`w-7 h-7 flex items-center justify-center font-bold mr-3 shrink-0 text-xs ${letterStyle}`}
                      >
                        {choice.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-body-lg text-sm leading-snug ${
                            feedbackState
                              ? isCorrectChoice
                                ? "text-[#0d3c1a] font-semibold"
                                : wasWrong
                                  ? "text-primary font-semibold"
                                  : "text-on-surface"
                              : "text-on-surface"
                          }`}
                        >
                          {choice.text}
                        </p>
                      </div>
                      {icon}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <aside className="md:col-span-5 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-4">
              {feedbackState ? (
                <div className="p-5 bg-inverse-surface text-surface border-t-8 border-primary">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">
                      {feedbackState.timedOut
                        ? "timer_off"
                        : feedbackState.correct
                          ? "check_circle"
                          : "psychology"}
                    </span>
                    <h3 className="font-label-caps text-primary tracking-widest text-[10px]">
                      {feedbackState.timedOut
                        ? "TIME'S UP"
                        : feedbackState.correct
                          ? "CORRECT"
                          : "RATIONALE & FEEDBACK"}
                    </h3>
                  </div>

                  {feedbackState.timedOut && (
                    <div className="mb-3 p-3 bg-error-container border border-error">
                      <p className="font-body-md text-on-error-container text-sm font-semibold">
                        Time expired for this question.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-headline-lg text-base mb-1.5 text-white">
                        {feedbackState.correct || feedbackState.timedOut
                          ? "Correct answer:"
                          : `Why Choice ${feedbackState.correctAnswer} is correct:`}
                      </h4>
                      <p className="text-surface-variant font-body-md text-xs opacity-80 leading-relaxed">
                        {feedbackState.rationale}
                      </p>
                    </div>

                    <div className="bg-surface-container-highest p-3 -mx-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-label-caps text-on-surface mb-0.5 text-[10px]">
                            CONTENT AREA
                          </p>
                          <span className="px-2.5 py-1 bg-white border border-outline text-[10px] font-bold uppercase tracking-tighter text-on-surface">
                            {areaLabel}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-label-caps text-on-surface mb-0.5 text-[10px]">
                            DIFFICULTY
                          </p>
                          <span className="font-mono-data text-xs capitalize">
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 border border-tertiary-fixed bg-surface-container-low">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      info
                    </span>
                    <h3 className="font-label-caps text-secondary tracking-widest text-[10px]">
                      TIPS
                    </h3>
                  </div>
                  <p className="font-body-md text-secondary text-xs leading-relaxed">
                    Read the question carefully. Identify key words, use the nursing process,
                    and eliminate obviously wrong answers first. You have 60 seconds per
                    question.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="shrink-0 bg-surface-container-high border-t border-tertiary px-margin-mobile md:px-margin-desktop py-3 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => goToQuestion(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 font-label-caps text-secondary hover:text-on-surface transition-colors text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            PREVIOUS
          </button>

          <div className="hidden md:flex gap-1.5">
            {questions.map((q, i) => {
              const state = answerStates[q.id]
              let dotStyle = "w-2 h-2 border border-primary opacity-20"
              if (state) {
                dotStyle = state.correct
                  ? "w-2 h-2 bg-[#1a8038]"
                  : "w-2 h-2 bg-primary"
              }
              if (i === currentIdx && !state) {
                dotStyle = "w-2 h-2 border border-primary"
              }
              return <div key={q.id} className={`${dotStyle} transition-colors duration-200`} />
            })}
          </div>

          <div>
            {feedbackState ? (
              isLastQuestion ? (
                <button
                  onClick={handleViewResults}
                  disabled={completing}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                >
                  {completing ? "LOADING..." : "VIEW RESULTS"}
                  <span className="material-symbols-outlined text-base">bar_chart</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                >
                  NEXT QUESTION
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              )
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  )
}
