import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/app/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body.data?.attributes

    if (!event) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout_session.payment.paid": {
        const attrs = event.data?.attributes ?? {}
        const metadata = attrs.metadata ?? {}
        const { userId, plan } = metadata

        if (!userId || !plan) break

        await sql`
          INSERT INTO subscriptions (user_id, plan, expires_at, paymongo_session_id)
          VALUES (
            ${userId},
            ${plan},
            now() + interval '30 days',
            ${attrs.id ?? null}
          )
        `
        break
      }
      case "checkout_session.payment.failed": {
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
