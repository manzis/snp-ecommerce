import React from 'react';
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

import { fetchProducts, fetchHomepageProducts, fetchBrands } from '@/services/productService';

export default async function HomePage() {
  // Fetch dynamic sections from database
  const [
    bestSellingProducts,
    popularProducts,
    todaysDealsProducts,
    newArrivalsProducts,
    allProducts, // Keep if needed for other sections, but user wants manual New Arrivals
    dbBrands
  ] = await Promise.all([
    fetchHomepageProducts('best_selling'),
    fetchHomepageProducts('popular_products'),
    fetchHomepageProducts('todays_deals'),
    fetchHomepageProducts('new_arrivals'),
    fetchProducts(),
    fetchBrands()
  ]);

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

      <main className="flex flex-col  pb-[86px]  mx-auto ">
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

        <ServicesMarquee />
        <FeatureBanners />

        <TestimonialSection />

        {newArrivalsProducts.length > 0 && (
          <ProductGridSection 
            title="New Arrivals" 
            products={mapToGrid(newArrivalsProducts)} 
          />
        )}

        <ServicesMarquee />
        <SubscribeSection />

      </main>
    </div>
  );
}