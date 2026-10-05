-- Debug events table - check if columns exist first
SELECT 
    id,
    title,
    CASE 
        WHEN status IS NULL THEN 'NULL'
        ELSE status 
    END as status,
    creator_id,
    created_at
FROM events 
ORDER BY created_at DESC 
LIMIT 5;

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Check for events without status
SELECT COUNT(*) as null_status_count FROM events WHERE status IS NULL OR status = '';

-- Check for pending events
SELECT COUNT(*) as pending_count FROM events WHERE status = 'pending';

-- Show all events with their status
SELECT id, title, status, creator_id FROM events ORDER BY created_at DESC;