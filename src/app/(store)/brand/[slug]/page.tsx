import React, { Suspense } from 'react';
import { fetchBrandBySlug, fetchProducts } from '@/services/productService.server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProductCard from '@/components/search/SearchProductCard';
import { BRAND_THEMES } from '@/lib/BrandThemes';
import BackButton from '@/components/ui/BackButton';
import type { Metadata } from 'next';
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import { generateBrandFallbackSeo } from '@/lib/seo/seoFallback';
import BrandJsonLd from '@/components/seo/BrandJsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [brand, gSeo] = await Promise.all([
    fetchBrandBySlug(slug),
    getSeoGlobal(),
  ]);

  if (!brand) return { title: 'Brand Not Found | SNP Store' };

  const fallback = generateBrandFallbackSeo(brand);
  const canonical = `https://brightsupplements.store/brand/${slug}`;
  const ogImage = brand.cover_image || gSeo?.default_og_image || '/images/shoplogo.png';

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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fallback.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fallback.title,
      description: fallback.description,
      images: [ogImage],
    },
  };
}


const BrandSkeleton = () => (
  <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px] animate-pulse">
    <div className="w-full h-[140px] lg:h-[300px] bg-gray-50" />
    <div className="w-full lg:max-w-[1280px] mx-auto mt-6 px-6">
      <div className="h-[120px] w-full bg-gray-50 rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-50 rounded" />
        ))}
      </div>
    </div>
  </div>
);

async function BrandDataWrapper({ slug }: { slug: string }) {
  const [brand, products] = await Promise.all([
    fetchBrandBySlug(slug),
    fetchProducts({ brandSlug: slug })
  ]);

  if (!brand) {
    notFound();
  }

  const theme = BRAND_THEMES[slug.toLowerCase()] ||
    BRAND_THEMES[slug.toLowerCase().replace(/-/g, '')] ||
    BRAND_THEMES.default;

  // Map database brand fields to UI structure
  const brandInfo = {
    name: brand.name,
    description: brand.description || `Explore high-quality products from ${brand.name}.`,
    banner: brand.cover_image || theme.banner,
    logo: brand.image_url || '/images/brands/brand-logo.png',
    rating: brand.rating?.toString() || '4.5',
    purchases: brand.total_purchases?.toLocaleString() || '0',
    totalProducts: products.length,
    colors: theme.cardColors,
    bgColor: theme.bgColor,
    accentColor: theme.accentColor
  };

  return (
    <div className="flex flex-col w-full lg:items-center">
      {/* Brand + ItemList + Breadcrumb structured data — enables Google product card carousels */}
      <BrandJsonLd
        brandName={brand.name}
        brandSlug={slug}
        brandDescription={brand.description || undefined}
        brandLogo={brand.image_url || undefined}
        brandCover={brand.cover_image || undefined}
        products={products.map(p => ({
          name: p.title || p.name,
          slug: p.slug,
          image: p.images?.[0],
          price: String(p.original_price),
          discountedPrice: String(p.discounted_price),
          rating: p.rating,
          reviewCount: p.reviews_count ? Number(p.reviews_count) : 0,
          stockStatus: p.stock_status || 'in_stock',
        }))}
      />
      <DynamicPageNav title={brandInfo.name} subtitle={`${brandInfo.totalProducts} Products`} />
      
      <header className="relative w-full h-[140px] lg:h-[300px] shrink-0">
        <Image
          src={brandInfo.banner}
          alt="Brand Banner"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      </header>

      <main className="w-full lg:max-w-[1280px] lg:mt-[24px]">
        <section
          className="flex flex-col items-start gap-[12px] px-[24px] py-[24px] lg:flex-row lg:items-center lg:gap-[32px] w-full"
          style={{ backgroundColor: brandInfo.bgColor }}
        >
          <div className="flex-none relative w-[80px] h-[80px] lg:w-[120px] lg:h-[120px] overflow-hidden border border-[#f1f5f9] bg-white flex items-center lg:border-none justify-center">
            <Image
              src={brandInfo.logo}
              alt="Brand Logo"
              fill
              className="object-contain p-[2px]"
              sizes="(max-width: 1024px) 75px, 120px"
            />
          </div>

          <div className="flex flex-col gap-[8px] flex-1 min-w-0 ">
            <h1
              className="font-titillium text-[18px] lg:text-[28px] font-semibold tracking-[-0.72px] leading-[26px]"
              style={{ color: brandInfo.accentColor }}
            >
              {brandInfo.name}
            </h1>
            <div className="font-titillium text-[13px] lg:text-[16px] leading-[20px] lg:leading-[24px] tracking-[-0.52px] text-[#1e1e1e] max-w-[850px]">
              {brandInfo.description}
            </div>
          </div>
        </section>

        <section className="flex w-full border-y border-t border-b border-[#f1f5f9] bg-white">
          {[
            { label: 'Rating', value: brandInfo.rating },
            { label: 'Purchases', value: brandInfo.purchases },
            { label: 'Total Products', value: brandInfo.totalProducts }
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex-1 flex flex-col items-start lg:items-center justify-center gap-[10px] px-[24px] py-[24px] ${idx !== 2 ? 'border-r border-[#f1f5f9]' : ''}`}
            >
              <span className="font-titillium text-[12px] lg:text-[14px] font-semibold text-[#242424] opacity-50  tracking-[-0.48px] leading-[18px]">
                {stat.label}
              </span>
              <span className="font-titillium text-[18px] lg:text-[24px] font-semibold text-[#242424] leading-[18px]">
                {stat.value}
              </span>
            </div>
          ))}
        </section>

        <div className="flex items-center gap-[10px]  border-[#f1f5f9] px-[24px] py-[24px] bg-white">
          <span className="flex-1 font-titillium text-[16px] lg:text-[20px] font-semibold text-[#242424] tracking-[-0.64px] leading-[26px]">
            Explore Brand & Products
          </span>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#f1f5f9] bg-white overflow-hidden">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[100px] px-[24px] text-center bg-white ">
            <div className="w-[64px] h-[64px] bg-[#f9fafb] rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <p className="font-titillium text-[18px] font-semibold text-[#242424] mb-2">No Products Available</p>
            <p className="font-titillium text-[14px] text-[#71717a] mb-8">Go back and check other brands or categories.</p>
            <BackButton
              className="px-8 py-3 bg-[#242424] text-white rounded-full text-[14px] font-medium hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Go Back
            </BackButton>
          </div>
        )}
      </main>
    </div>
  );
}

export default async function BrandDetailPage(props: Props) {
  const { slug } = await props.params;

  return (
    <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px]">
      <Suspense fallback={<BrandSkeleton />}>
        <BrandDataWrapper slug={slug} />
      </Suspense>
    </div>
  );
}
