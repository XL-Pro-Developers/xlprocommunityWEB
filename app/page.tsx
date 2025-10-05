import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getServerSupabase } from "@/lib/supabase/server";
import Lightning from "@/components/lightning";
import DecryptedText from "@/components/DecryptedText";
import TextType from "@/components/TextType";

export default async function HomePage() {
  const supabase = getServerSupabase();
  const [{ count: membersCount }, { count: eventsCount }] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main>
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
          <Lightning hue={230} speed={1} intensity={0.9} size={1.0} />
        </div>

        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Typing Header */}
          <h1 className="text-balance bg-[linear-gradient(90deg,#00D0FF,#8A6CFF)] bg-clip-text text-5xl font-semibold text-transparent md:text-6xl">
            <TextType
              text={[
                "XL Pro Developers",
                "Build. Learn. Ship. Together",
                "Ship Ideas, Not Just Code.",
              ]}
              typingSpeed={50}
              deletingSpeed={40}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="_"
              loop={true}
            />
          </h1>

          {/* Hover-Decrypted Text */}
          <DecryptedText
          text="XL Pro Community is a developer collective pushing boundaries with code, hardware, and product thinking. Join a league of builders who ship fast, collaborate, and level up together."
          animateOn="hover"
          className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl"
          encryptedClassName="text-muted-foreground/50 text-lg md:text-xl leading-relaxed max-w-2xl"
          parentClassName="block"
        />

          {/* CTA Buttons */}
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

      {/* About Section */}
      <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
        <h2 className="text-2xl font-semibold">About</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          We’re a student-built developer community focused on collaboration, creativity, and shipping real projects.
        </p>
      </section>
    </main>
  );
}
