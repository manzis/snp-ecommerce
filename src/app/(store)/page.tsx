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

const BEST_SELLERS = [
  {
    brand: "Naturltein",
    title: "Asitsi atom whey protein",
    originalPrice: "RS. 5000",
    discountedPrice: "rS. 1890",
    discountPercentage: "20%",
    rating: "4.3",
    image: "/images/atom-whey.jpg",
    slug: "atom-whey-1"
  },
  {
    brand: "Naturltein",
    title: "Asitsi atom whey protein",
    originalPrice: "RS. 5000",
    discountedPrice: "RS. 1890",
    discountPercentage: "20%",
    rating: "4.3",
    image: "/images/atom-whey.jpg",
    slug: "atom-whey-2"
  },
  {
    brand: "Naturltein",
    title: "Asitsi atom whey protein",
    originalPrice: "RS. 5000",
    discountedPrice: "RS. 1890",
    discountPercentage: "20%",
    rating: "4.3",
    image: "/images/atom-whey.jpg",
    slug: "atom-whey-3"
  },
  {
    brand: "Naturltein",
    title: "Asitsi atom whey protein",
    originalPrice: "RS. 5000",
    discountedPrice: "RS. 1890",
    discountPercentage: "20%",
    rating: "4.3",
    image: "/images/atom-whey.jpg",
    slug: "atom-whey-4"
  },
  {
    brand: "Naturltein",
    title: "Asitsi atom whey protein",
    originalPrice: "RS. 5000",
    discountedPrice: "RS. 1890",
    discountPercentage: "20%",
    rating: "4.3",
    image: "/images/atom-whey.jpg",
    slug: "atom-whey-5"
  },


  // ... more products
];

const POPULAR_PRODUCTS = [
  {
    brand: "Optimum Nutrition",
    title: "Creatine Monohydrate",
    originalPrice: "RS. 5000",
    discountedPrice: "rS. 1890",
    discountPercentage: "20%",
    rating: "4.3",
    image: "/images/product.png",
    slug: "atom-whey-2"
  },
  // ... more products
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* GLOBAL HOME NAVIGATION (TOP) */}
      <FloatingNav showBanner={true} />

      <main className="flex flex-col  pb-[86px]  mx-auto ">
        <HomeHero />
        <TodaysDeals />
        <HomeCategories />

        <ProductGridSection title="Best Sellers" products={BEST_SELLERS} />

        <ProductGridSection title="Popular Products" products={POPULAR_PRODUCTS} />
        <ServicesMarquee />
        <FeatureBanners />



        <TestimonialSection />
        <ServicesMarquee />

        <ProductGridSection title="New Arrivals" products={BEST_SELLERS} />

        <SubscribeSection />



      </main>
    </div>
  );
}