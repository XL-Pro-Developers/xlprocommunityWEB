import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

let _serverClient: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServer() {
  // Prefer server-only envs; fall back to NEXT_PUBLIC_* for local dev to avoid 500s
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error(
      "Missing Supabase environment variables. Expected SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for local dev).",
    )
  }

  const cookieStore = cookies()
  _serverClient = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set() {
        // no-op in Next.js
      },
      remove() {
        // no-op in Next.js
      },
    },
  })
  return _serverClient
}

export function getServerSupabase() {
  return getSupabaseServer()
}
