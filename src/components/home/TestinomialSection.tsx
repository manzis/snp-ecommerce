"use client"

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import StarIcon from '@/components/icons/StarIcon3';
import ArrowRightIcon from '@/components/icons/RedirectIcon';

interface PartialReview {
    id: string;
    author: string;
    role: string | null;
    author_avatar?: string | null;
    created_at: string;
    rating: number;
    text: string;
    home_title?: string | null;
    image: string | null;
    media_type?: 'video' | 'image';
}

interface TestimonialSectionProps {
    testimonials?: PartialReview[];
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ testimonials = [] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const floatingTransition = (delay: number) => ({
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
        delay: delay
    });

    return (
        <section className="relative mx-auto flex w-full  flex-col items-center gap-[32px] bg-[#eaffe8] pb-[40px] pt-[180px] lg:max-w-[1440px] lg:rounded-[48px] lg:pt-[280px] ">

            {/* FLOATING ATHLETE IMAGES WITH SCATTER BLUR */}
            <div className="absolute top-[31.96px] left-[-24px] flex h-[126.96px] w-[460px] items-center justify-center lg:left-1/2 lg:-translate-x-1/2 lg:w-[800px] lg:h-[200px] lg:top-[50px]">

                {/* LEFT SCATTER PARTICLES */}
                <motion.div animate={{ x: [-5, 5, -5], y: [0, 15, 0], opacity: [0.4, 0.7, 0.4] }} transition={floatingTransition(0.2)} className="absolute left-[-20px] top-[40px] z-30 h-[24px] w-[24px] blur-[2px] lg:left-[-40px]">
                    <Image src="/images/athelete.jpg" alt="" fill className="rounded-full object-cover" />
                </motion.div>

                {/* Image 1: Left-most (Edge Mask Blur) */}
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [4.71, 6.71, 4.71] }}
                    transition={floatingTransition(0)}
                    className="absolute left-0 top-[32.10px] h-[94.85px] w-[82.05px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[120px] lg:h-[140px] lg:top-[45px] lg:left-0"
                >
                    <Image src="/images/athelete.jpg" alt="Athlete" fill className="object-cover" />
                    {/* 20% Edge Blur Mask */}
                    <div className="absolute inset-0 z-20 backdrop-blur-[4px] [mask-image:linear-gradient(to_right,black_0%,transparent_30%)]" />
                </motion.div>

                {/* Image 2 */}
                <motion.div animate={{ y: [0, 10, 0], rotate: [-4.89, -2.89, -4.89] }} transition={floatingTransition(0.5)} className="absolute left-[98px] top-0 h-[95.07px] w-[82.31px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[120px] lg:h-[140px] lg:top-0 lg:left-[170px]">
                    <Image src="/images/athelete-2.png" alt="Athlete" fill className="object-cover" />
                </motion.div>

                {/* Image 3 (Center) */}
                <motion.div animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }} transition={floatingTransition(1)} className="absolute left-[196px] top-[26.03px] h-[89px] w-[82px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[120px] lg:h-[130px] lg:top-[35px] lg:left-[340px]">
                    <Image src="/images/athelete4.jpg" alt="Athlete" fill className="object-cover" />
                </motion.div>

                {/* Image 4 */}
                <motion.div animate={{ y: [0, 8, 0], rotate: [7.72, 5.72, 7.72] }} transition={floatingTransition(1.5)} className="absolute left-[288px] top-[4.40px] h-[98.26px] w-[86.27px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[125px] lg:h-[145px] lg:top-[6px] lg:left-[510px]">
                    <Image src="/images/athelete-3.jpg" alt="Athlete" fill className="object-cover" />
                </motion.div>

                {/* Image 5: Right-most (Edge Mask Blur) */}
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [-1.21, 1.21, -1.21] }}
                    transition={floatingTransition(2)}
                    className="absolute left-[390px] top-[25.25px] h-[90.56px] w-[76.86px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[115px] lg:h-[135px] lg:top-[35px] lg:left-[680px]"
                >
                    <Image src="/images/athelete4.jpg" alt="Athlete" fill className="object-cover" />
                    {/* 20% Edge Blur Mask */}
                    <div className="absolute inset-0 z-20 backdrop-blur-[4px] [mask-image:linear-gradient(to_left,black_0%,transparent_30%)]" />
                </motion.div>

                {/* RIGHT SCATTER PARTICLES */}
                <motion.div animate={{ x: [5, -5, 5], y: [10, -10, 10], opacity: [0.3, 0.6, 0.3] }} transition={floatingTransition(0.8)} className="absolute right-[-10px] top-[20px] z-30 h-[20px] w-[20px] blur-[3px] lg:right-[-30px]">
                    <Image src="/images/athelete-2.png" alt="" fill className="rounded-full object-cover" />
                </motion.div>
            </div>

            {/* HEADER */}
            <div className="flex w-full flex-col items-center gap-[12px] px-[24px] lg:pb-[20px] text-center">
                <div className="inline-flex items-center justify-center rounded-[100px] bg-[#d5ffb2] px-[12px] py-[4px]">
                    <span className="font-titillium text-[16px] font-[400] leading-[24px] text-[#242424]">Testimonials</span>
                </div>
                <h2 className="w-full font-titillium text-[32px] font-[600] leading-[36px] tracking-[-0.64px] text-[#242424] lg:text-[48px] lg:leading-[54px]">
                    Trusted by Athletes<br />
                    <span className="text-[#5ca452]">from various industries</span>
                </h2>
                <p className="max-w-[362px] font-titillium text-[16px] font-[300] leading-[22px] text-[#242424] lg:max-w-[600px] lg:text-[18px]">
                    Learn why professional trainers and fitness athletes choose us over others
                </p>
            </div>

            {/* SLIDER & CONTROLS (Identical to previous working versions) */}
            <div className="relative w-full overflow-hidden">
                <div ref={scrollRef} className="no-scrollbar flex w-full gap-[12px] overflow-x-auto px-[24px] pb-[10px] lg:gap-[24px] lg:px-[64px]">
                    {testimonials.length > 0 ? (
                        testimonials.map((item) => (
                            <TestimonialCard key={item.id} review={item} />
                        ))
                    ) : (
                        <div className="flex h-[200px] w-full items-center justify-center text-center text-[#535353] italic">
                            No featured testimonials found.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex w-full items-center justify-end gap-[16px] px-[24px] lg:px-[64px]">
                <button onClick={() => scroll('left')} className="flex h-[36px] w-[36px] rotate-225 items-center justify-center rounded-full border border-[#308026] bg-white text-[#308026] transition-all hover:bg-[#308026] hover:text-white active:scale-90"><ArrowRightIcon className="h-[16px] w-[16px] " /></button>
                <button onClick={() => scroll('right')} className="flex h-[36px] w-[36px] rotate-45 items-center justify-center rounded-full border border-[#308026] bg-white text-[#308026] transition-all hover:bg-[#308026] hover:text-white active:scale-90"><ArrowRightIcon className="h-[16px] w-[16px]" /></button>
            </div>
        </section>
    );
};

const TestimonialCard = ({ review }: { review: PartialReview }) => {
    // Determine type based on existence of image/video
    const hasMedia = !!review.image;
    // VERY simple assumption: if image URL contains .mp4, it's a video. For real production, use a dedicated mediaType field.
    const isVideo = review.image?.toLowerCase().endsWith('.mp4') || review.image?.toLowerCase().endsWith('.webm');
    
    // Fallbacks
    const avatar = review.author_avatar || '/images/default-avatar.png';
    const cleanDate = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <article className={`relative flex h-[275px] w-[220px] shrink-0 flex-col justify-between overflow-hidden rounded-[24px] p-[16px] transition-all lg:w-[320px] lg:h-[350px] ${hasMedia ? 'border-none' : 'bg-white'}`}>
            {hasMedia && (
                <div className="absolute inset-0 z-0">
                    {isVideo 
                        ? <video src={review.image as string} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" /> 
                        : <Image src={review.image as string} alt="Review Media" fill className="object-cover" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
            )}
            <div className="relative z-10 flex flex-col gap-[20px]">
                <div className="flex items-start gap-[10px]">
                    <div className="relative h-[36px] w-[36px] shrink-0 overflow-hidden rounded-full border border-white/20">
                        <Image src={avatar} alt={review.author} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[15px] font-[600] leading-[18px] ${hasMedia ? 'text-white' : 'text-[#242424]'}`}>{review.author}</span>
                        <span className={`text-[11px] font-[400] ${hasMedia ? 'text-white/80' : 'text-[#535353]'}`}>{review.role || 'Verified Buyer'}</span>
                    </div>
                </div>
                {!hasMedia && (
                    <div className="flex flex-col gap-[6px]">
                        <span className="text-[16px] font-[600] text-[#242424]">
                            {review.home_title || "Excellent Product"}
                        </span>
                        <p className="line-clamp-4 text-[14px] font-[400] leading-[19px] text-[#535353]">{review.text}</p>
                    </div>
                )}
            </div>
            <div className="relative z-10 flex w-full items-center justify-between pt-[10px]">
                <div className="flex gap-[2px]">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-[14px] w-[14px] ${i < review.rating ? 'text-[#ffe900]' : 'text-gray-200'}`} />
                    ))}
                </div>
                <span className={`text-[10px] font-[400] ${hasMedia ? 'text-white' : 'text-[#979797]'}`}>{cleanDate}</span>
            </div>
        </article>
    );
};


export default TestimonialSection;