import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import AppLayout from "@/app/components/app-layout"
import { getProfile } from "@/app/lib/db"

export default async function MockExamPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const profile = await getProfile(userId)
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <AppLayout
      firstName={(profile.first_name as string) || "there"}
      imageUrl={null}
    >
      <section className="mb-10 relative">
        <div className="glass-jar p-10 md:p-14 rounded-3xl border border-white/50 backdrop-blur-md text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-6 candy-button-shadow">
            <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              quiz
            </span>
          </div>
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.15em] bg-primary-fixed px-4 py-1.5 rounded-full inline-block mb-4">
            Coming Soon
          </span>
          <h1 className="font-display-lg text-display-lg text-primary mb-3">Mock Exam</h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
            Full-length timed board exam simulation is on its way. Practice hard — the real challenge is almost here.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/practice" className="px-6 py-3 bg-primary text-on-primary rounded-full font-title-md text-sm candy-button-shadow hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Start Practice
            </Link>
            <Link href="/progress" className="px-6 py-3 bg-surface-container-highest text-on-surface rounded-full font-title-md text-sm hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">monitoring</span>
              View Progress
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}
