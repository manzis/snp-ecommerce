import { useState, useEffect } from 'react';

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
}

const promiseCache: Record<string, Promise<any>> = {};

export function useVolatileProductData(slug: string) {
  const [volatileData, setVolatileData] = useState<VolatileProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchVolatileData = async () => {
      try {
        if (!promiseCache[slug]) {
          promiseCache[slug] = fetch(`/api/products/${slug}/volatile`, {
            cache: 'no-store'
          }).then(res => res.json());
        }
        
        const json = await promiseCache[slug];
        if (json.success && json.data) {
          setVolatileData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch volatile product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolatileData();
  }, [slug]);

  return { volatileData, isLoading };
}
