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
import { fetchProducts, fetchHomepageProducts, fetchBrands, fetchHomeTestimonials } from '@/services/productService';
import { fetchActiveBannersAction } from '@/app/actions/bannerActions';
import { getSeoPage, getSeoGlobal } from '@/lib/seo/getSeoData';

export async function generateMetadata(): Promise<Metadata> {
  const [pSeo, gSeo] = await Promise.all([
    getSeoPage('home'),
    getSeoGlobal(),
  ]);

  const title = pSeo?.title || gSeo?.default_title || 'SNP Store | Premium Supplements Nepal';
  const description = pSeo?.description || gSeo?.default_description || 'Shop premium supplements at SNP Store Nepal. Best prices on whey protein, mass gainers, and vitamins.';
  const canonical = pSeo?.canonical_url || 'https://brightsupplements.store';

  return {
    title,
    description,
    keywords: pSeo?.keywords || undefined,
    alternates: { canonical },
    robots: pSeo?.robots || gSeo?.default_robots || 'index, follow',
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: pSeo?.og_image ? [{ url: pSeo.og_image }] : gSeo?.default_og_image ? [{ url: gSeo.default_og_image }] : [],
    },
    twitter: {
      card: (pSeo?.twitter_card as any) || 'summary_large_image',
      title,
      description,
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
    allProducts, // Keep if needed for other sections, but user wants manual New Arrivals
    dbBrands,
    activeBannersRes,
    homeTestimonials
  ] = await Promise.all([
    fetchHomepageProducts('best_selling'),
    fetchHomepageProducts('popular_products'),
    fetchHomepageProducts('todays_deals'),
    fetchHomepageProducts('new_arrivals'),
    fetchProducts(),
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
    image: p.images?.[0] || '/images/protein.jpg'
  }));

  const mapToGrid = (products: any[]) => products.map(p => ({
    brand: p.brands?.name || 'Brand',
    title: p.title,
    originalPrice: p.original_price,
    discountedPrice: p.discounted_price,
    discountPercentage: p.discount_percentage,
    rating: p.rating.toString(),
    image: p.images?.[0] || '/images/protein.jpg',
    slug: p.slug,
    stockStatus: p.stock_status
  }));

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

      <main className="flex flex-col pb-[86px] mx-auto w-full">
        <HomeHero deals={deals.length > 0 ? deals : []} />
        
        {deals.length > 0 && <TodaysDeals deals={deals} />}
        
        <HomeCategories />

        {bestSellingProducts.length > 0 && (
          <ProductGridSection 
            title="Best Sellers" 
            products={mapToGrid(bestSellingProducts)} 
          />
        )}

        <Brands brands={mappedBrands} />

        {popularProducts.length > 0 && (
          <ProductGridSection 
            title="Popular Products" 
            products={mapToGrid(popularProducts)} 
          />
        )}

        {/* DYNAMIC BANNERS SECTION - POSITION 1 (Below Popular Products) */}
        {activeBanners.length > 0 && (
          <div className="w-full">
            <ProductBanners linkedBanners={activeBanners.map(b => ({ banner: b }))} />
          </div>
        )}

        {activeBanners.length === 0 && (
          <>
            <ServicesMarquee />
            <FeatureBanners />
          </>
        )}

        <TestimonialSection testimonials={homeTestimonials} />

        {newArrivalsProducts.length > 0 && (
          <ProductGridSection 
            title="New Arrivals" 
            products={mapToGrid(newArrivalsProducts)} 
          />
        )}

        <ServicesMarquee />
        <SubscribeSection />

        {/* DYNAMIC BANNERS SECTION - POSITION 2 (Below Subscribe) */}
        {activeBanners.length > 0 && (
          <div className="w-full">
            <ProductBanners linkedBanners={activeBanners.map(b => ({ banner: b }))} />
          </div>
        )}

        {/* RANDOM FEATURED PRODUCTS */}
        {allProducts.length > 0 && (
          <HomeFeaturedProducts products={allProducts} limit={15} />
        )}

      </main>
    </div>
  );
}