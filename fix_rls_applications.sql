-- Enable RLS (if not already enabled)
ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Allow authenticated users to INSERT (submit applications)
-- This allows anyone logged in (via Discord) to submit a form.
CREATE POLICY "Enable insert for authenticated users" 
ON "public"."applications"
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- POLICY 2: Allow users to view THEIR OWN applications (Optional, but good practice)
-- Note: This assumes you might want users to see their status later.
-- Since the table stores 'applicant_discord_id' but auth.uid() is a UUID, 
-- we can't easily join without a user_id column. 
-- For now, we focus on INSERT permissions.
