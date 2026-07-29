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
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
          {children}
        </div>
      </main>
    </>
  )
}
