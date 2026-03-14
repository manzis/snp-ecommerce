import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Icon imports from your established library
import FacebookIcon from '@/components/icons/FacebookIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import WhatsAppIcon from '@/components/icons/WhatsappIcon';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import FooterLogoIcon from '@/components/icons/FooterLogoIcon';
import SmileyFaceIcon from '@/components/icons/SmileyFaceIcon';
import QuickLinksNav from './QuicklinksNav';


const Footer = () => {
  return (
    <footer className="mx-auto w-full max-w-[1280px] bg-[#308026] px-[4px] pt-[4px]  rounded-t-[24px] flex flex-col gap-[16px] items-start flex-nowrap relative ">
      
      {/* 1. TOP CTA SECTION (The "Rock Bottom" Card) */}
      <section className="flex flex-col gap-[16px] justify-center items-center self-stretch shrink-0 flex-nowrap bg-[#164210] px-[24px] pt-[28px] pb-[32px] rounded-[24px] border-b-[2px] border-[#e5e5e5] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] relative">
        <div className="w-full text-center font-titillium text-[16px] leading-[24px] text-white">
          <span className="font-semibold">Stop Scrolling now !</span>
          <span className="font-light"> You have hit the rock bottom !</span>
        </div>

        <div className="flex flex-col gap-[12px] justify-center items-center self-stretch shrink-0">
          <h2 className="w-full text-center font-custom text-[24px] font-normal leading-[32px] tracking-[-0.24px] text-white uppercase">
            REWARD YOUR <br />
            <span className="text-[#bdff60]">OVERWORKED THUMBS</span>
          </h2>

          <button 
            type="button"
            className="flex w-[162px] py-[3px] px-[8px] gap-[2px] justify-center items-center shrink-0 bg-[#ffe900] rounded-tl-[10px] rounded-tr-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
          >
            <span className="font-titillium text-[16px] font-normal leading-[24px] text-[#242424] tracking-[-0.64px] whitespace-nowrap">
              Complete your order
            </span>
            <SmileyFaceIcon className="w-[18px] h-[18px] text-[#242424]" />
          </button>
        </div>
      </section>

      {/* 2. MIDDLE SECTION (Newsletter + Socials + Links) */}
      <div className="flex flex-col gap-[28px] items-start self-stretch shrink-0 py-[12px] px-0 ] relative md:flex-row md:justify-between md:items-start md:px-[24px]">
        
        {/* Newsletter & Socials Group */}
        <div className="flex flex-col gap-[16px] items-start self-stretch shrink-0 px-[24px] md:px-0 md:w-1/2">
          <p className="w-full font-custom text-[24px] font-normal leading-[32px] text-white uppercase">
            nuts about health? join our newsletter today !
          </p>
          
          <div className="flex flex-col gap-[24px] items-start self-stretch shrink-0">
            {/* Newsletter Form */}
            <form className="flex p-[6px] justify-between items-center self-stretch shrink-0 bg-white rounded-[100px] relative">
              <input 
                type="email"
                placeholder="Enter your email"
                className="flex-grow font-titillium text-[18px] font-normal leading-[34px] text-[#242424] px-[18px] bg-transparent outline-none placeholder:text-[#979797]"
              />
              <button 
                type="submit"
                className="w-[50px] h-[50px] shrink-0 bg-[#32d71d] rounded-full flex items-center justify-center"
              >
                <ArrowRightIcon className="w-[18px] h-[18px] text-white" />
              </button>
            </form>

            {/* Social Links */}
            <nav className="flex gap-[12px] items-start self-stretch shrink-0">
              <Link href="#" className="flex gap-[4px] items-center shrink-0">
                <FacebookIcon className="w-[16px] h-[16px] text-white" />
                <span className="font-titillium text-[16px] leading-[18px] text-white underline">Facebook</span>
              </Link>
              <Link href="#" className="flex gap-[4px] items-center shrink-0">
                <InstagramIcon className="w-[16px] h-[16px] text-white" />
                <span className="font-titillium text-[16px] leading-[18px] text-white underline">Instagram</span>
              </Link>
              <Link href="#" className="flex gap-[4px] items-center shrink-0">
                <WhatsAppIcon className="w-[16px] h-[16px] text-white" />
                <span className="font-titillium text-[16px] leading-[18px] text-white underline">Whatsapp</span>
              </Link>
            </nav>
          </div>
        </div>

      <QuickLinksNav />

      </div>

      {/* 3. BOTTOM LEGAL SECTION */}
      <section className="flex flex-col gap-[6px] justify-center items-center self-stretch  px-[24px] border-t border-[#e5e5e5] pt-[24px] rounded-t-[16px] relative  pb-[24px]">
        <div className="flex gap-[2px] items-center shrink-0 ">
          <FooterLogoIcon className="w-[20px] h-[20px] text-white" />
          <span className="font-custom text-[16px] font-normal leading-[20px] text-white">
            Supplyment Nepal 2026
          </span>
        </div>
        <span className="font-titillium text-[12px] font-light leading-[18px] text-white opacity-90">
          Powerered By Bright Nepcare Pvt. Ltd.
        </span>
      </section>

    </footer>
  );
};

export default Footer;