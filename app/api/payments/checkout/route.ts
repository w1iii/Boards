import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createCheckoutSession } from "@/app/lib/paymongo"
import { handleError, AppError } from "@/app/lib/errors"

const PRICES: Record<string, number> = {
  monthly: 34900,
  "final-push": 79900,
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthorized", 401)

    const body = await request.json()
    const { plan } = body

    if (!plan || !PRICES[plan]) throw new AppError("Invalid plan")

    const origin = request.headers.get("origin") ?? "http://localhost:3000"

    const checkout = await createCheckoutSession({
      amount: PRICES[plan],
      description: `NLE Review - ${plan} plan`,
      successUrl: `${origin}/payment/success`,
      cancelUrl: `${origin}/payment/cancel`,
      metadata: { userId, plan },
    })

    return NextResponse.json({
      checkoutUrl: checkout.data?.attributes?.checkout_url,
      sessionId: checkout.data?.id,
    })
  } catch (error) {
    return handleError(error)
  }
}
