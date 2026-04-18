import React from 'react';
import { fetchProducts, fetchCategoryBySlug } from '@/services/productService';
import ClientCategoryDetailLayout from './ClientCategoryDetailLayout';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  
  const [productsData, catData] = await Promise.all([
    fetchProducts({ categorySlug: slug }),
    fetchCategoryBySlug(slug)
  ]);

  if (!catData && productsData.length === 0) {
    // If no category and no products, it might be an invalid slug
    // But usually we at least expect some data or empty results
  }

  return (
    <ClientCategoryDetailLayout 
      slug={slug}
      initialProducts={productsData}
      categoryMetadata={catData}
    />
  );
}
