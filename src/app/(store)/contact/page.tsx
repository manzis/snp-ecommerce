"use client";

import React, { useState } from "react";
import DynamicPageNav from "@/components/layout/DynamicPageNav";
import { submitContactFormAction } from "@/app/actions/contactActions";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await submitContactFormAction(formData);

            if (result.success) {
                showToast(result.message, 'success');
                setFormData({ fullName: "", email: "", message: "" });
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast("Failed to send message. Please try again.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Top Navigation */}
            <DynamicPageNav title="Contact Us" />

            {/* Main Content Wrapper */}
            <main className="flex flex-col w-full max-w-[410px] lg:max-w-[1200px] mx-auto gap-[12px] relative pt-[65px] pb-[40px] bg-[#F7FAF6]">

                {/* --- HERO SECTION --- */}
                <section className="flex flex-col  pb-[12px] items-start self-stretch relative z-[1]">
                    <div className="flex px-[24px] py-[36px] flex-col gap-[16px] items-center self-stretch bg-[#3f9633]  relative z-[2] ">

                        <div className="flex w-full max-w-[288px] lg:max-w-[600px] flex-col gap-[8px] items-center relative z-[3]">
                            <span className="flex justify-center text-[14px] font-[600] leading-[18px] text-[#ffffff] whitespace-nowrap uppercase tracking-wider">
                                GET IN TOUCH
                            </span>
                            <h1 className="flex justify-center text-[30px] font-rajdhani font-bold lg:text-[42px] font-[500] leading-[40px] lg:leading-[50px] text-[#ffffff] text-center font-['DK_Jalebi',sans-serif]">
                                We’d Love to hear<br />From You
                            </h1>
                            <p className="flex justify-center text-[14px] lg:text-[16px] font-[500] leading-[20px] lg:leading-[24px] text-[#ddffd8] text-center max-w-[400px]">
                                Have a questions about delivery, supplements or orders do let us know to assist you best
                            </p>
                        </div>

                        <div className="flex gap-[8px] items-start relative z-[7] mt-[8px]">
                            <button className="flex px-[10px] py-[4px] gap-[4px] justify-center items-center bg-[#ffffff] hover:bg-[#f3f4f6] transition-colors duration-[200ms] rounded-[100px]">
                                <span className="text-[16px] font-[600] leading-[26px] text-[#242424] tracking-[-0.03px] whitespace-nowrap">
                                    Report
                                </span>
                            </button>
                            <a href="https://wa.me/9779767609390" target="_blank" rel="noopener noreferrer" className="flex px-[14px] py-[4px] gap-[4px] justify-center items-center bg-[#eaffcc] hover:bg-[#d8f7a1] transition-colors duration-[200ms] rounded-[100px]">
                                <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="#242424" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className="text-[16px] font-[600] leading-[26px] text-[#242424] tracking-[-0.03px] whitespace-nowrap">
                                    Live Chat
                                </span>
                            </a>
                        </div>

                    </div>
                </section>

                {/* --- DESKTOP GRID WRAPPER --- */}
                <div className="flex flex-col lg:flex-row items-start w-full gap-[24px] lg:px-[12px]">

                    {/* --- FORM SECTION --- */}
                    <section className="flex  lg:px-[0px] w-full lg:w-[60%] items-center self-stretch relative z-[13]">
                        <div className="flex py-[24px] px-[24px]  px-24px flex-col gap-[30px] items-start grow bg-[#ffffff] relative z-[14]">

                            <div className="flex  items-center self-stretch relative z-[16]">
                                <h2 className="text-[18px] font-[700] leading-[27px] tracking-[-0.07px] bg-clip-text text-transparent bg-[linear-gradient(46.44deg,#242424,#7d857b)] whitespace-nowrap">
                                    Submit a Message
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col w-full gap-[12px] relative z-[18]">
                                <div className="flex  flex-col gap-[20px] items-start self-stretch relative z-[19]">

                                    {/* Full Name Input */}
                                    <div className="flex flex-col gap-[8px] items-start self-stretch relative z-[20]">
                                        <label htmlFor="fullName" className="text-[12px] font-[600] leading-[14px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Ram prasad"
                                            required
                                            className="flex w-full px-[12px] py-[16px] items-center self-stretch rounded-[12px] border-[1px] border-[#eaebf0] text-[16px] font-[500] leading-[22px] text-[#242424] placeholder-[#68727d] focus:outline-none focus:border-[#3f9633] transition-colors duration-[200ms]"
                                        />
                                    </div>

                                    {/* Email Input */}
                                    <div className="flex flex-col gap-[8px] items-start self-stretch relative z-[25]">
                                        <label htmlFor="email" className="text-[12px] font-[600] leading-[14px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="yourmail@mail.com"
                                            required
                                            className="flex w-full px-[12px] py-[16px] items-center self-stretch rounded-[12px] border-[1px] border-[#eaebf0] text-[16px] font-[500] leading-[22px] text-[#242424] placeholder-[#68727d] focus:outline-none focus:border-[#3f9633] transition-colors duration-[200ms]"
                                        />
                                    </div>

                                    {/* Message Input */}
                                    <div className="flex flex-col gap-[8px] items-start self-stretch relative z-[30]">
                                        <label htmlFor="message" className="text-[12px] font-[600] leading-[14px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                            Your Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="How can we help?"
                                            required
                                            className="flex w-full h-[158px] px-[12px] py-[16px] items-start self-stretch rounded-[12px] border-[1px] border-[#eaebf0] text-[16px] font-[500] leading-[22px] text-[#242424] placeholder-[#68727d] focus:outline-none focus:border-[#3f9633] transition-colors duration-[200ms] resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Submit Action */}
                                <div className="flex px-[24px] pt-[12px] flex-col gap-[12px] items-start self-stretch relative z-[35]">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex py-[12px] justify-center items-center self-stretch bg-[#ffe900] hover:bg-[#ebd700] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed rounded-[12px] transition-all duration-[200ms] ease-in-out"
                                    >
                                        <span className="text-[16px] font-[600] leading-[24px] text-[#242424] tracking-[-0.24px] whitespace-nowrap flex items-center gap-2">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                "Send Message"
                                            )}
                                        </span>
                                    </button>
                                    <p className="w-full text-[14px] font-[500] leading-[22px] text-[#68727d] text-center lg:text-left">
                                        We will get back your message as soon as possible
                                    </p>
                                </div>
                            </form>

                        </div>
                    </section>

                    {/* --- CONTACT INFO SECTION --- */}
                    <section className="flex  lg:px-[0px] w-full lg:w-[40%] flex-col items-start self-stretch relative z-[39]">
                        <div className="flex  lg:h-auto min-h-[358px]   flex-col gap-[8px] justify-center items-start self-stretch relative z-[40]">
                            <div className="flex flex-col gap-[1px] items-start self-stretch grow  bg-[#F7FAF6] overflow-hidden relative z-[41]">

                                {/* Chat to Sales Card */}
                                <div className="flex px-[20px] py-[24px] flex-col gap-[10px] items-start self-stretch bg-[#ffffff] relative z-[43]">
                                    <div className="w-[40px] h-[39px] shrink-0 bg-[#efefef] rounded-[12px] flex items-center justify-center relative z-[45]">
                                        <svg className="w-[20px] h-[20px] text-[#3f9633]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col items-start self-stretch relative z-[48]">
                                        <h3 className="text-[16px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                            Chat to sales
                                        </h3>
                                        <p className="text-[12px] font-[500] leading-[24px] text-[#535353] tracking-[-0.2px] whitespace-nowrap">
                                            Speak to our friendly team
                                        </p>
                                        <a href="mailto:brightnepcare@gmail.com" className="text-[16px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] hover:text-[#3f9633] transition-colors duration-[150ms] whitespace-nowrap mt-[4px]">
                                            brightnepcare@gmail.com
                                        </a>
                                    </div>
                                </div>

                                {/* Call Us Card */}
                                <div className="flex px-[20px] py-[24px] flex-col gap-[10px] items-start self-stretch bg-[#ffffff] relative z-[53]">
                                    <div className="w-[40px] h-[39px] shrink-0 bg-[#efefef] rounded-[12px] flex items-center justify-center relative z-[55]">
                                        <svg className="w-[20px] h-[20px] text-[#3f9633]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.84-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col items-start self-stretch relative z-[57]">
                                        <h3 className="text-[16px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                            Call Us
                                        </h3>
                                        <p className="text-[12px] font-[500] leading-[24px] text-[#535353] tracking-[-0.2px] whitespace-nowrap">
                                            Mon to Fri From 10am to 5pm
                                        </p>
                                        <a href="tel:+9779767609390" className="text-[16px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] hover:text-[#3f9633] transition-colors duration-[150ms] whitespace-nowrap mt-[4px]">
                                            +977 9767609390
                                        </a>
                                    </div>
                                </div>

                                {/* Address Card (Required for Google Merchant Center) */}
                                <div className="flex px-[20px] py-[24px] flex-col gap-[10px] items-start self-stretch bg-[#ffffff] relative z-[60]">
                                    <div className="w-[40px] h-[39px] shrink-0 bg-[#efefef] rounded-[12px] flex items-center justify-center relative z-[61]">
                                        <svg className="w-[20px] h-[20px] text-[#3f9633]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col items-start self-stretch relative z-[62] w-full">
                                        <h3 className="text-[16px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap mb-[4px]">
                                            Visit Us
                                        </h3>
                                        
                                        {/* Main Office */}
                                        <div className="flex flex-col items-start w-full">
                                            <p className="text-[12px] font-[600] leading-[20px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                                Main Office
                                            </p>
                                            <p className="text-[12px] font-[500] leading-[20px] text-[#535353] tracking-[-0.2px] whitespace-nowrap">
                                                Bright Nepcare Pvt. Ltd.
                                            </p>
                                            <span className="text-[14px] font-[600] leading-[20px] text-[#242424] tracking-[-0.2px] mt-[2px]">
                                                Kathmandu, Nepal
                                            </span>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-full h-[1px] bg-[#eaebf0] my-[12px]"></div>

                                        {/* Warehouse */}
                                        <div className="flex flex-col items-start w-full">
                                            <div className="flex items-center gap-[6px] mb-[2px]">
                                                <svg className="w-[12px] h-[12px] text-[#535353]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                                </svg>
                                                <p className="text-[12px] font-[600] leading-[20px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                                                    Warehouse
                                                </p>
                                            </div>
                                            <span className="text-[14px] font-[600] leading-[20px] text-[#242424] tracking-[-0.2px]">
                                                Butwal, Nepal
                                            </span>
                                            <span className="text-[12px] text-[#d92d20] font-[600] mt-[6px] flex items-center gap-[4px]">
                                                <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                                In-store sales not available
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </>
    );
}
