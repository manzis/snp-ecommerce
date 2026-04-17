require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('pending', 'partially_paid', 'paid');
    END IF;
END $$;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status public.payment_status DEFAULT 'pending';
`;

// Note: Supabase JS library doesn't inherently have query() for DDL unless wrapped in an RPC or using postgres-meta API directly.
// We might not have an existing RPC. Let's see if we can use postgres driver directly or just standard REST.
// If REST fails, I might have to tell the user to run it from their Supabase Dashboard.
supabase.rpc('execute_sql', { sql }).then(res => console.log('RPC response:', res));
