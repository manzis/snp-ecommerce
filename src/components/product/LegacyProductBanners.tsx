'use client';

import React from 'react';
import Image from 'next/image';

interface LegacyProductBannersProps {
    banners: (string | undefined)[];
}

export default function LegacyProductBanners({ banners }: LegacyProductBannersProps) {
    const validBanners = banners.filter(Boolean);
    if (validBanners.length === 0) return null;

    // Layout as described: 2 horizontal, 2 square (1080x1080)
    // We'll assume the first two are horizontal and the next two are square

    return (
        <div className="w-full flex flex-col gap-4 lg:gap-8 px-6 lg:px-0">
            {/* Horizontal Banners Section */}
            {(banners[0] || banners[1]) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                    {banners[0] && (
                        <div className="relative aspect-[21/9] md:aspect-[16/7] w-full rounded-2xl overflow-hidden bg-gray-100">
                            <Image
                                src={banners[0]}
                                alt="Product Promotional Banner 1"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    )}
                    {banners[1] && (
                        <div className="relative aspect-[21/9] md:aspect-[16/7] w-full rounded-2xl overflow-hidden bg-gray-100">
                            <Image
                                src={banners[1]}
                                alt="Product Promotional Banner 2"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Square Banners Section (1080x1080) */}
            {(banners[2] || banners[3]) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {banners[2] && (
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
                            <Image
                                src={banners[2]}
                                alt="Product Highlight Banner 1"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    )}
                    {banners[3] && (
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
                            <Image
                                src={banners[3]}
                                alt="Product Highlight Banner 2"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
