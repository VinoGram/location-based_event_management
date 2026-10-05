-- Admin Features Database Updates
-- Add columns for auto-approval algorithm and user management

-- Add admin and auto-approval tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_events_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_approve_next INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Update existing users to have default values
UPDATE users SET 
    is_admin = FALSE,
    approved_events_count = 0,
    auto_approve_next = 0,
    is_suspended = FALSE
WHERE is_admin IS NULL OR approved_events_count IS NULL OR auto_approve_next IS NULL OR is_suspended IS NULL;

-- Add status column to events table for approval workflow
ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Update existing events to have pending status
UPDATE events SET status = 'pending' WHERE status IS NULL;

-- Admin access is hardcoded in backend
-- Email: euforia.admin.2024@gmail.com
-- Password: EuforiaSecure#2024

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_approved_count ON users(approved_events_count);
CREATE INDEX IF NOT EXISTS idx_users_auto_approve ON users(auto_approve_next);
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(is_suspended);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);