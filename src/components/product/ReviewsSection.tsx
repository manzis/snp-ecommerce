'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import MediaLightbox, { LightboxMedia } from '@/components/ui/MediaLightBox'; // Import the new Lightbox

// Icons
import StarIcon from '@/components/icons/GreenStar';
import VerifiedIcon from '@/components/icons/VerifiedIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import PostIcon from '@/components/icons/GreenStar';

interface Review {
  id: number;
  author: string;
  role: string;
  text: string;
  rating: string;
  image: string;
}

const reviewsData: Review[] = [
  { id: 1, author: "Manjish Upadhaya", role: "Athlete", text: "“ Loved the Purchase from Supplement Nepal, will purchase again”", rating: "4.3", image: "/images/review1.png" },
  { id: 2, author: "Sujal Shrestha", role: "Bodybuilder", text: "“ The quality of the protein is unmatched in the local market. ”", rating: "4.8", image: "/images/review2.png" },
  { id: 3, author: "Ankit Thapa", role: "Fitness Coach", text: "“ Super fast delivery and 100% authentic products. Trusted! ”", rating: "4.5", image: "/images/review3.png" },
  { id: 4, author: "Rohan Gurung", role: "Gym Enthusiast", text: "“ The atom whey chocolate flavor is just amazing. Loved it! ”", rating: "4.3", image: "/images/review4.png" },
  { id: 5, author: "Rohan Gurung", role: "Gym Enthusiast", text: "“ The atom whey chocolate flavor is just amazing. Loved it! ”", rating: "4.3", image: "/images/review4.png" }
];

const themes = [
  { bg: 'bg-[#FFE900]', text: 'bg-[linear-gradient(59.84deg,#242424,#FFE900)]', author: 'text-[#242424]', verified: 'text-[#3F9633]' },
  { bg: 'bg-[#FFFFFF]', text: 'bg-[linear-gradient(59.84deg,#242424,#FFFFFF)]', author: 'text-[#242424]', verified: 'text-[#3F9633]' },
  { bg: 'bg-[#3F9633]', text: 'bg-[linear-gradient(59.84deg,#FFFFFF,#CBFFC4)]', author: 'text-[#F8F8F8]', verified: 'text-[#FFFFFF]' },
  { bg: 'bg-[#334F96]', text: 'bg-[linear-gradient(59.84deg,#FFFFFF,#CBFFC4)]', author: 'text-[#F8F8F8]', verified: 'text-[#FFFFFF]' }
];

const ReviewsSection: React.FC = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Map reviews into the format the Lightbox expects
  const lightboxMedia: LightboxMedia[] = reviewsData.map(review => ({
    type: 'image',
    url: review.image,
    alt: `Review by ${review.author}`
  }));

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <section className="main-container relative mx-auto flex w-full max-w-[700px] flex-col items-start gap-[24px] lg:mx-0 lg:max-w-none">

        {/* HEADER ROW */}
        <div className="flex w-full items-center justify-between">
          <h2 className="font-titillium text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424]">
            Rating and Reviews
          </h2>
          <button className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[#EAEBF0] bg-[#FAFBFC] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-transform outline-none">
            <DropDownIcon className="h-[16px] w-[16px] text-black" />
          </button>
        </div>

        {/* HORIZONTAL SCROLLABLE REVIEWS */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex flex-row gap-[6px] lg:gap-[16px] pb-2">
            {reviewsData.map((review, index) => {
              const theme = themes[index % themes.length];
              return (
                <motion.div
                  key={review.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.6 }}
                  onClick={() => handleOpenLightbox(index)} // Opens dedicated Lightbox
                  className="relative flex h-[290px] w-[225px] flex-shrink-0 flex-col rounded-[8px] border-[2px] border-white p-[2px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] overflow-hidden bg-white cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {/* 1. Base Layer: Product Image */}
                  <div className="relative h-full w-full rounded-[6px] overflow-hidden">
                    <Image
                      src={review.image}
                      alt="Reviewed Product"
                      fill
                      className="object-cover"
                      sizes="225px"
                    />
                  </div>

                  {/* 2. Top Layer: Rating Badge */}
                  <div className="absolute right-[8px] top-[8px] z-20 flex h-[26px] w-[62px] items-center justify-center gap-[2px] rounded-[4px] bg-white px-[4px] py-[4px] shadow-sm pointer-events-none">
                    <StarIcon className="h-[14px] w-[14px]" />
                    <div className="font-titillium text-[12px] font-semibold text-[#242424]">
                      {review.rating}<span className="font-normal opacity-60">/5.0</span>
                    </div>
                  </div>

                  {/* 3. Bouncy Animated Text Overlay */}
                  <motion.div
                    variants={{
                      hidden: { y: "150%" },
                      visible: { y: 0 }
                    }}
                    transition={{
                      delay: 1.2,
                      type: "spring",
                      stiffness: 140,
                      damping: 12,
                      mass: 0.8
                    }}
                    className={`absolute bottom-[2px] left-[2px] right-[2px] z-10 flex flex-col gap-[6px] p-[12px_12px_8px_12px] rounded-[6px] overflow-hidden pointer-events-none ${theme.bg}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-[8px] self-stretch text-center relative z-10">
                      <span className={`font-custom text-[14px] leading-[18px] tracking-[0.1px] bg-clip-text text-transparent ${theme.text}`}>
                        {review.text}
                      </span>
                      <div className="flex flex-col items-center gap-[4px]">
                        <span className={`font-titillium text-[10px] leading-[12px] tracking-[0.1px] ${theme.author}`}>
                          {review.author} | {review.role}
                        </span>
                        <div className="flex items-center gap-[2px]">
                          <VerifiedIcon className="h-[10px] w-[10px]" />
                          <span className={`font-titillium text-[8px] font-semibold leading-[7px] ${theme.verified}`}>
                            Verified Buyer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Original Smooth Continuous Shine */}
                    <motion.div
                      initial={{ x: "-150%" }}
                      animate={{ x: "250%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 2.5,
                        delay: 2.2,
                        ease: "linear"
                      }}
                      className="absolute inset-0 z-20 w-[50%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none mix-blend-overlay"
                    />
                  </motion.div>
                </motion.div>
              );
            })}

            {/* VIEW ALL CARD */}
            <button className="flex h-[290px] w-[84px] flex-shrink-0 flex-col items-center justify-center gap-[6px] rounded-[8px] border-[2px] border-white bg-[#FAFBFC] p-[8px_12px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] active:scale-95 transition-transform outline-none">
              <span className="font-inter text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-[#252525]">
                View all
              </span>
              <div className="relative h-[27px] w-[26px] -rotate-90">
                <DropDownIcon className="h-full w-full text-black" />
              </div>
            </button>
          </div>
        </div>

        {/* POST REVIEW BUTTON */}
        <div className="w-full pt-[10px]">
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