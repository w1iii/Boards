import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AppLayout from "@/app/components/app-layout"
import { getProfile } from "@/app/lib/db"
import SettingsForm from "./settings-form"

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  let email: string | null = null
  try {
    const user = await (await clerkClient()).users.getUser(userId)
    email = user.emailAddresses?.[0]?.emailAddress ?? null
  } catch {
    // fall back to no email
  }

  return (
    <AppLayout firstName={(profile.first_name as string) || "there"} imageUrl={null}>
      <SettingsForm
        initialFirstName={(profile.first_name as string) || ""}
        initialLastName={(profile.last_name as string) || ""}
        initialContentAreas={(profile.content_areas as string[]) || []}
        initialDailyGoal={(profile.daily_goal as number) || 20}
        initialTargetExamDate={(profile.target_exam_date as string) || ""}
        email={email}
      />
    </AppLayout>
  )
}
