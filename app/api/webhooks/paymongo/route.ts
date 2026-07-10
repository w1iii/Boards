import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body.data?.attributes

    if (!event) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout_session.payment.paid": {
        const metadata = event.data?.attributes?.metadata ?? {}
        const { userId, plan } = metadata
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
