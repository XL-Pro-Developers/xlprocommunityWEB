import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await getServerSupabase()

  // 1. Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 })
  }

  const userEmail = authData.user.email
  if (!userEmail) {
    return NextResponse.json({ error: "Authenticated user has no email" }, { status: 400 })
  }

  // 2. Find corresponding member record
  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("email", userEmail)
    .single()

  if (memberError || !memberData) {
    return NextResponse.json({ error: "User not found in members table" }, { status: 404 })
  }

  return NextResponse.json({ member: memberData })
}

export async function PATCH(request: Request) {
  const supabase = await getServerSupabase()

  // 1. Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 })
  }

  const userEmail = authData.user.email
  if (!userEmail) {
    return NextResponse.json({ error: "Authenticated user has no email" }, { status: 400 })
  }

  // 2. Parse request body
  let updates;
  try {
    updates = await request.json()
  } catch (e) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }

  // 3. Prevent updating non-allowed fields
  const allowedFields = ["github_url", "github_handle", "linkedin_url", "bio", "skills"]
  const filteredUpdates: Record<string, any> = {}
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key]
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return NextResponse.json({ error: "No allowed fields to update" }, { status: 400 })
  }

  // 4. Update the member record using the email safely
  // (RLS also prevents updating other rows, but we add the eq filter here anyway)
  const { data: updatedMember, error: updateError } = await supabase
    .from("members")
    .update(filteredUpdates)
    .eq("email", userEmail)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: "Supabase API failure during update" }, { status: 500 })
  }

  if (!updatedMember) {
    return NextResponse.json({ error: "User not found in members table" }, { status: 404 })
  }

  return NextResponse.json({ member: updatedMember })
}
