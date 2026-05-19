'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChevronLeftIcon from '@/components/icons/BackIcon';

interface DynamicPageNavProps {
  title: string;
  subtitle?: string; // Optional: "28 Brands", "12 Items", etc.
  onBack?: () => void;
  showBack?: boolean;
}

const DynamicPageNav: React.FC<DynamicPageNavProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true
}) => {
  const router = useRouter();
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsClickable(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!isClickable) return;
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
      <nav className="pointer-events-auto relative flex h-[81px] w-full   items-center gap-[4px] bg-white px-[24px] py-[16px] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        {/* Back Button */}
        {showBack && (
          <button
            onClick={handleBack}
            type="button"
            className="flex h-[42px] w-[42px] shrink-0 items-center rounded-[5px] active:scale-95 transition-transform outline-none"
            aria-label="Go back"
          >
            <div className="h-[24px] w-[24px]">
              <ChevronLeftIcon className="h-full w-full text-[#242424]" />
            </div>
          </button>
        )}

        {/* Title Section */}
        <div className="flex flex-grow items-center overflow-hidden">
          <h1 className="truncate font-titillium text-[20px] font-semibold leading-[26px] tracking-[-0.88px] text-[#242424]">
            {title}
          </h1>
        </div>

        {/* Subtitle / Meta Info */}
        {subtitle && (
          <span className="shrink-0 font-titillium text-[14px] font-normal leading-[20px] tracking-[-0.64px] text-[#838383]">
            {subtitle}
          </span>
        )}
      </nav>
    </div>
  );
};

export default DynamicPageNav;
