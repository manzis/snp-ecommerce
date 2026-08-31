import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | null = null;

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
 * Privileged Supabase client for administrative tasks.
 * Lazy initialization to prevent crashes if the key is missing at build/module evaluation.
 */
export const getSupabaseAdmin = () => {
  if (adminClient) return adminClient;
  
  if (!supabaseServiceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to standard client (RLS will apply).');
    return null;
  }

  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: fetchWithRetry
    }
  });
  
  return adminClient;
};

