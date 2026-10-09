import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// The driver's generics default to the widened `boolean`; pin them so `query()` resolves to a
// plain row array instead of a three-way union.
let sql: NeonQueryFunction<false, false> | null = null

// Server-only. Uses the pooled connection string; never import from a client component.
export function getDb(): NeonQueryFunction<false, false> {
  if (sql) return sql

  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Neon is not configured: set DATABASE_URL')

  sql = neon<false, false>(url)
  return sql
}
