import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

let _serverClient: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env.local file or Vercel environment variables.",
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
