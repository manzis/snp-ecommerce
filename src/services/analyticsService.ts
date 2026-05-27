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
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();
    const { data, error } = await supabase
      .from('view_top_products_30d')
      .select('*')
      .limit(limit);

    if (error) {
      // Fallback: Query raw product_views if view doesn't exist
      const { data: rawData } = await supabase
        .from('product_views')
        .select('product_id, products(title, images)')
        .limit(100); // Get a sample and aggregate in JS for safety

      const aggregated = rawData?.reduce((acc: any, curr: any) => {
        const id = curr.product_id;
        if (!acc[id]) acc[id] = { product_id: id, name: curr.products?.title, thumbnail: curr.products?.images?.[0], view_count: 0 };
        acc[id].view_count += 1;
        return acc;
      }, {});

      return Object.values(aggregated || {}).sort((a: any, b: any) => b.view_count - a.view_count).slice(0, limit);
    }
    return data;
  }),

  /**
   * Fetches recently viewed products
   */
  getRecentlyViewedProducts: cache(async (limit = 10) => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();

    const { data: rawData, error } = await supabase
      .from('product_views')
      .select('product_id, viewed_at, products(title, name, images)')
      .order('viewed_at', { ascending: false })
      .limit(500); // Fetch a good sample size

    if (error || !rawData) {
      console.error('Error fetching recently viewed:', error);
      return [];
    }

    const aggregated = rawData.reduce((acc: any, curr: any) => {
      const id = curr.product_id;
      if (!acc[id]) {
        const product = curr.products as any;
        acc[id] = {
          product_id: id,
          name: product?.title || product?.name || 'Unknown Product',
          thumbnail: product?.images?.[0] || '/images/protein.webp',
          view_count: 0,
          last_viewed: new Date(curr.viewed_at).getTime()
        };
      }
      acc[id].view_count += 1;
      
      const currentViewed = new Date(curr.viewed_at).getTime();
      if (currentViewed > acc[id].last_viewed) {
        acc[id].last_viewed = currentViewed;
      }
      return acc;
    }, {});

    return Object.values(aggregated)
      .sort((a: any, b: any) => b.last_viewed - a.last_viewed)
      .slice(0, limit);
  }),

  /**
   * Fetches top selling products based on order items
   */
  getTopSellingProducts: cache(async (limit = 5) => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();

    // We group and count based on order_items
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity, products(title, images, name), orders(status)')
      .limit(2000); // Get a larger sample size for accuracy

    if (error || !data) {
      console.error('Error fetching top selling:', error);
      return [];
    }

    // Aggregate by product_id: Track orders and sold quantities
    const aggregated = data.reduce((acc: any, curr: any) => {
      const id = curr.product_id;
      if (!acc[id]) {
        const product = curr.products as any;
        acc[id] = {
          product_id: id,
          name: product?.title || product?.name || 'Unknown Product',
          thumbnail: product?.images?.[0] || '/images/protein.webp',
          order_count: 0,
          sold_count: 0
        };
      }
      
      // Every item entry represents an appearance in an order
      acc[id].order_count += 1; 
      
      // Only count quantity as "sold" if the order is not cancelled
      if (curr.orders && curr.orders.status !== 'cancelled') {
        acc[id].sold_count += (curr.quantity || 1);
      }
      
      return acc;
    }, {});

    return Object.values(aggregated || {})
      .sort((a: any, b: any) => b.sold_count - a.sold_count)
      .slice(0, limit);
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
      supabase.from('profiles').select('id, full_name, email, avatar_url').in('id', userIds)
    ]);

    const productsMap = new Map(productsRes.data?.map(p => [p.id, p]));
    const profilesMap = new Map(profilesRes.data?.map(p => [p.id, p]));

    // 2.5 Fetch auth users to get Google metadata (e.g. avatars) if admin client is available
    if (admin) {
      try {
        const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
        authUsers.forEach(authUser => {
          if (userIds.includes(authUser.id)) {
            const existing = profilesMap.get(authUser.id);
            const authAvatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;

            profilesMap.set(authUser.id, {
              id: authUser.id,
              email: authUser.email || existing?.email || 'No email',
              full_name: authUser.user_metadata?.full_name || existing?.full_name || authUser.email?.split('@')[0] || 'Anonymous',
              avatar_url: existing?.avatar_url || authAvatar || ''
            });
          }
        });
      } catch (e) {
        console.error('Failed to fetch auth users for metadata:', e);
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
          email: profile?.email || 'No email',
          avatar: profile?.avatar_url || ''
        });
      }
    });

    return {
      productsInCarts: Array.from(productMap.values()).sort((a, b) => b.unique_cart_count - a.unique_cart_count)
    };
  }),

  /**
   * Fetches abandoned checkouts (Users who filled details but exited)
   */
  getAbandonedOrdersAnalytics: cache(async () => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();

    // 1. Get abandoned checkouts
    const { data: abandoned, error } = await supabase
      .from('abandoned_checkouts')
      .select('*')
      .order('abandoned_at', { ascending: false });

    if (error) {
      console.error('Error fetching abandoned checkouts:', error);
      return { abandonedOrders: [] };
    }

    // 2. Fetch user profiles for these records if they exist
    const userIds = Array.from(new Set(abandoned?.map(a => a.user_id).filter(id => id)));
    let profilesMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url')
        .in('id', userIds);
      profilesMap = new Map(profiles?.map(p => [p.id, p]));

      // Fetch auth metadata for Google avatars
      if (admin) {
        try {
          const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
          authUsers.forEach(au => {
            if (userIds.includes(au.id)) {
              const existing = profilesMap.get(au.id);
              const authAvatar = au.user_metadata?.avatar_url || au.user_metadata?.picture;
              profilesMap.set(au.id, {
                ...(existing || {}),
                id: au.id,
                avatar_url: existing?.avatar_url || authAvatar || ''
              });
            }
          });
        } catch (e) {
          console.error('Failed to fetch auth users for abandoned checkouts metadata:', e);
        }
      }
    }

    // 3. Map and format
    const formatted = abandoned?.map(record => {
      const details = typeof record.customer_details === 'string'
        ? JSON.parse(record.customer_details)
        : record.customer_details;

      const profile = profilesMap.get(record.user_id);
      const contactValue = details?.contact_value || details?.value || '';

      return {
        id: record.id,
        user_id: record.user_id,
        created_at: record.abandoned_at,
        total_amount: record.total_amount,
        customer: {
          name: profile?.full_name || details?.full_name || details?.addressDetails?.full_name || details?.delivery?.addressDetails?.full_name || details?.name || 'Anonymous',
          email: profile?.email || (contactValue.includes('@') ? contactValue : (details?.email || details?.delivery?.addressDetails?.email)) || 'No email',
          phone: profile?.phone || (!contactValue.includes('@') && contactValue ? contactValue : (details?.phone || details?.delivery?.addressDetails?.phone || details?.addressDetails?.phone)) || 'No phone',
          avatar: profile?.avatar_url || ''
        },
        items: (record.items as any[])?.map(item => ({
          ...item,
          product_name: item.name || item.product_name || 'Product',
          thumbnail: item.image || item.images?.[0] || item.thumbnail
        }))
      };
    });

    return {
      abandonedOrders: formatted || []
    };
  }),

  /**
   * Fetches trending searches
   */
  getTrendingSearches: cache(async (limit = 10) => {
    const admin = getSupabaseAdmin();
    const supabase = admin || await createClient();
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
