-- Add ticket columns to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS has_tickets BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ticket_ussd VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ticket_web TEXT;
