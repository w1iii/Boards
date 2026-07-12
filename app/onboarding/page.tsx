"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

const CONTENT_AREAS = [
  { value: "medical-surgical", label: "Medical-Surgical Nursing" },
  { value: "mother-child", label: "Mother & Child Nursing" },
  { value: "psychiatric", label: "Psychiatric Nursing" },
  { value: "community-health", label: "Community Health Nursing" },
  { value: "leadership-management", label: "Leadership & Management" },
] as const

const GOAL_OPTIONS = [
  { questions: 20, label: "Casual Pace" },
  { questions: 50, label: "Steady Progress" },
  { questions: 100, label: "Intensive Prep" },
] as const

type Step = 1 | 2 | 3 | 4

const STEP_META: Record<Step, {
  label: string
  title: string
  description: string
}> = {
  1: {
    label: "STEP 01 OF 04",
    title: "Personalize Your Study Plan",
    description:
      "Setting clear goals is the first step toward nursing excellence. We'll tailor your daily practice based on your exam date and desired intensity.",
  },
  2: {
    label: "STEP 02 OF 04",
    title: "Tell Us About Yourself",
    description:
      "We'll use your name to personalize your experience and celebrate your milestones throughout your NLE journey.",
  },
  3: {
    label: "STEP 03 OF 04",
    title: "Choose Your Focus Areas",
    description:
      "Select the nursing content areas you want to practice. You can change these anytime from your dashboard.",
  },
  4: {
    label: "STEP 04 OF 04",
    title: "Review Your Study Plan",
    description:
      "Here's a summary of your personalized plan. If everything looks good, let's get started!",
  },
}

function getDefaultDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split("T")[0]
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contentAreas, setContentAreas] = useState<string[]>(
    CONTENT_AREAS.map((a) => a.value),
  )
  const [dailyGoal, setDailyGoal] = useState(50)
  const [targetExamDate, setTargetExamDate] = useState(getDefaultDate())
  const [dateFocused, setDateFocused] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/onboarding")
        const data = await res.json()
        if (data.profile) {
          if (data.profile.first_name) setFirstName(data.profile.first_name)
          if (data.profile.last_name) setLastName(data.profile.last_name)
          if (data.profile.content_areas) setContentAreas(data.profile.content_areas)
          if (data.profile.daily_goal) setDailyGoal(data.profile.daily_goal)
          if (data.profile.target_exam_date) setTargetExamDate(data.profile.target_exam_date)
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return targetExamDate.length > 0 && dailyGoal > 0
      case 2:
        return firstName.trim().length > 0 && lastName.trim().length > 0
      case 3:
        return contentAreas.length > 0
      case 4:
        return true
    }
  }, [step, targetExamDate, dailyGoal, firstName, lastName, contentAreas])

  const stepIcons = useMemo(() => [
    { value: "school", fill: step >= 1 },
    { value: "person", fill: step >= 2 },
    { value: "category", fill: step >= 3 },
    { value: "checklist", fill: step >= 4 },
  ], [step])

  async function handleSubmit() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contentAreas,
          dailyGoal,
          targetExamDate: targetExamDate || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || "Failed to save profile")
      }

      window.location.href = "/dashboard"
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  function toggleContentArea(value: string) {
    setContentAreas((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value],
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-tertiary-fixed-dim border-t-primary" />
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface h-screen flex flex-col selection:bg-primary selection:text-on-primary overflow-hidden">
      <header className="bg-surface border-b border-tertiary-fixed px-margin-mobile md:px-margin-desktop py-3 flex justify-between items-center z-50">
        <div className="font-display-md text-[24px] font-black tracking-tighter text-on-surface">
          BOARDS.
        </div>
        <div className="flex items-center gap-4">
          <span className="font-label-caps text-label-caps text-secondary">
            {STEP_META[step].label}
          </span>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="text-on-surface hover:text-primary transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop overflow-y-auto overflow-x-hidden py-4">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-5 flex flex-col gap-2 mb-4 md:mb-0">
            <div className="flex gap-2 mb-2">
              {([1, 2, 3, 4] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-0.5 ${step >= s ? "bg-primary" : "bg-tertiary-fixed"}`}
                />
              ))}
            </div>

            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {STEP_META[step].title}
            </h1>
            <p className="font-body-lg text-body-lg text-secondary">
              {STEP_META[step].description}
            </p>

            {step === 1 && (
              <div className="mt-4 hidden md:block">
                <div className="h-px bg-tertiary-fixed w-full mb-4" />
                <div className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant italic">
                    &ldquo;94% of students who set a daily goal pass the NLE on
                    their first attempt.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {(step === 2 || step === 3 || step === 4) && (
              <div className="mt-4 hidden md:flex items-center gap-3">
                <div className="h-px bg-tertiary-fixed flex-1" />
                <span className="font-mono-data text-mono-data text-secondary">
                  {stepIcons[step - 1]?.value}
                </span>
              </div>
            )}
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7 flex flex-col gap-4">
            {step === 1 && (
              <>
                <div className="flex flex-col gap-2">
                  <label
                    className="font-label-caps text-label-caps text-secondary uppercase"
                    htmlFor="exam-date"
                  >
                    Question 01
                  </label>
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                    When is your NLE Board Exam?
                  </h2>
                  <div className="relative group mt-1">
                    <input
                      id="exam-date"
                      type="date"
                      value={targetExamDate}
                      onChange={(e) => setTargetExamDate(e.target.value)}
                      onFocus={() => setDateFocused(true)}
                      onBlur={() => setDateFocused(false)}
                      required
                      className={`w-full bg-surface-container-low border-0 border-b-2 py-3 px-0 font-body-lg text-body-lg transition-all placeholder:text-tertiary-fixed-dim focus:ring-0 ${
                        dateFocused ? "border-primary" : "border-tertiary"
                      }`}
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-secondary">
                        calendar_today
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-label-caps text-secondary uppercase">
                    Question 02
                  </span>
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                    What is your daily study goal?
                  </h2>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {GOAL_OPTIONS.map((opt) => {
                      const selected = dailyGoal === opt.questions
                      return (
                        <button
                          key={opt.questions}
                          type="button"
                          onClick={() => setDailyGoal(opt.questions)}
                          className={`group flex items-center justify-between p-3 border text-left transition-all duration-200 cursor-pointer ${
                            selected
                              ? "bg-on-secondary-fixed text-inverse-on-surface border-on-secondary-fixed"
                              : "bg-surface border-tertiary"
                          }`}
                        >
                          <div>
                            <h3 className="font-body-lg text-body-lg mb-0.5">
                              {opt.questions} Questions
                            </h3>
                            <p
                              className={`font-label-caps text-label-caps uppercase ${
                                selected
                                  ? "text-surface-container"
                                  : "text-secondary"
                              }`}
                            >
                              {opt.label}
                            </p>
                          </div>
                          <span
                            className={`material-symbols-outlined ${
                              selected
                                ? "text-white"
                                : "text-primary"
                            }`}
                            style={
                              selected
                                ? { fontVariationSettings: "'FILL' 1" }
                                : undefined
                            }
                          >
                            {opt.questions === 100
                              ? "local_fire_department"
                              : "bolt"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  Question 03
                </span>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                  What&rsquo;s your name?
                </h2>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="relative group">
                    <label
                      className="font-label-caps text-label-caps text-secondary uppercase mb-1 block"
                      htmlFor="first-name"
                    >
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Juan"
                      className="w-full bg-surface-container-low border-0 border-b-2 border-tertiary focus:border-primary focus:ring-0 font-body-lg text-body-lg py-3 px-0 transition-all placeholder:text-tertiary-fixed-dim"
                    />
                  </div>
                  <div className="relative group">
                    <label
                      className="font-label-caps text-label-caps text-secondary uppercase mb-1 block"
                      htmlFor="last-name"
                    >
                      Last name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dela Cruz"
                      className="w-full bg-surface-container-low border-0 border-b-2 border-tertiary focus:border-primary focus:ring-0 font-body-lg text-body-lg py-3 px-0 transition-all placeholder:text-tertiary-fixed-dim"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  Question 04
                </span>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                  Which areas do you want to practice?
                </h2>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {CONTENT_AREAS.map((area) => {
                    const selected = contentAreas.includes(area.value)
                    return (
                      <button
                        key={area.value}
                        type="button"
                        onClick={() => toggleContentArea(area.value)}
                        className={`group flex items-center justify-between p-3 border text-left transition-all duration-200 cursor-pointer ${
                          selected
                            ? "bg-on-secondary-fixed text-inverse-on-surface border-on-secondary-fixed"
                            : "bg-surface border-tertiary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 flex items-center justify-center border ${
                              selected
                                ? "bg-primary border-primary text-white"
                                : "border-tertiary"
                            }`}
                          >
                            {selected && (
                              <span
                                className="material-symbols-outlined text-[12px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                check
                              </span>
                            )}
                          </div>
                          <h3 className="font-body-lg text-body-lg">
                            {area.label}
                          </h3>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-3">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    celebration
                  </span>
                  Ready, {firstName}!
                </h2>

                <div className="bg-surface-container-low p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">
                      Target Exam Date
                    </span>
                    <span className="font-body-lg text-body-lg text-on-surface">
                      {new Date(targetExamDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                  <div className="h-px bg-tertiary-fixed" />
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">
                      Daily Goal
                    </span>
                    <span className="font-body-lg text-body-lg text-on-surface">
                      {dailyGoal} Questions
                    </span>
                  </div>
                  <div className="h-px bg-tertiary-fixed" />
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">
                      Focus Areas
                    </span>
                    <span className="font-body-lg text-body-lg text-on-surface">
                      {contentAreas.length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {contentAreas.map((area) => {
                      const found = CONTENT_AREAS.find((a) => a.value === area)
                      return (
                        <span
                          key={area}
                          className="font-mono-data text-mono-data bg-primary-fixed text-on-primary-fixed px-3 py-1"
                        >
                          {found?.label ?? area}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="px-margin-mobile md:px-margin-desktop pb-4">
        <div className="max-w-4xl mx-auto grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-6 md:col-start-7 flex flex-col gap-2">
            {error && (
              <div className="bg-error-container border border-primary p-3 font-mono-data text-sm text-on-error-container">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (step < 4) {
                  setStep((prev) => (prev + 1) as Step)
                } else {
                  handleSubmit()
                }
              }}
              disabled={!canProceed() || saving}
              className="w-full bg-primary text-on-primary py-3 px-6 font-headline-lg-mobile text-headline-lg-mobile flex justify-between items-center group hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <span>
                {step < 4 ? "Continue" : saving ? "Saving..." : "Get Started"}
              </span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2 group-disabled:translate-x-0">
                {step < 4 ? "arrow_forward" : "rocket_launch"}
              </span>
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as Step)}
                className="font-body-md text-body-md text-secondary hover:text-on-surface transition-colors text-center"
              >
                Back
              </button>
            )}

            <p className="font-body-md text-body-md text-center text-secondary">
              Don&rsquo;t worry, you can change these goals anytime in your
              dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none z-[-1] opacity-20 overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 border-[40px] border-tertiary opacity-10 rotate-12" />
        <div className="absolute top-1/2 right-10 flex gap-2 rotate-90">
          <div className="w-2 h-24 bg-primary" />
          <div className="w-2 h-12 bg-tertiary" />
        </div>
      </div>

    </div>
  )
}
