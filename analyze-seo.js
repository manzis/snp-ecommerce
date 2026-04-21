const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSeoSchema() {
    console.log('--- SEO Global (Fallback) ---');
    const { data: globalSeo } = await supabase.from('seo_global').select('id, default_title').eq('id', 1).single();
    console.log(JSON.stringify(globalSeo, null, 2));

    console.log('\n--- SEO Pages (Home Page Specific) ---');
    const { data: pageSeo } = await supabase.from('seo_pages').select('id, page_identifier, title').eq('page_identifier', 'home').single();
    console.log(JSON.stringify(pageSeo, null, 2));

    console.log('\n--- All Page Specific SEO ---');
    const { data: allPages } = await supabase.from('seo_pages').select('page_identifier, title');
    console.log(allPages);
}

analyzeSeoSchema();
