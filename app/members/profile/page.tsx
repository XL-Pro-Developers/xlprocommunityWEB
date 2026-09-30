"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type MemberProfile = {
  id: string
  name: string
  role: string
  batch: string
  status: string
  skills: string[]
  github_url: string
  github_handle: string
  linkedin_url: string
  bio: string
}

export default function MemberProfilePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    github_url: "",
    github_handle: "",
    linkedin_url: "",
    bio: "",
    skills: "",
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth/login")
          return
        }

        const res = await fetch("/api/members/me")
        if (!res.ok) {
          throw new Error("Failed to load profile. Ensure your email matches the club records.")
        }
        
        const data = await res.json()
        setProfile(data.member)
        setFormData({
          github_url: data.member.github_url || "",
          github_handle: data.member.github_handle || "",
          linkedin_url: data.member.linkedin_url || "",
          bio: data.member.bio || "",
          skills: (data.member.skills || []).join(", "),
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      const res = await fetch("/api/members/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: formData.github_url,
          github_handle: formData.github_handle,
          linkedin_url: formData.linkedin_url,
          bio: formData.bio,
          skills: skillsArray,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setMessage("Profile updated successfully")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-20">Loading...</div>
      </main>
    )
  }

  if (!profile && error) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md rounded-md border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <Button variant="outline" onClick={handleLogout}>Log Out</Button>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Name</span>
                <span className="font-medium">{profile?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Role</span>
                <span className="font-medium">{profile?.role}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Batch</span>
                <span className="font-medium">{profile?.batch}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Status</span>
                <span className="font-medium">{profile?.status}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Basic information cannot be changed here. Contact admin if it needs updating.
            </p>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Editable Profile Details</h2>
            
            {error && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
                {error}
              </div>
            )}
            
            {message && (
              <div className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 text-green-600 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="skills" className="text-sm font-medium">Skills (comma-separated)</label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Python, Machine Learning..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="github_handle" className="text-sm font-medium">GitHub Handle</label>
                <Input
                  id="github_handle"
                  value={formData.github_handle}
                  onChange={(e) => setFormData({ ...formData, github_handle: e.target.value })}
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="github_url" className="text-sm font-medium">GitHub URL</label>
                <Input
                  id="github_url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="linkedin_url" className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
