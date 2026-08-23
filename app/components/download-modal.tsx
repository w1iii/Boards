"use client"

import { useState, useEffect, useCallback } from "react"

type Platform = "ios" | "android" | "desktop"

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return "ios"
  if (/android/i.test(ua)) return "android"
  return "desktop"
}

const STEPS: Record<Platform, { icon: string; title: string; steps: string[] }[]> = {
  ios: [
    {
      icon: "open_in_browser",
      title: "Open in Safari",
      steps: ["This only works in Safari — not Chrome or Firefox on iOS."],
    },
    {
      icon: "ios_share",
      title: "Tap the Share button",
      steps: ["The square icon with an arrow pointing up, at the bottom of the screen."],
    },
    {
      icon: "add_to_home_screen",
      title: "Add to Home Screen",
      steps: ["Scroll down and tap \"Add to Home Screen\", then tap \"Add\"."],
    },
  ],
  android: [
    {
      icon: "open_in_browser",
      title: "Open in Chrome",
      steps: ["Use Chrome browser for the best install experience."],
    },
    {
      icon: "download",
      title: "Tap Install",
      steps: [
        "Chrome will show an \"Install app\" banner.",
        "Tap it, then confirm by tapping \"Install\".",
      ],
    },
  ],
  desktop: [
    {
      icon: "open_in_browser",
      title: "Visit in Chrome or Edge",
      steps: ["PWAs install from Chromium-based browsers on desktop."],
    },
    {
      icon: "download",
      title: "Click the install icon",
      steps: [
        "Look for the install icon in the address bar (right side).",
        "Click it, then confirm the install.",
      ],
    },
  ],
}

export default function DownloadModal() {
  const [isOpen, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>("desktop")
  const [installed, setInstalled] = useState(true)

  useEffect(() => {
    setPlatform(detectPlatform())
    setInstalled(window.matchMedia("(display-mode: standalone)").matches)
  }, [])

  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener("open-download-modal", handleOpen)
    return () => window.removeEventListener("open-download-modal", handleOpen)
  }, [])

  const dismiss = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [isOpen, dismiss])

  if (installed || !isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss()
      }}
    >
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-outline-variant/30">
        <div className="p-6 text-center">
          <span
            className="material-symbols-outlined text-5xl text-primary mb-3 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            install_mobile
          </span>
          <h2 className="font-title-lg text-title-lg text-on-surface mb-1">
            Install BOARDS.
          </h2>
          <p className="font-body-sm text-on-surface/60 mb-6">
            Add to your home screen for quick access — just like a native app.
          </p>

          <div className="space-y-4 text-left">
            {STEPS[platform].map((section, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg text-primary">
                    {section.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-label-lg text-on-surface text-sm mb-0.5">
                    {i + 1}. {section.title}
                  </h3>
                  {section.steps.map((step, j) => (
                    <p key={j} className="font-body-sm text-on-surface/60 text-xs leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={dismiss}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-caps text-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
