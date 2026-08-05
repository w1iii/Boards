import type { NeonQueryFunction, FullQueryResults } from "@neondatabase/serverless"
import { cache } from "react"

let _sql: NeonQueryFunction<false, true> | null = null

async function getSql(): Promise<NeonQueryFunction<false, true>> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL not set")
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

export async function unsafesql(
  query: string,
  params: unknown[],
): Promise<FullQueryResults<false>> {
  const client = await getSql()
  return client.query(query, params) as Promise<FullQueryResults<false>>
}

export const getProfile = cache(async (userId: string) => {
  const result = await sql`
    SELECT * FROM user_profiles WHERE clerk_user_id = ${userId}
  `
  return result.rows[0] as Record<string, unknown> | undefined
})

export const getProgressAgg = cache(async (userId: string) => {
  const result = await sql`
    SELECT COUNT(*)::int as total_answered,
           COALESCE(SUM(CASE WHEN correct THEN weight ELSE 0 END), 0)::numeric as total_correct
    FROM mastery_events
    WHERE user_id = ${userId}
  `
  const row = result.rows[0] as Record<string, unknown> | undefined
  return {
    totalAnswered: (row?.total_answered as number) || 0,
    totalCorrect: Number(row?.total_correct as number) || 0,
  }
})

export const deleteUserData = async (userId: string) => {
  await sql`DELETE FROM sessions WHERE user_id = ${userId}`
  await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`
  await sql`DELETE FROM user_profiles WHERE clerk_user_id = ${userId}`
}

export const getAreaBreakdown = cache(async (userId: string) => {
  try {
    const result = await sql`
      SELECT content_area,
             COUNT(*)::int as total,
             COALESCE(SUM(CASE WHEN correct THEN weight ELSE 0 END), 0)::numeric as correct
      FROM mastery_events
      WHERE user_id = ${userId}
      GROUP BY content_area
    `
    return result.rows.map((row: Record<string, unknown>) => ({
      content_area: row.content_area as string,
      total: row.total as number,
      correct: Number(row.correct),
    }))
  } catch {
    return []
  }
})
