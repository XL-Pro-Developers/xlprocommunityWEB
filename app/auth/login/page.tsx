"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // We allow creating auth users, but they only see dashboard if they are in members table
        },
      })

      if (signInError) throw signInError

      setStep("otp")
    } catch (err: any) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error: verifyError, data } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      })

      if (verifyError) throw verifyError
      
      if (!data.user) {
        throw new Error("Unauthorized user")
      }

      // Check if user exists in members table
      const res = await fetch("/api/members/me")
      if (res.status === 404) {
        throw new Error("User not found in members table. Ensure your email matches the club records.")
      } else if (!res.ok) {
        throw new Error("Database connection failure or other error.")
      }

      router.push("/members/profile")
    } catch (err: any) {
      setError(err.message || "Invalid OTP or error verifying")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Member Login</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in with your registered email to access the Members dashboard.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  One-Time Password
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter the 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep("email")}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
