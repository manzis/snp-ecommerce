'use client';

import React from 'react';
import Image from 'next/image';

interface WhyChooseUsProps {
  imageUrl?: string | null;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ imageUrl }) => {
  return (
    <section
      className="main-container relative flex w-full max-w-[1200px] aspect-square md:aspect-auto md:h-auto flex-col items-start rounded-t-[24px] sm:rounded-t-[28px] lg:rounded-t-[32px] rounded-b-none shrink-0 overflow-hidden"
    >
      <div className="relative w-full aspect-square self-stretch overflow-hidden rounded-t-[24px] sm:rounded-t-[28px] lg:rounded-t-[32px] rounded-b-none bg-transparent z-[1]">
        <Image
          src={imageUrl || "/images/whychoose.webp"}
          alt="Why choose Supplement Nepal - Premium quality and fast delivery"
          fill
          className="object-cover rounded-t-[24px] sm:rounded-t-[28px] lg:rounded-t-[32px] rounded-b-none"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
      </div>
    </section>
  );
};

export default WhyChooseUs;
