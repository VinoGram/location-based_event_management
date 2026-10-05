-- Create event_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_comments (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  sentiment VARCHAR(20) DEFAULT 'neutral',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created ON event_comments(created_at);

-- Insert test comments (only if there are existing events and users)
INSERT INTO event_comments (event_id, user_id, comment, created_at)
SELECT 
    e.id as event_id,
    u.id as user_id,
    'This looks like a great event!' as comment,
    NOW() - INTERVAL '1 hour' as created_at
FROM events e, users u 
WHERE e.id = (SELECT id FROM events LIMIT 1)
AND u.id = (SELECT id FROM users LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM event_comments WHERE event_id = e.id AND user_id = u.id)
LIMIT 1;

INSERT INTO event_comments (event_id, user_id, comment, created_at)
SELECT 
    e.id as event_id,
    u.id as user_id,
    'Looking forward to attending this!' as comment,
    NOW() - INTERVAL '30 minutes' as created_at
FROM events e, users u 
WHERE e.id = (SELECT id FROM events LIMIT 1)
AND u.id = (SELECT id FROM users WHERE id != (SELECT id FROM users LIMIT 1) LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM event_comments WHERE event_id = e.id AND user_id = u.id)
LIMIT 1;