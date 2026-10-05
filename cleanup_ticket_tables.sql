-- Cleanup script to remove ticket-related tables and data
-- Run this script to clean up your database after removing ticket functionality

-- Drop ticket-related tables if they exist
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_purchases CASCADE;
DROP TABLE IF EXISTS event_ticket_types CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;

-- Remove ticket-related columns from events table if they exist
ALTER TABLE events DROP COLUMN IF EXISTS price;
ALTER TABLE events DROP COLUMN IF EXISTS price_currency;
ALTER TABLE events DROP COLUMN IF EXISTS max_tickets;
ALTER TABLE events DROP COLUMN IF EXISTS tickets_sold;
ALTER TABLE events DROP COLUMN IF EXISTS ticket_price;

-- Clean up any ticket-related indexes
DROP INDEX IF EXISTS idx_tickets_event_id;
DROP INDEX IF EXISTS idx_tickets_user_id;
DROP INDEX IF EXISTS idx_event_ticket_types_event_id;
DROP INDEX IF EXISTS idx_ticket_purchases_event_id;
DROP INDEX IF EXISTS idx_ticket_purchases_user_id;

-- Note: This script removes all ticket selling functionality from the database
-- Make sure to backup your database before running this script