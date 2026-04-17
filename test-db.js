require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      product_variants (
        *, 
        size:product_sizes(*), 
        flavour:product_flavours(*)
      )
    `);
    
  if (error) console.error("Error:", error.message);
  else {
    const withVariants = data.find(d => d.product_variants && d.product_variants.some(v => v.size_id || v.flavour_id));
    if (withVariants) {
        console.log("Found product with variants:", withVariants.name);
        console.dir(withVariants.product_variants, { depth: null });
    } else {
        console.log("No products with real variants found.");
    }
  }
}
test();
