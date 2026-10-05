-- Add admin and suspension columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Update the admin user
UPDATE users SET is_admin = TRUE WHERE email = 'admin@eventapp.com';