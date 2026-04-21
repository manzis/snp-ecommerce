'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/auth.service';
import { fetchBrands, Brand } from '@/services/productService';
import { CATEGORY_THEMES } from '@/lib/CategoryThemes';
import CloseIcon from '@/components/icons/CloseIcon';
import ArrowRightIcon from '@/components/icons/RightBackIcon';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);

    React.useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchBrands();
                // Filter only brands that have an image_url
                setBrands(data.filter(b => b.image_url));
            } catch (error) {
                console.error('Error loading brands for sidebar:', error);
            }
        };
        loadBrands();
    }, []);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
    const avatarUrl = user?.user_metadata?.avatar_url || "/images/avatar.png";

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await AuthService.signOut();
            onClose();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    const BrandsMarquee = () => {
        if (!brands.length) return null;

        return (
            <div className="flex overflow-hidden w-full pointer-events-none">
                <motion.div
                    animate={{ x: [-1000, 0] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex gap-4 whitespace-nowrap items-center h-full"
                >
                    {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
                        <div key={`${brand.id}-${i}`} className="relative h-[20px] w-[50px] shrink-0 opacity-40 grayscale">
                            <Image 
                                src={brand.image_url || '/images/brands/brand-logo.png'} 
                                alt={brand.name} 
                                fill 
                                className="object-contain"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        );
    };

    const CategoriesMarquee = () => {
        const categories = Object.values(CATEGORY_THEMES).map((c: any) => ({
            title: c.title,
            color: c.cardColors?.text || '#242424',
            bg: c.cardColors?.to || '#f0f0f0'
        }));

        return (
            <div className="overflow-hidden pointer-events-none w-full">
                <motion.div
                    animate={{ x: [-600, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex items-center h-full gap-3 whitespace-nowrap opacity-[0.6]"
                >
                    {[...categories, ...categories, ...categories, ...categories].map((cat, i) => (
                        <div 
                            key={i} 
                            style={{ backgroundColor: cat.bg, color: cat.color }} 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border border-black/5"
                        >
                            {cat.title}
                        </div>
                    ))}
                </motion.div>
            </div>
        );
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
        { name: 'Categories', href: '/category' },
        { name: 'Brands', href: '/brand' },
        { name: 'My Rewards', href: '/account/rewards' },
        { name: 'Track Order', href: '/track-order' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* SIDEBAR CONTAINER */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 z-[120] h-full w-[85%] max-w-[360px] bg-white shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* HEADER / USER PROFILE SECTION */}
                        <div className="relative w-full overflow-hidden shrink-0 rounded-b-[36px]">
                            {/* Background Gradient matching Account Page */}
                            <div
                                className="absolute inset-0 z-0 h-full w-full"
                                style={{
                                    background: 'linear-gradient(180deg, #031f00 0%, #318126 100%)',
                                }}
                            />

                            <div className="relative z-10 p-[24px] pt-[40px] flex flex-col gap-[20px]">
                                <div className="flex w-full items-center justify-between">
                                    <button
                                        onClick={onClose}
                                        className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-white/10 text-white backdrop-blur-md transition-transform active:scale-90"
                                    >
                                        <CloseIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                {user ? (
                                    <div className="flex flex-col gap-[12px]">
                                        <Link
                                            href="/account"
                                            onClick={onClose}
                                            className="flex items-center gap-[12px] group"
                                        >
                                            <div className="relative h-[60px] w-[60px] rounded-full overflow-hidden border-2 border-white/80 transition-transform group-active:scale-95">
                                                <Image
                                                    src={avatarUrl}
                                                    alt={displayName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-titillium text-[18px] font-bold text-white uppercase leading-tight">
                                                    Hi, {displayName}
                                                </span>
                                                <span className="text-[13px] text-white/70 font-medium tracking-wide flex items-center gap-1">
                                                    View Profile <ArrowRightIcon className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-[8px] pb-[10px]">
                                        <h3 className="font-titillium text-[20px] font-bold text-white uppercase leading-tight">
                                            Welcome to <br /> SNP Store
                                        </h3>
                                        <Link
                                            href="/login"
                                            onClick={onClose}
                                            className="mt-2 flex h-[44px] w-fit items-center justify-center rounded-[100px] bg-white px-[24px] transition-transform active:scale-95"
                                        >
                                            <span className="font-titillium text-[16px] font-semibold text-[#242424]">
                                                Log in / Register
                                            </span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NAVIGATION LINKS */}
                        <div className="flex-1 overflow-y-auto px-[16px] py-[24px]">
                            <div className="flex flex-col h-full gap-[8px]">
                                <div className="flex flex-col gap-[8px]">
                                    {navLinks.slice(0, -1).map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={onClose}
                                            className="relative flex items-center justify-between rounded-[12px] p-[14px_16px] transition-colors hover:bg-gray-50 active:bg-gray-100 overflow-hidden group/link"
                                        >
                                            <div className="relative z-10 flex items-center flex-1 mr-2 overflow-hidden">
                                                <span className="font-titillium text-[16px] font-semibold text-[#242424] uppercase tracking-[0.2px] shrink-0">
                                                    {link.name}
                                                </span>
                                                {link.name === 'Brands' && (
                                                    <div className="flex-1 ml-4 overflow-hidden mt-0.5">
                                                        <BrandsMarquee />
                                                    </div>
                                                )}
                                                {link.name === 'Categories' && (
                                                    <div className="flex-1 ml-4 overflow-hidden">
                                                        <CategoriesMarquee />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <ArrowRightIcon className="relative z-10 h-4 w-4 text-gray-400 shrink-0" />
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    {navLinks.slice(-1).map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={onClose}
                                            className="flex items-center justify-between rounded-[12px] p-[14px_16px] transition-colors hover:bg-gray-50 active:bg-gray-100"
                                        >
                                            <span className={`font-titillium font-semibold text-[#242424] uppercase tracking-[0.2px] text-[13px] border-b-[1.5px] border-[#242424]`}>
                                                {link.name}
                                            </span>
                                            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER SECTION */}
                        <div className="border-t border-gray-100 p-[24px] shrink-0">
                            {user && (
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`flex w-full items-center gap-2 text-red-500 font-semibold transition-opacity ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                >
                                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                                </button>
                            )}
                            <div className="mt-4 flex flex-col gap-1">
                                <p className="text-[12px] text-gray-400 font-medium">© 2024 SNP STORE. All rights reserved.</p>
                                <div className="flex gap-4">
                                    <Link href="/privacy" className="text-[11px] text-gray-500 hover:underline">Privacy Policy</Link>
                                    <Link href="/terms" className="text-[11px] text-gray-500 hover:underline">Terms of Service</Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
