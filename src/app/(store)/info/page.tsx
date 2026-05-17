import React from 'react';
import type { Metadata } from 'next';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Store Information & Policies | Supplyment Nepal',
  description: 'Learn about Supplyment Nepal. Read our About Us, Shipping Policy, Return Policy, Refund Policy, Terms of Service, and Privacy Policy.',
  keywords: 'Supplyment Nepal policies, return policy, shipping details, authentic supplements nepal, terms of service, privacy policy',
};

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <DynamicPageNav title="Information" subtitle="Help Center" />

      {/* Clean, Minimalist Hero Section */}
      <div className="w-full pt-[160px] pb-[40px] md:pt-[190px] md:pb-[56px] px-[24px] bg-[#fafafa] border-b border-[#f1f5f9]">
         <div className="max-w-[1200px] mx-auto flex flex-col justify-between items-start gap-[24px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-[24px] w-full">
              <div className="flex flex-col">
                <span className="font-titillium text-[14px] font-semibold text-[#308026] tracking-widest uppercase mb-[8px]">
                  Help Center & Policies
                </span>
                <h1 className="font-titillium font-bold text-[40px] md:text-[56px] text-[#242424] tracking-[-1px] leading-[1.1]">
                  Everything you <br className="hidden md:block" />
                  <span className="text-[#308026]">need to know.</span>
                </h1>
              </div>
              <p className="font-titillium text-[16px] md:text-[18px] text-[#535353] max-w-[400px] font-light leading-[26px]">
                 Discover our policies, shipping details, and what makes Supplyment Nepal your most trusted fitness partner.
              </p>
            </div>

            {/* Mobile Quick Links with Underlines */}
            <div className="flex flex-wrap gap-x-[16px] gap-y-[12px] mt-[8px] md:hidden w-full border-t border-[#f1f5f9] pt-[16px]">
              <a href="#about-us" className="font-titillium text-[14px] font-semibold text-[#308026] underline decoration-1 underline-offset-4 hover:text-[#242424] transition-colors">About Us</a>
              <a href="#shipping-policy" className="font-titillium text-[14px] font-semibold text-[#308026] underline decoration-1 underline-offset-4 hover:text-[#242424] transition-colors">Shipping & Delivery</a>
              <a href="#return-policy" className="font-titillium text-[14px] font-semibold text-[#308026] underline decoration-1 underline-offset-4 hover:text-[#242424] transition-colors">Return Policy</a>
              <a href="#refund-policy" className="font-titillium text-[14px] font-semibold text-[#308026] underline decoration-1 underline-offset-4 hover:text-[#242424] transition-colors">Refund Policy</a>
              <a href="#terms-and-conditions" className="font-titillium text-[14px] font-semibold text-[#308026] underline decoration-1 underline-offset-4 hover:text-[#242424] transition-colors">Terms & Conditions</a>
              <a href="#privacy-policy" className="font-titillium text-[14px] font-semibold text-[#308026] underline decoration-1 underline-offset-4 hover:text-[#242424] transition-colors">Privacy Policy</a>
            </div>
         </div>
      </div>

      <main className="mx-auto w-full max-w-[1200px] px-[24px] pb-[80px] pt-[40px] lg:px-[0px] flex flex-col md:flex-row gap-[40px] md:gap-[40px]">
        
        {/* Sticky Sidebar Navigation - Clean Documentation Style */}
        <aside className="hidden md:block w-[240px] shrink-0 pl-[24px]">
          <nav className="sticky top-[120px] flex flex-col gap-[8px]">
            <span className="font-titillium text-[13px] font-semibold text-[#979797] uppercase tracking-wider mb-[8px]">
              Jump To Section
            </span>
            <div className="flex flex-col gap-[12px] border-l-2 border-[#f1f5f9] pl-[16px]">
              <a href="#about-us" className="font-titillium text-[15px] font-medium text-[#535353] hover:text-[#308026] transition-colors">About Us</a>
              <a href="#shipping-policy" className="font-titillium text-[15px] font-medium text-[#535353] hover:text-[#308026] transition-colors">Shipping & Delivery</a>
              <a href="#return-policy" className="font-titillium text-[15px] font-medium text-[#535353] hover:text-[#308026] transition-colors">Return Policy</a>
              <a href="#refund-policy" className="font-titillium text-[15px] font-medium text-[#535353] hover:text-[#308026] transition-colors">Refund Policy</a>
              <a href="#terms-and-conditions" className="font-titillium text-[15px] font-medium text-[#535353] hover:text-[#308026] transition-colors">Terms & Conditions</a>
              <a href="#privacy-policy" className="font-titillium text-[15px] font-medium text-[#535353] hover:text-[#308026] transition-colors">Privacy Policy</a>
            </div>
          </nav>
        </aside>

        {/* Main Content Area - High contrast, extremely readable */}
        <div className="flex flex-col gap-[48px] flex-grow pr-[24px] md:pr-[60px]">
          
          {/* About Us */}
          <section id="about-us" className="scroll-mt-[35vh]">
            <h2 className="font-titillium font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#242424] mb-[16px]">About Us</h2>
            <div className="font-titillium text-[16px] leading-[28px] text-[#535353] font-light space-y-[16px]">
              <p>
                Welcome to <strong className="font-semibold text-[#242424]">Supplyment Nepal</strong>, your most trusted destination for authentic dietary supplements, including Whey Protein, Creatine Monohydrate, and comprehensive sports nutrition in Nepal.
              </p>
              <p>
                We stock world-class brands like MuscleBlaze and Naturaltein to ensure you get 100% genuine products with fast, nationwide delivery. Our mission is to empower fitness enthusiasts and athletes across Nepal with the highest quality nutrition available, sourced directly from verified manufacturers and official distributors.
              </p>
            </div>
          </section>

          <hr className="border-t border-[#f1f5f9]" />

          {/* Shipping Policy */}
          <section id="shipping-policy" className="scroll-mt-[35vh]">
            <h2 className="font-titillium font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#242424] mb-[16px]">Shipping & Delivery</h2>
            <div className="font-titillium text-[16px] leading-[28px] text-[#535353] font-light space-y-[24px]">
              <p>
                At Supplyment Nepal, we are committed to delivering your supplements safely and quickly. We offer both <strong className="font-semibold text-[#242424]">Home Delivery</strong> directly to your doorstep and <strong className="font-semibold text-[#242424]">Pickup</strong> options via our nearest branches.
              </p>
              
              <div className="flex flex-col md:flex-row gap-[24px]">
                  {/* In-Stock Details */}
                  <div className="flex-1 bg-[#F2F9F1] rounded-[12px] p-[24px] border border-[#EAFFCD]">
                    <div className="flex items-center gap-[12px] mb-[16px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#308026] flex items-center justify-center">
                        <svg className="w-[20px] h-[20px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="font-titillium font-bold text-[22px] text-[#242424] tracking-[-0.5px] leading-none">
                        In-Stock
                      </h3>
                    </div>
                    <p className="mb-[16px] font-titillium text-[15px] leading-[22px] text-[#535353]">
                      Stored locally in our Kathmandu warehouse and shipped directly from our store.
                    </p>
                    <ul className="space-y-[12px] font-titillium text-[15px]">
                      <li className="flex gap-[8px] items-start">
                        <span className="text-[#308026] mt-[2px]">•</span> 
                        <span className="text-[#242424]">Faster delivery in <strong className="font-semibold">1 to 2 days</strong></span>
                      </li>
                      <li className="flex gap-[8px] items-start">
                        <span className="text-[#308026] mt-[2px]">•</span> 
                        <span className="text-[#242424]">100% Verified Authenticity Guarantee</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pre-Order Details */}
                  <div className="flex-1 bg-white rounded-[12px] p-[24px] border border-[#e5e5e5]">
                    <div className="flex items-center gap-[12px] mb-[16px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#242424] flex items-center justify-center">
                        <svg className="w-[20px] h-[20px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="font-titillium font-bold text-[22px] text-[#242424] tracking-[-0.5px] leading-none">
                        Pre-Order
                      </h3>
                    </div>
                    <p className="mb-[16px] font-titillium text-[15px] leading-[22px] text-[#535353]">
                      Shipped internationally on a pre-order basis from our trusted global partners.
                    </p>
                    <ul className="space-y-[12px] font-titillium text-[15px]">
                      <li className="flex gap-[8px] items-start">
                        <span className="text-[#242424] mt-[2px]">•</span> 
                        <span className="text-[#242424]">Delivery timeframe of <strong className="font-semibold">4 to 7 days</strong></span>
                      </li>
                      <li className="flex gap-[8px] items-start">
                        <span className="text-[#242424] mt-[2px]">•</span> 
                        <span className="text-[#242424]">100% Verified Authenticity Guarantee</span>
                      </li>
                    </ul>
                  </div>
              </div>
              
              <div className="bg-[#f9fafb] p-[16px] rounded-[8px] border-l-4 border-[#308026]">
                <p className="font-titillium text-[14px] italic text-[#535353] leading-[22px]">
                  <strong>Note:</strong> Delivery times may vary slightly based on your exact location outside the Kathmandu valley. Out of stock items will display "Restocking soon, Stay tuned".
                </p>
              </div>
            </div>
          </section>

          <hr className="border-t border-[#f1f5f9]" />

          {/* Return Policy */}
          <section id="return-policy" className="scroll-mt-[35vh]">
            <h2 className="font-titillium font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#242424] mb-[16px]">Return Policy</h2>
            <div className="font-titillium text-[16px] leading-[28px] text-[#535353] font-light space-y-[16px]">
              <p>
                We stand behind the quality of every product we sell. If you are not completely satisfied with your purchase, you may request a return within <strong className="font-semibold text-[#242424]">7 days</strong> of delivery.
              </p>
              <p>
                To be eligible for a return, the item must be unused, in the same condition that you received it, and in its original sealed packaging. Any products with broken seals, missing scoops, or signs of tampering will not be accepted for health and safety reasons.
              </p>
              <p>
                To initiate a return, please contact our support team via WhatsApp or email with your order number and photographic proof of the unopened product.
              </p>
            </div>
          </section>

          <hr className="border-t border-[#f1f5f9]" />

          {/* Refund Policy */}
          <section id="refund-policy" className="scroll-mt-[35vh]">
            <h2 className="font-titillium font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#242424] mb-[16px]">Refund Policy</h2>
            <div className="font-titillium text-[16px] leading-[28px] text-[#535353] font-light space-y-[16px]">
              <p>
                Once your return is received and inspected by our team, we will notify you of the approval or rejection of your refund. 
              </p>
              <p>
                If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment (e.g., eSewa, Khalti, or bank transfer) within <strong className="font-semibold text-[#242424]">3 to 5 business days</strong>. 
              </p>
              <p>
                Please note that original shipping charges are non-refundable. If you receive a refund, the cost of return shipping may be deducted from your refund amount unless the return is due to our error (e.g., you received an incorrect or defective item).
              </p>
            </div>
          </section>

          <hr className="border-t border-[#f1f5f9]" />

          {/* Terms and Conditions */}
          <section id="terms-and-conditions" className="scroll-mt-[35vh]">
            <h2 className="font-titillium font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#242424] mb-[16px]">Terms & Conditions</h2>
            <div className="font-titillium text-[16px] leading-[28px] text-[#535353] font-light space-y-[16px]">
              <p>
                By accessing and placing an order with Supplyment Nepal, you confirm that you are in agreement with and bound by the terms of service outlined herein. These terms apply to the entire website and any email or other type of communication between you and Supplyment Nepal.
              </p>
              <p>
                <strong className="font-semibold text-[#242424]">Product Information:</strong> While we strive for accuracy, product packaging and materials may contain more and/or different information than that shown on our website. We recommend that you do not solely rely on the information presented and that you always read labels, warnings, and directions before using or consuming a product.
              </p>
              <p>
                <strong className="font-semibold text-[#242424]">Pricing & Availability:</strong> All prices are listed in Nepalese Rupees (NPR). Prices and availability of products are subject to change without notice. We reserve the right to limit the quantity of any product sold.
              </p>
            </div>
          </section>

          <hr className="border-t border-[#f1f5f9]" />

          {/* Privacy Policy */}
          <section id="privacy-policy" className="scroll-mt-[35vh]">
            <h2 className="font-titillium font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#242424] mb-[16px]">Privacy Policy</h2>
            <div className="font-titillium text-[16px] leading-[28px] text-[#535353] font-light space-y-[16px]">
              <p>
                At Supplyment Nepal, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our website.
              </p>
              <p>
                <strong className="font-semibold text-[#242424]">Information Collection:</strong> We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This may include your name, email address, phone number, and delivery address.
              </p>
              <p>
                <strong className="font-semibold text-[#242424]">Use of Information:</strong> We use the collected information to process transactions, deliver your orders, communicate with you about updates or offers, and improve our website experience. 
              </p>
              <p>
                <strong className="font-semibold text-[#242424]">Data Protection:</strong> We implement a variety of security measures to maintain the safety of your personal information. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except for trusted third parties who assist us in operating our website and conducting our business.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
