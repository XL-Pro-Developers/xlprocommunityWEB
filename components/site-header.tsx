"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Members" },
  { href: "/events", label: "Events" },
  { href: "/chat", label: "Chat" }, // Coming Soon page
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-(--color-chart-2) shadow-[0_0_16px] shadow-(--color-chart-2)" />
          <span className="font-mono text-sm tracking-wide text-foreground">XL Pro Community</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "font-medium hover:bg-secondary/30 hover:text-primary",
                    active && "text-primary underline underline-offset-4",
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
