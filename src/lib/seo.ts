// In a helpers file, e.g., src/lib/seo.ts

function generateBreadcrumbJsonLd(path: BreadcrumbItem[]) {
  const itemListElement = path.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://www.yoursite.com${item.href}`, // Use your full domain
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

// Then, in your src/app/product/[slug]/page.tsx:

export default async function ProductPage({ params }) {
  // ... (fetch data and build breadcrumbPath as before)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbPath);

  return (
    <main>
      {/* Add this script to inject the structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <ProductNav />
      <Breadcrumbs path={breadcrumbPath} />
      {/* ... */}
    </main>
  );
}