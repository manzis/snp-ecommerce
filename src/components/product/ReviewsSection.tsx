'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MediaLightbox, { LightboxMedia } from '@/components/ui/MediaLightBox'; // Import the new Lightbox

// Icons
import StarIcon from '@/components/icons/GreenStar';
import VerifiedIcon from '@/components/icons/VerifiedIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import PostIcon from '@/components/icons/EditIcon';

import type { Review } from '@/services/productService';

interface ReviewsSectionProps {
  reviews: Review[];
}

const themes = [
  { bg: 'bg-[#FFE900]', text: 'bg-[linear-gradient(59.84deg,#242424,#979047)]', author: 'text-[#242424]', verified: 'text-[#3F9633]' },
  { bg: 'bg-[#FFFFFF]', text: 'bg-[linear-gradient(59.84deg,#242424,#FFFFFF)]', author: 'text-[#242424]', verified: 'text-[#3F9633]' },
  { bg: 'bg-[#3F9633]', text: 'bg-[linear-gradient(59.84deg,#FFFFFF,#CBFFC4)]', author: 'text-[#F8F8F8]', verified: 'text-[#FFFFFF]' },
  { bg: 'bg-[#334F96]', text: 'bg-[linear-gradient(59.84deg,#FFFFFF,#CBFFC4)]', author: 'text-[#F8F8F8]', verified: 'text-[#FFFFFF]' }
];

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews = [] }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Map reviews into the format the Lightbox expects
  const lightboxMedia: LightboxMedia[] = reviews.map(review => ({
    type: review.image?.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image',
    url: review.image || '/images/default-review.png',
    alt: `Review by ${review.author}`
  }));

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <section className="main-container  relative mx-auto flex w-full max-w-[700px] flex-col items-start gap-[24px] lg:mx-0 lg:max-w-none border-t border-b border-[#F1F5F9] py-[24px] ">

        {/* HEADER ROW */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between cursor-pointer select-none group px-[24px]"
        >
          <h2 className="font-rajdhani text-[20px] font-bold leading-[18px] tracking-[-0.4px] text-[#242424] group-active:opacity-80 transition-opacity">
            Rating and Reviews
          </h2>
          <button className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px]   outline-none overflow-hidden group-active:scale-95 transition-transform duration-300">
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <DropDownIcon className="h-[16px] w-[16px] text-black" />
            </div>
          </button>
        </div>

        {isExpanded && (
          <div className="w-full flex flex-col gap-6">
            {/* HORIZONTAL SCROLLABLE REVIEWS */}
            <div className="w-full overflow-x-auto no-scrollbar px-[24px]">
              <div className="flex flex-row gap-[12px] lg:gap-[16px] pb-2">
                {reviews.length === 0 ? (
                  <div className="px-[12px] py-[24px] text-sm text-[#797979]">No reviews yet. Be the first to review!</div>
                ) : (
                  reviews.map((review, index) => {
                    const theme = themes[index % themes.length];
                    const isVideo = review.image?.match(/\.(mp4|webm|mov|ogg)$/i);
                    const hasMedia = !!review.image;

                    return (
                      <div
                        key={review.id}
                        onClick={() => hasMedia && handleOpenLightbox(index)}
                        className={`relative group/review flex ${hasMedia ? 'h-[290px]' : 'h-[220px]'} w-[225px] flex-shrink-0 flex-col rounded-[8px] border-[2px] border-white p-[2px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] overflow-hidden cursor-pointer transition-transform ${!hasMedia ? theme.bg : 'bg-white'}`}
                      >
                        {/* 1. Base Layer: Content Media (Photo/Video) */}
                        {hasMedia && (
                          <div className="relative h-full w-full rounded-[6px] overflow-hidden bg-gray-50">
                            {isVideo ? (
                              <video
                                src={review.image!}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                autoPlay
                                loop
                              />
                            ) : (
                              <Image
                                src={review.image || '/images/default-review.png'}
                                alt="Reviewed Product"
                                fill
                                className="object-cover"
                                sizes="225px"
                              />
                            )}
                            {/* Video Indicator */}
                            {isVideo && (
                              <div className="absolute top-2 left-2 z-30 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/20">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Top Layer: Rating Badge */}
                        <div className="absolute right-[8px] top-[8px] z-20 flex h-[26px] items-center justify-center gap-[4px] rounded-[6px] bg-white/90 backdrop-blur-md px-[8px] py-[4px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] pointer-events-none">
                          <StarIcon className="h-[12px] w-[12px]" />
                          <div className="font-rajdhani text-[11px] font-bold text-[#242424]">
                            {Number(review.rating).toFixed(1)}
                          </div>
                        </div>

                        {/* 3. Smooth Interactive Text Overlay (or static text if no media) */}
                        <div
                          className={`
                          ${hasMedia
                              ? `absolute bottom-[2px] left-[2px] right-[2px] z-10 p-[12px] rounded-[6px] ${theme.bg} translate-y-0 opacity-100 lg:translate-y-full lg:opacity-0 lg:group-hover/review:translate-y-0 lg:group-hover/review:opacity-100 transition-all duration-300`
                              : "relative h-full flex flex-col justify-center items-center p-[20px] pt-[40px]"}
                          flex flex-col gap-[6px] overflow-hidden pointer-events-none
                        `}
                        >
                          <div className="flex flex-col items-center justify-center gap-[8px] self-stretch text-center relative z-10">
                            <span
                              className={`font-rajdhani font-bold text-[14px] leading-[18px] tracking-[0.1px] bg-clip-text text-transparent line-clamp-6 ${theme.text}`}
                              style={{ maskImage: !hasMedia ? 'none' : 'linear-gradient(to bottom, black 80%, rgba(0,0,0,0.5) 100%)', WebkitMaskImage: !hasMedia ? 'none' : 'linear-gradient(to bottom, black 80%, rgba(0,0,0,0.5) 100%)' }}
                            >
                              {review.text}
                            </span>
                            <div className="flex flex-col items-center gap-[6px]">
                              <div className="flex items-center gap-[6px]">
                                {/* Author Avatar in Overlay */}
                                <div className={`w-[20px] h-[20px] rounded-full overflow-hidden relative border border-black/5 flex items-center justify-center text-[10px] font-bold ${!hasMedia ? 'bg-black/10' : 'bg-black/10'}`}>
                                  {review.author_avatar ? (
                                    <Image src={review.author_avatar} alt="" fill className="object-cover" />
                                  ) : (
                                    <span className={`${theme.author} font-rajdhani`}>{review.author?.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <span className={`font-rajdhani text-[10px] leading-[12px] tracking-[0.1px] font-bold ${theme.author}`}>
                                  {review.author}
                                </span>
                              </div>
                              <div className="flex items-center gap-[2px]">
                                <VerifiedIcon className="h-[10px] w-[10px]" />
                                <span className={`font-rajdhani text-[8px] font-semibold leading-[7px] ${theme.verified}`}>
                                  Verified Buyer
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Original Smooth Continuous Shine (Only if media exists to make it pop) */}
                          {hasMedia && (
                            <div
                              className="absolute inset-0 z-20 w-[50%] animate-[shimmerEffect_2.5s_linear_infinite_2.2s] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none mix-blend-overlay"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* VIEW ALL CARD */}
                {reviews.length >= 7 && (
                  <button className="flex h-[290px] w-[84px] flex-shrink-0 flex-col items-center justify-center gap-[6px] rounded-[8px] border-[2px] border-white bg-[#FAFBFC] p-[8px_12px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] active:scale-95 transition-transform outline-none">
                    <span className="font-inter text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-[#252525]">
                      View all
                    </span>
                    <div className="relative h-[27px] w-[26px] -rotate-90">
                      <DropDownIcon className="h-full w-full text-black" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* POST REVIEW BUTTON */}
            <div className="w-full pt-[10px] px-[24px]">
              <button className="relative flex w-full items-center justify-center gap-[6px] rounded-[6px] border border-[#EAEBF0] bg-white p-[8px_12px] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-[0.98] transition-all outline-none">
                <PostIcon className="h-[20px] w-[20px] text-[#242424]" />
                <span className="font-inter text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-[#242424]">
                  Post your Review
                </span>
                <div className="absolute right-[12px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] -rotate-90">
                  <DropDownIcon className="h-full w-full text-black" />
                </div>
              </button>
            </div>
          </div>
        )}

      </section>

      {/* RENDER THE LIGHTBOX GLOBALLY */}
      <MediaLightbox
        isOpen={isLightboxOpen}
        media={lightboxMedia}
        initialIndex={activeImageIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export default ReviewsSection;
