"use client"

import { useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import { SignIn, SignUp } from "@clerk/nextjs"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBp9URoKbSdVXtDkLUk3agUg470oc7dnRKCgHR1cHcode3qnTUPb4W4llS4Ty0BhqYl0Gud6tuhJ8EmAY5i1Aekaz2i7ZtMDew1MlM7oCUMkikr64B-80R6cPJZPau66s6qQ-jxIYqimGOWnVBh7QrRig9PJD3hR6WgJuIaMbAM_3vpygG5pKIOY3BH8IrbULd-NdM2TELuBLTCMOnMbvT3V_mZVFpz_IJxVYYBqFijXc6b-UPD_7vE"

const LOGO_IMAGE =
  "https://lh3.googleusercontent.com/aida/AP1WRLuUh2k-lGT78YZeM3wwQp3tOQOFDXYNp8EMnjf-16T0lke4cZaqkOspRffuUgNbKGx75Wrj2AnrNHKrsvrKQB45Ym4b1x_tkvE4jxIcYa3Vxvhtpzn_IfrLDOpB_Hxfa4-i-tTv15VuRdKojci-SKifGI4CWOaA3I5Yre4N_k5QzxIw_Erk60LKmKt2mNiNijLSQLGjc4eqE9TlwNxHtTYVT9ft3tgUXQ7w3emqpa_NragDdHyzDCxOu7Q"

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none p-0 w-full max-w-none",
    header: "hidden",
    footer: "hidden",
    socialButtons: "hidden",
    formFieldLabel: "block text-sm font-semibold text-gray-900 mb-0.5",
    formFieldInput:
      "block w-full px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-power-red/20 focus:border-power-red focus:outline-none transition-all text-base",
    formButtonPrimary:
      "btn-gradient w-full py-3.5 px-6 rounded-full text-white font-bold text-lg shadow-lg shadow-power-red/30",
    formFieldError: "text-sm text-power-red",
  },
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function HomePage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup")

  const isSignUp = mode === "signup"
  const title = isSignUp ? "Create Account" : "Welcome Back"
  const toggleLabel = isSignUp ? "Sign In" : "Sign Up"
  const footerPrefix = isSignUp ? "Already have an account?" : "Don't have an account?"
  const footerLink = isSignUp ? "Sign In" : "Sign Up"

  return (
    <main
      className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="min-h-screen flex items-center justify-center p-0 md:p-2 lg:p-4" style={{ backgroundColor: "#2b2b2b" }}>
        <div className="flex flex-col lg:flex-row w-full max-w-[1440px] bg-boards-charcoal rounded-[3rem] lg:rounded-[3rem] rounded-none overflow-hidden shadow-2xl">
          {/* Left Hero Section */}
          <section className="relative flex-1 bg-boards-charcoal p-6 lg:p-10 flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-[440px]">
            <div className="absolute inset-0 z-0">
              <Image
                src={HERO_IMAGE}
                alt="Medical background"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-boards-charcoal/40" />
            </div>

            <div className="relative z-10">
              <Image
                src={LOGO_IMAGE}
                alt="BOARDS. Logo"
                width={160}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
              <p className="text-gray-400 mt-3 text-xs uppercase tracking-widest font-medium">
                Global NLE Certification Prep
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <h1 className="text-2xl lg:text-4xl font-bold text-white leading-tight max-w-md">
                Your journey to NLE mastery starts here.
              </h1>
            </div>
          </section>

          {/* Right Auth Section */}
          <section className="flex-1 bg-white p-6 lg:p-10 flex flex-col justify-center items-center">
            <div className="w-full max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
                <button
                  onClick={() => setMode(isSignUp ? "signin" : "signup")}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  {toggleLabel}
                </button>
              </div>

              {isSignUp ? (
                <SignUp appearance={clerkAppearance} signInUrl="/sign-in" />
              ) : (
                <SignIn appearance={clerkAppearance} signUpUrl="/sign-up" />
              )}

              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  {footerPrefix}{" "}
                  <button
                    onClick={() => setMode(isSignUp ? "signin" : "signup")}
                    className="font-bold text-power-red hover:text-power-red-dark transition-colors"
                  >
                    {footerLink}
                  </button>
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 text-xs text-gray-400 font-medium uppercase tracking-widest">
                <p>© 2024-2025 BOARDS. Inc.</p>
                <div className="flex gap-6">
                  <a className="hover:text-gray-900 transition-colors" href="#">
                    Contact Us
                  </a>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors">
                    <span>English</span>
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
