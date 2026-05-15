import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const BASE_URL = 'https://www.brightsupplements.store';

// Regenerate once a week (safety net; primarily refreshed via on-demand revalidation)
export const revalidate = 604800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  // Use a fixed date for static pages to prevent non-deterministic output.
  // Dynamic entries (products, brands, categories) use their actual updated_at from the DB.
  const staticLastModified = new Date('2026-01-01');

  // ── Static core pages ────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: staticLastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: staticLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/brands`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/essentials`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/distributor`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  if (!supabase) return staticPages;

  try {
    // ── Products — highest priority after homepage ────────────────────────────
    const { data: products } = await supabase
      .from('products')
      .select('slug, title, updated_at, images, brands(name)')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    const productPages: MetadataRoute.Sitemap = (products || []).map((p: any) => ({
      url: `${BASE_URL}/product/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      // images must be string[] per Next.js MetadataRoute.Sitemap type
      images: p.images?.length > 0 ? [p.images[0]] : undefined,
    }));

    // ── Categories ───────────────────────────────────────────────────────────
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, name, updated_at, image_url');

    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c: any) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
      images: c.image_url ? [c.image_url] : undefined,
    }));

    // ── Brands — key for "[Brand] products in Nepal" searches ─────────────────
    const { data: brands } = await supabase
      .from('brands')
      .select('slug, name, updated_at, image_url, cover_image');

    const brandPages: MetadataRoute.Sitemap = (brands || []).map((b: any) => ({
      url: `${BASE_URL}/brand/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: (b.cover_image || b.image_url) ? [b.cover_image || b.image_url] : undefined,
    }));

    return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
  } catch (err) {
    console.error('[sitemap] Error generating dynamic sitemap:', err);
    return staticPages;
  }
}
