"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
            router.push('/login?redirect=/account');
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
    const avatarUrl = user.user_metadata?.avatar_url || "/images/avatar.png";

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden">

            {/* FIXED BACKGROUND SYSTEM */}
            <div className="absolute top-0 inset-0 z-0 w-full h-[100dvh] pointer-events-none overflow-hidden">

                {/* 1. Base Gradient Layer - GPU LOCKED */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        background: 'linear-gradient(180deg, #031f00 0%, #318126 30%, #85be7c 50%, #e9f1e7ff 70%, #FFFFFF 90%)',
                        transform: 'translate3d(0,0,0)',
                        WebkitTransform: 'translate3d(0,0,0)',
                    }}
                />

                {/* 2. Animated Pattern Layer */}
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                    style={{
                        transform: 'translate3d(0,0,0)',
                        WebkitTransform: 'translate3d(0,0,0)'
                    }}
                >
                    <div className="fixed h-[55%] w-full opacity-7">
                        <Image
                            src="/images/line-pattern.png"
                            alt="Background Pattern"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div
                            className="fixed "
                            style={{
                                background: 'linear-gradient(to bottom, transparent 40%, #318126 100%)'
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* CONTENT AREA */}
            <div className="relative z-10 mx-auto flex w-full max-w-[410px] flex-col lg:max-w-[1440px]">
                <div className="sticky top-0 z-50 w-full">
                    <AccountNav />
                </div>

                <div className="flex flex-col gap-[24px] items-center lg:pt-[40px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <AccountHeader
                        name={displayName}
                        avatarUrl={avatarUrl}
                    />
                    <AccountMenu />
                </div>
            </div>
        </main>
    );
}