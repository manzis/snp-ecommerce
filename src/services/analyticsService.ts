import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { cache } from 'react';

export const analyticsService = {
  /**
   * Fetches top performing metrics for the dashboard
   */
  getDashboardStats: cache(async () => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();
    
    // In a real scenario, we'd use Promise.all for these
    const [revenueRes, orders, views, customers] = await Promise.all([
      supabase.rpc('get_total_revenue'),
      supabase.from('orders').select('id', { count: 'exact' }),
      supabase.from('product_views').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' })
    ]);

    let revenue = revenueRes.data;

    // Fallback: If RPC doesn't exist, calculate from orders table
    if (revenueRes.error || revenue === null) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');
      
      revenue = orderData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
    }

    return {
      revenue: revenue || 0,
      orders: orders.count || 0,
      views: views.count || 0,
      customers: customers.count || 0
    };
  }),

  /**
   * Fetches most viewed products from the new view
   */
  getMostViewedProducts: cache(async (limit = 5) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('view_top_products_30d')
      .select('*')
      .limit(limit);
      
    if (error) {
      // Fallback: Query raw product_views if view doesn't exist
      const { data: rawData } = await supabase
        .from('product_views')
        .select('product_id, products(title, image_url)')
        .limit(100); // Get a sample and aggregate in JS for safety

      const aggregated = rawData?.reduce((acc: any, curr: any) => {
        const id = curr.product_id;
        if (!acc[id]) acc[id] = { product_id: id, name: curr.products?.title, thumbnail: curr.products?.image_url, view_count: 0 };
        acc[id].view_count += 1;
        return acc;
      }, {});

      return Object.values(aggregated || {}).sort((a: any, b: any) => b.view_count - a.view_count).slice(0, limit);
    }
    return data;
  }),

  /**
   * Fetches active cart data (In-cart items and associated users)
   */
  getActiveCartAnalytics: cache(async () => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();
    
    // 1. Get unique items in carts
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        product_id,
        user_id,
        updated_at
      `)
      .order('updated_at', { ascending: false });

    if (cartError) {
      console.error('Error fetching cart analytics:', cartError);
      return { productsInCarts: [] };
    }

    if (!cartItems || cartItems.length === 0) {
      return { productsInCarts: [] };
    }

    // 2. Fetch products and profiles separately to avoid join issues
    const productIds = Array.from(new Set(cartItems.map(item => item.product_id).filter(id => id)));
    const userIds = Array.from(new Set(cartItems.map(item => item.user_id).filter(id => id)));

    const [productsRes, profilesRes] = await Promise.all([
      supabase.from('products').select('id, name, images').in('id', productIds),
      supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    ]);

    const productsMap = new Map(productsRes.data?.map(p => [p.id, p]));
    const profilesMap = new Map(profilesRes.data?.map(p => [p.id, p]));

    // 2.5 Fetch missing emails/names from auth if admin client is available
    if (admin) {
      const missingUserIds = userIds.filter(id => {
        const p = profilesMap.get(id);
        return !p || !p.email || p.full_name === 'Anonymous' || !p.full_name;
      });

      if (missingUserIds.length > 0) {
        try {
          // Fetch users from auth.users (requires service role)
          const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
          authUsers.forEach(authUser => {
            if (missingUserIds.includes(authUser.id)) {
              const existing = profilesMap.get(authUser.id);
              profilesMap.set(authUser.id, {
                id: authUser.id,
                email: authUser.email || existing?.email || 'No email',
                full_name: authUser.user_metadata?.full_name || existing?.full_name || authUser.email?.split('@')[0] || 'Anonymous'
              });
            }
          });
        } catch (e) {
          console.error('Failed to fetch auth users:', e);
        }
      }
    }

    // 3. Aggregate
    const productMap = new Map<string, any>();

    cartItems.forEach((item: any) => {
      const product = productsMap.get(item.product_id);
      if (!product) return;

      if (!productMap.has(item.product_id)) {
        productMap.set(item.product_id, {
          id: item.product_id,
          name: product.name,
          thumbnail: product.images?.[0],
          unique_cart_count: 0,
          users: []
        });
      }
      
      const prod = productMap.get(item.product_id);
      const profile = profilesMap.get(item.user_id);
      
      // Add user if not already in the list for this product
      if (item.user_id && !prod.users.some((u: any) => u.id === item.user_id)) {
        prod.unique_cart_count += 1;
        prod.users.push({
          id: item.user_id,
          name: profile?.full_name || 'Anonymous User',
          email: profile?.email || 'No email'
        });
      }
    });

    return {
      productsInCarts: Array.from(productMap.values()).sort((a, b) => b.unique_cart_count - a.unique_cart_count)
    };
  }),

  /**
   * Fetches abandoned orders (Orders that reached checkout but remained 'pending')
   */
  getAbandonedOrdersAnalytics: cache(async () => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();
    
    // 1. Get pending orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total_amount,
        created_at,
        contact_details,
        status,
        order_items (
          product_id,
          quantity,
          price,
          selected_size,
          selected_flavor,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching abandoned orders:', ordersError);
      return { abandonedOrders: [] };
    }

    // 2. Fetch user profiles for these orders if they exist
    const userIds = Array.from(new Set(orders?.map(o => o.user_id).filter(id => id)));
    let profilesMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      profilesMap = new Map(profiles?.map(p => [p.id, p]));
    }

    // 3. Map and format
    const formattedOrders = orders?.map(order => {
      const profile = profilesMap.get(order.user_id);
      const contactInfo = typeof order.contact_details === 'string' 
        ? JSON.parse(order.contact_details) 
        : order.contact_details;

      return {
        ...order,
        customer: {
          name: profile?.full_name || contactInfo?.full_name || contactInfo?.name || 'Anonymous',
          email: profile?.email || contactInfo?.email || 'No email',
          phone: contactInfo?.phone || 'No phone'
        },
        items: order.order_items?.map((item: any) => ({
          ...item,
          product_name: item.products?.name,
          thumbnail: item.products?.images?.[0]
        }))
      };
    });

    return {
      abandonedOrders: formattedOrders || []
    };
  }),

  /**
   * Fetches trending searches
   */
  getTrendingSearches: cache(async (limit = 10) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('view_trending_searches')
      .select('*')
      .limit(limit);
      
    if (error) {
      // Fallback: Query raw search_history
      const { data: rawData } = await supabase
        .from('search_history')
        .select('normalized_query, query')
        .limit(100);

      const aggregated = rawData?.reduce((acc: any, curr: any) => {
        const q = curr.normalized_query || curr.query;
        if (!acc[q]) acc[q] = { keyword: q, search_count: 0 };
        acc[q].search_count += 1;
        return acc;
      }, {});

      return Object.values(aggregated || {}).sort((a: any, b: any) => b.search_count - a.search_count).slice(0, limit);
    }
    return data;
  }),

  /**
   * Records a product view (Client-side helper)
   */
  recordProductView: async (productId: string, userId?: string) => {
    const supabase = await createClient();
    return supabase.from('product_views').insert({
      product_id: productId,
      user_id: userId
    });
  },

  /**
   * Records a search query with normalization
   */
  recordSearch: async (query: string, userId?: string, resultsCount: number = 0) => {
    const supabase = await createClient();
    const normalized = query.trim().toLowerCase().replace(/[^\w\s]/gi, ''); // Basic normalization
    
    return supabase.from('search_history').insert({
      query,
      normalized_query: normalized,
      user_id: userId,
      results_count: resultsCount
    });
  }
};
