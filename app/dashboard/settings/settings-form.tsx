"use client"

import { useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const CONTENT_AREAS = [
  { value: "nlp-i", label: "NP I — Community Health Nursing" },
  { value: "nlp-ii", label: "NP II — Maternal & Child Health Nursing" },
  { value: "nlp-iii", label: "NP III — Adult Health and Illness Care (Part 1)" },
  { value: "nlp-iv", label: "NP IV — Adult Health and Illness Care (Part 2)" },
  { value: "nlp-v", label: "NP V — Mental Health and Psychiatric Nursing" },
] as const

const GOAL_OPTIONS = [
  { questions: 20, label: "Casual Pace" },
  { questions: 50, label: "Steady Progress" },
  { questions: 100, label: "Intensive Prep" },
] as const

interface SettingsFormProps {
  initialFirstName: string
  initialLastName: string
  initialContentAreas: string[]
  initialDailyGoal: number
  initialTargetExamDate: string
  email: string | null
}

export default function SettingsForm({
  initialFirstName,
  initialLastName,
  initialContentAreas,
  initialDailyGoal,
  initialTargetExamDate,
  email,
}: SettingsFormProps) {
  const { signOut } = useClerk()
  const router = useRouter()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [contentAreas, setContentAreas] = useState<string[]>(initialContentAreas)
  const [dailyGoal, setDailyGoal] = useState(initialDailyGoal)
  const [targetExamDate, setTargetExamDate] = useState(initialTargetExamDate)

  const [savingAccount, setSavingAccount] = useState(false)
  const [savingPlan, setSavingPlan] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")

  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function toggleContentArea(value: string) {
    setContentAreas((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value],
    )
  }

  async function save(section: "account" | "plan") {
    setError("")
    setSaved("")
    if (section === "account") setSavingAccount(true)
    else setSavingPlan(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
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
        throw new Error((err as { error?: string }).error || "Failed to save")
      }

      setSaved(section === "account" ? "Account updated." : "Study plan updated.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      if (section === "account") setSavingAccount(false)
      else setSavingPlan(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError("")
    try {
      const res = await fetch("/api/settings", { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || "Failed to delete account")
      }
      await signOut({ redirectUrl: "/" })
      router.push("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display-lg text-display-lg text-primary mb-2">Settings</h1>
        <p className="font-body-lg text-on-surface-variant">
          Manage your account, study plan, and focus areas.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-error-container border border-primary p-3 font-mono-data text-sm text-on-error-container">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-6 bg-primary-container border border-primary p-3 font-mono-data text-sm text-on-primary-container">
          {saved}
        </div>
      )}

      <section className="glass-jar p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-primary text-2xl">person</span>
          <h2 className="font-headline-lg text-headline-lg text-primary">Account</h2>
        </div>

        <div className="flex flex-col gap-5 mb-6">
          <div>
            <label className="font-label-caps text-on-surface-variant uppercase mb-1 block" htmlFor="email">
              Email
            </label>
            <p className="font-body-lg text-on-surface-variant" id="email">
              {email ?? "—"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase mb-1 block" htmlFor="first-name">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
                className="w-full bg-surface-container-low border border-tertiary rounded-lg focus:border-primary focus:ring-0 font-body-lg text-body-lg py-3 px-3 transition-all placeholder:text-tertiary-fixed-dim"
              />
            </div>
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase mb-1 block" htmlFor="last-name">
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dela Cruz"
                className="w-full bg-surface-container-low border border-tertiary rounded-lg focus:border-primary focus:ring-0 font-body-lg text-body-lg py-3 px-3 transition-all placeholder:text-tertiary-fixed-dim"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => save("account")}
          disabled={savingAccount || firstName.trim().length === 0 || lastName.trim().length === 0}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-title-md text-sm candy-button-shadow hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          {savingAccount ? "Saving..." : "Save Account"}
        </button>
      </section>

      <section className="glass-jar p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-primary text-2xl">school</span>
          <h2 className="font-headline-lg text-headline-lg text-primary">Study Plan</h2>
        </div>

        <div className="flex flex-col gap-5 mb-6">
          <div className="relative group">
            <label className="font-label-caps text-on-surface-variant uppercase mb-1 block" htmlFor="exam-date">
              Target exam date
            </label>
            <input
              id="exam-date"
              type="date"
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              className="w-full bg-surface-container-low border border-tertiary rounded-lg focus:border-primary focus:ring-0 font-body-lg text-body-lg py-3 px-3 transition-all placeholder:text-tertiary-fixed-dim"
            />
          </div>

          <div>
            <span className="font-label-caps text-on-surface-variant uppercase mb-2 block">
              Daily goal
            </span>
            <div className="grid grid-cols-1 gap-1">
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
                          selected ? "text-surface-container" : "text-secondary"
                        }`}
                      >
                        {opt.label}
                      </p>
                    </div>
                    <span
                      className={`material-symbols-outlined ${
                        selected ? "text-white" : "text-primary"
                      }`}
                      style={selected ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {opt.questions === 100 ? "local_fire_department" : "bolt"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="font-label-caps text-on-surface-variant uppercase mb-2 block">
              Focus areas
            </span>
            <div className="grid grid-cols-1 gap-2">
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
                          selected ? "bg-primary border-primary text-white" : "border-tertiary"
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
                      <h3 className="font-body-lg text-body-lg">{area.label}</h3>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => save("plan")}
          disabled={savingPlan || contentAreas.length === 0}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-title-md text-sm candy-button-shadow hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          {savingPlan ? "Saving..." : "Save Study Plan"}
        </button>
      </section>

      <section className="glass-jar p-6 md:p-8 rounded-2xl border-l-4 border-error">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-error text-2xl">delete</span>
          <h2 className="font-headline-lg text-headline-lg text-error">Danger Zone</h2>
        </div>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-6 py-2.5 bg-error text-on-error rounded-full font-title-md text-sm candy-button-shadow hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_off</span>
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-body-lg text-on-surface-variant">
              This permanently deletes your account, session history, and all study data. This cannot be undone.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-error text-on-error rounded-full font-title-md text-sm candy-button-shadow hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">delete_forever</span>
                {deleting ? "Deleting..." : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-full font-title-md text-sm hover:bg-surface-container-highest transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
