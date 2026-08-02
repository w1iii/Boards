"use client"

import { useState } from "react"
import Link from "next/link"
import SideNavBar from "@/app/components/side-nav-bar"

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
  firstName: string
  imageUrl: string | null
  questions: Question[]
  answers: Record<string, string>
}

const AREA_LABELS: Record<string, string> = {
  "nlp-i": "NP I — Community Health",
  "nlp-ii": "NP II — Mother & Child",
  "nlp-iii": "NP III — Adult Health (Part 1)",
  "nlp-iv": "NP IV — Adult Health (Part 2)",
  "nlp-v": "NP V — Mental Health & Psych",
}

export default function ReviewView({
  sessionId,
  firstName,
  imageUrl,
  questions,
  answers,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)

  const correctCount = questions.filter((q) => answers[q.id] === q.correct_answer).length
  const question = questions[currentIdx]
  const totalQuestions = questions.length

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

  const userAnswer = answers[question.id]
  const isCorrect = userAnswer === question.correct_answer

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <SideNavBar firstName={firstName} imageUrl={imageUrl} />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
      <div className="shrink-0 px-margin-mobile md:px-margin-desktop pt-4 pb-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="font-label-caps text-primary block tracking-[0.2em] text-[10px]">
                REVIEW ANSWERS
              </span>
              <h1 className="font-headline-lg text-lg uppercase tracking-tight leading-none">
                Question {currentIdx + 1}{" "}
                <span className="text-secondary opacity-30">/ {totalQuestions}</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="font-mono-data text-sm font-bold">
                {correctCount}
                <span className="text-secondary opacity-60"> / {totalQuestions} correct</span>
              </p>
              <p className="font-label-caps text-[10px] text-secondary uppercase">Score Recap</p>
            </div>
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
        <div className="max-w-6xl mx-auto md:h-full grid grid-cols-1 md:grid-cols-12 gap-5">
          <section className="md:col-span-7 md:flex md:flex-col md:min-h-0">
            <div className="p-5 border-l-4 border-primary bg-surface-container-lowest shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-surface-container-highest border border-outline-variant text-[10px] font-bold uppercase tracking-tight text-on-surface">
                  {AREA_LABELS[question.content_area] || question.content_area}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${
                  isCorrect ? "bg-[#e6f4ea] text-[#1a8038]" : "bg-error-container text-primary"
                }`}>
                  {userAnswer ? (isCorrect ? "CORRECT" : "INCORRECT") : "UNANSWERED"}
                </span>
              </div>
              <h2 className="font-headline-lg text-xl leading-tight mb-3">
                {question.text}
              </h2>
            </div>

            <div className="mt-2 md:flex-1 md:min-h-0 md:overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                {choices.map((choice) => {
                  const isUser = userAnswer === choice.key
                  const isCorrectChoice = question.correct_answer === choice.key
                  const wasWrong = isUser && !isCorrectChoice

                  let borderStyle = "border border-outline-variant bg-white"
                  let letterStyle = "border border-outline-variant text-secondary"
                  let icon = null

                  if (isCorrectChoice) {
                    borderStyle = "border-2 border-[#1a8038] bg-[#e6f4ea]"
                    letterStyle = "bg-[#1a8038] text-white border-[#1a8038]"
                    icon = (
                      <span className="material-symbols-outlined text-[#1a8038] shrink-0 text-sm">check_circle</span>
                    )
                  } else if (wasWrong) {
                    borderStyle = "border-2 border-primary bg-error-container"
                    letterStyle = "bg-primary text-white border-primary"
                    icon = (
                      <span className="material-symbols-outlined text-primary shrink-0 text-sm">cancel</span>
                    )
                  }

                  return (
                    <div key={choice.key} className={`flex items-center p-5 ${borderStyle}`}>
                      <div className={`w-7 h-7 flex items-center justify-center font-bold mr-3 shrink-0 text-xs ${letterStyle}`}>
                        {choice.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-body-lg text-sm leading-snug ${
                          isCorrectChoice
                            ? "text-[#0d3c1a] font-semibold"
                            : wasWrong
                              ? "text-primary font-semibold"
                              : "text-on-surface"
                        }`}>
                          {choice.text}
                        </p>
                      </div>
                      {icon}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <aside className="md:col-span-5 md:min-h-0 md:overflow-hidden">
            <div className="md:h-full md:overflow-y-auto space-y-4">
              <div className="p-5 bg-inverse-surface text-surface border-t-8 border-primary">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-lg">school</span>
                  <h3 className="font-label-caps text-primary tracking-widest text-[10px]">
                    RATIONALE
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-headline-lg text-base mb-1.5 text-white">
                      {`Why Choice ${question.correct_answer} is correct:`}
                    </h4>
                    <p className="text-surface-variant font-body-md text-xs opacity-80 leading-relaxed">
                      {question.rationale}
                    </p>
                  </div>
                  {wasWrongRationale(question, userAnswer) && (
                    <div className="bg-error-container p-3 -mx-5">
                      <p className="font-label-caps text-primary mb-1 text-[10px] uppercase">
                        Why your answer was wrong
                      </p>
                      <p className="text-on-error-container font-body-md text-xs leading-relaxed">
                        {wasWrongRationale(question, userAnswer)}
                      </p>
                    </div>
                  )}
                  <div className="bg-surface-container-highest p-3 -mx-5">
                    <p className="font-label-caps text-on-surface mb-0.5 text-[10px]">
                      DIFFICULTY
                    </p>
                    <span className="font-mono-data text-xs capitalize">
                      {question.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {!userAnswer && (
                <div className="p-4 border border-amber-300 bg-amber-50">
                  <p className="font-body-md text-sm text-amber-900">
                    You did not answer this question during the exam.
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
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 font-label-caps text-secondary hover:text-on-surface transition-colors text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            PREVIOUS
          </button>

          <div className="hidden md:flex gap-1.5">
            {questions.map((q, i) => {
              const answered = !!answers[q.id]
              const correct = answers[q.id] === q.correct_answer
              let dotStyle = "w-2 h-2 border border-primary opacity-20"
              if (answered) {
                dotStyle = correct ? "w-2 h-2 bg-[#1a8038]" : "w-2 h-2 bg-primary"
              }
              if (i === currentIdx) {
                dotStyle = answered
                  ? correct
                    ? "w-2 h-2 bg-[#1a8038] ring-2 ring-[#1a8038]/30"
                    : "w-2 h-2 bg-primary ring-2 ring-primary/30"
                  : "w-2 h-2 border-2 border-primary"
              }
              return <div key={q.id} className={`${dotStyle} transition-colors duration-200`} />
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/practice/session/${sessionId}/results`}
              className="flex items-center gap-2 font-label-caps text-secondary hover:text-on-surface transition-colors text-[11px]"
            >
              <span className="material-symbols-outlined text-base">bar_chart</span>
              BACK TO RESULTS
            </Link>
            <button
              onClick={() => setCurrentIdx(Math.min(totalQuestions - 1, currentIdx + 1))}
              disabled={currentIdx === totalQuestions - 1}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT QUESTION
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}

function wasWrongRationale(q: Question, userAnswer?: string): string | null {
  if (!userAnswer || userAnswer === q.correct_answer) return null
  const specific = q.wrong_choice_rationales?.[userAnswer]
  if (specific) return specific
  const chosen = q.choices.find((c) => c.key === userAnswer)?.text ?? "your answer"
  return `"${chosen}" was not the best response.`
}
