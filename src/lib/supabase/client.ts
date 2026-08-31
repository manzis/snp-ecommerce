import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Check your .env file.');
}

const fetchWithRetry: typeof fetch = async (url, options) => {
  let retries = 2;
  let delay = 200;
  while (true) {
    try {
      return await fetch(url, options);
    } catch (err: any) {
      if (retries > 0) {
        retries--;
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
};

/**
 * Creates a browser-side Supabase client using @supabase/ssr.
 * Includes automatic fetch retry logic for network resilience.
 */
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: fetchWithRetry,
    },
  });
};

// Ensure single instance throughout the application for legacy compatibility
export const supabase = createClient();

