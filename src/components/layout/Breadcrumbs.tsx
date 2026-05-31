import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumbs({ path }: { path: BreadcrumbItem[] }) {
  // Smart heuristic to estimate available horizontal space without browser measurement
  // TOTAL_BUDGET is the approximate character count that fits on a single line (mobile-conservative)
  const TOTAL_BUDGET = 70;
  const SPACING_OVERHEAD = path.length * 4; // Gaps, icons, and item padding
  const precedingLength = path.slice(0, -1).reduce((acc, item) => acc + item.name.length, 0);

  // Calculate dynamic limit (clamped between 15 and 50 characters)
  const MAX_CHARS = Math.min(50, Math.max(15, TOTAL_BUDGET - precedingLength - SPACING_OVERHEAD));

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex w-full lg:px-[60px] mx-auto min-w-0 px-[24px] pb-[16px] pt-[6px] items-center shrink-0 flex-wrap bg-white md:bg-transparent  "
    >
      <ol className="flex items-center gap-[2px] flex-wrap">
        {path.map((item, index) => {
          const isLast = index === path.length - 1;
          const displayName = isLast && item.name.length > MAX_CHARS
            ? item.name.substring(0, MAX_CHARS - 3) + '...'
            : item.name;

          return (
            <li key={`${index}-${item.href}`} className="flex items-center gap-[2px]">
              {!isLast ? (
                <>
                  <Link
                    href={item.href}
                    className="h-[14px] shrink-0 font-['Rajdhani',sans-serif] text-[12px] font-[500] leading-[14px] text-[#838383] whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                  <ChevronRightIcon className="w-[12px] h-[12px] shrink-0 text-[#838383]" aria-hidden="true" />
                </>
              ) : (
                <span
                  aria-current="page"
                  className="h-[14px] shrink-0 font-['Rajdhani',sans-serif] text-[12px] font-[500] leading-[14px] text-[#242424] whitespace-nowrap"
                >
                  {displayName}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
