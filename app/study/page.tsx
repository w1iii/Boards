import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/app/lib/db"
import StudyPicker from "./study-picker"

export default async function StudyPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  if (!profile || !profile.onboarding_completed) redirect("/onboarding")

  return (
    <StudyPicker
      firstName={(profile.first_name as string) || "there"}
      imageUrl={null}
    />
  )
}
