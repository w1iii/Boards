import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
])

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  if (isOnboardingRoute(request)) {
    return
  }

  const { userId } = await auth()
  if (!userId) return

  const { neon } = await import("@neondatabase/serverless")
  const url = process.env.DATABASE_URL
  if (!url) return

  const sql = neon(url, { fullResults: true })
  const result = await sql`SELECT onboarding_completed FROM user_profiles WHERE clerk_user_id = ${userId}`

  if (result.rows.length === 0 || !result.rows[0].onboarding_completed) {
    const onboardingUrl = new URL("/onboarding", request.url)
    return NextResponse.redirect(onboardingUrl)
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
