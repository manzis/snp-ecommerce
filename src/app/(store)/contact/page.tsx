"use client";

import React, { useState } from 'react';
import MailIcon from '@/components/icons/MailIcon';
import WhatsappIcon from '@/components/icons/WhatsAppIcon2';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setStatus("🚀 Thank you! We have received your message and will get back to you shortly.");
            setTimeout(() => setStatus(null), 5000);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#fcfff8] font-titillium pt-[40px] pb-[120px] px-[16px]">
            <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-[40px]">
                
                {/* Header */}
                <div className="flex flex-col gap-[16px] text-center lg:text-left pt-[20px]">
                    <div className="inline-flex items-center justify-center lg:justify-start gap-[8px] text-[#3f9633]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span className="font-semibold text-[14px] tracking-widest uppercase">Get In Touch</span>
                    </div>
                    <h1 className="text-[40px] lg:text-[48px] font-custom text-[#242424] leading-tight">
                        We'd love to hear <br className="hidden lg:block" /> from you.
                    </h1>
                    <p className="text-[#68727d] text-[16px] lg:text-[18px] max-w-[500px]">
                        Have a question about our supplements, your order, or just need fitness advice? Drop us a message!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px]">
                    
                    {/* Contact Form */}
                    <div className="bg-white p-[32px] rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#f1f5f9]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[14px] font-semibold text-[#242424]">Full Name</label>
                                <input required type="text" placeholder="John Doe" className="h-[54px] rounded-[12px] border border-[#eaebf0] px-[16px] outline-none transition-all focus:border-[#3f9633] focus:ring-1 focus:ring-[#3f9633] bg-transparent text-[#242424]" />
                            </div>
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[14px] font-semibold text-[#242424]">Email Address</label>
                                <input required type="email" placeholder="john@example.com" className="h-[54px] rounded-[12px] border border-[#eaebf0] px-[16px] outline-none transition-all focus:border-[#3f9633] focus:ring-1 focus:ring-[#3f9633] bg-transparent text-[#242424]" />
                            </div>
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[14px] font-semibold text-[#242424]">Your Message</label>
                                <textarea required rows={4} placeholder="How can we help?" className="rounded-[12px] border border-[#eaebf0] p-[16px] outline-none transition-all focus:border-[#3f9633] focus:ring-1 focus:ring-[#3f9633] bg-transparent text-[#242424] resize-none"></textarea>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="mt-[10px] h-[54px] rounded-[12px] bg-[linear-gradient(135deg,#3f9633_0%,#87c03d_100%)] text-white font-semibold text-[16px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center">
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                            {status && <p className="text-[#3f9633] text-center font-medium mt-[4px]">{status}</p>}
                        </form>
                    </div>

                    {/* Contact Info Cards */}
                    <div className="flex flex-col gap-[20px]">
                        
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-[32px] rounded-[24px] flex flex-col gap-[16px]">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center">
                                <MailIcon className="w-[20px] h-[20px]" />
                            </div>
                            <div className="flex flex-col gap-[4px]">
                                <h3 className="font-bold text-[20px] text-[#242424]">Chat to Sales</h3>
                                <p className="text-[#68727d] text-[15px]">Speak to our friendly team.</p>
                                <a href="mailto:sales@supplementnepal.com" className="mt-[8px] font-semibold text-[#3f9633] hover:underline">sales@supplementnepal.com</a>
                            </div>
                        </div>

                        <div className="bg-[#fffbeb] border border-[#fde68a] p-[32px] rounded-[24px] flex flex-col gap-[16px]">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#fef3c7] text-[#92400e] flex items-center justify-center">
                                <WhatsappIcon className="w-[24px] h-[24px]" />
                            </div>
                            <div className="flex flex-col gap-[4px]">
                                <h3 className="font-bold text-[20px] text-[#242424]">Call Us</h3>
                                <p className="text-[#68727d] text-[15px]">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+9779800000000" className="mt-[8px] font-semibold text-[#b45309] hover:underline">+977 980-000-0000</a>
                            </div>
                        </div>

                        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-[32px] rounded-[24px] flex flex-col gap-[16px]">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#e2e8f0] text-[#475569] flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div className="flex flex-col gap-[4px]">
                                <h3 className="font-bold text-[20px] text-[#242424]">Visit Us</h3>
                                <p className="text-[#68727d] text-[15px]">Visit our office HQ.</p>
                                <p className="mt-[8px] font-semibold text-[#475569]">Kathmandu, Nepal <br /> 44600</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
