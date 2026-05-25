import React from 'react';

interface BrandProduct {
  name: string;
  slug: string;
  image?: string;
  price?: string | number;
  discountedPrice?: string | number;
  rating?: number;
  reviewCount?: number;
  stockStatus?: string;
}

interface BrandJsonLdProps {
  brandName: string;
  brandSlug: string;
  brandDescription?: string;
  brandLogo?: string;
  brandCover?: string;
  products?: BrandProduct[];
}

const SITE_URL = 'https://brightsupplements.store';
const STORE_NAME = 'Supplyment Nepal';

const STOCK_STATUS_MAP: Record<string, string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  pre_order: 'https://schema.org/PreOrder',
};

export default function BrandJsonLd({
  brandName,
  brandSlug,
  brandDescription,
  brandLogo,
  products = [],
}: BrandJsonLdProps) {
  const brandUrl = `${SITE_URL}/brand/${brandSlug}`;

  // ── Brand schema (enables Google Knowledge Panel for the brand) ──────────────
  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brandName,
    url: brandUrl,
    logo: brandLogo ? brandLogo : `${SITE_URL}/icon.png`,
    description:
      brandDescription ||
      `Buy authentic ${brandName} supplements in Nepal at ${STORE_NAME}. 100% genuine products, best prices, fast delivery.`,
  };

  // ── BreadcrumbList ───────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Brands',
        item: `${SITE_URL}/brands`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${brandName} Products`,
        item: brandUrl,
      },
    ],
  };

  // ── ItemList — triggers Google product card carousel in search results ────────
  const itemListSchema =
    products.length > 0
      ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Buy ${brandName} Products in Nepal | ${STORE_NAME}`,
        description: `Shop authentic ${brandName} supplements in Nepal at the best prices. Fast delivery & cash on delivery available.`,
        url: brandUrl,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((p, idx) => {
          const priceVal = Number(p.discountedPrice) || Number(p.price) || 0;
          const productUrl = `${SITE_URL}/product/${p.slug}`;
          return {
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              url: productUrl,
              ...(p.image && { image: p.image }),
              brand: {
                '@type': 'Brand',
                name: brandName,
              },
              offers: {
                '@type': 'Offer',
                url: productUrl,
                priceCurrency: 'NPR',
                price: priceVal > 0 ? priceVal : undefined,
                availability:
                  STOCK_STATUS_MAP[p.stockStatus || 'in_stock'] ||
                  'https://schema.org/InStock',
                seller: {
                  '@type': 'Organization',
                  name: STORE_NAME,
                  url: SITE_URL,
                },
              },
              ...(p.rating && p.reviewCount && p.reviewCount > 0
                ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: p.rating.toFixed(1),
                    reviewCount: p.reviewCount,
                    bestRating: '5',
                    worstRating: '1',
                  },
                }
                : {}),
            },
          };
        }),
      }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
    </>
  );
}
