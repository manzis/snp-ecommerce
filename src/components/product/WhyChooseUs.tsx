'use client';

import React from 'react';
import Image from 'next/image';

const WhyChooseUs: React.FC = () => {
  return (
    <section
      className="main-container h-[400px] relative  flex w-full  lg:max-w-none flex-col items-start gap-[16px] rounded-[24px]  shrink-0 ">





      <div className="relative h-full w-full self-stretch overflow-x-auto no-scrollbar rounded-[8px] bg-white  z-[1]">
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