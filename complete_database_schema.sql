-- Complete Database Schema for Event Management Application
-- Generated from frontend and backend analysis

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_engagement CASCADE;
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS event_comments CASCADE;
DROP TABLE IF EXISTS event_ratings CASCADE;
DROP TABLE IF EXISTS event_views CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS saved_events CASCADE;
DROP TABLE IF EXISTS ticket_purchases CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table with OAuth support
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expiry_date TIMESTAMP,
  used_premium_discount BOOLEAN DEFAULT FALSE,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  profile_picture TEXT,
  location TEXT,
  interests TEXT[],
  onboarded BOOLEAN DEFAULT FALSE,
  preferred_categories TEXT[],
  preferred_vibes TEXT[],
  price_range VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  location_address TEXT,
  venue VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  creator_id INTEGER REFERENCES users(id),
  is_virtual BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0,
  price_category VARCHAR(50),
  is_exclusive BOOLEAN DEFAULT FALSE,
  flyer_url TEXT,
  tags TEXT[],
  vibe VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- 'going', 'interested', 'not_going'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Saved events
CREATE TABLE saved_events (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Event ratings
CREATE TABLE event_ratings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Event comments
CREATE TABLE event_comments (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  sentiment VARCHAR(20) DEFAULT 'neutral',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event views tracking
CREATE TABLE event_views (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Ticket purchases
CREATE TABLE ticket_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  original_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  payment_reference VARCHAR(255),
  payment_provider VARCHAR(50),
  purchase_date TIMESTAMP DEFAULT NOW()
);

-- User engagement tracking (for AI recommendations)
CREATE TABLE user_engagement (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'interested', 'rating_5', 'view_time', etc.
  score INTEGER NOT NULL,
  value TEXT,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Groups for social features
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  creator_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group members
CREATE TABLE group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Group messages
CREATE TABLE group_messages (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friendships
CREATE TABLE friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_location ON events(latitude, longitude);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_saved_events_user ON saved_events(user_id);
CREATE INDEX idx_user_engagement_user ON user_engagement(user_id);
CREATE INDEX idx_user_engagement_event ON user_engagement(event_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- Insert sample data
INSERT INTO users (email, first_name, last_name, password_hash) VALUES
('admin@eventapp.com', 'Admin', 'User', '$2a$10$example_hash'),
('john@example.com', 'John', 'Doe', '$2a$10$example_hash'),
('jane@example.com', 'Jane', 'Smith', '$2a$10$example_hash');

INSERT INTO events (title, description, category, date, time, location_name, venue, latitude, longitude, creator_id, price, status) VALUES
('Summer Music Festival', 'Annual outdoor music festival', 'Music', '2024-07-15', '18:00', 'Central Park', 'Main Stage', 5.6037, -0.1870, 1, 25.00, 'approved'),
('Tech Conference 2024', 'Latest in technology trends', 'Technology', '2024-06-20', '09:00', 'Convention Center', 'Hall A', 5.6037, -0.1870, 1, 150.00, 'approved'),
('Comedy Night', 'Stand-up comedy show', 'Comedy', '2024-05-25', '20:00', 'Comedy Club', 'Main Room', 5.6037, -0.1870, 2, 15.00, 'approved'),
('Food Truck Festival', 'Best food trucks in the city', 'Food', '2024-06-10', '12:00', 'City Square', 'Outdoor Area', 5.6037, -0.1870, 2, 0.00, 'approved'),
('Art Gallery Opening', 'Contemporary art exhibition', 'Art', '2024-05-30', '19:00', 'Modern Art Gallery', 'Gallery Space', 5.6037, -0.1870, 3, 10.00, 'approved');

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;