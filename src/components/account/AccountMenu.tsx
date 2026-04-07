"use client"
import React from 'react';
import Link from 'next/link';
import ProfileIcon from '@/components/icons/AccountIcon';
import AddressIcon from '@/components/icons/AddressIcon';
import WishlistIcon from '@/components/icons/WishListIcon';
import PrefIcon from '@/components/icons/PreferencesIcon';
import NotificationIcon from '@/components/icons/NotificationIcon';
import RewardsIcon from '@/components/icons/DiscountIcon';
import ChevronRight from '@/components/icons/RightBackIcon';
import OrderIcon from '@/components/icons/PackageIcon';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

const MenuLink = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => (
    <Link href={href} className="flex w-full items-center justify-center gap-[8px] px-[16px] py-[14px] border-t border-[rgba(64,64,64,0.07)] first:border-none group">
        <Icon className="h-[22px] w-[22px] shrink-0 text-[#242424]" />
        <span className="flex-1 font-titillium text-[16px] font-[600] leading-[24px] tracking-[-0.03px] text-[#242424]">
            {label}
        </span>
        <ChevronRight className="h-[16px] w-[16px] shrink-0 text-[#242424] transition-transform group-hover:translate-x-1" />
    </Link>
);

const ProfileMenu: React.FC = () => {
    const router = useRouter();
    return (
        <section className="flex w-full flex-col gap-[12px] px-[24px] pb-[40px] lg:max-w-[500px]">
            {/* GROUP 1 */}
            <div className="flex flex-col rounded-[16px] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] backdrop-blur-md overflow-hidden">
                <MenuLink icon={ProfileIcon} label="My Profile" href="/account/profile" />
                <MenuLink icon={OrderIcon} label="Orders" href="/account/orders" />
                <MenuLink icon={AddressIcon} label="Saved Addresses" href="/account/addresses" />
                <MenuLink icon={WishlistIcon} label="Wishlist" href="/account/wishlist" />
            </div>

            {/* GROUP 2 */}
            <div className="flex flex-col rounded-[16px] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] backdrop-blur-md overflow-hidden">
                <MenuLink icon={PrefIcon} label="Preferences" href="/account/preferences" />
                <MenuLink icon={NotificationIcon} label="Emails and Notifications" href="/account/notifications" />
                <MenuLink icon={RewardsIcon} label="Rewards and Coupons" href="/account/rewards" />
            </div>

            {/* LOGOUT BUTTON */}
            <button
                onClick={async () => {
                    await AuthService.signOut();
                    router.push('/login');
                }}
                className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[12px] border-[1.5px] border-[#f0e4e4] bg-[linear-gradient(90deg,#ffffff,#ffefef)] px-[16px] py-[16px] transition-all active:scale-[0.98]"
            >
                <span className="font-titillium text-[16px] font-[600] leading-[24px] tracking-[-0.2px] text-[#b02900]">
                    Log Out
                </span>
            </button>
        </section>
    );
};

export default ProfileMenu;