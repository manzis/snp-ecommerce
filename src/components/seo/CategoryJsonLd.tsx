import React from 'react';

interface ProductItem {
  name: string;
  slug: string;
  image?: string;
  price?: string | number;
}

interface CategoryJsonLdProps {
  categoryName: string;
  categorySlug: string;
  products?: ProductItem[];
  description?: string;
}

export default function CategoryJsonLd({
  categoryName,
  categorySlug,
  products = [],
  description,
}: CategoryJsonLdProps) {
  const categoryUrl = `https://www.brightsupplements.store/category/${categorySlug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.brightsupplements.store',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://www.brightsupplements.store/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: categoryUrl,
      },
    ],
  };

  const itemListSchema = products.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Best ${categoryName} Supplements in Nepal`,
        description: description || `Shop authentic ${categoryName} supplements in Nepal at the best prices.`,
        url: categoryUrl,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `https://www.brightsupplements.store/product/${p.slug}`,
          name: p.name,
          ...(p.image && { image: p.image }),
        })),
      }
    : null;

  return (
    <>
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
