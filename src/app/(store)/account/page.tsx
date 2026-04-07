"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import AccountNav from '@/components/account/AccountNav';
import AccountHeader from '@/components/account/AccountHeader';
import AccountMenu from '@/components/account/AccountMenu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login?redirect=/account/profile');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#031f00]">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";

    return (
        <main
            className="relative min-h-screen w-full overflow-x-hidden"
            style={{
                background: 'linear-gradient(180deg, #031f00ff 0%, #318126 40%, #FFFFFF 65%, #FFFFFF 100%)'
            }}
        >

            <div
                className="absolute inset-0 z-0 h-[55%] w-full opacity-7 pointer-events-none"
                style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                }}
            >
                <Image
                    src="/images/line-pattern.png"
                    alt="Background Pattern"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* CONTENT AREA */}
            <div className="relative z-10 mx-auto flex w-full max-w-[410px] flex-col lg:max-w-[1440px]">
                <AccountNav />

                <div className="flex flex-col gap-[24px] items-center lg:pt-[40px]">
                    <AccountHeader
                        name={displayName}
                        avatarUrl="/images/avatar.png"
                    />

                    <AccountMenu />
                </div>
            </div>
        </main>
    );
}