import React from 'react';
import ProductCard from '@/components/home/ProductCard';

interface ProductGridSectionProps {
    title: string;
    products: any[];
}

const ProductGridSection: React.FC<ProductGridSectionProps> = ({ title, products }) => {
    return (
        <section className="mx-auto w-full max-w-[1440px]  rounded-br-[24px] rounded-tl-[24px] lg:rounded-[24px] py-[32px] lg:px-[48px] lg:py-[48px] md:py-[64px] bg-[#F2F9F1]">
            {/* HEADER */}
            <div className="mb-[24px] flex items-center justify-between px-[24px] md:mb-[40px] md:px-0">
                <h2 className="font-titillium text-[20px] font-semibold tracking-[-0.8px] text-[#242424] md:text-[32px]">
                    {title}
                </h2>
                <button className="font-titillium text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]">
                    View All
                </button>
            </div>

            {/* HORIZONTAL SCROLL ON MOBILE / GRID ON DESKTOP */}
            <div className="no-scrollbar flex w-full gap-[10px] overflow-x-auto px-[24px] pb-[10px] md:grid md:grid-cols-3 md:gap-[24px] md:px-0 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => (
                    <ProductCard key={product.slug} {...product} />
                ))}
            </div>
        </section>
    );
};

export default ProductGridSection;