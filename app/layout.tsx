import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display, Source_Sans_3, Space_Grotesk } from "next/font/google"
import AppShell from "@/app/components/app-shell"
import { BreakProvider } from "@/app/contexts/break-context"
import BreakModal from "@/app/components/break-modal"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BOARDS. | Master the NLE Nursing Board Exam",
  description: "AI-powered practice exams designed for Philippine nursing boards. We bridge the gap between classroom theory and licensure success.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${spaceGrotesk.variable} ${sourceSans.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="bg-surface text-on-surface font-body-md overflow-x-hidden min-h-screen selection:bg-primary selection:text-white custom-scrollbar">
        <ClerkProvider>
          <BreakProvider>
            <AppShell>
              {children}
            </AppShell>
            <BreakModal />
          </BreakProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
