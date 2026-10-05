-- Create global_messages table for global chat
CREATE TABLE IF NOT EXISTS global_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_global_messages_created ON global_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_global_messages_user ON global_messages(user_id);

-- Insert a welcome message if table is empty
INSERT INTO global_messages (user_id, message, created_at)
SELECT 
    (SELECT id FROM users LIMIT 1) as user_id,
    'Welcome to the global chat! 🎉' as message,
    NOW() - INTERVAL '1 hour' as created_at
WHERE NOT EXISTS (SELECT 1 FROM global_messages)
LIMIT 1;