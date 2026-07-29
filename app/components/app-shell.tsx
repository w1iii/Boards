"use client"

import dynamic from "next/dynamic"

const ShaderBackground = dynamic(
  () => import("@/app/components/shader-background"),
  { ssr: false }
)

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShaderBackground />
      <div className="fixed inset-0 z-[-5] opacity-20 graph-paper pointer-events-none" />
      {children}
    </>
  )
}
