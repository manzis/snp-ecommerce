import React from 'react';
import RedirectIcon from '@/components/icons/SmileyFaceIcon';

/**
 * CheckoutPrompt Component
 * 
 * DESIGN SPECIFICATIONS:
 * - Brand Colors: #308026 (Green), #164210 (Dark Green), #94ff00 (Lime), #ffe900 (Yellow)
 * - Typography: font-custom (DK Jalebi), font-titillium (Titillium Web)
 * - Proportions: Pixel-perfect 410px context for mobile, scalable for desktop max-w-[1280px].
 */
const CheckoutPrompt: React.FC = () => {
    return (
        <section className="mx-auto w-full max-w-[410px] bg-[#308026] p-[4px_4px_28px_4px] rounded-t-[24px] lg:max-w-[1280px] lg:rounded-[24px] lg:p-[4px]">
            <div className="flex w-full flex-col items-center justify-center gap-[16px] rounded-[24px] border-b-[2px] border-[#e5e5e5] bg-[#164210] p-[28px_24px_32px_24px] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] lg:flex-row lg:justify-between lg:p-[32px_48px]">

                {/* TEXT CONTENT */}
                <div className="flex flex-col gap-[16px] items-center lg:items-start">
                    <p className="w-full text-center font-titillium text-[16px] leading-[24px] text-white lg:text-left">
                        <span className="font-[400]">You are heading towards the </span>
                        <span className="font-[600]">Best Decision!</span>
                    </p>

                    <div className="flex flex-col items-center justify-center gap-[14px] lg:items-start">
                        <h2 className="w-full text-center font-custom text-[24px] font-[400] leading-[32px] tracking-[-0.24px] text-white lg:text-left lg:text-[32px] lg:leading-[40px]">
                            We are excited for <br className="lg:hidden" />
                            <span className="text-[#94ff00]"> your order</span>
                        </h2>
                    </div>
                </div>

                {/* CTA BUTTON */}
                <button className="flex h-[34px] w-[162px] items-center justify-center gap-[2px] rounded-[10px_0_10px_10px] bg-[#ffe900] px-[8px] py-[3px] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] transition-transform active:scale-95 lg:h-[48px] lg:w-[200px]">
                    <span className="font-titillium text-[16px] font-[400] leading-[24px] tracking-[-0.64px] text-[#242424] lg:text-[18px]">
                        Complete your order
                    </span>
                    <div className="h-[18px] w-[18px] shrink-0 lg:h-[20px] lg:w-[20px]">
                        <RedirectIcon className="h-full w-full text-[#242424]" />
                    </div>
                </button>



            </div>
            <p className="w-[full] text-center px-[24px] font-titillium  text-[12px]  leading-[24px] text-white lg:text-left mt-[12px]" >
                <span className="font-regular italic">We never ask OTP through phone calls or messages. Such activities are supposed to be fraudulent. </span></p>
        </section>
    );
};

export default CheckoutPrompt;