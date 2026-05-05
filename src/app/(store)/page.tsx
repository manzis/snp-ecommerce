import React from 'react';
import { Metadata } from 'next';
import FloatingNav from '@/components/layout/FloatingNav';
import HomeHero from '@/components/home/HomeHero';
import HomeCategories from '@/components/home/HomeCategory';
import TodaysDeals from '@/components/home/TodaysDeals';
import ProductGridSection from '@/components/home/ProductGridSection';
import SubscribeSection from '@/components/home/SubscribeSection';
import TestimonialSection from '@/components/home/TestinomialSection';
import FeatureBanners from '@/components/home/FeatureBanners';
import ServicesMarquee from '@/components/home/ServicesMarquee';
import Brands from '@/components/home/Brands';
import ProductBanners from '@/components/product/ProductBanners';
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts';
import HomeFaqSection from '@/components/home/HomeFaqSection';
import LazySection from '@/components/optimization/LazySection';
import { fetchProducts, fetchHomepageProducts, fetchBrands, fetchHomeTestimonials } from '@/services/productService';
import { fetchActiveBannersAction } from '@/app/actions/bannerActions';
import { getSeoPage, getSeoGlobal } from '@/lib/seo/getSeoData';
import { generateHomeFallbackSeo } from '@/lib/seo/seoFallback';

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

export default async function HomePage() {
  // Fetch dynamic sections from database
  const [
    bestSellingProducts,
    popularProducts,
    todaysDealsProducts,
    newArrivalsProducts,
    dbBrands,
    activeBannersRes,
    homeTestimonials
  ] = await Promise.all([
    fetchHomepageProducts('best_selling'),
    fetchHomepageProducts('popular_products'),
    fetchHomepageProducts('todays_deals'),
    fetchHomepageProducts('new_arrivals'),
    fetchBrands(),
    fetchActiveBannersAction(),
    fetchHomeTestimonials()
  ]);

  const activeBanners = activeBannersRes.success ? activeBannersRes.data : [];

  // Map Todays Deals
  const deals = todaysDealsProducts.map(p => ({
    id: p.slug,
    brand: p.brands?.name || '',
    title: p.title,
    originalPrice: String(p.original_price),
    discountedPrice: String(p.discounted_price),
    discount: String(p.discount_percentage),
    image: p.images?.[0] || '/images/protein.png'
  }));

  const mapToGrid = (products: any[]) => products.map(p => {
    // Generate a quick benefit summary based on title or category for Quick Wins
    let benefit = "";
    const titleLower = p.title?.toLowerCase() || '';
    if (titleLower.includes('protein')) benefit = "Muscle Recovery & Growth";
    else if (titleLower.includes('creatine')) benefit = "Strength & Endurance";
    else if (titleLower.includes('magnesium')) benefit = "Deep Sleep & Recovery";
    else if (titleLower.includes('vitamin')) benefit = "Daily Immunity Support";
    else if (p.brands?.name) benefit = `Premium by ${p.brands.name}`;

    return {
      brand: p.brands?.name || 'Brand',
      title: p.title,
      originalPrice: p.original_price,
      discountedPrice: p.discounted_price,
      discountPercentage: p.discount_percentage,
      rating: p.rating.toString(),
      image: p.images?.[0] || '/images/protein.png',
      slug: p.slug,
      stockStatus: p.stock_status,
      benefit
    };
  });

  // Map Brands
  const mappedBrands = dbBrands.map(b => ({
    name: b.name,
    slug: b.slug,
    logo: b.image_url || '/images/brands/muscleblaze.png' // Default placeholder if missing
  }));

  return (
    <div className="relative min-h-screen bg-white">
      {/* GLOBAL HOME NAVIGATION (TOP) */}
      <FloatingNav showBanner={true} />

      <main className="flex flex-col items-center max-w-[1200px] lg:border-[1px] border-[#efefef] pb-[86px] mx-auto w-full">
        {/* === ABOVE THE FOLD — Render eagerly === */}
        <HomeHero deals={deals.length > 0 ? deals : []} />

        {deals.length > 0 && <TodaysDeals deals={deals} />}

        <HomeCategories />

        {/* === BELOW THE FOLD — Deferred rendering via LazySection === */}

        {bestSellingProducts.length > 0 && (
          <LazySection minHeight="350px" rootMargin="400px" className="w-full">
            <ProductGridSection
              title="Best Sellers"
              products={mapToGrid(bestSellingProducts)}
            />
          </LazySection>
        )}

        <LazySection minHeight="200px" rootMargin="300px" className="w-full">
          <Brands brands={mappedBrands} />
        </LazySection>

        {popularProducts.length > 0 && (
          <LazySection minHeight="350px" rootMargin="300px" className="w-full">
            <ProductGridSection
              title="Popular Products"
              products={mapToGrid(popularProducts)}
            />
          </LazySection>
        )}

        {/* DYNAMIC BANNERS SECTION - POSITION 1 (Below Popular Products) */}
        {activeBanners.length > 0 && (
          <LazySection minHeight="500px" rootMargin="200px" className="w-full">
            <div className="w-full">
              <ProductBanners linkedBanners={activeBanners.map(b => ({ banner: b }))} />
            </div>
          </LazySection>
        )}

        {activeBanners.length === 0 && (
          <LazySection minHeight="300px" rootMargin="200px" className="w-full">
            <>
              <ServicesMarquee />
              <FeatureBanners />
            </>
          </LazySection>
        )}

        <LazySection minHeight="400px" rootMargin="200px" className="w-full">
          <TestimonialSection testimonials={
            homeTestimonials.map((t, idx) => {
              // Replace anonymous or generic authors with more trustworthy profiles
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
        </LazySection>

        {newArrivalsProducts.length > 0 && (
          <LazySection minHeight="350px" rootMargin="200px" className="w-full">
            <ProductGridSection
              title="New Arrivals"
              products={mapToGrid(newArrivalsProducts)}
            />
          </LazySection>
        )}

        <LazySection minHeight="200px" rootMargin="200px" className="w-full">
          <ServicesMarquee />
        </LazySection>

        <LazySection minHeight="200px" rootMargin="200px" className="w-full">
          <SubscribeSection />
        </LazySection>

        {/* DYNAMIC BANNERS SECTION - POSITION 2 (Below Subscribe) */}
        {activeBanners.length > 0 && (
          <LazySection minHeight="500px" rootMargin="200px" className="w-full">
            <div className="w-full">
              <ProductBanners linkedBanners={activeBanners.map(b => ({ banner: b }))} />
            </div>
          </LazySection>
        )}

        <LazySection minHeight="300px" rootMargin="200px" className="w-full">
          <HomeFaqSection />
        </LazySection>

        {/* SEO Content Block */}
        <section className="w-full px-[24px] py-[40px] text-center max-w-[800px] mx-auto opacity-70">
          <p className="font-titillium text-[14px] leading-[22px] text-[#535353]">
            Supplyment Nepal is your most trusted destination for authentic dietary supplements, including Whey Protein, Creatine Monohydrate, and sports nutrition in Nepal. We stock world-class brands like MuscleBlaze and Naturaltein to ensure you get 100% genuine products with fast nationwide delivery.
          </p>
        </section>

      </main>
    </div>
  );
}
