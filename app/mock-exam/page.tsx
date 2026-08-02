import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/app/lib/db"
import MockExamSetup from "./mock-exam-setup"

export default async function MockExamPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const firstName = (profile?.first_name as string) || "there"

  return <MockExamSetup firstName={firstName} imageUrl={null} />
}
