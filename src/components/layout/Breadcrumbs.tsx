import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumbs({ path }: { path: BreadcrumbItem[] }) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex w-full  md:max-w-7xl mx-auto min-w-0 px-[24px] py-[16px] items-center shrink-0 flex-wrap bg-white md:bg-transparent  "
    >
      <ol className="flex items-center gap-[2px] flex-wrap">
        {path.map((item, index) => (
          <li key={item.href} className="flex items-center gap-[2px]">
            {index < path.length - 1 ? (
              <>
                <Link 
                  href={item.href}
                  className="h-[14px] shrink-0 font-['Titillium_Web',sans-serif] text-[12px] font-[400] leading-[14px] text-[#838383] whitespace-nowrap"
                >
                  {item.name}
                </Link>
                <ChevronRightIcon className="w-[12px] h-[12px] shrink-0 text-[#838383]" aria-hidden="true" />
              </>
            ) : (
              <span 
                aria-current="page"
                className="h-[14px] shrink-0 font-['Titillium_Web',sans-serif] text-[12px] font-[400] leading-[14px] text-[#242424] whitespace-nowrap"
              >
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}