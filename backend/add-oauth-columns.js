const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addOAuthColumns() {
  console.log('Adding OAuth support columns...');
  
  try {
    // Add OAuth columns to users table
    const { data, error } = await supabase
      .from('users')
      .select('oauth_provider')
      .limit(1);
    
    if (error && error.code === '42703') {
      console.log('OAuth columns do not exist, they will be added via Supabase dashboard');
      console.log('Please run these SQL commands in your Supabase SQL editor:');
      console.log(`
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      `);
    } else {
      console.log('✅ OAuth columns already exist or table structure is ready');
    }
    
  } catch (error) {
    console.error('Error checking OAuth columns:', error);
  }
}

addOAuthColumns();