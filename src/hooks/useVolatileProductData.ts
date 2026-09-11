import { useState, useEffect, useCallback } from 'react';

export interface VolatileProductData {
  original_price: string | number;
  discounted_price: string | number;
  stock_status: string;
  activeSale: {
    name: string;
    slug?: string;
    discount_type: string;
    discount_value: number;
    ends_at: string;
    max_discount_percentage?: number;
  } | null;
  storeSettings?: {
    orders_disabled: boolean;
    orders_disabled_until: string | null;
    orders_disabled_reason: string;
  };
  server_time?: number;
}

interface CacheEntry {
  promise: Promise<any>;
  timestamp: number;
}

const inFlightCache: Record<string, CacheEntry> = {};

export function clearVolatileCache(slug?: string) {
  if (slug) {
    delete inFlightCache[slug];
  } else {
    for (const key in inFlightCache) {
      delete inFlightCache[key];
    }
  }
}

export function useVolatileProductData(slug: string) {
  const [volatileData, setVolatileData] = useState<VolatileProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVolatileData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      const now = Date.now();
      // Deduplicate simultaneous component mounts on the same page (1.5s window),
      // but fetch fresh data on navigation or subsequent visits
      if (!inFlightCache[slug] || now - inFlightCache[slug].timestamp > 1500) {
        inFlightCache[slug] = {
          promise: fetch(`/api/products/${slug}/volatile?t=${now}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          })
            .then(res => res.json())
            .catch(err => {
              delete inFlightCache[slug];
              throw err;
            }),
          timestamp: now,
        };
      }

      const json = await inFlightCache[slug].promise;
      if (json && json.success && json.data) {
        setVolatileData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch volatile product data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchVolatileData();
  }, [fetchVolatileData]);

  const refetch = useCallback(() => {
    delete inFlightCache[slug];
    return fetchVolatileData();
  }, [slug, fetchVolatileData]);

  return { volatileData, isLoading, refetch };
}
