-- Fix Profile Schema - Ensure all necessary columns exist
-- Run this to fix the "Cannot coerce the result to a single JSON object" error

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"eventReminders": true, "newEventsNearby": true, "friendActivity": true, "adminUpdates": true}';

-- Update existing users with default notification preferences if null
UPDATE users 
SET notification_preferences = '{"eventReminders": true, "newEventsNearby": true, "friendActivity": true, "adminUpdates": true}'::jsonb
WHERE notification_preferences IS NULL;

-- Ensure location column can handle JSONB (if it's currently TEXT)
-- This is safe to run even if already JSONB
DO $$
BEGIN
    -- Check if location column exists and is not JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'location' 
        AND data_type != 'jsonb'
    ) THEN
        -- Convert existing location data to JSONB if needed
        ALTER TABLE users ALTER COLUMN location TYPE JSONB USING 
            CASE 
                WHEN location IS NULL THEN NULL
                WHEN location ~ '^{.*}$' THEN location::JSONB
                ELSE json_build_object('city', location, 'state', '', 'latitude', 0, 'longitude', 0)::JSONB
            END;
    END IF;
END $$;

-- Create storage bucket for avatars if using Supabase Storage
-- This would need to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create RLS policies for avatars bucket (if using Supabase)
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verify the schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('bio', 'notification_preferences', 'location', 'first_name', 'last_name', 'interests', 'profile_picture')
ORDER BY column_name;