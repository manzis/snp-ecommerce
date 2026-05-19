"use client"

import React, { useState } from 'react';
import PlusIcon from '@/components/icons/PlusIcon';

interface FaqItem {
    question: string;
    answer: string;
}

const FAQS: FaqItem[] = [
    {
        question: "Are your supplements 100% authentic?",
        answer: "Absolutely. We source all our products directly from official brand distributors or the brands themselves. Every product comes with a verification code or a holographic seal that you can check on the manufacturer's website."
    },
    {
        question: "How long does delivery take in Nepal?",
        answer: "Inside Kathmandu Valley, we offer same-day or next-day delivery. For outside Kathmandu, it typically takes 2-4 business days depending on your location."
    },
    {
        question: "How can I verify the authenticity of my product?",
        answer: "Most of our brands (like MuscleBlaze or Naturaltein) have a scratch code on the packaging. You can scratch it and enter the unique code on the brand's official website or app to confirm it's genuine."
    },
    {
        question: "Do I need a prescription to buy supplements?",
        answer: "No, dietary supplements like whey protein, creatine, and vitamins do not require a prescription. However, we always recommend consulting with a healthcare professional or trainer before starting any new supplement regimen."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 7-day easy return policy for unopened and sealed products if you change your mind or received the wrong item. For health and safety reasons, we cannot accept returns for opened supplements."
    }
];

const HomeFaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[40px] px-[24px] py-[60px] lg:px-[60px] lg:py-[100px]">
            {/* HEADER */}
            <div className="flex w-full flex-col items-center gap-[12px] text-center">
                <div className="inline-flex items-center justify-center rounded-[100px] bg-[#f2f9f1] px-[12px] py-[4px] border border-[#e2efe0]">
                    <span className="font-titillium text-[14px] font-[600] leading-[20px] text-[#308026] uppercase tracking-wider">FAQ</span>
                </div>
                <h2 className="font-titillium text-[32px] font-[600] leading-[36px] tracking-[-0.64px] text-[#242424] lg:text-[44px] lg:leading-[50px]">
                    Have Questions? <br />
                    <span className="text-[#308026]">We have answers.</span>
                </h2>
                <p className="max-w-[500px] font-titillium text-[16px] font-[300] leading-[22px] text-[#535353] lg:text-[18px]">
                    Everything you need to know about our products, delivery, and authenticity.
                </p>
            </div>

            {/* FAQ LIST */}
            <div className="flex w-full max-w-[800px] flex-col gap-[16px]">
                {FAQS.map((faq, idx) => (
                    <FaqRow 
                        key={idx} 
                        faq={faq} 
                        isOpen={openIndex === idx} 
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
                    />
                ))}
            </div>
        </section>
    );
};

const FaqRow = ({ faq, isOpen, onClick }: { faq: FaqItem; isOpen: boolean; onClick: () => void }) => {
    return (
        <div 
            className={`group overflow-hidden rounded-[16px] border transition-all duration-300 ${
                isOpen ? 'border-[#308026] bg-[#fafff9]' : 'border-[#f1f5f9] bg-white hover:border-[#e2efe0]'
            }`}
        >
            <button 
                onClick={onClick}
                className="flex w-full items-center justify-between px-[20px] py-[20px] text-left lg:px-[24px]"
            >
                <span className={`font-titillium text-[16px] font-[600] leading-[22px] transition-colors lg:text-[18px] ${
                    isOpen ? 'text-[#308026]' : 'text-[#242424]'
                }`}>
                    {faq.question}
                </span>
                <div className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen ? 'rotate-45 border-[#308026] bg-[#308026] text-white' : 'border-[#d1d5db] text-[#242424]'
                }`}>
                    <PlusIcon className="h-[14px] w-[14px]" />
                </div>
            </button>
            
            {/* CSS-only accordion — replaces framer-motion AnimatePresence */}
            <div className={`faq-answer ${isOpen ? 'faq-open' : ''}`}>
                <div className="faq-answer-inner">
                    <div className="px-[20px] pb-[20px] pt-0 lg:px-[24px] lg:pb-[24px]">
                        <p className="font-titillium text-[15px] font-[400] leading-[24px] text-[#535353] lg:text-[16px]">
                            {faq.answer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeFaqSection;
