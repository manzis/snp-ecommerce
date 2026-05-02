"use client"
import React from 'react';
import Link from 'next/link';
import BackIcon from '@/components/icons/BackIcon';
import SearchIcon from '@/components/icons/CartIcon';
import HelpIcon from '@/components/icons/HelpIcon';

const AccountNav: React.FC = () => {
    return (
        <nav className="flex h-[81px] w-full items-center gap-[8px] px-[24px] py-[16px]">
            {/* BACK BUTTON */}
            <Link href="/" className="flex h-[42px] w-[24px] items-center shrink-0">
                <BackIcon className="h-[24px] w-[24px] text-white" />
            </Link>

            {/* PAGE TITLE */}
            <div className="flex flex-1 items-center  gap-[10px]">
                <span className="font-titillium text-[20px] font-[600] leading-[26px] tracking-[-0.8px] text-white">
                    Account Settings
                </span>
            </div>

            {/* Cart Icon Pill */}
            <div className="flex h-[38px] w-[39px] items-center justify-center rounded-[200px] bg-white shrink-0">
                <SearchIcon className="h-[17px] w-[17px] text-[#242424]" />
            </div>

            {/* HELP PILL */}
            <div className="flex h-[38px] w-[74px] items-center justify-center gap-[4px] rounded-[100px] bg-white shrink-0">
                <HelpIcon className="h-[18px] w-[18px] text-[#242424]" />
                <span className="font-titillium text-[16px] font-[600] leading-[26px] tracking-[-0.03px] text-[#242424]">
                    Help
                </span>
            </div>


        </nav>
    );
};

export default AccountNav;
