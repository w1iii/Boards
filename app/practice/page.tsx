import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/app/lib/db"
import PracticeSetup from "./practice-setup"

export default async function PracticePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getProfile(userId)
  const firstName = (profile?.first_name as string) || "there"

  return <PracticeSetup firstName={firstName} imageUrl={null} />
}
