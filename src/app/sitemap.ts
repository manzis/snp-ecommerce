import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const BASE_URL = 'https://brightsupplements.store';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/refund`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/distributor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/essentials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  if (!supabase) return staticPages;

  try {
    // Fetch all published product slugs
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_published', true);

    const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
      url: `${BASE_URL}/product/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // Fetch all category slugs
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at');

    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Fetch all brand slugs
    const { data: brands } = await supabase
      .from('brands')
      .select('slug, updated_at');

    const brandPages: MetadataRoute.Sitemap = (brands || []).map((b) => ({
      url: `${BASE_URL}/brand/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

    return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
  } catch (err) {
    console.error('[sitemap] Error generating dynamic sitemap:', err);
    return staticPages;
  }
}
