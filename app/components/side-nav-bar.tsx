"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBreak } from "@/app/contexts/break-context"

const NAV_ITEMS: Array<{
  href: string
  label: string
  icon: string
  query?: boolean
}> = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/practice", label: "Practice", icon: "edit_note" },
  { href: "/practice?type=mock-exam", label: "Mock Exam", icon: "quiz", query: true },
  { href: "/progress", label: "Progress", icon: "monitoring" },
]

interface SideNavBarProps {
  firstName: string
  imageUrl: string | null
}

export default function SideNavBar({ firstName, imageUrl }: SideNavBarProps) {
  const pathname = usePathname()
  const { openBreakModal } = useBreak()

  function isActive(href: string, query?: boolean): boolean {
    if (query) {
      if (href === "/practice?type=mock-exam" && pathname === "/practice") return false
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 pt-6 pb-6 z-40 bg-surface-container-low/80 backdrop-blur-md border-r border-outline-variant/30 w-64 rounded-r-2xl shadow-sm">
      <div className="px-5 mb-6">
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
            <h3 className="font-title-md text-title-md text-primary leading-tight truncate">
              {firstName}
            </h3>
            <p className="font-label-caps text-on-surface-variant text-[10px]">NLE Candidate</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.query)
          return (
            <Link
              key={item.label}
              href={item.href}
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
          href="/dashboard"
          className="flex items-center px-4 py-2.5 gap-3 text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-xl transition-all font-label-caps"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          Settings
        </Link>
        <button
          onClick={openBreakModal}
          className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-label-caps text-sm candy-button-shadow-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">self_improvement</span>
          Take a Break
        </button>
      </div>
    </aside>
  )
}
