import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EditIcon from '@/components/icons/EditIcon';
import ArrowRightIcon from '@/components/icons/RightBackIcon';

interface ProfileHeaderProps {
    name: string;
    avatarUrl: string;
}

const AccountHeader: React.FC<ProfileHeaderProps> = ({ name, avatarUrl }) => {
    return (
        <section className="flex flex-col items-center gap-[24px] w-full px-[24px] pt-[30px]">
            <div className="flex flex-col items-center gap-[12px] shrink-0">
                {/* AVATAR & GREETING - Clickable for convenience */}
                <Link href="/account/profile" className="flex flex-col items-center gap-[12px] active:scale-[0.98] transition-transform">
                    {/* AVATAR */}
                    <div className="relative h-[75px] w-[75px] rounded-full overflow-hidden outline outline-2 outline-white">
                        <Image
                            src={avatarUrl || "/images/avatar.svg"}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* GREETING */}
                    <div className="font-rajdhani text-[22px] leading-[26px] tracking-[-0.4px] text-white uppercase whitespace-nowrap">
                        <span className="font-[600]">HI,</span>
                        <span className="font-[700]"> {name}</span>
                    </div>
                </Link>

                {/* ACTION BUTTONS */}
                <div className="flex gap-[8px] items-start shrink-0">
                    {/* EDIT BUTTON */}
                    <Link
                        href="/account/profile"
                        className="flex h-[34px] w-[65px] items-center justify-center gap-[4px] rounded-[100px] bg-white transition-transform active:scale-95"
                    >
                        <EditIcon className="w-[14px] h-[14px] text-[#242424]" />
                        <span className="font-rajdhani text-[16px] font-[600] leading-[10px] tracking-[-0.03px] text-[#242424]">Edit</span>
                    </Link>

                    {/* STORE BUTTON */}
                    <Link
                        href="/"
                        className="flex h-[34px] w-[79px] items-center justify-center gap-[4px] rounded-[100px] bg-[#eaffcc] transition-transform active:scale-95"
                    >
                        <span className="font-rajdhani text-[16px] font-[600] leading-[10px] tracking-[-0.03px] text-[#242424]">Store</span>
                        <ArrowRightIcon className="w-[14px] h-[14px] mb-[1px] text-[#242424]" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AccountHeader;
