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
           COUNT(*) FILTER (WHERE s.answers->>q.id::text = q.correct_answer)::int as total_correct
    FROM sessions s
    CROSS JOIN LATERAL jsonb_array_elements_text(s.questions) AS qid(qid_txt)
    JOIN questions q ON q.id::text = qid.qid_txt
    WHERE s.user_id = ${userId} AND s.status = 'completed'
  `
  const row = result.rows[0] as Record<string, unknown> | undefined
  return {
    totalAnswered: (row?.total_answered as number) || 0,
    totalCorrect: (row?.total_correct as number) || 0,
  }
})

export const getAreaBreakdown = cache(async (userId: string) => {
  try {
    const result = await sql`
      SELECT q.content_area,
             COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE s.answers->>q.id::text = q.correct_answer)::int as correct
      FROM sessions s
      CROSS JOIN LATERAL jsonb_array_elements_text(s.questions) AS qid(qid_txt)
      JOIN questions q ON q.id::text = qid.qid_txt
      WHERE s.user_id = ${userId} AND s.status = 'completed'
      GROUP BY q.content_area
    `
    return result.rows as Array<{ content_area: string; total: number; correct: number }>
  } catch {
    return []
  }
})
