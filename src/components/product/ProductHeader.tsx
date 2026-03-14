import React from 'react';

interface ProductHeaderProps {
  brand: string;
  title: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: string;
}

const ProductHeader = ({
  brand,
  title,
  originalPrice,
  discountedPrice,
  discountPercentage
}: ProductHeaderProps) => {
  return (
    <section className="flex w-full flex-col items-start font-titillium">
      {/* 
          ROOT: product-title-info-prices-offer
          - Mobile Width: 362px (mx-auto handled by parent grid wrapper)
          - Gap: 10px (Figma Token)
          - Height: 139px (Figma Token)
      */}
      <div className="relative flex w-full max-w-[362px] lg:max-w-none flex-col items-start gap-[10px] lg:h-auto h-[139px]">
        
        {/* 
            FRAME 23: Brand and Title Wrapper
            - Gap: 6px
            - Height: 84px
        */}
        <div className="relative flex w-full flex-col items-start gap-[6px] shrink-0 h-[84px] lg:h-auto">
          {/* Brand: ASITIS NUTRITION */}
          <span className="h-[18px] font-titillium text-[16px] font-normal leading-[18px] text-[#787878] tracking-[-0.06em] uppercase whitespace-nowrap">
            {brand}
          </span>
          
          {/* FRAME 5: Title Row */}
          <div className="relative flex w-full items-center h-[60px] lg:h-auto">
            <h1 className="font-custom text-[22px] lg:text-[26px] font-normal leading-[30px] lg:leading-[36px] text-left bg-[linear-gradient(90deg,#242424_0%,#535353_117.72%)] bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        {/* 
            FRAME 27: Pricing and Tax Section
            - Gap: 5px
            - Height: 45px
        */}
        <div className="relative flex flex-col items-start justify-center gap-[5px] h-[45px] shrink-0 lg:h-auto">
          
          {/* FRAME 24: Price Row (Badge + Prices) */}
          <div className="relative flex items-center gap-[10px] h-[30px]">
            
            {/* FRAME 25: Discount Badge */}
            <div className="flex h-[22px] w-[63px] items-center justify-center bg-[#95FF00] rounded-[6px] px-[6px] py-[4px]">
              <span className="font-custom text-[12px] font-normal leading-[14px] text-[#242424] whitespace-nowrap">
                save {discountPercentage}
              </span>
            </div>

            {/* Original Price */}
            <span className="h-[30px] font-titillium text-[28px] font-normal leading-[30px] text-[#979797] tracking-[-0.07em] line-through whitespace-nowrap">
              {originalPrice}
            </span>

            {/* Discounted Price */}
            <span className="h-[30px] font-custom text-[28px] lg:text-[32px] font-normal leading-[30px] lg:leading-[32px] bg-[linear-gradient(87.93deg,#318126_10.71%,#33D81D_124.28%)] bg-clip-text text-transparent whitespace-nowrap">
              {discountedPrice}
            </span>
          </div>

          {/* Tax Disclaimer */}
          <span className="h-[10px] font-titillium text-[12px] font-[300] leading-[10px] text-[#606060] whitespace-nowrap">
            *inclusive of all taxes
          </span>
        </div>
      </div>
    </section>
  );
};

export default ProductHeader;