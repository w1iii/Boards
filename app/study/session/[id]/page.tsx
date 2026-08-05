import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/app/lib/db"
import { getProfile } from "@/app/lib/db"
import StudySessionView from "./study-session"

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const { id } = await params

  const result = await sql`
    SELECT * FROM study_sessions WHERE id = ${id} AND user_id = ${userId}
  `
  if (result.rows.length === 0) redirect("/study")

  const session = result.rows[0] as Record<string, unknown>
  const profile = await getProfile(userId)

  return (
    <StudySessionView
      sessionId={id}
      mode={session.mode as string}
      contentArea={session.content_area as string}
      topic={(session.topic as string) ?? null}
      initialTranscript={(session.transcript_json as Array<{ role: "system" | "user" | "assistant"; content: string }>) ?? []}
      firstName={(profile?.first_name as string) || "there"}
      imageUrl={null}
    />
  )
}
