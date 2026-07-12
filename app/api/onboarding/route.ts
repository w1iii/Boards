import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { onboardingSchema } from "@/app/lib/validation"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const result = await sql`
      SELECT * FROM user_profiles WHERE clerk_user_id = ${userId}
    `

    return NextResponse.json({ profile: result.rows[0] || null })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { firstName, lastName, contentAreas, dailyGoal, targetExamDate } = parsed.data

    await sql`
      INSERT INTO user_profiles (clerk_user_id, first_name, last_name, content_areas, daily_goal, target_exam_date, onboarding_completed)
      VALUES (${userId}, ${firstName}, ${lastName}, ${JSON.stringify(contentAreas)}::jsonb, ${dailyGoal}, ${targetExamDate || null}::date, true)
      ON CONFLICT (clerk_user_id) DO UPDATE
      SET first_name = ${firstName},
          last_name = ${lastName},
          content_areas = ${JSON.stringify(contentAreas)}::jsonb,
          daily_goal = ${dailyGoal},
          target_exam_date = ${targetExamDate || null}::date,
          onboarding_completed = true,
          updated_at = now()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
