import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getServerSupabase()
  const { data, error } = await supabase
    .from("events")
    .select("id,title,starts_at,location,description,poster_url,capacity,created_at,department,status,speaker")
    .order("starts_at", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const events = (data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    starts_at: e.starts_at,
    location: e.location,
    description: e.description,
    poster_url: e.poster_url,
    capacity: (e as any).capacity ?? null,
    created_at: e.created_at,
    department: (e as any).department ?? null,
    status: (e as any).status ?? null,
    speaker: (e as any).speaker ?? null,
  }))
  return NextResponse.json({ events })
}
