import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { getServerSupabase } from "@/lib/supabase/server"
import Lightning from "@/components/lightning"
import DecryptedText from "@/components/DecryptedText"
import TextType from "@/components/TextType"

export default async function HomePage() {
  const supabase = getServerSupabase()
  const [{ count: membersCount }, { count: eventsCount }] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ])

  return (
    <main>
      <SiteHeader />
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Lightning hue={230} speed={1} intensity={0.9} size={1.0} />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <TextType
            as="h1"
            className="text-balance bg-[linear-gradient(90deg,#00D0FF,#8A6CFF)] bg-clip-text text-5xl font-semibold text-transparent md:text-6xl"
            text={["Build. Learn. Ship. Together."]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
          <p className="mt-4 text-pretty text-muted-foreground">
            <DecryptedText
              text="A dark, futuristic hub for the XL Pro Developer Community — sleek, fast, and collaborative."
              animateOn="view"
              revealDirection="center"
              sequential={true}
            />
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/members">
              <Button className="bg-primary text-primary-foreground hover:opacity-90">Meet Our Members</Button>
            </a>
            <a href="/events">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent">
                View Events
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 md:grid-cols-3">
        {[
          { k: "Members", v: String(membersCount ?? 0) },
          { k: "Events Hosted", v: String(eventsCount ?? 0) },
          { k: "Departments", v: "6" },
        ].map((s) => (
          <div
            key={s.k}
            className="rounded-xl border border-border/60 bg-secondary/20 p-6 shadow-[0_0_24px_rgba(0,208,255,0.08)]"
          >
            <p className="text-sm text-muted-foreground">{s.k}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{s.v}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
        <h2 className="text-2xl font-semibold">About</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          We’re a student-built developer community focused on collaboration, creativity, and shipping real projects.
        </p>
      </section>
    </main>
  )
}
