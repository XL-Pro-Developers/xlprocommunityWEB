-- schema.sql
-- Run this in the Supabase SQL Editor to create the members table and security policies

-- 1. Create the members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    batch TEXT,
    status TEXT,
    skills TEXT[],
    avatar_url TEXT,
    github_url TEXT,
    github_handle TEXT,
    linkedin_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT,
    email TEXT UNIQUE -- Added for authentication linking
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Policy: Anyone can view basic member profiles (if that's desired, or we can restrict it to authenticated users).
-- Assuming member profiles are public or at least visible to logged-in users.
-- If the members section requires login to view other members:
CREATE POLICY "Members are viewable by authenticated users" 
ON public.members FOR SELECT 
TO authenticated 
USING (true);

-- Policy: A member can update their OWN profile.
-- The user is identified by matching auth.jwt() email to the members.email field.
CREATE POLICY "Members can update their own profile" 
ON public.members FOR UPDATE 
TO authenticated 
USING (auth.jwt() ->> 'email' = email)
WITH CHECK (auth.jwt() ->> 'email' = email);

-- Policy: Service role can do everything (default bypasses RLS, but explicit is fine)
-- (No explicit policy needed for service_role as it bypasses RLS by default)

-- 4. Function and Trigger to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_members_modtime ON public.members;
CREATE TRIGGER update_members_modtime 
BEFORE UPDATE ON public.members 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Note on Encryption: 
-- The current fields (bio, links, etc.) are standard profile information.
-- No highly sensitive fields (like SSN or financial data) exist in this dataset.
-- Therefore, application-level encryption is not applied to avoid over-engineering,
-- but RLS protects unauthorized modification.
