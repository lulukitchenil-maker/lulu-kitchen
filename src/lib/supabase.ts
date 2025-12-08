import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('=== Supabase Configuration ===');
console.log('URL present:', !!supabaseUrl);
console.log('URL value:', supabaseUrl || 'MISSING');
console.log('Anon Key present:', !!supabaseAnonKey);
console.log('Anon Key length:', supabaseAnonKey.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase configuration missing!');
  console.error('Please ensure .env file exists and dev server is restarted');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

console.log('✅ Supabase client created');
