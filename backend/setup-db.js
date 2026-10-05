const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Create users table with OAuth support
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
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
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('Users table error:', usersError);
    } else {
      console.log('✅ Users table created/updated');
    }

    // Create events table
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          location_name VARCHAR(255) NOT NULL,
          location_address TEXT,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          creator_id INTEGER REFERENCES users(id),
          is_virtual BOOLEAN DEFAULT FALSE,
          price DECIMAL(10, 2) DEFAULT 0,
          price_category VARCHAR(50),
          is_exclusive BOOLEAN DEFAULT FALSE,
          flyer_url TEXT,
          tags TEXT[],
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (eventsError) {
      console.error('Events table error:', eventsError);
    } else {
      console.log('✅ Events table created/updated');
    }

    // Create ticket purchases table
    const { error: ticketsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ticket_purchases (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          original_price DECIMAL(10,2) NOT NULL,
          discount_percent INTEGER NOT NULL,
          final_price DECIMAL(10,2) NOT NULL,
          purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (ticketsError) {
      console.error('Tickets table error:', ticketsError);
    } else {
      console.log('✅ Ticket purchases table created/updated');
    }

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

setupDatabase();