'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ServiceHighlights: React.FC = () => {
  const highlights = [
    {
      id: 1,
      title: 'Money Back\nGuarantee',
      icon: '/images/moneyback.svg',
      bgColor: 'rgba(247, 255, 243, 0.8)',
      radius: 'rounded-l-[2px]',
    },
    {
      id: 2,
      title: 'Cash on\nDelivery',
      icon: '/images/cod.png',
      bgColor: 'rgba(237, 245, 255, 0.8)',
      radius: 'rounded-none',
    },
    {
      id: 3,
      title: 'Authentic &\nGenuine',
      icon: '/images/authentic.svg',
      bgColor: 'rgba(255, 246, 247, 0.8)',
      radius: 'rounded-r-[2px]',
    }
  ];

  return (
    <div className="main-container w-full px-[24px]">
      <section
        className="relative mx-auto flex w-full max-w-[700px] flex-col items-center bg-white border border-[#E9E9E9] rounded-[6px] p-[4px] gap-[4px] shrink-0 lg:mx-0 lg:max-w-none "
      >

        <div className="flex flex-row items-stretch w-full h-[122px] lg:h-[172px] self-stretch ">
          {highlights.map((item) => (
            <div
              key={item.id}
              style={{ backgroundColor: item.bgColor }}
              /* 
                 flex-1: Forces equal 33.33% width distribution
                 px-[10px]: Balanced internal padding for text safety
              */
              className={`flex flex-1 flex-col items-center justify-center py-[20px] px-[10px] gap-[12px] ${item.radius} transition-colors duration-300`}
            >
              {/* ICON: 30x30 locked */}
              <div className="relative w-[30px] h-[30px] shrink-0">
                <Image
                  src={item.icon}
                  alt={item.title}
                  fill
                  className="object-contain"
                  sizes="30px"
                />
              </div>

              {/* 
                TEXT: 16px Rajdhani
                - h-[40px] and leading-[20px] match Figma 2-line auto-layout
                - w-full ensures text centers within the 1/3rd grid
            */}
              <span
                className="w-full h-[40px] font-rajdhani text-[16px] font-medium leading-[20px] text-[#242424] text-center whitespace-pre-line overflow-hidden"
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* FRAME 168: Policy Bar */}
        <div className="flex items-center justify-center w-full h-[30px] bg-[#3F9733] rounded-[2px] self-stretch">
          <p className="font-rajdhani text-[12px] font-medium leading-[14px] text-white text-center">
            Easy Returns , Check Our{' '}
            <Link href="/info#return-policy" className="underline hover:opacity-80 transition-opacity">
              Return Policy
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default ServiceHighlights;
