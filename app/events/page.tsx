"use client"

import useSWR from "swr"
import { useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { EventCard, type EventItem } from "@/components/event-card"
import { getSupabaseBrowser } from "@/lib/supabase/client"

type DbEvent = {
  id: string
  title: string
  description: string | null
  department: string | null
  status: "Upcoming" | "Past" | string | null
  location: string | null
  speaker: string | null
  poster_url: string | null
  starts_at: string | null
}

export default function EventsPage() {
  const supabase = getSupabaseBrowser()

  const fetcher = async () => {
    const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true })
    if (error) throw error
    return data as DbEvent[]
  }

  const { data, mutate } = useSWR("events:list", fetcher, { revalidateOnFocus: false })

  useEffect(() => {
    const channel = supabase
      .channel("public:events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        mutate()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate, supabase])

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold">Events</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data || []).map((e) => (
            <EventCard
              key={e.id}
              e={{
                id: e.id,
                title: e.title,
                date: e.starts_at ? new Date(e.starts_at).toLocaleString() : "",
                department: e.department || "",
                description: e.description || "",
                speaker: e.speaker || "",
                status: (e.status as EventItem["status"]) || "Upcoming",
                location: e.location || "",
                poster: e.poster_url || undefined,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
