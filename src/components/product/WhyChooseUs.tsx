'use client';

import React from 'react';
import Image from 'next/image';

interface WhyChooseUsProps {
  imageUrl?: string | null;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ imageUrl }) => {
  return (
    <section
      className="main-container relative flex w-full aspect-square md:aspect-auto md:h-auto lg:max-w-none flex-col items-start gap-[16px] rounded-[24px] shrink-0"
    >
      <div className="relative w-full aspect-square self-stretch overflow-hidden rounded-[8px] bg-white z-[1]">
        <Image
          src={imageUrl || "/images/whychoose.webp"}
          alt="Why choose Supplement Nepal - Premium quality and fast delivery"
          fill
          className="object-cover rounded-[8px]"
          sizes="(max-width: 768px) 100vw, 1000px"
          priority
        />
      </div>
    </section>
  );
};

export default WhyChooseUs;
