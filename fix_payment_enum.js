require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

async function fixEnum() {
    console.log('Connecting to Supabase...');
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const sql = `ALTER TYPE public.payment_status ADD VALUE 'failed';`;

    console.log('Attempting to execute SQL to add "failed" to payment_status enum...');
    
    // Attempting via the same RPC found in add_payment_status.js
    const { data, error } = await supabase.rpc('execute_sql', { sql: sql });

    if (error) {
        console.error('Error executing SQL via RPC:', error);
        console.log('\nTIP: If RPC fails, try running this SQL manually in Supabase Dashboard:');
        console.log(sql);
    } else {
        console.log('SUCCESS: SQL executed.', data);
    }
}

fixEnum();
