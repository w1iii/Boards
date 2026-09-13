"use client"

import SideNavBar from "@/app/components/side-nav-bar"

interface AppLayoutProps {
  children: React.ReactNode
  firstName: string
  imageUrl?: string | null
}

export default function AppLayout({ children, firstName, imageUrl }: AppLayoutProps) {
  return (
    <>
      <SideNavBar firstName={firstName} imageUrl={imageUrl ?? null} />
      <main className="relative min-h-screen overflow-hidden lg:pl-64">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-margin-mobile py-6 md:px-10 md:py-10 xl:px-16">
          {children}
        </div>
      </main>
    </>
  )
}
