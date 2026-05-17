import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowRightIcon from '@/components/icons/RedirectIcon';
import { CATEGORY_THEMES } from '@/lib/CategoryThemes';

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  image_url?: string;
  product_count?: number;
}

interface ExploreCategoriesProps {
  categories?: Category[];
}

const ExploreCategories: React.FC<ExploreCategoriesProps> = ({ categories = [] }) => {
  if (categories.length === 0) return null;

  const getCategoryColors = (slug: string) => {
    const theme = CATEGORY_THEMES[slug.toLowerCase()] || CATEGORY_THEMES.essentials;
    return theme.cardColors;
  };

  const getCategoryFallbackImage = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('protein')) return '/images/protein.webp';
    if (s.includes('creatine')) return '/images/creatine.webp';
    if (s.includes('vitamin')) return '/images/vitamin.webp';
    if (s.includes('essential')) return '/images/essentials.webp';
    return '/images/essentials.webp';
  };

  return (
    <section className="flex flex-col gap-[20px] self-stretch border-t border-[#f1f5f9] py-[24px] px-[24px] bg-white">
      <h3 className="font-titillium text-[16px] font-semibold leading-[20px] text-[#242424]">
        Explore Categories:
      </h3>
      <div className="no-scrollbar flex w-full gap-[12px] overflow-x-auto pb-[4px]">
        {categories.map((cat) => {
          const colors = getCategoryColors(cat.slug);
          const image = cat.image_url || getCategoryFallbackImage(cat.slug);
          const count = cat.product_count || 0;

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative flex h-[125px] w-[110px] shrink-0 flex-col items-center overflow-hidden rounded-[10px] border border-[#f1f5f9] bg-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
            >
              {/* Background Image */}
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={cat.name}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="110px"
                />
              </div>

              {/* Top Badge: Product Count */}
              <div className="absolute right-[4px] top-[4px] flex h-[16px] px-[4px] items-center justify-center rounded-[3px] bg-white/90 backdrop-blur-[2px] z-10 border border-[#f1f5f9]">
                <span className="font-titillium text-[7px] font-bold tracking-[0.2px] text-[#242424] uppercase">
                  {count} items
                </span>
              </div>

              {/* Bottom Label with Dynamic Gradient */}
              <div
                className="absolute bottom-[4px] left-[4px] right-[4px] flex h-[26px] items-center justify-center gap-[2px] rounded-[6px] border-b-[1px] z-20 px-[4px]"
                style={{
                  background: `linear-gradient(197.56deg, ${colors.from}, ${colors.to})`,
                  borderBottomColor: colors.border
                }}
              >
                <span
                  className="font-titillium text-[9px] font-bold tracking-[0.2px] uppercase leading-none truncate max-w-[70px]"
                  style={{ color: colors.text }}
                >
                  {cat.name}
                </span>
                <div className="h-[9px] w-[9px] shrink-0">
                  <ArrowRightIcon className="h-full w-full" style={{ color: colors.text }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ExploreCategories;
