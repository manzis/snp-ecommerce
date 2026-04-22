import React from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  images: string[];
  slug: string;
  sku?: string;
  brand: string;
  originalPrice: string | number;
  discountedPrice: string | number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'pre_order';
  rating?: number;
  reviewCount?: string | number;
  category?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FaqItem[];
  ratingOverride?: number;
  reviewCountOverride?: number;
  priceOverride?: number;
  stockStatusOverride?: string;
}

const STOCK_STATUS_MAP: Record<string, string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  pre_order: 'https://schema.org/PreOrder',
  InStock: 'https://schema.org/InStock',
  OutOfStock: 'https://schema.org/OutOfStock',
  PreOrder: 'https://schema.org/PreOrder',
};

export default function ProductJsonLd({
  name,
  description,
  images,
  slug,
  sku,
  brand,
  originalPrice,
  discountedPrice,
  stockStatus = 'in_stock',
  rating,
  reviewCount,
  category,
  breadcrumbs,
  faqs,
  ratingOverride,
  reviewCountOverride,
  priceOverride,
  stockStatusOverride,
}: ProductJsonLdProps) {
  const canonical = `https://brightsupplements.store/product/${slug}`;
  const priceValue = priceOverride || Number(discountedPrice) || Number(originalPrice);
  const availability = STOCK_STATUS_MAP[stockStatusOverride || stockStatus] || 'https://schema.org/InStock';
  const ratingValue = ratingOverride || rating;
  const reviewCountValue = reviewCountOverride || Number(reviewCount) || 0;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: images.slice(0, 5),
    url: canonical,
    sku: sku || slug,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    ...(category && { category }),
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'NPR',
      price: priceValue,
      availability,
      seller: {
        '@type': 'Organization',
        name: 'Bright Supplements',
      },
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
    ...(ratingValue && reviewCountValue > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: ratingValue.toFixed(1),
            reviewCount: reviewCountValue,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
  };

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://brightsupplements.store',
          },
          ...breadcrumbs.map((bc, idx) => ({
            '@type': 'ListItem',
            position: idx + 2,
            name: bc.name,
            item: bc.url,
          })),
        ],
      }
    : null;

  const faqSchema = faqs && faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
