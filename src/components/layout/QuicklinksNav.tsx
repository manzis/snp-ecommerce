"use client"; // Required for interactivity and animations

import React, { useState } from 'react';
import Link from 'next/link';
import ArrowDown from '@/components/icons/ArrowDown';

export default function QuickLinksNav() {
  // State to track which dropdown is currently open. null means all are closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleDropdown = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const navSections =[
    {
      label: 'Quick Links',
      items:[
        { text: 'Products', href: '/products', type: 'link' },
        { text: 'Brands', href: '/brands', type: 'link' },
        { text: 'Categories', href: '/categories', type: 'link' },
        { text: 'Essentials', href: '/essentials', type: 'link' },
      ]
    },
    {
      label: 'Partner with us',
      items:[
        { text: 'Contact us', href: '/contact', type: 'link' },
        { text: 'Mail us', href: 'mailto:partner@yourstore.com', type: 'link' },
        { text: 'Become a Seller', href: '/distributor', type: 'button' },
      ]
    },
    {
      label: 'Policies',
      items:[
        { text: 'Terms and condition', href: '/terms', type: 'link' },
        { text: 'Shipping policy', href: '/shipping', type: 'link' },
        { text: 'Return policy', href: '/return', type: 'link' },
        { text: 'Refund policy', href: '/refund', type: 'link' },
      ]
    },
    {
      label: 'Contact us',
      items:[
        { text: 'Kathmandu, Nepal', href: '#', type: 'text' },
        { text: '+977 9800000000', href: 'tel:+9779800000000', type: 'link' },
        { text: 'Contact Us', href: '/contact', type: 'button' },
      ]
    }
  ];

  return (
    <nav className="flex flex-col gap-[12px] items-start self-stretch shrink-0 px-[24px] pb-[16px] pt-[8px] md:px-0 md:w-[200px]">
      {navSections.map((section, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={section.label} className="w-full  pb-[8px] md:border-none md:pb-0">
            {/* 1. The Trigger Button */}
            <button 
              onClick={() => toggleDropdown(index)}
              className="flex justify-between items-center w-full self-stretch shrink-0 group focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-custom text-[20px] font-normal leading-[32px] text-white transition-colors hover:text-gray-300">
                {section.label}
              </span>
              <ArrowDown 
                className={`w-[20px] h-[20px] text-white opacity-80 transition-transform duration-300 ease-in-out ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </button>

            {/* 2. The Smooth Animated Dropdown Container */}
            <div 
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100 mt-[8px]' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden flex flex-col gap-[10px] pl-[4px]">
                {/* 3. Dropdown Content Mapping */}
                {section.items.map((item, itemIndex) => {
                  
                  // Render as a highlighted Button
                  if (item.type === 'button') {
                    return (
                      <Link 
                        key={itemIndex} 
                        href={item.href}
                        className="inline-flex mt-[4px] px-[16px] py-[8px] justify-center items-center bg-white text-black text-[16px] font-medium rounded-[4px] hover:bg-gray-200 transition-colors self-start"
                      >
                        {item.text}
                      </Link>
                    );
                  }

                  // Render as plain Text (e.g., Address)
                  if (item.type === 'text') {
                    return (
                      <span key={itemIndex} className="text-[16px] text-white/70 leading-[20px]">
                        {item.text}
                      </span>
                    );
                  }

                  // Render as a normal Link
                  return (
                    <Link 
                      key={itemIndex} 
                      href={item.href}
                      className="text-[16px] text-white/70 leading-[20px] hover:text-white transition-colors"
                    >
                      {item.text}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}