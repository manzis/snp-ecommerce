require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// We need admin client to bypass RLS potentially?
const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpsert() {
  // pick the first product
  const { data: prods } = await adminClient.from('products').select('*').limit(1);
  if(!prods || prods.length === 0) return console.log('no product found');
  const pId = prods[0].id;
  
  console.log("Testing on product ID:", pId);

  // simulate creating a variant
  const flavourData = [{
    product_id: pId,
    flavour_name: 'TestFlavor',
    image_url: 'test.jpg'
  }];
  
  const { data: fData, error: fError } = await adminClient
      .from('product_flavours')
      .insert(flavourData)
      .select();
      
  if (fError) {
      console.error("Flavour insert error:", fError);
      return;
  }
  console.log("inserted flavour:", fData);
  
  const sizeData = [{
    product_id: pId,
    size_label: 'Large'
  }];
  const { data: sData, error: sError } = await adminClient
      .from('product_sizes')
      .insert(sizeData)
      .select();
  if (sError) {
      console.error("Size insert error:", sError);
      return;
  }
  console.log("inserted size:", sData);
  
  const variantsToInsert = [{
    product_id: pId,
    size_id: sData[0].id,
    flavour_id: fData[0].id,
    original_price: 100,
    discounted_price: 90
  }];
  
  const { data: vData, error: vError } = await adminClient
    .from('product_variants')
    .insert(variantsToInsert)
    .select();
    
  if (vError) {
     console.error("Variant insert error:", vError);
     return;
  }
  console.log("inserted variant:", vData);

  // now fetch it back using deep joins
  const { data: fetched, error: fetchError } = await adminClient
    .from('product_variants')
    .select('*, size:product_sizes(*), flavour:product_flavours(*)')
    .eq('product_id', pId);
    
  console.log("Fetch back:", fetched, fetchError);
}

testUpsert();
