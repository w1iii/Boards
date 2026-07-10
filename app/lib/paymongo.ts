const PAYMONGO_API = "https://api.paymongo.com/v1"

async function paymongoFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYMONGO_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Basic ${Buffer.from(
        process.env.PAYMONGO_SECRET_KEY ?? "",
      ).toString("base64")}`,
    },
  })

  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.errors?.[0]?.detail ?? "PayMongo request failed")
  }

  return res.json()
}

export async function createCheckoutSession(params: {
  amount: number
  currency?: string
  description: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  return paymongoFetch("/checkout_sessions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          amount: params.amount,
          currency: params.currency ?? "PHP",
          description: params.description,
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          metadata: params.metadata,
          send_email_receipt: true,
          payment_method_types: ["gcash", "card", "paymaya", "billease"],
        },
      },
    }),
  })
}

export async function retrieveCheckoutSession(id: string) {
  return paymongoFetch(`/checkout_sessions/${id}`)
}

export async function retrievePaymentIntent(id: string) {
  return paymongoFetch(`/payment_intents/${id}`)
}
