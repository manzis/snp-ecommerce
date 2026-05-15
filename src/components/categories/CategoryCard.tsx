import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowRightIcon from '@/components/icons/RedirectIcon';

interface CategoryCardProps {
  title: string;
  count: number;
  image: string;
  slug: string;
  colors: {
    from: string;
    to: string;
    border: string;
    text: string;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, count, image, slug, colors }) => {
  return (
    <Link 
      href={`/category/${slug}`}

      className="group relative flex h-[217px] w-full flex-col items-center overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white transition-all duration-300 hover:-translate-y-1 active:scale-95"
    >
      {/* Background Image */}
      <div className="relative h-full w-full">
        <Image
          src={image}
          alt={title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
        />
      </div>

      {/* Top Badge: Product Count */}
      <div className="absolute right-[6px] top-[6px] flex h-[28px] w-[80px] items-center justify-center rounded-[4px] bg-white z-10">
        <span className="font-titillium text-[10px] font-semibold tracking-[0.4px] text-[#242424] uppercase">
          {count} Products
        </span>
      </div>

      {/* Bottom Label with Dynamic Gradient */}
      <div 
        className="absolute bottom-[7px] left-[6px] right-[6px] flex h-[42px] items-center justify-center gap-[4px] rounded-[8px] border-b-[1px] z-20"
        style={{ 
          background: `linear-gradient(197.56deg, ${colors.from}, ${colors.to})`,
          borderBottomColor: colors.border
        }}
      >
        <span 
          className="font-titillium text-[14px] font-bold tracking-[0.56px] uppercase leading-[12px]"
          style={{ color: colors.text }}
        >
          {title}
        </span>
        <div className="h-[16px] w-[16px]">
          <ArrowRightIcon className="h-full w-full" style={{ color: colors.text }} />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
