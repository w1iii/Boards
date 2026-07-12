import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/app/lib/db"
import { handleError } from "@/app/lib/errors"
import { Webhook } from "svix"
import type { WebhookEvent } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
    }

    const secret = process.env.CLERK_WEBHOOK_SECRET
    if (!secret) throw new Error("CLERK_WEBHOOK_SECRET not set")

    const wh = new Webhook(secret)
    let event: WebhookEvent

    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "user.created": {
        const { id, first_name, last_name } = event.data

        await sql`
          INSERT INTO user_profiles (clerk_user_id, first_name, last_name)
          VALUES (${id}, ${first_name || null}, ${last_name || null})
          ON CONFLICT (clerk_user_id) DO UPDATE
          SET first_name = COALESCE(${first_name || null}, user_profiles.first_name),
              last_name = COALESCE(${last_name || null}, user_profiles.last_name),
              updated_at = now()
        `
        break
      }

      case "user.updated": {
        const { id, first_name, last_name } = event.data

        await sql`
          UPDATE user_profiles
          SET first_name = ${first_name || null},
              last_name = ${last_name || null},
              updated_at = now()
          WHERE clerk_user_id = ${id}
        `
        break
      }

      case "user.deleted": {
        const { id } = event.data
        if (!id) break

        await sql`DELETE FROM user_profiles WHERE clerk_user_id = ${id}`
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
