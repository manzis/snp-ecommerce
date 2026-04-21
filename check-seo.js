const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSeo() {
    const { data, error } = await supabase
        .from('seo_global')
        .select('*')
        .single();
    
    if (error) {
        console.error('Error fetching SEO:', error);
        return;
    }
    
    console.log('Current SEO Global:', data);
}

checkSeo();
