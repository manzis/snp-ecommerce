import Image from 'next/image';
import Link from 'next/link';
import { optimizeImage } from '@/lib/optimizeImage';

export interface Brand {
  id: number | string;
  image: string;
  name: string;
  slug: string;
}

interface RecommendedBrandsProps {
  brands?: Brand[];
}

const RecommendedBrands: React.FC<RecommendedBrandsProps> = ({ brands = [] }) => {
  if (brands.length === 0) return null;

  return (
    <section className="flex flex-col gap-[20px] self-stretch border-t border-[#f1f5f9] bg-white py-[24px] px-[24px]">
      <h3 className="font-titillium text-[16px] font-semibold leading-[20px] text-[#242424]">
        Recommended Brands
      </h3>
      <div className="no-scrollbar flex w-full gap-[16px] overflow-x-auto pb-[4px]">
        {brands.map((brand) => (
          <Link 
            key={brand.id} 
            href={`/brand/${brand.slug}`}

            className="flex h-[100px] w-[86px] shrink-0 flex-col gap-[5px] active:scale-95 transition-all"
          >
            <div className="relative flex flex-1 overflow-hidden rounded-[12px] border border-[#f1f5f9]">
              <Image
                src={optimizeImage(brand.image, 150)}
                alt={brand.name}
                fill
                className="object-cover"
                sizes="86px"
              />
            </div>
            <span className="font-titillium text-[10px] text-center text-[#979797] truncate px-1">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedBrands;
