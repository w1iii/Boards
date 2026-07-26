"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import UserMenu from "@/app/dashboard/user-menu"

export interface TopNavBarProps {
  variant: "public" | "auth"
  firstName?: string
  imageUrl?: string | null
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/progress", label: "Progress" },
] as const

export default function TopNavBar({ variant, firstName, imageUrl }: TopNavBarProps) {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-primary-fixed/30">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href={variant === "auth" ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary italic tracking-tight">
              BOARDS.
            </span>
          </Link>
          {variant === "auth" && (
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 font-label-caps transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary-fixed/40 rounded-xl"
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-xl"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
          {variant === "public" && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="font-label-caps text-on-surface-variant hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/practice"
                className="font-label-caps text-on-surface-variant hover:text-primary transition-colors"
              >
                Practice
              </Link>
              <Link
                href="/progress"
                className="font-label-caps text-on-surface-variant hover:text-primary transition-colors"
              >
                Progress
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {variant === "auth" ? (
            <>
              <button className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-all">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {firstName && (
                <UserMenu imageUrl={imageUrl ?? null} firstName={firstName} />
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="font-label-caps text-on-surface-variant hover:text-primary transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-primary text-on-primary px-6 py-2.5 font-label-caps rounded-xl hover:bg-primary-container transition-all candy-button-shadow-sm"
              >
                Start Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
