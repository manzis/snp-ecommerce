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
    <section className="flex w-full flex-col items-start justify-center overflow-hidden font-titillium">
      <div className="main-container relative mx-auto flex w-[362px] flex-col items-start gap-[10px] flex-nowrap">
        
        {/* Brand and Title Section */}
        <div className="relative flex self-stretch flex-col items-start gap-[6px] shrink-0 flex-nowrap">
          <span className="relative h-[18px] shrink-0 font-titillium text-[16px] leading-[18px] text-[#787878] tracking-[-0.96px] whitespace-nowrap text-left z-[1]">
            {brand}
          </span>
          
          <div className="relative flex self-stretch items-center justify-center gap-[10px] shrink-0 flex-nowrap z-[2]">
            {/* Title using Custom Font */}
            <h1 className="relative flex-grow shrink-0 basis-0 h-[60px] font-custom text-[22px] font-normal leading-[30px] text-left z-[3] bg-[linear-gradient(90deg,#242424,#535353)] bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="relative flex w-[277px] flex-col items-start justify-center gap-[5px] shrink-0 flex-nowrap z-[4]">
          <div className="relative flex w-[277px] items-center gap-[10px] shrink-0 flex-nowrap z-[5]">
            
            {/* Discount Badge */}
            <div className="relative flex self-stretch w-[63px] flex-col items-start justify-center gap-[5px] shrink-0 flex-nowrap z-[6]">
              <div className="relative flex w-[63px] items-center justify-center gap-[10px] shrink-0 flex-nowrap px-[6px] py-[4px] bg-[#94ff00] rounded-[6px] z-[7]">
                <span className="relative h-[14px] shrink-0 font-custom text-[12px] font-normal leading-[14px] text-[#242424] whitespace-nowrap text-left z-[8]">
                  save {discountPercentage}
                </span>
              </div>
            </div>

{/* Original Price */}
<span className="relative h-[30px] shrink-0 font-titillium text-[28px] font-normal leading-[30px] text-[#979797] tracking-[-1.96px] whitespace-nowrap text-left z-[9]">
  {originalPrice}
  {/* 1px Strikethrough Line - Exact Thickness Control */}
  <div className="absolute w-full h-[1px] bg-[#979797] top-[55%] left-0" />
</span>

            {/* Discounted Price using Custom Font */}
            <span className="relative h-[30px] shrink-0 font-custom text-[28px] font-normal leading-[30px] whitespace-nowrap text-left z-[10] bg-[linear-gradient(68.09deg,#308026,#32d71d)] bg-clip-text text-transparent">
              {discountedPrice}
            </span>
          </div>

          {/* Tax Disclaimer */}
          <span className="relative h-[10px] shrink-0 font-titillium text-[12px] font-light leading-[10px] text-[#5f5f5f] whitespace-nowrap text-left z-[11]">
            *inclusive of all taxes
          </span>
        </div>
      </div>
    </section>
  );
};

export default ProductHeader;