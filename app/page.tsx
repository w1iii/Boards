"use client"

import { useState } from "react"
import Image from "next/image"
import { SignIn, SignUp } from "@clerk/nextjs"

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
    dividerRow: "hidden",
    alternativeMethods: "hidden",
    form: "gap-0",
    formField: "mb-1.5",
    formFieldRow: "gap-2 mb-1.5",
    formFieldLabel: "block font-label-caps text-xs text-on-surface-variant mb-0.5",
    formFieldInput:
      "block w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-body-md text-sm",
    formButtonPrimary:
      "w-full py-2 px-6 rounded-full font-title-md text-sm text-on-primary bg-primary candy-button-shadow-sm transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-[0.97]",
    formFieldError: "text-sm text-error",
    footerAction: "pt-1",
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
    <main className="split-auth font-body-md antialiased overflow-hidden h-screen bg-surface">
      <div className="h-screen flex items-center justify-center p-0 md:p-2 lg:p-4 overflow-hidden">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl h-[calc(100dvh-0rem)] md:h-[calc(100dvh-1rem)] lg:h-[calc(100dvh-2rem)] bg-surface-container-low rounded-[2rem] overflow-hidden shadow-2xl">
          {/* Left Hero Section */}
          <section className="relative flex-1 bg-primary p-4 lg:p-8 flex flex-col items-center justify-center text-center overflow-hidden min-h-[260px] lg:min-h-[300px]">
            <div className="absolute inset-0 z-0">
              <Image
                src={HERO_IMAGE}
                alt="Medical background"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-primary/60" />
            </div>

            <div className="relative z-10">
              <Image
                src={LOGO_IMAGE}
                alt="BOARDS. Logo"
                width={160}
                height={40}
                className="h-10 w-auto brightness-0 invert mx-auto"
              />
            </div>

            <h1 className="relative z-10 font-display-md text-display-md font-black tracking-tighter text-on-primary leading-tight">
              BOARDS.
            </h1>
            <p className="relative z-10 font-label-caps text-sm text-primary-fixed uppercase tracking-widest mt-3">
              Global NLE Certification Prep
            </p>
          </section>

          {/* Right Auth Section */}
          <section className="flex-1 bg-surface p-4 lg:p-8 flex flex-col justify-center items-center overflow-hidden min-h-0">
            <div className="w-full max-w-md flex flex-col space-y-1.5">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-title-md text-title-md font-bold tracking-tight text-on-surface">
                  {title}
                </h2>
                <button
                  onClick={() => setMode(isSignUp ? "signin" : "signup")}
                  className="font-label-caps text-sm text-primary hover:text-primary-container flex items-center gap-2 transition-colors"
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
                <p className="font-body-md text-sm text-on-surface-variant">
                  {footerPrefix}{" "}
                  <button
                    onClick={() => setMode(isSignUp ? "signin" : "signup")}
                    className="font-bold text-primary hover:text-primary-container transition-colors"
                  >
                    {footerLink}
                  </button>
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">
                <p>© 2024-2025 BOARDS. Inc.</p>
                <div className="flex gap-6">
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact Us
                  </a>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
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
