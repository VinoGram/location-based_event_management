-- Make User Admin Script
-- Replace 'your-email@example.com' with your actual email address

-- First, run the admin_features.sql to add the necessary columns
-- Then run this script to make yourself admin

UPDATE users 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, first_name, last_name, is_admin 
FROM users 
WHERE is_admin = TRUE;