import dynamic from 'next/dynamic';
import React from 'react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import HomeHero from '@/components/home/HomeHero';
import HomeCategories from '@/components/home/HomeCategory';

// Dynamic imports for below-the-fold / heavy sections
const ProductGridSection = dynamic(() => import('@/components/home/ProductGridSection'));
const Brands = dynamic(() => import('@/components/home/Brands'));
const FeatureBanners = dynamic(() => import('@/components/home/FeatureBanners'));
const TestimonialSection = dynamic(() => import('@/components/home/TestinomialSection'));
const ServicesMarquee = dynamic(() => import('@/components/home/ServicesMarquee'));
const SubscribeSection = dynamic(() => import('@/components/home/SubscribeSection'));
const HomeFaqSection = dynamic(() => import('@/components/home/HomeFaqSection'));
const ProductBanners = dynamic(() => import('@/components/product/ProductBanners'));

import ProductGridSectionSkeleton from '@/components/home/ProductGridSectionSkeleton';
import {
  fetchHomepageFullData,
  fetchHomepageProducts,
} from '@/services/productService.server';
import type { Product } from '@/services/productService.server';
import { getSeoPage, getSeoGlobal } from '@/lib/seo/getSeoData';
import { generateHomeFallbackSeo } from '@/lib/seo/seoFallback';
import { getSiteSetting } from '@/services/settingsService';

export async function generateMetadata(): Promise<Metadata> {
  const [pSeo, gSeo] = await Promise.all([
    getSeoPage('home'),
    getSeoGlobal(),
  ]);

  const homeFallback = generateHomeFallbackSeo();
  const title = pSeo?.title || gSeo?.default_title || homeFallback.title;
  const description = pSeo?.description || gSeo?.default_description || homeFallback.description;
  const keywords = pSeo?.keywords || homeFallback.keywords;
  const canonical = pSeo?.canonical_url || 'https://www.brightsupplements.store';
  const ogImage = pSeo?.og_image || gSeo?.default_og_image || '';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: { 'en-NP': canonical },
    },
    robots: pSeo?.robots || gSeo?.default_robots || 'index, follow',
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Supplyment Nepal',
      locale: 'en_NP',
      images: [
        {
          url: ogImage || '/icon.png',
          width: 1200,
          height: 1200,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      site: '@supplymentnepal',
      images: [ogImage || '/icon.png'],
    },
  };
}

// ISR: Cache handled by unstable_cache in services (604800s TTL + on-demand revalidateTag).
// No route-level revalidate timer needed — eliminates unnecessary periodic ISR writes.

export default async function HomePage() {
  // Fetch hero settings and deals at the top level to fully SSR the above-the-fold content
  const [heroImages, todaysDealsProducts] = await Promise.all([
    getSiteSetting('hero_images'),
    fetchHomepageProducts('todays_deals')
  ]);

  // Map Todays Deals
  const deals = todaysDealsProducts.map(p => ({
    id: p.slug,
    brand: p.brands?.name || '',
    title: p.title,
    originalPrice: String(p.original_price),
    discountedPrice: String(p.discounted_price),
    discount: String(p.discount_percentage || '0'),
    image: p.images?.[0] || '/images/protein.jpg'
  }));

  return (
    <div className="relative min-h-screen bg-white w-full">
      {/* === ABOVE THE FOLD — Fully Server-Side Rendered for instant LCP === */}
      <HomeHero deals={deals} heroImages={heroImages} />

      <main className="flex flex-col items-center  lg:border-[1px] border-[#efefef] pb-[86px] mx-auto w-full">
        <HomeCategories />

        {/* Stream heavy sections after critical content is visible. */}
        <Suspense fallback={<HomeDeferredSectionsFallback />}>
          <HomeDeferredSections />
        </Suspense>
      </main>
    </div>
  );
}



async function HomeDeferredSections() {
  const {
    productsGrouped,
    brands: dbBrands,
    testimonials: homeTestimonials,
    banners: activeBanners
  } = await fetchHomepageFullData();

  const bestSellingProducts = productsGrouped['best_selling'] || [];
  const popularProducts = productsGrouped['popular_products'] || [];
  const newArrivalsProducts = productsGrouped['new_arrivals'] || [];

  const mapToGrid = (products: Product[]) => products.map(p => {
    let benefit = '';
    const titleLower = p.title?.toLowerCase() || '';
    if (titleLower.includes('protein')) benefit = 'Muscle Recovery & Growth';
    else if (titleLower.includes('creatine')) benefit = 'Strength & Endurance';
    else if (titleLower.includes('magnesium')) benefit = 'Deep Sleep & Recovery';
    else if (titleLower.includes('vitamin')) benefit = 'Daily Immunity Support';
    else if (p.brands?.name) benefit = `Premium by ${p.brands.name}`;

    return {
      brand: p.brands?.name || 'Brand',
      title: p.title,
      originalPrice: p.original_price,
      discountedPrice: p.discounted_price,
      discountPercentage: p.discount_percentage,
      rating: p.rating.toString(),
      image: p.images?.[0] || '/images/protein.webp',
      slug: p.slug,
      stockStatus: p.stock_status,
      benefit
    };
  });

  const mappedBrands = dbBrands.map(b => ({
    name: b.name,
    slug: b.slug,
    logo: b.image_url || '/images/brands/muscleblaze.png'
  }));

  return (
    <>
      {newArrivalsProducts.length > 0 && (
        <div className="w-full">
          <ProductGridSection
            title="New Arrivals"
            products={mapToGrid(newArrivalsProducts)}
          />
        </div>
      )}

      <div className="w-full">
        <Brands brands={mappedBrands} />
      </div>

      {activeBanners.length > 0 && (
        <div className="w-full">
          <ProductBanners linkedBanners={activeBanners.map(b => ({ banner: b }))} />
        </div>
      )}

      {popularProducts.length > 0 && (
        <div className="w-full">
          <ProductGridSection
            title="Popular Products"
            products={mapToGrid(popularProducts)}
          />
        </div>
      )}

      <div className="w-full">
        <FeatureBanners />
      </div>

      <div className="w-full">
        <TestimonialSection testimonials={
          homeTestimonials.map((t, idx) => {
            const isAnonymous = !t.author || t.author.toLowerCase().includes('user') || t.author.toLowerCase().includes('anonymous');
            const fallbackProfiles = [
              { name: 'Sanjay Shrestha', role: 'Fitness Coach & Athlete', useCase: 'For Muscle Recovery' },
              { name: 'Priya Gurung', role: 'Yoga Instructor', useCase: 'For Daily Energy' },
              { name: 'Bikash Thapa', role: 'Professional Bodybuilder', useCase: 'For Peak Performance' },
              { name: 'Anita Maharjan', role: 'Nutritionist', useCase: 'For Overall Health' },
            ];

            const profile = fallbackProfiles[idx % fallbackProfiles.length];

            return {
              ...t,
              author: isAnonymous ? profile.name : t.author,
              role: t.role || profile.role,
              home_title: t.home_title || profile.useCase
            };
          })
        } />
      </div>

      {bestSellingProducts.length > 0 && (
        <div className="w-full">
          <ProductGridSection
            title="Best Sellers"
            products={mapToGrid(bestSellingProducts)}
          />
        </div>
      )}

      <div className="w-full">
        <ServicesMarquee />
      </div>

      <div className="w-full">
        <SubscribeSection />
      </div>

      {activeBanners.length > 0 && (
        <div className="w-full">
          <ProductBanners linkedBanners={activeBanners.map(b => ({ banner: b }))} />
        </div>
      )}

      <div className="w-full">
        <HomeFaqSection />
      </div>

      <section className="w-full px-[24px] py-[40px] text-center max-w-[800px] mx-auto opacity-70">
        <p className="font-rajdhani text-[14px] leading-[22px] text-[#535353]">
          Supplyment Nepal is your most trusted destination for authentic dietary supplements, including Whey Protein, Creatine Monohydrate, and sports nutrition in Nepal. We stock world-class brands like MuscleBlaze and Naturaltein to ensure you get 100% genuine products with fast nationwide delivery. Create a personal account to track your orders, save your favorite products, and experience faster checkout.
        </p>
      </section>
    </>
  );
}

function HomeDeferredSectionsFallback() {
  return (
    <>
      {/* New Arrivals skeleton */}
      <ProductGridSectionSkeleton bgColor="bg-[#F2F9F1]" />

      {/* Brands skeleton */}
      <section className="mx-auto w-full max-w-[1440px] py-[32px] lg:px-[48px] lg:py-[48px] animate-pulse">
        <div className="mb-[24px] px-[24px] md:px-0">
          <div className="h-[28px] w-[120px] rounded-lg bg-gray-200 md:h-[36px]" />
        </div>
        <div className="flex gap-[16px] overflow-hidden px-[24px] md:px-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[80px] w-[120px] flex-shrink-0 rounded-[12px] bg-gray-100" />
          ))}
        </div>
      </section>

      {/* Popular Products skeleton */}
      <ProductGridSectionSkeleton bgColor="bg-[#F1F7F9]" />

      {/* Feature Banners skeleton */}
      <section className="mx-auto w-full max-w-[1440px] py-[32px] lg:px-[48px] animate-pulse">
        <div className="h-[200px] w-full rounded-[20px] bg-gray-100 mx-[24px] md:mx-0" />
      </section>

      {/* Product Banners #1 skeleton */}
      <div className="w-full h-[530px] md:h-[650px] lg:h-[720px] bg-gray-100 animate-pulse border-y border-gray-100" />

      {/* Testimonials skeleton (approx) */}
      <section className="w-full py-16 bg-gray-50 animate-pulse">
        <div className="h-[300px] w-full max-w-4xl mx-auto rounded-[20px] bg-gray-200" />
      </section>

      {/* Best Sellers skeleton */}
      <ProductGridSectionSkeleton bgColor="bg-white" />

      {/* Services, Subscribe skeleton */}
      <div className="w-full h-[150px] bg-gray-100 animate-pulse mt-8" />
      <div className="w-full h-[300px] bg-gray-50 animate-pulse mt-8" />

      {/* Product Banners #2 skeleton */}
      <div className="w-full h-[530px] md:h-[650px] lg:h-[720px] bg-gray-100 animate-pulse border-y border-gray-100 mt-8" />
    </>
  );
}
