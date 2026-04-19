"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';
import { useToast } from '@/components/ui/ToastProvider'; // Assuming useToast exists per your project structure
import { createClient } from '@/lib/supabase/client';
import CloseIcon from '@/components/icons/CloseIcon2';
import MailIcon from '@/components/icons/MailIcon';
import GoogleIcon from '@/components/icons/GoogleIcon';
import WhatsappIcon from '@/components/icons/WhatsAppIcon2';

interface LoginModalProps {
    isPage?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isPage = false }) => {
    const { isOpen, closeLogin } = useAuthModal();
    const { showToast } = useToast();
    const router = useRouter();

    // State Management initialized with persistence check
    const [identifier, setIdentifier] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_identifier') || '';
        }
        return '';
    });
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'login' | 'otp'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('auth_step') as 'login' | 'otp') || 'login';
        }
        return 'login';
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    // Sync state to localStorage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_identifier', identifier);
            localStorage.setItem('auth_step', step);
        }
    }, [identifier, step]);

    // Resend Cooldown Timer
    React.useEffect(() => {
        let timer: any;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Logic: Validation
    const validateIdentifier = (val: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/; // Basic 10 digit check
        return emailRegex.test(val) || phoneRegex.test(val);
    };

    const handleSendOtp = async () => {
        if (!validateIdentifier(identifier)) {
            setError("Please enter a valid email or phone number");
            return;
        }
        setError(null);
        setIsSending(true);

        // OPTIMISTIC TRANSITION: Switch to OTP view immediately to feel "faster"
        // Most users have high confidence in their email/phone being correct.
        setStep('otp');

        const supabase = createClient();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        try {
            if (isEmail) {
                const { error } = await supabase.auth.signInWithOtp({
                    email: identifier,
                    options: { shouldCreateUser: true }
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    phone: identifier.startsWith('+') ? identifier : `+977${identifier}`,
                });
                if (error) throw error;
            }

            console.log("OTP Sent");
            setIsSending(false);
            showToast("OTP sent successfully!", "success");
        } catch (err: any) {
            console.log("Login Failed");
            setIsSending(false);
            setStep('login'); // Revert if failed
            showToast(err?.message || "Failed to send OTP", "error");
        }
    };

    const handleResendOtp = async () => {
        setStatusMsg("Sending...");
        const supabase = createClient();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        try {
            if (isEmail) {
                const { error } = await supabase.auth.signInWithOtp({
                    email: identifier,
                    options: { shouldCreateUser: true }
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    phone: identifier.startsWith('+') ? identifier : `+977${identifier}`,
                });
                if (error) throw error;
            }
            console.log("OTP Sent");
            setStatusMsg("OTP resent successfully!");
            showToast("OTP has been resent to your inbox", "success");
            setTimeout(() => setStatusMsg(null), 3000);
        } catch (err: any) {
            console.log("Login Failed");
            setStatusMsg("Failed to resend");
            showToast(err?.message || "Failed to resend OTP", "error");
            setTimeout(() => setStatusMsg(null), 3000);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.some(digit => digit === '')) {
            showToast("Please enter all 6 digits", "error");
            return;
        }
        setIsVerifying(true);
        const otpString = otp.join('');
        console.log("Verifying:", otpString);

        const supabase = createClient();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        try {
            let verifyParams: any = {
                token: otpString,
                type: isEmail ? 'email' : 'sms',
            };
            if (isEmail) {
                verifyParams.email = identifier;
            } else {
                verifyParams.phone = identifier.startsWith('+') ? identifier : `+977${identifier}`;
            }

            const { error: verifyError } = await supabase.auth.verifyOtp(verifyParams);

            if (verifyError) throw verifyError;

            console.log("OTP Verified");
            // Clear persistence on success
            localStorage.removeItem('auth_identifier');
            localStorage.removeItem('auth_step');
            
            showToast("Logged in successfully!", "success");
            closeLogin();
            router.push('/account');
        } catch (err: any) {
            console.log("Login Failed");
            showToast(err?.message || "Invalid OTP", "error");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSending(true);
        try {
            const supabase = createClient();
            // Get base URL for redirects (production or development)
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                           (typeof window !== 'undefined' ? window.location.origin : '');
            const redirectUrl = `${siteUrl.replace(/\/$/, '')}/auth/callback`;

            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                },
            });
            if (googleError) throw googleError;
        } catch (err: any) {
            console.error("Google Login Failed", err);
            showToast(err?.message || "Google Login Failed", "error");
            setIsSending(false);
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) {
            setTimeout(() => {
                inputRefs[index + 1].current?.focus();
            }, 10);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs[index - 1].current?.focus();
    };

    const active = isPage || isOpen;

    const Content = (
        <motion.div
            initial={isPage ? {} : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={`relative w-full max-w-[410px] lg:max-w-[900px] lg:h-[600px] bg-[#3f9633] flex flex-col lg:flex-row overflow-hidden lg:rounded-[32px] lg:border-4 lg:border-[#3f9633] lg:p-[4px] 
        ${isPage ? 'h-[675px] rounded-none' : 'h-[600px] rounded-t-[24px]'} 
    `}
        >
            <div className="absolute top-0 left-0 w-full h-[40%] lg:h-full opacity-40 pointer-events-none z-0">
                <Image src="/images/supplement-pattern.png" alt="Supplement Pattern" fill className="object-cover object-top" priority />
            </div>
            <section className="relative z-10 flex-1 flex flex-col justify-between p-[24px] lg:p-[48px] lg:gap-[32px]">
                <div className="flex items-center justify-between lg:justify-start gap-[10px]">
                    <div className="flex items-center gap-[10px]">
                        <div className="relative w-[60px] h-[60px] shrink-0 rounded-[12px] p-[2px] bg-[linear-gradient(to_right,#3F9733,#EAFFCD)]">
                            <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-[#3f9633]">
                                <Image src="/images/logo.png" alt="Supplement Nepal Logo" fill className="object-cover" />
                            </div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-custom text-[18px] leading-[24px] text-[#e8ffe5] [text-shadow:0_1px_2px_rgba(16,24,40,0.04)]">Supplyment Nepal</span>
                            <span className="text-[10px] font-medium leading-[12px] text-[#b1e7aa] uppercase tracking-wider">Powered By Bright Nepcare Pvt. Ltd.</span>
                        </div>
                    </div>
                    <button onClick={isPage ? () => window.location.href = '/' : closeLogin} className="lg:hidden flex w-[44px] h-[44px] items-center justify-center bg-[#edffe7] rounded-[12px]">
                        <CloseIcon className="w-[24px] h-[24px] text-[#3f9633]" />
                    </button>
                </div>
                <div className="hidden lg:flex flex-col gap-[12px] text-left">
                    <h2 className="font-custom text-[32px] text-white leading-tight">Your journey to peak <br /> fitness starts here.</h2>
                    <p className="text-[#b1e7aa] text-[16px]">Access exclusive deals and track your fitness essentials.</p>
                </div>
            </section>

            <section className={`relative z-10 bg-white w-full lg:w-[450px] rounded-t-[32px] lg:rounded-[24px] flex flex-col p-[36px_24px_32px_24px] lg:p-[36px] lg:justify-center gap-[30px] shadow-lg lg:shadow-none overflow-hidden  ${isPage ? 'h-auto rounded-none' : 'h-full '} `}>
                <AnimatePresence mode="wait" initial={false}>
                    {step === 'login' ? (
                        <motion.div 
                            key="login-form" 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            exit={{ y: -20, opacity: 0 }} 
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex flex-col gap-[30px]"
                        >
                            <header className="flex flex-col gap-[10px] text-left">
                                <h1 className="text-[24px] font-[700] leading-[36px] tracking-[-0.1px] bg-[linear-gradient(46.44deg,#242424,#7d857b)] bg-clip-text text-transparent">Login to get Started</h1>
                            </header>
                            <div className="flex flex-col gap-[14px]">
                                <div className="flex flex-col gap-[16px]">
                                    <div className={`group flex h-[54px] items-center gap-[8px] rounded-[12px] border ${error ? 'border-red-500' : 'border-[#eaebf0]'} px-[12px] transition-all focus-within:border-[#3f9633] focus-within:ring-1 focus-within:ring-[#3f9633]`}>
                                        <MailIcon className="w-[18px] h-[18px] text-[#68727d]" />
                                        <input type="text" placeholder="Email or phone no" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(null); }} className="flex-1 bg-transparent text-[18px] text-[#242424] outline-none placeholder:text-[#68727d]" />
                                    </div>
                                    {error && <span className="text-red-500 text-[12px] font-titillium mt-[-10px]">{error}</span>}
                                    <div className="flex items-center gap-[6px]">
                                        <div className="flex h-[16px] w-[16px] items-center justify-center rounded-[4px] bg-[#308026]">
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8.33331 2.5L3.74998 7.08333L1.66665 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                        <p className="text-[14px] leading-[22px] text-[#4d4d4d] text-left">By signing in you agree to our <span className="underline cursor-pointer">Terms and Conditions</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-[12px]">
                                    <button disabled={isSending} onClick={handleSendOtp} className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#ffe900] text-[16px] font-[600] text-[#242424] transition-all hover:bg-[#ebd700] active:scale-[0.98] disabled:opacity-70">
                                        {isSending ? "Processing..." : "Send OTP"}
                                    </button>
                                    <p className="text-[14px] leading-[22px] text-[#68727d] text-left">Note : This email will be used to login to website</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-[16px] items-center">
                                <span className="text-[12px] font-[600] text-[#7b838d] tracking-widest">OR LOGIN WITH</span>
                                <div className="flex gap-[10px] w-full max-w-[250px]">
                                    <button className="flex h-[48px] flex-1 items-center justify-center gap-[10px] rounded-[12px] border border-[#f1f5f9] bg-white transition-all hover:bg-gray-50"><WhatsappIcon className="w-[18px] h-[18px]" /><span className="text-[16px] font-[600] text-[#575757]">Whatsapp</span></button>
                                    <button disabled={isSending} onClick={handleGoogleLogin} className="flex h-[48px] flex-1 items-center justify-center gap-[10px] rounded-[12px] border border-[#f1f5f9] bg-white transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-70"><GoogleIcon className="w-[18px] h-[18px]" /><span className="text-[16px] font-[600] text-[#575757]">Google</span></button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-form"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex flex-col gap-[30px] pt-[10px] lg:pt-0"
                        >
                            <header className="flex flex-col gap-[10px] ">
                                {/* Navigation Action Row */}
                                <div className="flex items-center gap-[6px]">
                                    <button
                                        onClick={() => {
                                            setStep('login');
                                            localStorage.removeItem('auth_step');
                                        }}
                                        className="flex items-center justify-center  h-[28px] rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStep('login');
                                            localStorage.removeItem('auth_step');
                                        }}
                                        className="text-[14px] font-semibold text-[#242424] hover:underline bg-transparent border-none outline-none cursor-pointer"
                                    >
                                        Go back
                                    </button>
                                </div>

                                <div className="flex items-start gap-[10px] mt-[10px]">
                                    <h1 className="text-[24px]  font-[700]  leading-[36px] tracking-[-0.1px] bg-[linear-gradient(46.44deg,#242424,#7d857b)] bg-clip-text text-transparent">
                                        Verify OTP
                                    </h1>
                                </div>
                                <p className="text-[14px]  text-left  leading-[20px] text-[#68727d]">
                                    OTP sent to {identifier} <span className="text-[#3f9633]">check your inbox or spam.</span>
                                </p>
                            </header>

                            <div className="flex flex-col gap-[24px]">
                                <div className="flex items-center justify-center gap-[8px]">
                                    {otp.map((digit, index) => (
                                        <React.Fragment key={index}>
                                            <input
                                                ref={inputRefs[index]}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                className="w-full h-[52px] rounded-[12px] border border-[#eaebf0] bg-transparent text-center text-[20px] font-bold text-[#242424] outline-none transition-all focus:border-[#3f9633] focus:ring-1 focus:ring-[#3f9633]"
                                            />
                                            {index === 2 && <span className="text-[#eaebf0] text-[24px]">-</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-[12px] items-center">
                                    <button
                                        disabled={isVerifying}
                                        onClick={handleVerifyOtp}
                                        className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#ffe900] text-[16px] font-[600] text-[#242424] transition-all hover:bg-[#ebd700] active:scale-[0.98] disabled:opacity-70"
                                    >
                                        {isVerifying ? "Verifying..." : "Verify OTP Now"}
                                    </button>
                                    <button
                                        disabled={resendCooldown > 0}
                                        onClick={() => {
                                            handleResendOtp();
                                            setResendCooldown(60); // 60 seconds cooldown
                                        }}
                                        className={`text-[14px] font-semibold text-[#242424] hover:underline bg-transparent border-none outline-none cursor-pointer disabled:text-[#68727d] disabled:no-underline`}
                                    >
                                        {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
                                    </button>
                                    {statusMsg && <span className="text-[#308026] text-[12px] font-titillium animate-pulse">{statusMsg}</span>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </motion.div>
    );

    if (isPage) return <main className="flex items-start lg:items-center justify-center font-titillium mb-[36px]  min-h-screen ">{Content}</main>;

    return (
        <AnimatePresence>
            {active && (
                <div className="fixed inset-0 z-[999] flex items-end justify-start lg:justify-center lg:items-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeLogin} className="absolute inset-0 backdrop-blur-[5px]" style={{ background: `radial-gradient(circle at 0% 0%, rgba(23, 196, 0, 0.4) 0%, transparent 30%), radial-gradient(circle at 100% 0%, rgba(161, 179, 0, 0.88) 0%, transparent 30%), radial-gradient(circle at 100% 100%, rgba(187, 121, 0, 0.6) 0%, transparent 30%), radial-gradient(circle at 0% 100%, rgba(0, 98, 190, 0.62) 0%, transparent 30%), rgba(0, 0, 0, 0.3)` }} />
                    {Content}
                </div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;