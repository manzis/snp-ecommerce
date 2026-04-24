
import { sendOrderConfirmationEmail } from './src/services/emailService';
import { createClient } from './src/lib/supabase/server';

async function test() {
  const supabase = await createClient();
  const { data: order } = await supabase.from('orders').select('id').limit(1).single();
  
  if (order) {
    console.log('Testing with order:', order.id);
    const success = await sendOrderConfirmationEmail(order.id);
    console.log('Test result:', success ? 'SUCCESS' : 'FAILED');
  } else {
    console.log('No orders found to test with.');
  }
}

test();
