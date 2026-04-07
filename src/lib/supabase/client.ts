import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Check your .env file.');
}

/**
 * Creates a browser-side Supabase client using @supabase/ssr.
 * This client automatically handles document.cookie for authentication persistence, 
 * ensuring the session is valid for both Client and Server Components.
 */
export const createClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Ensure single instance throughout the application for legacy compatibility
export const supabase = createClient();
