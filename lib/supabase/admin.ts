import { createClient } from "@supabase/supabase-js"

let _admin: ReturnType<typeof createClient> | null = null

export function getAdminSupabase() {
  if (_admin) return _admin

  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file or Vercel environment variables.",
    )
  }

  _admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
  // Uses service role for privileged writes (server-only). Forms in /admin007 call server actions that use this client.
  return _admin
}
