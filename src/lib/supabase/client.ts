import { createClient as createClientBase } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Subabase URL or Anon Key is missing. Check your .env file.');
}

// Ensure single instance throughout the application
export const supabase = createClientBase(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, 
  }
});

// Provide createClient for existing auth.service.ts compatibility
export const createClient = () => supabase;
