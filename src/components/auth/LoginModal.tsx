"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';
import { useToast } from '@/components/ui/ToastProvider'; // Assuming useToast exists per your project structure
import { createClient } from '@/lib/supabase/client';
import CloseIcon from '@/components/icons/CloseIcon2';
import MailIcon from '@/components/icons/MailIcon';
import GoogleIcon from '@/components/icons/GoogleIcon';
import WhatsappIcon from '@/components/icons/WhatsAppIcon2';

import { sendWhatsappOtpAction, verifyWhatsappOtpAction } from '@/app/actions/whatsappAuthActions';
import dynamic from 'next/dynamic';
import FloatingNav from '@/components/layout/FloatingNav';

const CartSidebar = dynamic(() => import('@/components/cart/CartSidebar'), { ssr: false });

interface LoginModalProps {
    isPage?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isPage = false }) => {
    const { isOpen, closeLogin, triggerLoginSuccess } = useAuthModal();
    const { showToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

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
    const [loginMethod, setLoginMethod] = useState<'supabase' | 'whatsapp'>('supabase');
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

    // Ensure state is correctly recovered after SSR hydration or page reload
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedStep = localStorage.getItem('auth_step') as 'login' | 'otp';
            if (savedStep && savedStep === 'otp') {
                setStep('otp');
            }
            const savedIdentifier = localStorage.getItem('auth_identifier');
            if (savedIdentifier) {
                setIdentifier(savedIdentifier);
            }
        }
    }, []);

    // Initialize cooldown timer on mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const sentTime = parseInt(localStorage.getItem('otp_sent_time') || '0', 10);
            const diff = Math.floor((Date.now() - sentTime) / 1000);
            if (diff < 60 && diff >= 0) {
                setResendCooldown(60 - diff);
            }
        }
    }, []);

    // Auto-focus first OTP input when switching to OTP step
    React.useEffect(() => {
        if (step === 'otp') {
            // Small delay to allow the animation to complete/DOM to render
            setTimeout(() => {
                inputRefs[0].current?.focus();
            }, 300);
        }
    }, [step]);

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

    // Logic: Validation — catches common domain typos before wasting an OTP send
    const KNOWN_DOMAINS: Record<string, string> = {
        // Gmail typos
        'gamil.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmial.com': 'gmail.com',
        'gmaill.com': 'gmail.com', 'gmali.com': 'gmail.com', 'gmil.com': 'gmail.com',
        'gnail.com': 'gmail.com', 'gmaik.com': 'gmail.com', 'gmaio.com': 'gmail.com',
        'gmail.co': 'gmail.com', 'gmail.om': 'gmail.com', 'gmail.cm': 'gmail.com',
        'gmail.con': 'gmail.com', 'gmail.cpm': 'gmail.com', 'gmail.comm': 'gmail.com',
        'gmail.vom': 'gmail.com', 'gmail.xom': 'gmail.com', 'gmai.com': 'gmail.com',
        'gmaiil.com': 'gmail.com', 'gmaul.com': 'gmail.com', 'gemail.com': 'gmail.com',
        'gimail.com': 'gmail.com', 'gmsil.com': 'gmail.com', 'gmeil.com': 'gmail.com',
        // Yahoo typos
        'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yhoo.com': 'yahoo.com',
        'yahoo.co': 'yahoo.com', 'yahoo.om': 'yahoo.com', 'yahoo.con': 'yahoo.com',
        'yhaoo.com': 'yahoo.com', 'yaoo.com': 'yahoo.com',
        // Hotmail / Outlook typos
        'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
        'hotmail.con': 'hotmail.com', 'hotmil.com': 'hotmail.com', 'hotamil.com': 'hotmail.com',
        'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.co': 'outlook.com',
        'outlook.con': 'outlook.com', 'outllook.com': 'outlook.com',
        // Others
        'icloud.co': 'icloud.com', 'icloud.con': 'icloud.com',
        'protonmail.co': 'protonmail.com', 'protonmail.con': 'protonmail.com',
    };

    const VALID_DOMAINS = new Set([
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
        'protonmail.com', 'proton.me', 'aol.com', 'mail.com', 'zoho.com',
        'yandex.com', 'live.com', 'msn.com', 'me.com', 'mac.com',
        'rediffmail.com', 'inbox.com', 'fastmail.com',
    ]);

    const validateIdentifier = (val: string): { valid: boolean; suggestion?: string } => {
        const trimmed = val.trim().toLowerCase();
        const phoneRegex = /^(?:\+977|977)?\d{10}$/;
        if (phoneRegex.test(trimmed)) return { valid: true };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return { valid: false };

        // Extract domain part
        const domain = trimmed.split('@')[1];
        if (!domain) return { valid: false };

        // Check for known typos
        const corrected = KNOWN_DOMAINS[domain];
        if (corrected) {
            return { valid: false, suggestion: corrected };
        }

        // Check TLD validity (must end with at least a 2-char TLD)
        const tldMatch = domain.match(/\.([a-z]{2,})$/);
        if (!tldMatch) return { valid: false };

        // If domain is in the known-good list, instant pass
        if (VALID_DOMAINS.has(domain)) return { valid: true };

        // For unknown domains, still allow — but warn if TLD looks suspect
        const suspiciousTlds = ['co', 'om', 'cm', 'con', 'cpm', 'comm', 'vom', 'xom'];
        if (suspiciousTlds.includes(tldMatch[1])) {
            return { valid: false, suggestion: domain.replace(/\.[a-z]+$/, '.com') };
        }

        return { valid: true };
    };

    const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

    const handleSendOtp = async () => {
        const result = validateIdentifier(identifier);
        if (!result.valid) {
            if (result.suggestion) {
                const correctedEmail = identifier.trim().split('@')[0] + '@' + result.suggestion;
                setEmailSuggestion(correctedEmail);
                setError(`Did you mean ${correctedEmail}?`);
            } else {
                setEmailSuggestion(null);
                setError("Please enter your email address");
            }
            return;
        }
        
        setIsSending(true);
        setError(null);
        setEmailSuggestion(null);
        // Validate type before switching UI
        const cleanIdentifier = identifier.trim().toLowerCase();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
        const isPhone = /^(?:\+977|977)?\d{10}$/.test(cleanIdentifier);

        if (isPhone) {
            setError("This method is not available. Please use email instead.");
            showToast("Please use your email address to log in.", "error");
            setIsSending(false);
            return;
        }

        if (!isEmail) {
            setError("Please enter a valid email address.");
            setIsSending(false);
            return;
        }

        const lastSentIdentifier = localStorage.getItem('auth_identifier_sent');
        const sentTime = parseInt(localStorage.getItem('otp_sent_time') || '0', 10);
        const diff = Math.floor((Date.now() - sentTime) / 1000);
        
        if (cleanIdentifier === lastSentIdentifier && diff < 60 && diff >= 0) {
             setResendCooldown(60 - diff);
             setStep('otp');
             setLoginMethod('supabase');
             showToast("Please use the previously sent OTP", "success");
             setIsSending(false);
             return;
        }

        // OPTIMISTIC UI: Switch to OTP step instantly for email
        setStep('otp');
        setLoginMethod('supabase');

        try {
            const supabase = createClient();
            
            setLoginMethod('supabase');
            const { error } = await supabase.auth.signInWithOtp({ 
                email: cleanIdentifier, 
                options: { shouldCreateUser: true } 
            });
            if (error) throw error;
            
            localStorage.setItem('otp_sent_time', Date.now().toString());
            localStorage.setItem('auth_identifier_sent', cleanIdentifier);
            setResendCooldown(60);
            
            showToast("OTP sent to your email!", "success");
        } catch (err: any) {
            console.error("OTP Send Failed:", err?.message || err);
            
            // If it's a rate limit error, the OTP was likely already sent (e.g. double click),
            // so we shouldn't force them back to the login screen.
            const errorMsg = (err?.message || "").toLowerCase();
            const isRateLimit = errorMsg.includes("security purposes") || 
                                errorMsg.includes("60 seconds") || 
                                errorMsg.includes("rate limit");
                                
            if (!isRateLimit) {
                setStep('login');
                setError(err?.message || "Failed to send OTP. Please try again.");
            }
            
            showToast(err?.message || "Failed to send OTP. Please try again.", isRateLimit ? "success" : "error");
        } finally {
            setIsSending(false);
        }
    };

    const handleResendOtp = async () => {
        setStatusMsg("Sending...");

        const cleanIdentifier = identifier.trim().toLowerCase();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
        const isPhone = /^(?:\+977|977)?\d{10}$/.test(cleanIdentifier);

        try {
            const supabase = createClient();

            let formattedPhone = cleanIdentifier;
            if (isPhone) {
                if (cleanIdentifier.startsWith('977')) {
                    formattedPhone = `+${cleanIdentifier}`;
                } else if (!cleanIdentifier.startsWith('+')) {
                    formattedPhone = `+977${cleanIdentifier}`;
                }
            }

            if (isEmail) {
                const { error } = await supabase.auth.signInWithOtp({ 
                    email: cleanIdentifier, 
                    options: { shouldCreateUser: true } 
                });
                if (error) throw error;
                
                localStorage.setItem('otp_sent_time', Date.now().toString());
                localStorage.setItem('auth_identifier_sent', cleanIdentifier);
                
                setStatusMsg("Email OTP resent!");
                showToast("OTP has been resent to your email", "success");
            } else {
                throw new Error("Login method not available.");
            }
        } catch (err: any) {
            console.error("Resend OTP Failed:", err?.message || err);
            const unsupported = isPhone || err?.message?.includes("Phone");
            setStatusMsg(unsupported ? "Method not supported" : "Failed to resend");
            showToast(unsupported ? "Please use your Email to login." : (err?.message || "Failed to resend OTP"), "error");
        } finally {
            setTimeout(() => setStatusMsg(null), 3000);
        }
    };

    const handleVerifyOtp = async () => {
        if (isVerifying) return;

        if (otp.some(digit => digit === '')) {
            showToast("Please enter all 6 digits", "error");
            return;
        }
        setIsVerifying(true);
        const otpString = otp.join('').trim();

        try {
            const supabase = createClient();
            const cleanIdentifier = identifier.trim().toLowerCase();
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
            const isPhone = /^(?:\+977|977)?\d{10}$/.test(cleanIdentifier);

            let formattedPhone = cleanIdentifier;
            if (isPhone) {
                if (cleanIdentifier.startsWith('977')) {
                    formattedPhone = `+${cleanIdentifier}`;
                } else if (!cleanIdentifier.startsWith('+')) {
                    formattedPhone = `+977${cleanIdentifier}`;
                }
            }

            let verifyPromise;

            if (loginMethod === 'whatsapp') {
                const formattedPhone = cleanIdentifier.startsWith('977')
                    ? `+${cleanIdentifier}`
                    : (cleanIdentifier.startsWith('+') ? cleanIdentifier : `+977${cleanIdentifier}`);
                verifyPromise = verifyWhatsappOtpAction(formattedPhone, otpString);
            } else {
                let verifyParams: any = {
                    token: otpString,
                    type: isEmail ? 'email' : 'sms',
                };
                if (isEmail) {
                    verifyParams.email = cleanIdentifier;
                } else {
                    verifyParams.phone = formattedPhone;
                }
                verifyPromise = supabase.auth.verifyOtp(verifyParams);
            }

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Verification timed out. Please try again.")), 15000)
            );

            const result = await Promise.race([verifyPromise, timeoutPromise]);

            // Handle different result shapes from Supabase vs Custom Action
            const error = (result as any).error;
            const data = (result as any).data;
            const success = (result as any).success;

            if (error || (loginMethod === 'whatsapp' && !success)) {
                // If we're already logged in, Supabase might return an error for a used token
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log("Already logged in, ignoring verification error");
                } else {
                    throw new Error(error?.message || (result as any).error || "Invalid OTP");
                }
            }

            // Clear persistence on success
            localStorage.removeItem('auth_identifier');
            localStorage.removeItem('auth_step');
            localStorage.removeItem('otp_sent_time');
            localStorage.removeItem('auth_identifier_sent');

            showToast("Logged in successfully!", "success");
            closeLogin();
            
            const redirectParam = typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('redirect')
                : null;
            
            if (isPage) {
                router.replace(redirectParam || '/account');
            } else {
                router.refresh();
            }
            triggerLoginSuccess();
        } catch (err: any) {
            console.error("OTP Verify Failed:", err?.message || err);
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
            const redirectParam = typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('redirect')
                : null;
            // Pass current path as 'next' so auth callback returns user here, not /account
            const nextPath = encodeURIComponent(redirectParam || pathname || '/');
            const redirectUrl = `${siteUrl.replace(/\/$/, '')}/auth/callback?next=${nextPath}`;

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

    const handleWhatsappLogin = async () => {
        showToast("Not available Currently", "error");
    };

    const handleOtpChange = (value: string, index: number) => {
        // Handle multi-character input (paste/autofill)
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            if (digits.length > 0) {
                const newOtp = [...otp];
                digits.forEach((digit, i) => {
                    if (index + i < 6) newOtp[index + i] = digit;
                });
                setOtp(newOtp);
                // Focus the next empty field or the last one
                const nextToFocus = Math.min(index + digits.length, 5);
                inputRefs[nextToFocus].current?.focus();
                return;
            }
        }

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
                <Image src="/images/supplement-pattern.webp" alt="Supplement Pattern" fill className="object-cover object-top" priority />
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
 <span className="uppercase font-rajdhani font-bold text-[18px] leading-[24px] text-[#e8ffe5] [text-shadow:0_1px_2px_rgba(16,24,40,0.04)]">Supplyment Nepal</span>
                            <span className="text-[10px] font-medium leading-[12px] text-[#b1e7aa] uppercaser">Powered By Bright Nepcare Pvt. Ltd.</span>
                        </div>
                    </div>
                    <button onClick={isPage ? () => window.location.href = '/' : closeLogin} className="lg:hidden flex w-[44px] h-[44px] items-center justify-center bg-[#edffe7] rounded-[12px]">
                        <CloseIcon className="w-[24px] h-[24px] text-[#3f9633]" />
                    </button>
                </div>
                <div className="hidden lg:flex flex-col gap-[12px] text-left">
 <h2 className="font-rajdhani font-bold text-[32px] text-white leading-tight">Your journey to peak <br /> fitness starts here.</h2>
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
                                <h1 className="text-[24px] font-[700] leading-[36px] bg-[linear-gradient(46.44deg,#242424,#7d857b)] bg-clip-text text-transparent">Login to get Started</h1>
                            </header>
                            <div className="flex flex-col gap-[14px]">
                                <div className="flex flex-col gap-[16px]">
                                    <div className={`group flex h-[54px] items-center gap-[8px] rounded-[12px] border ${error ? 'border-red-500' : 'border-[#eaebf0]'} px-[12px] transition-all focus-within:border-[#3f9633] focus-within:ring-1 focus-within:ring-[#3f9633]`}>
                                        <MailIcon className="w-[18px] h-[18px] text-[#68727d]" />
                                        <input type="text" placeholder="Enter your email" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(null); setEmailSuggestion(null); }} className="flex-1 bg-transparent text-[18px] text-[#242424] outline-none placeholder:text-[#68727d]" />
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-[8px] mt-[-10px]">
                                            <span className="text-red-500 text-[12px] font-rajdhani">{error}</span>
                                            {emailSuggestion && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setIdentifier(emailSuggestion); setError(null); setEmailSuggestion(null); }}
                                                    className="text-[12px] font-[600] text-[#308026] bg-[#e8ffe5] px-[8px] py-[2px] rounded-[6px] hover:bg-[#d0f5cc] transition-colors whitespace-nowrap"
                                                >
                                                    Yes, fix it
                                                </button>
                                            )}
                                        </div>
                                    )}
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
                                    <p className="text-[14px] leading-[22px] text-[#68727d] text-left">
                                        Note: This email will be used to login to website
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-[16px] items-center">
                                <span className="text-[12px] font-[600] text-[#7b838d]st">OR LOGIN WITH</span>
                                <div className="flex gap-[12px] w-full max-w-[320px] justify-center">
                                    <button disabled={isSending} onClick={handleGoogleLogin} className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[12px] border border-[#f1f5f9] bg-white transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-70">
                                        <GoogleIcon className="w-[18px] h-[18px]" />
                                        <span className="text-[16px] font-[600] text-[#575757]">Google</span>
                                    </button>
                                    <button disabled={isSending} onClick={handleWhatsappLogin} className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[12px] border border-[#f1f5f9] bg-white transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-70">
                                        <WhatsappIcon className="w-[20px] h-[20px]" />
                                        <span className="text-[16px] font-[600] text-[#575757]">WhatsApp</span>
                                    </button>
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
                                    <h1 className="text-[24px]  font-[700]  leading-[36px] bg-[linear-gradient(46.44deg,#242424,#7d857b)] bg-clip-text text-transparent">
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
                                        type="button"
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
                                            setResendCooldown(60);
                                        }}
                                        className={`text-[14px] font-semibold text-[#242424] hover:underline bg-transparent border-none outline-none cursor-pointer disabled:text-[#68727d] disabled:no-underline`}
                                    >
                                        {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
                                    </button>
                                    {statusMsg && <span className="text-[#308026] text-[12px] font-rajdhani animate-pulse">{statusMsg}</span>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </motion.div>
    );

    if (isPage) {
        return (
            <>
                <div className="hidden lg:block">
                    <FloatingNav alwaysScrolled={true} />
                </div>
                <main className="flex items-start lg:items-center justify-center font-rajdhani mb-[36px]  min-h-screen ">{Content}</main>
                <CartSidebar />
            </>
        );
    }

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
