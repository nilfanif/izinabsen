const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

// Support both SUPABASE_KEY and SUPABASE_ANON_KEY
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY or SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
};

module.exports = { supabase, testConnection };
