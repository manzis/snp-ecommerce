import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/home/ProductCard';

interface ProductGridSectionProps {
    title: string;
    products: any[];
}

const ProductGridSection: React.FC<ProductGridSectionProps> = ({ title, products }) => {
    // Mapping titles to specific background colors
    // Best Sellers uses the green theme, others use different colors
    const getBgColor = (sectionTitle: string) => {
        const titleLower = sectionTitle.toLowerCase();

        if (titleLower.includes('best seller')) {
            return 'bg-[#F2F9F1]'; // Your primary green tint
        }
        if (titleLower.includes('popular')) {
            return 'bg-[#F1F7F9]'; // Light blue/gray tint for variety
        }
        if (titleLower.includes('new arrival')) {
            return 'bg-white'; // Light orange/yellow tint
        }

        return 'bg-white'; // Default fallback
    };

    const bgColorClass = getBgColor(title);

    return (
        <section className={`mx-auto w-full max-w-[1440px] py-[32px]  lg:px-[48px] lg:py-[48px] md:py-[64px] transition-colors duration-300 ${bgColorClass}`}>
            {/* HEADER */}
            <div className="mb-[24px] flex items-center justify-between px-[24px] md:mb-[40px] md:px-0">
                <h2 className="font-titillium text-[20px] font-semibold tracking-[-0.8px] text-[#242424] md:text-[32px]">
                    {title}
                </h2>
                <Link 
                    href="/products" 
                    className="font-titillium text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]"
                    aria-label={`View all ${title}`}
                >
                    View All
                </Link>
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
