import type { NeonQueryFunction, FullQueryResults } from "@neondatabase/serverless"

let _sql: NeonQueryFunction<false, true> | null = null

async function getSql(): Promise<NeonQueryFunction<false, true>> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error("DATABASE_URL not set")
    }
    const { neon } = await import("@neondatabase/serverless")
    _sql = neon(url, { fullResults: true })
  }
  return _sql
}

export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<FullQueryResults<false>> {
  const client = await getSql()
  return client(strings, ...values) as Promise<FullQueryResults<false>>
}
