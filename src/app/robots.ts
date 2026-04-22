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
          '/_next/',
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
          '/_next/',
          '/login',
        ],
      },
    ],
    sitemap: 'https://brightsupplements.store/sitemap.xml',
    host: 'https://brightsupplements.store',
  };
}
