'use client';

import React from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CategoryCard from '@/components/categories/CategoryCard';

import { fetchCategories, Category } from '@/services/productService';

import { CATEGORY_THEMES } from '@/lib/CategoryThemes';

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#308026] rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalCount = categories.length;
  const mainCategories = categories.filter(c => !c.is_other_category);
  const otherCategories = categories.filter(c => c.is_other_category);

  const getCategoryColors = (slug: string) => {
    const theme = CATEGORY_THEMES[slug.toLowerCase()] || CATEGORY_THEMES.essentials;
    return theme.cardColors;
  };

  return (
    <div className="min-h-screen mx-auto w-full max-w-[1280px] bg-white mt-[80px] pb-[60px]">
      {/* Reusable Dynamic Nav */}
      <DynamicPageNav title="Categories" subtitle={`${totalCount} Total`} />

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {/* Main Categories Section */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.72px] text-[#242424]">
            Main Categories
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
            {mainCategories.map((cat, idx) => (
              <CategoryCard 
                key={cat.id} 
                title={cat.name}
                count={cat.product_count || 0}
                slug={cat.slug}
                image={cat.image_url || '/images/categories/creatine-category.png'}
                colors={getCategoryColors(cat.slug)}
              />
            ))}
          </div>
        </section>

        {/* Other Categories Section */}
        {otherCategories.length > 0 && (
          <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
            <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.72px] text-[#242424]">
              Other Categories
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
              {otherCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  title={cat.name}
                  count={cat.product_count || 0}
                  slug={cat.slug}
                  image={cat.image_url || '/images/categories/creatine-category.png'}
                  colors={getCategoryColors(cat.slug)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}