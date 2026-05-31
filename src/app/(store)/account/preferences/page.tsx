'use client';

import React from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';

const PreferencesPage = () => {
    return (
        <div className="min-h-screen bg-[#f7faf6] pt-[81px]">
            <DynamicPageNav title="Preferences" />
            <main className="mx-auto w-full max-w-[1280px] p-[24px]">
                <div className="rounded-[24px] bg-white p-[48px] text-center shadow-sm">
                    <p className="font-rajdhani text-[18px] text-[#242424]">Demo Page: Your preferences will appear here.</p>
                </div>
            </main>
        </div>
    );
};

export default PreferencesPage;
