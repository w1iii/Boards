"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { usePomodoro } from "@/app/contexts/pomodoro-context"
import { NAV_ITEMS } from "@/app/components/nav-items"

interface MobileNavProps {
  firstName: string
  imageUrl: string | null
}

export default function MobileNav({ firstName, imageUrl }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { openModal } = usePomodoro()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/")
  }

  function close() {
    setOpen(false)
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-primary-fixed/30">
        <div className="px-margin-mobile py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="p-2 -ml-2 text-primary hover:bg-surface-container-high rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <Link href="/dashboard" className="font-headline-lg text-headline-lg-mobile text-primary italic tracking-tight">
              BOARDS.
            </Link>
          </div>
          <Link
            href="/dashboard/settings"
            className="w-10 h-10 rounded-full overflow-hidden border border-secondary shrink-0"
          >
            {imageUrl ? (
              <img className="w-full h-full object-cover" src={imageUrl} alt={`${firstName}'s avatar`} />
            ) : (
              <div className="w-full h-full bg-secondary-fixed-dim flex items-center justify-center font-mono-data text-on-secondary-fixed-variant">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-surface-container-low/95 backdrop-blur-md border-r border-outline-variant/30 flex flex-col overflow-y-auto">
            <div className="px-5 pt-5 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary-fixed/20 to-secondary-fixed/10 rounded-2xl border border-primary-fixed/20">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-fixed shrink-0 shadow-sm">
                  {imageUrl ? (
                    <img className="w-full h-full object-cover" src={imageUrl} alt={`${firstName}'s avatar`} />
                  ) : (
                    <div className="w-full h-full bg-primary-fixed flex items-center justify-center font-label-caps text-primary text-sm">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-title-md text-title-md text-primary leading-tight truncate">{firstName}</h3>
                  <p className="font-label-caps text-on-surface-variant text-[10px]">NLE Candidate</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center px-4 py-2.5 gap-3 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-primary-fixed/40 text-primary font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-primary" : ""
                      }`}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <span className="font-label-caps">{item.label}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto px-3 pt-4 border-t border-outline-variant/20 space-y-1">
              <Link
                href="/dashboard/settings"
                onClick={close}
                className={`flex items-center px-4 py-2.5 gap-3 rounded-xl transition-all font-label-caps ${
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-primary-fixed/40 text-primary font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                Settings
              </Link>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="w-full flex items-center px-4 py-2.5 gap-3 rounded-xl transition-all font-label-caps text-on-surface-variant hover:bg-surface-container-high hover:text-error"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Logout
              </button>
              <button
                onClick={() => {
                  close()
                  openModal()
                }}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-label-caps text-sm candy-button-shadow-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">timer</span>
                Pomodoro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
