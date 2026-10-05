-- Check events table structure and data
SELECT 
    id,
    title,
    status,
    creator_id,
    created_at
FROM events 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if status column exists and its values
SELECT DISTINCT status FROM events;

-- Check users table
SELECT id, email, first_name, last_name FROM users LIMIT 5;