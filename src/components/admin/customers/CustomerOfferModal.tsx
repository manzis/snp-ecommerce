'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Mail,
    ShoppingBag,
    Ticket,
    Check,
    Copy
} from 'lucide-react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { CustomerData } from '@/app/actions/customerActions';
import { fetchAllProductsAction } from '@/app/actions/productActions';
import { fetchCouponsAction } from '@/app/actions/couponActions';

interface CustomerOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerData | null;
}

export default function CustomerOfferModal({
    isOpen,
    onClose,
    customer
}: CustomerOfferModalProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [couponCode, setCouponCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        const [prodRes, coupRes] = await Promise.all([
            fetchAllProductsAction(),
            fetchCouponsAction()
        ]);

        if (prodRes.success) setProducts(prodRes.data || []);
        if (coupRes.success) setCoupons(coupRes.data || []);

        setLoading(false);
    };

    if (!customer) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 3);

    const activeCoupons = coupons.filter(c => c.is_active);

    const generateWhatsAppLink = () => {
        if (!selectedProduct) return '';

        const productName = selectedProduct.title || selectedProduct.name;
        const productLink = `https://www.brightsupplements.store/product/${selectedProduct.slug}`;
        const name = (customer?.name || '').split(' ')[0];

        // Find selected coupon details
        const selectedCoupon = coupons.find(c => c.code === couponCode);
        const couponDetails = selectedCoupon?.description || '';

        const message = `Hi *${name}*, 👋\n\nWe noticed you were interested in *${productName}* and we'd love to help you get it! 🚀\n\nFor a limited time, we are offering this exclusively to you at a special price.\n\nUse Coupon Code: *${couponCode || 'LUCKY50'}* 🎫\n*${couponDetails}*\n\nOrder Now: ${productLink}\n\n*Exclusive discount*`;

        // Handle Nepal Country Code (+977)
        let rawPhone = (customer?.phone || '').replace(/\D/g, '');
        if (rawPhone.length === 10 && rawPhone.startsWith('9')) {
            rawPhone = `977${rawPhone}`;
        } else if (rawPhone.length > 0 && !rawPhone.startsWith('977')) {
            rawPhone = `977${rawPhone}`;
        }

        return `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
    };

    const generateEmailLink = () => {
        if (!selectedProduct) return '';

        const productName = selectedProduct.title || selectedProduct.name;
        const productLink = `${window.location.origin}/product/${selectedProduct.slug}`;
        const name = (customer?.name || '').split(' ')[0];

        // Find selected coupon details
        const selectedCoupon = coupons.find(c => c.code === couponCode);
        const couponDetails = selectedCoupon?.description || '';

        const subject = `Exclusive Offer Just for You, ${name}!`;
        const body = `Hi ${name},\n\nWe noticed you were interested in ${productName} and we'd love to help you get it!\n\nFor a limited time, we are offering this exclusively to you at a special price.\n\nUse Coupon Code: ${couponCode || 'LUCKY50'}\n${couponDetails}\n\nclaim it here ! ${productLink}\n\nExclusive discount\n\nBest regards,\nSNP Team`;

        return `mailto:${customer?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleSendWhatsApp = () => {
        const link = generateWhatsAppLink();
        if (link) window.open(link, '_blank');
    };

    const handleSendEmail = () => {
        const link = generateEmailLink();
        if (link) window.open(link, '_blank');
    };

    const handleCopyMessage = () => {
        const rawLink = generateWhatsAppLink();
        const messageText = rawLink.split('text=')[1]
            ? decodeURIComponent(rawLink.split('text=')[1])
            : "";

        if (messageText) {
            navigator.clipboard.writeText(messageText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="Generate Exclusive Offer"
            description={`Targeted marketing for ${customer?.name || ''}`}
            maxHeight="max-h-[90dvh]"
            footerActions={
                <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                        disabled={!selectedProduct}
                        onClick={handleSendWhatsApp}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#242424] text-white rounded-xl text-[10px] font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
                    </button>
                    <button
                        disabled={!selectedProduct}
                        onClick={handleSendEmail}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-[#242424] rounded-xl text-[10px] font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        <Mail className="w-3.5 h-3.5" /> Send Email
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-3">
                    <label className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" /> 1. Select Target Product
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#242424]/5 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-2">
                        {loading && products.length === 0 ? (
                            <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                        ) : filteredProducts.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProduct(p)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${selectedProduct?.id === p.id
                                    ? 'border-[#242424] bg-gray-50/50'
                                    : 'border-gray-50 hover:border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-white">
                                    <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-[#242424] truncate">{p.name}</p>
                                    <p className="text-[10px] text-[#71717a]">रु {p.discounted_price?.toLocaleString()}</p>
                                </div>
                                {selectedProduct?.id === p.id && (
                                    <div className="w-5 h-5 bg-[#242424] rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Coupon Selection */}
                <div className="space-y-3">
                    <label className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5" /> 2. Select Exclusive Coupon
                    </label>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {loading && coupons.length === 0 ? (
                            <div className="h-10 w-full bg-gray-50 rounded-xl animate-pulse" />
                        ) : activeCoupons.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCouponCode(c.code)}
                                className={`px-3 py-2 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-2 ${couponCode === c.code
                                    ? 'border-[#242424] bg-[#242424] text-white shadow-lg shadow-black/10'
                                    : 'border-gray-100 bg-gray-50 text-[#242424] hover:border-gray-300'
                                    }`}
                            >
                                {c.code}
                                {!c.is_public && <div className="w-1 h-1 rounded-full bg-red-400" title="Private Coupon" />}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="Or enter custom code..."
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#242424]/5"
                    />
                    <p className="text-[10px] text-[#a1a1aa] italic">Admins can see all available coupons including private ones.</p>
                </div>

                <div className="space-y-3 pt-2">
                    <label className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" /> Template Preview
                    </label>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp Format</span>
                            </div>

                            {selectedProduct && (
                                <button
                                    onClick={handleCopyMessage}
                                    className="p-1.5 hover:bg-gray-200/50 rounded-lg transition-all text-[#71717a] hover:text-[#242424] flex items-center gap-1.5"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3 h-3 text-green-600" />
                                            <span className="text-[10px] font-bold text-green-600">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">Copy</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <p className="text-[12px] text-[#242424] whitespace-pre-wrap leading-relaxed font-normal italic">
                            {selectedProduct ? (
                                generateWhatsAppLink().split('text=')[1] ? decodeURIComponent(generateWhatsAppLink().split('text=')[1]) : "Generating message..."
                            ) : (
                                "Select a product to generate the offer message..."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </AdminModal>
    );
}
