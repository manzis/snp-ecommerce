import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/checkout/',
          '/login',
        ],
      },
      {
        // Allow Google to crawl everything including checkout for Shopping Ads
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/login',
        ],
      },
    ],
    sitemap: 'https://www.brightsupplements.store/sitemap.xml',
    host: 'https://www.brightsupplements.store',
  };
}
