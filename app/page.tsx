import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { getServerSupabase } from "@/lib/supabase/server"
import TextType from "@/components/TextType"
import DecryptedText from "@/components/DecryptedText"

export default async function HomePage() {
  const supabase = getServerSupabase()

  const [{ count: membersCount }, { count: eventsCount }] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ])

  return (
    <main>
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_50%_-100px,rgba(0,208,255,0.25),transparent)]" />

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance bg-[linear-gradient(90deg,#00D0FF,#8A6CFF)] bg-clip-text text-5xl font-semibold text-transparent md:text-6xl">
            <TextType
              text={[
                "XL Pro Developers",
                "Build. Learn. Ship.",
                "Code. Create. Conquer."
              ]}
              typingSpeed={65}
              pauseDuration={2500}
              showCursor={true}
              cursorCharacter="|"
            />
          </h1>

          {/* Decrypted/Futuristic Text */}
          <div className="mt-4 text-pretty text-muted-foreground">
            <DecryptedText
              text="Hack. Code. Compete. Repeat. XL Pro Developers is your playground for all things hackathon, fun, and fast-paced coding"
              speed={80}
              maxIterations={20}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`"
              className="revealed"
              parentClassName="all-letters"
              encryptedClassName="encrypted"
              
              revealDirection="center"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/members">
              <Button className="bg-primary text-primary-foreground hover:opacity-90">
                Meet Our Members
              </Button>
            </a>
            <a href="/events">
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
              >
                View Events
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 md:grid-cols-3">
        {[
          { k: "Members", v: String(membersCount ?? 0) },
          { k: "Events Hosted", v: String(eventsCount ?? 0) },
          { k: "Departments", v: "6" },
        ].map((stat) => (
          <div
            key={stat.k}
            className="rounded-xl border border-border/60 bg-secondary/20 p-6 shadow-[0_0_24px_rgba(0,208,255,0.08)]"
          >
            <p className="text-sm text-muted-foreground">{stat.k}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{stat.v}</p>
          </div>
        ))}
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
        <h2 className="text-2xl font-semibold">About</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          We’re a student-built developer community focused on collaboration, creativity, and shipping real projects.
        </p>
      </section>
    </main>
  )
}
