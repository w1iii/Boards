"use client"

import { useState, useRef, useEffect } from "react"
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

interface Props {
  sessionId: string
  mode: string
  contentArea: string
  topic: string | null
  initialTranscript: TranscriptEntry[]
  firstName: string
  imageUrl: string | null
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
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [completed, setCompleted] = useState(!!initialTranscript.find((m) => m.role === "assistant" && m.content.includes('"concepts_covered"')))
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [error, setError] = useState<"start" | "send" | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript, error])

  async function startSession() {
    setSending(true)
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
        await fetch(`/api/study/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            summary: data.summary,
            transcript: updated,
          }),
        })
      }
    } catch {
      setError("start")
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (initialTranscript.length === 0) {
      const id = requestAnimationFrame(() => startSession())
      return () => cancelAnimationFrame(id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage() {
    if (!input.trim() || sending || completed) return

    const userMsg = { role: "user" as const, content: input.trim() }
    const updated = [...transcript, userMsg]
    setTranscript(updated)
    setInput("")
    setSending(true)
    setError(null)

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
        await fetch(`/api/study/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            summary: data.summary,
            transcript: withReply,
          }),
        })
      }
    } catch {
      setError("send")
    } finally {
      setSending(false)
    }
  }

  const areaLabel = contentArea
  const modeLabel = mode.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())

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
                {topic && (
                  <span className="px-2.5 py-0.5 bg-primary-container border border-primary text-[10px] font-bold uppercase tracking-wider text-on-primary-container">
                    {topic}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="w-full h-[3px] bg-surface-variant relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: completed ? "100%" : `${Math.min((transcript.filter(m => m.role === "user").length / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-3">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
          <section className="md:col-span-8">
            <div className="space-y-4">
              {transcript.filter((m) => m.role !== "system").map((msg, i) => {
                const isUser = msg.role === "user"
                return (
                  <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      isUser
                        ? "bg-primary text-on-primary rounded-br-md"
                        : "bg-surface-container-lowest border border-outline-variant rounded-bl-md"
                    }`}>
                      <p className={`font-body-md text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser ? "text-on-primary" : "text-on-surface"
                      }`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )
              })}
              {sending && !completed && (
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
              {error && !sending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-md bg-error-container border border-error">
                    <p className="font-body-md text-sm text-on-error-container mb-2">
                      {error === "start" ? "Failed to start session. Please try again." : "Failed to get response. Please try again."}
                    </p>
                    <button
                      onClick={() => { setError(null); if (error === "start") { startSession() } else { sendMessage() } }}
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
              {completed && summary ? (
                <div className="p-5 bg-inverse-surface text-surface border-t-8 border-primary">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                    <h3 className="font-label-caps text-primary tracking-widest text-[10px]">
                      SESSION SUMMARY
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="font-label-caps text-on-surface mb-0.5 text-[10px]">SCORE</p>
                        <p className="font-display-lg text-2xl text-white">{Math.round(summary.score_pct)}%</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-on-surface mb-0.5 text-[10px]">COVERED</p>
                        <p className="font-body-md text-sm text-white">{summary.concepts_covered.length}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-on-surface mb-0.5 text-[10px]">WEAK</p>
                        <p className="font-body-md text-sm text-primary">{summary.weak_concepts.length}</p>
                      </div>
                    </div>
                    {summary.weak_concepts.length > 0 && (
                      <div className="pt-3 border-t border-surface-container-highest">
                        <p className="font-label-caps text-on-surface mb-2 text-[10px]">WEAK CONCEPTS</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.weak_concepts.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 bg-surface-container-highest border border-outline text-[10px] font-bold uppercase tracking-wider text-on-surface">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                    {mode === "drill" && "Answer each question thoughtfully. The AI will guide you through Socratic questioning to deepen your understanding."}
                    {mode === "case" && "Read the clinical vignette carefully. Consider patient history, symptoms, and nursing priorities before responding."}
                    {mode === "recall" && "Quick recall round! Answer as fast as you can with your best knowledge."}
                    {mode === "teach_back" && "Explain the concept in your own words. Teaching is the best way to learn!"}
                    {mode === "weak_area" && "Focus on your weak areas. Take your time to understand each concept thoroughly."}
                    {!["drill", "case", "recall", "teach_back", "weak_area"].includes(mode) && "Engage with the AI tutor to strengthen your nursing knowledge."}
                  </p>
                </div>
              )}
          </aside>
        </div>
      </main>

      {!completed && (
        <footer className="shrink-0 bg-surface-container-high border-t border-tertiary px-margin-mobile md:px-margin-desktop py-3 z-50">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage() }}
            className="max-w-6xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={sending}
              className="flex-1 px-4 py-3 bg-surface border border-outline-variant rounded-xl font-body-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] hover:bg-on-primary-fixed-variant transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              SEND
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </form>
        </footer>
      )}
      </div>
    </div>
  )
}
