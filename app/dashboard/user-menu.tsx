"use client"

import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

interface UserMenuProps {
  imageUrl: string | null
  firstName: string
}

export default function UserMenu({ imageUrl, firstName }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden border border-secondary cursor-pointer"
      >
        {imageUrl ? (
          <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={`${firstName}'s avatar`}
          />
        ) : (
          <div className="w-full h-full bg-secondary-fixed-dim flex items-center justify-center font-mono-data text-on-secondary-fixed-variant">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 bg-surface border border-tertiary shadow-lg z-50">
          <button
            onClick={() => {
              router.push("/settings")
              setOpen(false)
            }}
            className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container transition-colors"
          >
            Settings
          </button>
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container transition-colors border-t border-tertiary"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
