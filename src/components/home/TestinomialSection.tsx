"use client"

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import StarIcon from '@/components/icons/StarIcon3';
import ArrowRightIcon from '@/components/icons/RedirectIcon';
import MediaLightbox, { LightboxMedia } from '@/components/ui/MediaLightBox';

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
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<LightboxMedia[]>([]);

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

    const openLightbox = (mediaUrl: string, type: 'image' | 'video', author: string) => {
        setSelectedMedia([{
            url: mediaUrl,
            type: type,
            alt: `Review by ${author}`
        }]);
        setLightboxOpen(true);
    };

    return (
        <section className="relative mx-auto flex w-full  flex-col items-center gap-[32px] bg-[#eaffe8] pb-[40px] pt-[180px] lg:max-w-[1440px]  lg:pt-[280px] ">
            {/* ... athlete images ... */}
            <div className="absolute top-[31.96px] left-[-24px] flex h-[126.96px] w-[460px] items-center justify-center lg:left-1/2 lg:-translate-x-1/2 lg:w-[800px] lg:h-[200px] lg:top-[50px]">
                {/* LEFT SCATTER PARTICLES */}
                <motion.div animate={{ x: [-5, 5, -5], y: [0, 15, 0], opacity: [0.4, 0.7, 0.4] }} transition={floatingTransition(0.2)} className="absolute left-[-20px] top-[40px] z-30 h-[24px] w-[24px] blur-[2px] lg:left-[-40px]">
                    <Image src="/images/athelete.jpg" alt="Professional athlete testimonial" fill sizes="24px" className="rounded-full object-cover" />
                </motion.div>

                {/* Image 1 */}
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [4.71, 6.71, 4.71] }}
                    transition={floatingTransition(0)}
                    className="absolute left-0 top-[32.10px] h-[94.85px] w-[82.05px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[120px] lg:h-[140px] lg:top-[45px] lg:left-0"
                >
                    <Image src="/images/athelete.jpg" alt="Athlete" fill sizes="(max-width: 1024px) 82px, 120px" className="object-cover" />
                    <div className="absolute inset-0 z-20 backdrop-blur-[4px] [mask-image:linear-gradient(to_right,black_0%,transparent_30%)]" />
                </motion.div>
                {/* Image 2 */}
                <motion.div animate={{ y: [0, 10, 0], rotate: [-4.89, -2.89, -4.89] }} transition={floatingTransition(0.5)} className="absolute left-[98px] top-0 h-[95.07px] w-[82.31px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[120px] lg:h-[140px] lg:top-0 lg:left-[170px]">
                    <Image src="/images/athelete-2.png" alt="Athlete" fill sizes="(max-width: 1024px) 82px, 120px" className="object-cover" />
                </motion.div>
                {/* Image 3 */}
                <motion.div animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }} transition={floatingTransition(1)} className="absolute left-[196px] top-[26.03px] h-[89px] w-[82px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[120px] lg:h-[130px] lg:top-[35px] lg:left-[340px]">
                    <Image src="/images/athelete4.jpg" alt="Athlete" fill sizes="(max-width: 1024px) 82px, 120px" className="object-cover" />
                </motion.div>
                {/* Image 4 */}
                <motion.div animate={{ y: [0, 8, 0], rotate: [7.72, 5.72, 7.72] }} transition={floatingTransition(1.5)} className="absolute left-[288px] top-[4.40px] h-[98.26px] w-[86.27px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[125px] lg:h-[145px] lg:top-[6px] lg:left-[510px]">
                    <Image src="/images/athelete-3.jpg" alt="Athlete" fill sizes="(max-width: 1024px) 86px, 125px" className="object-cover" />
                </motion.div>
                {/* Image 5 */}
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [-1.21, 1.21, -1.21] }}
                    transition={floatingTransition(2)}
                    className="absolute left-[390px] top-[25.25px] h-[90.56px] w-[76.86px] overflow-hidden rounded-[6px] border border-[#f1f5f9] shadow-sm bg-white lg:w-[115px] lg:h-[135px] lg:top-[35px] lg:left-[680px]"
                >
                    <Image src="/images/athelete4.jpg" alt="Athlete" fill sizes="(max-width: 1024px) 76px, 115px" className="object-cover" />
                    <div className="absolute inset-0 z-20 backdrop-blur-[4px] [mask-image:linear-gradient(to_left,black_0%,transparent_30%)]" />
                </motion.div>

                {/* RIGHT SCATTER PARTICLES */}
                <motion.div animate={{ x: [5, -5, 5], y: [10, -10, 10], opacity: [0.3, 0.6, 0.3] }} transition={floatingTransition(0.8)} className="absolute right-[-10px] top-[20px] z-30 h-[20px] w-[20px] blur-[3px] lg:right-[-30px]">
                    <Image src="/images/athelete-2.png" alt="Fitness enthusiast testimonial" fill sizes="20px" className="rounded-full object-cover" />
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

            {/* SLIDER & CONTROLS */}
            <div className="relative w-full overflow-hidden">
                <div ref={scrollRef} className="no-scrollbar flex w-full gap-[12px] overflow-x-auto px-[24px] pb-[10px] lg:gap-[24px] lg:px-[64px]">
                    {testimonials.length > 0 ? (
                        testimonials.map((item) => (
                            <TestimonialCard
                                key={item.id}
                                review={item}
                                onMediaClick={() => {
                                    if (item.image) {
                                        const isVideo = item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm');
                                        openLightbox(item.image, isVideo ? 'video' : 'image', item.author);
                                    }
                                }}
                            />
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

            <MediaLightbox
                isOpen={lightboxOpen}
                media={selectedMedia}
                onClose={() => setLightboxOpen(false)}
            />
        </section>
    );
};

const TestimonialCard = ({ review, onMediaClick }: { review: PartialReview, onMediaClick?: () => void }) => {
    const hasMedia = !!review.image;
    const isVideo = review.image?.toLowerCase().endsWith('.mp4') || review.image?.toLowerCase().endsWith('.webm');
    const cleanDate = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <article
            onClick={hasMedia ? onMediaClick : undefined}
            className={`relative flex h-[275px] w-[220px] shrink-0 flex-col justify-between overflow-hidden rounded-[24px] p-[16px] transition-all lg:w-[320px] lg:h-[350px] ${hasMedia ? 'border-none cursor-pointer group active:scale-[0.98]' : 'bg-white'}`}
        >
            {hasMedia && (
                <div className="absolute inset-0 z-0 select-none">
                    {isVideo
                        ? <video src={review.image as string} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                        : <Image src={review.image as string} alt="Review Media" fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 220px, 320px" />
                    }
                    {/* OPTIMIZED OVERLAY: Slight dark top, clear center, medium dark bottom */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0)_15%,rgba(0,0,0,0)_80%,rgba(0,0,0,0.7)_100%)]" />
                </div>
            )}
            <div className="relative z-10 flex flex-col gap-[20px]">
                <div className="flex items-start gap-[10px]">
                    <div className="relative h-[36px] w-[36px] shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#308026] flex items-center justify-center">
                        {review.author_avatar ? (
                            <Image src={review.author_avatar} alt={review.author} fill sizes="36px" className="object-cover" />
                        ) : (
                            <span className="text-white font-titillium font-bold text-[16px] leading-none mb-[1px]">
                                {review.author.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[15px] font-[600] leading-[18px] drop-shadow-sm ${hasMedia ? 'text-white' : 'text-[#242424]'}`}>{review.author}</span>
                        <span className={`text-[11px] font-[400] drop-shadow-sm ${hasMedia ? 'text-white/80' : 'text-[#535353]'}`}>{review.role || 'Verified Buyer'}</span>
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
                        <StarIcon key={i} className={`h-[14px] w-[14px] drop-shadow-sm ${i < review.rating ? 'text-[#ffe900]' : 'text-gray-200'}`} />
                    ))}
                </div>
                <span className={`text-[10px] font-[400] drop-shadow-sm ${hasMedia ? 'text-white' : 'text-[#979797]'}`}>{cleanDate}</span>
            </div>
        </article>
    );
};

export default TestimonialSection;
