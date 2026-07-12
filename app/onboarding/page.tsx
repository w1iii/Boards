"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const CONTENT_AREAS = [
  { value: "medical-surgical", label: "Medical-Surgical" },
  { value: "mother-child", label: "Mother & Child" },
  { value: "psychiatric", label: "Psychiatric" },
  { value: "community-health", label: "Community Health" },
  { value: "leadership-management", label: "Leadership & Management" },
] as const

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contentAreas, setContentAreas] = useState<string[]>(
    CONTENT_AREAS.map((a) => a.value),
  )
  const [dailyGoal, setDailyGoal] = useState(20)
  const [targetExamDate, setTargetExamDate] = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
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

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return firstName.trim().length > 0 && lastName.trim().length > 0
      case 2:
        return contentAreas.length > 0
      case 3:
        return true
    }
  }

  async function handleSubmit() {
    setSaving(true)
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

      if (!res.ok) throw new Error("Failed to save")

      router.push("/dashboard")
    } catch {
      // silent fail
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to Boards</h1>
          <p className="mt-2 text-gray-600">
            Let's get you set up in just a few steps.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? "bg-blue-600 text-white"
                    : step > s
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    step > s ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="mb-1 text-xl font-semibold">What's your name?</h2>
              <p className="mb-6 text-sm text-gray-500">
                We'll use this to personalize your experience.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1 text-xl font-semibold">
                Choose your focus areas
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Select the nursing content areas you want to practice. You can
                change these anytime.
              </p>
              <div className="grid gap-3">
                {CONTENT_AREAS.map((area) => {
                  const selected = contentAreas.includes(area.value)
                  return (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() =>
                        setContentAreas((prev) =>
                          selected
                            ? prev.filter((a) => a !== area.value)
                            : [...prev, area.value],
                        )
                      }
                      className={`flex items-center rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                          selected
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {area.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1 text-xl font-semibold">Set your goals</h2>
              <p className="mb-6 text-sm text-gray-500">
                Customize your practice routine.
              </p>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Daily question goal:{" "}
                  <span className="font-semibold text-blue-600">
                    {dailyGoal}
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target exam date{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as Step)}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              disabled={!canProceed()}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Get Started"}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
