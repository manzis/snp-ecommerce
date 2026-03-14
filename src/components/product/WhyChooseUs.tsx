'use client';

import React from 'react';
import Image from 'next/image';

const WhyChooseUs: React.FC = () => {
  return (
    <section 
      className="main-container relative mx-auto flex w-full  lg:max-w-none flex-col items-start gap-[16px] rounded-[24px] p-[28px_24px] shrink-0 "
      style={{
        background: 'linear-gradient(180deg, #f0ffed 0%, #ffffff 100%)',
        height: '800px'
      }}
    >
      
      <h2 className="h-[18px] w-full self-stretch font-titillium text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424] whitespace-nowrap">
        Why Choose Us?
      </h2>

      
      <div className="relative h-[388px] lg:h-[1000px] w-full self-stretch overflow-x-auto no-scrollbar rounded-[8px] bg-white shadow-sm z-[1]">
        <Image
          src="/images/whychoose.png" 
          alt="Why choose Supplement Nepal - Premium quality and fast delivery"
          fill
          className="object-cover rounded-[8px]"
          sizes="362px, 1000px"
          priority
        />
      </div>
    </section>
  );
};

export default WhyChooseUs;