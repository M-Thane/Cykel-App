import type { Env } from './env'

// Thin PostgREST client (Supabase's auto-generated REST API over Postgres).
// Always uses the service_role key, which bypasses row-level security --
// this file is the only thing in the whole system allowed to touch the
// database directly, and every call here MUST already be scoped to the
// right user_id by the caller.

function headers(env: Env, extra?: Record<string, string>) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export async function pgSelect<T>(env: Env, table: string, query: string): Promise<T[]> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: headers(env) })
  if (!res.ok) throw new Error(`select ${table} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function pgInsert<T>(env: Env, table: string, rows: object | object[]): Promise<T[]> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers(env, { Prefer: 'return=representation' }),
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`insert ${table} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function pgUpsert<T>(env: Env, table: string, rows: object | object[], onConflict: string): Promise<T[]> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: headers(env, { Prefer: 'return=representation,resolution=merge-duplicates' }),
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`upsert ${table} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function pgUpdate<T>(env: Env, table: string, query: string, patch: object): Promise<T[]> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: headers(env, { Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`update ${table} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function pgDelete(env: Env, table: string, query: string): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'DELETE',
    headers: headers(env),
  })
  if (!res.ok) throw new Error(`delete ${table} failed: ${res.status} ${await res.text()}`)
}
