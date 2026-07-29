import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PracticeSetup from "./practice-setup"

export default async function PracticePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const firstName = user?.firstName || "there"

  return <PracticeSetup firstName={firstName} imageUrl={user?.imageUrl ?? null} />
}
