"use client"

import Link from "next/link"
import UserMenu from "@/app/dashboard/user-menu"

interface Props {
  firstName: string
  imageUrl: string | null
  activeHref: string
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/progress", label: "Progress" },
  { href: "/pricing", label: "Pricing" },
] as const

export default function NavHeader({ firstName, imageUrl, activeHref }: Props) {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-2 bg-surface border-b border-tertiary shrink-0">
      <div className="flex items-center gap-6">
        <span className="font-display-md text-[20px] font-black tracking-tighter text-on-surface">
          BOARDS.
        </span>
        <nav className="hidden md:flex gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = activeHref === item.href
            return (
              <Link
                key={item.href}
                className={`font-label-caps text-[11px] transition-colors duration-200 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-secondary-fixed-variant hover:text-on-surface"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button className="material-symbols-outlined p-1.5 hover:bg-surface-container transition-colors duration-200 rounded-full text-lg">
          notifications
        </button>
        <UserMenu imageUrl={imageUrl} firstName={firstName} />
      </div>
    </header>
  )
}
