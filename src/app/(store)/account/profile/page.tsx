import React, { Suspense } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { getProfile } from '@/app/actions/profile';
import { redirect } from 'next/navigation';

export default function ProfileEditPage() {
    return (
        <main
            className="relative min-h-screen w-full overflow-x-hidden bg-white mt-[100px]"
        >
            {/* CONTENT AREA */}
            <div className="relative z-10 mx-auto flex w-full max-w-[410px] flex-col lg:max-w-[1440px] pb-[40px]">
                <DynamicPageNav title="My Profile" />

                {/* FORM CONTAINER - Matches the 410px mobile width and scales for desktop */}
                <div className="mt-[24px] flex flex-col items-center gap-[32px] lg:mt-[60px]">
                    <div className="w-full bg-white rounded-[24px] lg:max-w-[800px] lg:px-[40px]">
                        <Suspense fallback={<ProfileSkeleton />}>
                            <ProfileContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    );
}

/**
 * Handles the async data fetching in isolation, allowing the rest of the page 
 * (Navigation, background) to render immediately via Streaming/Suspense.
 */
async function ProfileContent() {
    const profile = await getProfile();

    if (!profile) {
        redirect('/login?redirect=/account/profile');
    }

    return <ProfileEditForm initialData={profile} />;
}

/**
 * A lightweight skeleton that matches the form structure to prevent layout shifts.
 */
function ProfileSkeleton() {
    return (
        <div className="flex flex-col animate-pulse px-[24px] lg:px-0">
             {/* Avatar Skeleton */}
             <div className="flex flex-col gap-[12px] items-center self-stretch shrink-0 pb-[12px]">
                <div className="w-[80px] h-[80px] rounded-full bg-gray-100 border-2 border-gray-50" />
                <div className="w-[100px] h-[34px] rounded-[100px] bg-gray-50" />
            </div>

            {/* Field Skeletons */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-[8px] pt-[24px]">
                    <div className="w-[80px] h-[14px] bg-gray-100 rounded" />
                    <div className="w-full h-[48px] bg-gray-50 rounded-[12px]" />
                </div>
            ))}

            {/* Save Button Skeleton */}
            <div className="w-full h-[48px] bg-gray-100 rounded-[12px] mt-[32px]" />
        </div>
    );
}
