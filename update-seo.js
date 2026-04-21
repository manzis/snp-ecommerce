const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// CHANGE THIS TO YOUR DESIRED TITLE
const NEW_TITLE = 'Supplyment Nepal | Best Fitness Supplements in Nepal';

async function updateSeo() {
    console.log('Updating SEO title to:', NEW_TITLE);
    
    const { data, error } = await supabase
        .from('seo_global')
        .update({ default_title: NEW_TITLE })
        .eq('id', 1)
        .select();
    
    if (error) {
        console.error('Error updating SEO:', error);
        return;
    }
    
    console.log('Successfully updated SEO title:', data[0].default_title);
}

updateSeo();
