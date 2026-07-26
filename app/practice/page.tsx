import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ShaderBackground from "@/app/components/shader-background"
import PracticeSetup from "./practice-setup"

export default async function PracticePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const firstName = user?.firstName || "there"

  return (
    <>
      <ShaderBackground />
      <div className="fixed inset-0 z-[-5] opacity-20 graph-paper pointer-events-none" />
      <PracticeSetup firstName={firstName} imageUrl={user?.imageUrl ?? null} />
    </>
  )
}
