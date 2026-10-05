// Check the current events table schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    // Get a sample event to see the current schema
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      console.log('Current event schema:');
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
        console.log('\nSample event:');
        console.log(data[0]);
      } else {
        console.log('No events found in database');
      }
    }
  } catch (error) {
    console.error('Failed to check schema:', error);
  }
}

checkSchema();