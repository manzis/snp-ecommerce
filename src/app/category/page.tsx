'use client';

import React from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CategoryCard from '@/components/categories/CategoryCard';
import OtherCategoryCard from '@/components/categories/OtherCategoryCard';

const MAIN_CATEGORIES = [
  {
    title: 'Creatine',
    count: 12,
    slug: 'creatine',
    image: '/images/categories/creatine-category.png',
    colors: { from: '#ffffff', to: '#d5ffd0', border: '#308026', text: '#308026' }
  },
  {
    title: 'Multivitamins',
    count: 12,
    slug: 'multivitamins',
    image: '/images/categories/creatine-category.png',
    colors: { from: '#ffffff', to: '#dbe5ff', border: '#334f96', text: '#334f96' }
  },
  {
    title: 'Proteins',
    count: 12,
    slug: 'protein',
    image: '/images/categories/creatine-category.png',
    colors: { from: '#ffffff', to: '#fff7e0', border: '#8e6d00', text: '#8e6d00' }
  },
  {
    title: 'Essentials',
    count: 12,
    slug: 'essentials',
    image: '/images/categories/creatine-category.png',
    colors: { from: '#ffffff', to: '#ffefe6', border: '#a41f1f', text: '#e11717' }
  }
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen mx-auto w-full max-w-[1280px] bg-white mt-[80px] pb-[60px]">
      {/* Reusable Dynamic Nav */}
      <DynamicPageNav title="Categories" subtitle={`${MAIN_CATEGORIES.length + 1} Total`} />

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {/* Main Categories Section */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.72px] text-[#242424]">
            Main Categories
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
            {MAIN_CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </section>

        {/* Other Categories Section */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.72px] text-[#242424]">
            Other Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            <OtherCategoryCard 
              title="Accessories"
              count={12}
              slug="accessories"
              image="/images/categories/creatine-category.png"
            />
          </div>
        </section>
      </main>
    </div>
  );
}