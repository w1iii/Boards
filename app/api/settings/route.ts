import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { sql, deleteUserData } from "@/app/lib/db"
import { handleError, AppError } from "@/app/lib/errors"
import { settingsSchema } from "@/app/lib/validation"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const result = await sql`
      SELECT * FROM user_profiles WHERE clerk_user_id = ${userId}
    `
    const profile = result.rows[0] || null

    let email: string | null = null
    try {
      const user = await (await clerkClient()).users.getUser(userId)
      email = user.emailAddresses?.[0]?.emailAddress ?? null
    } catch {
      // clerk unavailable; profile fields still returned
    }

    return NextResponse.json({ profile, email })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) throw new AppError(parsed.error.message, 400)

    const { firstName, lastName, contentAreas, dailyGoal, targetExamDate } = parsed.data

    await (await clerkClient()).users.updateUser(userId, { firstName, lastName })

    await sql`
      INSERT INTO user_profiles (clerk_user_id, first_name, last_name, content_areas, daily_goal, target_exam_date)
      VALUES (${userId}, ${firstName}, ${lastName}, ${JSON.stringify(contentAreas)}::jsonb, ${dailyGoal}, ${targetExamDate || null}::date)
      ON CONFLICT (clerk_user_id) DO UPDATE
      SET first_name = ${firstName},
          last_name = ${lastName},
          content_areas = ${JSON.stringify(contentAreas)}::jsonb,
          daily_goal = ${dailyGoal},
          target_exam_date = ${targetExamDate || null}::date,
          updated_at = now()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    await deleteUserData(userId)
    await (await clerkClient()).users.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
