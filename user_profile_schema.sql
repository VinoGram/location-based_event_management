-- User Profile Database Schema Updates
-- PostgreSQL Implementation

-- =============================================
-- ALTER USERS TABLE FOR PROFILE FEATURES
-- =============================================

-- Core profile fields (matching backend expectations)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expiry_date TIMESTAMP;

-- Additional profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"eventReminders": true, "newEventsNearby": true, "friendActivity": true, "adminUpdates": true}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- =============================================
-- CREATE INDEXES FOR USER PROFILE
-- =============================================

-- B-tree index for location (if it's text-based location search)
-- Or use pg_trgm extension for fuzzy text search
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- GIN index for text array interests with array_ops
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests array_ops);

-- B-tree index for is_admin
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_premium_expiry ON users(premium_expiry_date) WHERE premium_expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =============================================
-- UPDATE EXISTING USERS WITH DEFAULTS
-- =============================================

UPDATE users SET 
    notification_preferences = '{"eventReminders": true, "newEventsNearby": true, "friendActivity": true, "adminUpdates": true}'::jsonb,
    is_admin = FALSE,
    is_premium = FALSE,
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP),
    interests = COALESCE(interests, ARRAY[]::TEXT[])
WHERE notification_preferences IS NULL OR is_admin IS NULL;

-- =============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS FOR USER PROFILE
-- =============================================

-- Function to check if user is premium and active
CREATE OR REPLACE FUNCTION is_active_premium(user_id_param VARCHAR(24))
RETURNS BOOLEAN AS $$
DECLARE
    is_premium_active BOOLEAN;
BEGIN
    SELECT 
        is_premium AND (premium_expiry_date IS NULL OR premium_expiry_date > CURRENT_TIMESTAMP)
    INTO is_premium_active
    FROM users
    WHERE id = user_id_param;
    
    RETURN COALESCE(is_premium_active, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to add interest to user (prevents duplicates)
CREATE OR REPLACE FUNCTION add_user_interest(
    user_id_param VARCHAR(24),
    interest_param TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET interests = array_append(COALESCE(interests, ARRAY[]::TEXT[]), interest_param)
    WHERE id = user_id_param
    AND NOT (COALESCE(interests, ARRAY[]::TEXT[]) @> ARRAY[interest_param]);
END;
$$ LANGUAGE plpgsql;

-- Function to remove interest from user
CREATE OR REPLACE FUNCTION remove_user_interest(
    user_id_param VARCHAR(24),
    interest_param TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET interests = array_remove(COALESCE(interests, ARRAY[]::TEXT[]), interest_param)
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update notification preference
CREATE OR REPLACE FUNCTION update_notification_preference(
    user_id_param VARCHAR(24),
    pref_key TEXT,
    pref_value BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET notification_preferences = jsonb_set(
        COALESCE(notification_preferences, '{}'::jsonb),
        ARRAY[pref_key],
        to_jsonb(pref_value)
    )
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get users by interest
CREATE OR REPLACE FUNCTION get_users_by_interest(
    interest_param TEXT,
    limit_param INT DEFAULT 50
)
RETURNS TABLE(
    id VARCHAR(24),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.first_name, u.last_name, u.profile_picture
    FROM users u
    WHERE u.interests @> ARRAY[interest_param]
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;