import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkAndSyncExpoExpressStatus, checkAndPersistDelayedStatus } from '@/app/actions/orderActions';

export const maxDuration = 60; // Allow 60s for external API calls
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Verify Cron Secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Missing Supabase Admin configuration' }, { status: 500 });
  }

  try {
    // 2. Find active orders being shipped by Expo Express
    const activeTransitStatuses = ['shipped', 'in_transit', 'shipment_arrived', 'out_for_delivery'];
    
    const { data: activeOrders, error } = await supabase
      .from('orders')
      .select('id, status, carrier_name, tracking_number, status_updates, created_at, order_items(id, quantity, price, mrp, selected_size, selected_flavor, products(name, stock_status))')
      .in('status', activeTransitStatuses)
      .not('tracking_number', 'is', null)
      .ilike('carrier_name', '%expoexpress%');

    if (error) {
      throw error;
    }

    if (!activeOrders || activeOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active Expo Express orders found.', 
        processedCount: 0 
      });
    }

    let updatedCount = 0;

    // 3. Process each order sequentially to avoid rate limits
    for (const order of activeOrders) {
      const originalStatus = order.status;
      
      // We pass the order object to these mutative functions.
      // They handle updating Supabase AND firing the emails internally!
      await checkAndPersistDelayedStatus(order, supabase);
      await checkAndSyncExpoExpressStatus(order, supabase);
      
      if (order.status !== originalStatus) {
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sync completed', 
      processedCount: activeOrders.length,
      updatedCount 
    });

  } catch (error: any) {
    console.error('[CRON] Sync tracking error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
