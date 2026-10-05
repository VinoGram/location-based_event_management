-- Add missing profile columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences TEXT;

-- location is already TEXT in schema, used to store JSON string
-- interests is already TEXT[] in schema

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
