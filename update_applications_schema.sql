-- Add new columns for Discord and Roblox verification
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS discord_avatar TEXT,
ADD COLUMN IF NOT EXISTS roblox_id BIGINT,
ADD COLUMN IF NOT EXISTS roblox_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS roblox_account_age INTEGER,
ADD COLUMN IF NOT EXISTS roblox_display_name TEXT,
ADD COLUMN IF NOT EXISTS verification_timestamp TIMESTAMPTZ DEFAULT NOW();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_roblox_id ON applications(roblox_id);
CREATE INDEX IF NOT EXISTS idx_applications_discord_id ON applications(applicant_discord_id);
