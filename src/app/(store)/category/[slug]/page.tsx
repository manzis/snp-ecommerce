import React, { Suspense } from 'react';
import { fetchProducts, fetchCategoryBySlug } from '@/services/productService.server';
import ClientCategoryDetailLayout from './ClientCategoryDetailLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import { generateCategoryFallbackSeo } from '@/lib/seo/seoFallback';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [catData, gSeo] = await Promise.all([
    fetchCategoryBySlug(slug),
    getSeoGlobal(),
  ]);

  if (!catData) return { title: 'Category Not Found | SNP Store' };

  const fallback = generateCategoryFallbackSeo(catData);
  const canonical = `https://brightsupplements.store/category/${slug}`;

  return {
    title: fallback.title,
    description: fallback.description,
    keywords: fallback.keywords,
    alternates: { canonical },
    robots: gSeo?.default_robots || 'index, follow',
    openGraph: {
      title: fallback.title,
      description: fallback.description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fallback.title,
      description: fallback.description,
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

  return (
    <ClientCategoryDetailLayout 
      slug={slug}
      initialProducts={productsData}
      categoryMetadata={catData}
    />
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
