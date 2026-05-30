import React, { Suspense } from 'react';
import { fetchProducts, fetchCategoryBySlug } from '@/services/productService.server';
import ClientCategoryDetailLayout from './ClientCategoryDetailLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import { generateCategoryFallbackSeo } from '@/lib/seo/seoFallback';
import CategoryJsonLd from '@/components/seo/CategoryJsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [catData, gSeo, products] = await Promise.all([
    fetchCategoryBySlug(slug),
    getSeoGlobal(),
    fetchProducts({ categorySlug: slug }),
  ]);

  if (!catData) return { title: 'Category Not Found | Supplyment Nepal' };

  const fallback = generateCategoryFallbackSeo(catData);
  const canonical = `https://www.brightsupplements.store/category/${slug}`;
  const catCover = catData.image_url || gSeo?.default_og_image || '/icon.png';

  // Build a rich image array: category image first, then up to 8 product images
  // Google uses multiple og:image tags to display visual grids in search results
  const productImages = products
    .filter((p: any) => p.images?.[0])
    .slice(0, 8)
    .map((p: any) => ({
      url: p.images[0],
      width: 1000,
      height: 1000,
      alt: `${p.title || p.name} — ${catData.name}`,
    }));

  const ogImages = [
    {
      url: catCover,
      width: 1200,
      height: 1200,
      alt: fallback.title,
    },
    ...productImages,
  ];

  return {
    title: fallback.title,
    description: fallback.description,
    keywords: fallback.keywords,
    alternates: {
      canonical,
      languages: { 'en-NP': canonical },
    },
    robots: gSeo?.default_robots || 'index, follow',
    openGraph: {
      title: fallback.title,
      description: fallback.description,
      url: canonical,
      type: 'website',
      siteName: 'Supplyment Nepal',
      locale: 'en_NP',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fallback.title,
      description: fallback.description,
      images: [catCover, ...productImages.slice(0, 3).map(i => i.url)],
    },
  };
}


const CategorySkeleton = () => (
  <div className="min-h-screen mx-auto w-full max-w-[1440px] bg-white mt-[80px] pb-[60px] animate-pulse">
    <div className="h-[200px] w-full bg-gray-50" />
    <div className="mx-auto w-full max-w-[410px] lg:px-[48px] lg:max-w-[1440px] mt-8">
      <div className="h-10 w-48 bg-gray-50 mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-50 rounded" />
        ))}
      </div>
    </div>
  </div>
);

async function CategoryDataWrapper({ slug }: { slug: string }) {
  const [productsData, catData] = await Promise.all([
    fetchProducts({ categorySlug: slug }),
    fetchCategoryBySlug(slug)
  ]);

  const productItems = (productsData || []).map(p => ({
    name: p.title || p.name,
    slug: p.slug,
    image: p.images?.[0],
    price: String(p.discounted_price),
  }));

  return (
    <>
      {catData && (
        <CategoryJsonLd
          categoryName={catData.name}
          categorySlug={slug}
          products={productItems}
          description={catData.description}
        />
      )}
      <ClientCategoryDetailLayout 
        slug={slug}
        initialProducts={productsData}
        categoryMetadata={catData}
      />
    </>
  );
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryDataWrapper slug={slug} />
    </Suspense>
  );
}
