import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string | number;
  brand: string;
  name: string;
  image: string;
  slug: string;
}

interface PopularProductsProps {
  products?: Product[];
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products = [] }) => {
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-[20px] self-stretch border-t border-[#f1f5f9] py-[24px] px-[24px]">
      <h3 className="font-titillium text-[16px] font-semibold leading-[20px] text-[#242424]">
        Popular Products:
      </h3>
      <div className="no-scrollbar flex w-full gap-[16px] overflow-x-auto pb-[4px]">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="flex w-[141px] shrink-0 flex-col overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-[0.98] transition-all"
          >
            {/* Image Container */}
            <div className="relative h-[120px] w-full px-[10px]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-[10px]"
                sizes="141px"
              />
            </div>
            {/* Details Container */}
            <div className="flex flex-col gap-[8px] px-[16px] py-[8px]">
              <div className="flex flex-col gap-[2px] pb-[4px]">
                <span className="font-titillium text-[10px] font-normal leading-[14px] text-[#bebebe]">
                  {product.brand}
                </span>
                <span className="h-[32px] font-titillium text-[12px] font-semibold leading-[16px] tracking-[0.2px] text-[#242424] line-clamp-2">
                  {product.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularProducts;
