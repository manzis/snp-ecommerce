"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh(); // Refresh to catch navigation states
        router.push('/');
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-[#fcfff8]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#3f9633] border-t-transparent animate-spin"></div>
                    <p className="font-titillium text-[#3f9633] font-semibold tracking-wide animate-pulse">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#fcfff8] font-titillium pt-[40px] pb-[100px] px-4">
            <div className="max-w-[800px] mx-auto w-full">
                
                {/* Header Banner */}
                <div className="relative w-full h-[200px] rounded-t-[24px] overflow-hidden bg-[linear-gradient(135deg,#3f9633_0%,#87c03d_100%)] shadow-sm">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>

                {/* Profile Information Block */}
                <div className="relative bg-white rounded-b-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] px-[32px] pb-[40px] pt-[80px] mt-[-20px]">
                    
                    {/* Floating Avatar */}
                    <div className="absolute top-[-50px] left-[32px] w-[100px] h-[100px] rounded-full p-[4px] bg-white shadow-md">
                        <div className="w-full h-full rounded-full bg-[#f1f5f9] border border-[#eaebf0] flex items-center justify-center overflow-hidden">
                            <span className="text-[36px] font-bold text-[#3f9633]">
                                {user.email ? user.email.charAt(0).toUpperCase() : (user.phone ? user.phone.charAt(1) : "U")}
                            </span>
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-[6px] right-[6px] w-[20px] h-[20px] rounded-full border-[3px] border-white bg-green-500"></div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-[24px]">
                        
                        {/* Details */}
                        <div className="flex flex-col gap-[4px] text-left">
                            <h1 className="text-[28px] md:text-[32px] font-custom text-[#242424] leading-tight">
                                My Account
                            </h1>
                            <div className="flex items-center gap-[8px] mt-[4px]">
                                <span className="px-[12px] py-[4px] rounded-full bg-[#edffe7] text-[#308026] text-[13px] font-bold tracking-wider uppercase border border-[#b1e7aa]">
                                    Verified User
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="h-[48px] px-[24px] rounded-[12px] bg-[#fff0f0] text-[#e53935] border border-[#ffe0e0] font-semibold text-[16px] transition-all hover:bg-[#ffe0e0] active:scale-95 flex items-center justify-center gap-[8px] disabled:opacity-50"
                        >
                            {isLoggingOut ? "Signing Out..." : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                    Sign Out
                                </>
                            )}
                        </button>
                    </div>

                    {/* Data Section */}
                    <div className="mt-[40px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                        
                        {/* Registered Email / Phone */}
                        <div className="flex flex-col gap-[6px] p-[20px] rounded-[16px] border border-[#eaebf0] bg-[#fcfff8]">
                            <span className="text-[13px] font-bold text-[#68727d] uppercase tracking-wider">Contact Identifier</span>
                            <span className="text-[18px] font-semibold text-[#242424]">
                                {user.email || user.phone || "Not Provided"}
                            </span>
                        </div>

                        {/* User UUID */}
                        <div className="flex flex-col gap-[6px] p-[20px] rounded-[16px] border border-[#eaebf0] bg-[#fcfff8]">
                            <span className="text-[13px] font-bold text-[#68727d] uppercase tracking-wider">Account ID</span>
                            <span className="text-[14px] font-mono text-[#68727d] break-all">
                                {user.id}
                            </span>
                        </div>
                        
                    </div>
                </div>

            </div>
        </main>
    );
}
