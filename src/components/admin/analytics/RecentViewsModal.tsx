import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, User, Search } from 'lucide-react';

interface RecentViewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    views: any[];
    onCustomerClick?: (customer: any) => void;
}

export const RecentViewsModal = ({ isOpen, onClose, views, onCustomerClick }: RecentViewsModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const groupedViews = React.useMemo(() => {
        if (!views) return [];
        const grouped = views.reduce((acc: any, view: any) => {
            const key = view.session_id || view.user_id || view.customer_name;
            if (!acc[key]) {
                acc[key] = {
                    id: key,
                    user_id: view.user_id,
                    customer_name: view.customer_name,
                    customer_avatar: view.customer_avatar,
                    customer_email: view.customer_email,
                    customer_phone: view.customer_phone,
                    customer_created_at: view.customer_created_at,
                    last_viewed_at: view.viewed_at,
                    viewed_products: []
                };
            }
            const existingProduct = acc[key].viewed_products.find((p: any) => p.product_id === view.product_id);
            if (!existingProduct) {
                acc[key].viewed_products.push({
                    product_id: view.product_id,
                    product_name: view.product_name,
                    thumbnail: view.thumbnail,
                    viewed_at: view.viewed_at
                });
            }
            if (new Date(view.viewed_at) > new Date(acc[key].last_viewed_at)) {
                acc[key].last_viewed_at = view.viewed_at;
            }
            return acc;
        }, {});
        return Object.values(grouped).sort((a: any, b: any) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime());
    }, [views]);

    const filteredViews = groupedViews.filter((group: any) => {
        const matchesSearch =
            (group.customer_name && group.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            group.viewed_products.some((p: any) => p.product_name && p.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="w-full max-w-5xl h-full max-h-[90vh] bg-[#FAFAFA] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-rubik tracking-tight border border-white/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#bef264]/20 rounded-xl border border-[#bef264]/30 text-[#4d7c0f]">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#242424]">Recent Product Views</h2>
                                    <p className="text-sm text-[#71717a] font-normal mt-0.5">Showing the 50 most recent product interactions</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 focus:outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-6 bg-[#FAFAFA] border-b border-gray-100">
                            <div className="relative max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by product or customer name..."
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bef264]/50 focus:border-[#bef264] sm:text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                            {filteredViews.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredViews.map((userGroup: any, index: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                                            key={userGroup.id}
                                            className="group flex flex-col bg-white rounded-[12px] border border-gray-100 hover:border-gray-200 transition-all p-4 shadow-none hover:shadow-none"
                                        >
                                            {/* Customer Header */}
                                            <div 
                                                className={`flex items-center justify-between mb-4 ${userGroup.user_id && onCustomerClick ? 'cursor-pointer hover:bg-gray-50/50 p-1 -m-1 rounded-lg transition-colors' : ''}`}
                                                onClick={() => {
                                                    if (userGroup.user_id && onCustomerClick) {
                                                        onCustomerClick({
                                                            id: userGroup.user_id,
                                                            name: userGroup.customer_name,
                                                            avatar: userGroup.customer_avatar,
                                                            email: userGroup.customer_email || 'No email',
                                                            phone: userGroup.customer_phone || 'No phone',
                                                            status: 'active',
                                                            createdAt: userGroup.customer_created_at || new Date().toISOString(),
                                                            behavior: { totalOrders: 0, totalSpent: 0, lastActive: userGroup.last_viewed_at, avgOrderValue: 0, isVIP: false, monthlyConsistency: false }
                                                        });
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {userGroup.customer_avatar ? (
                                                        <img src={userGroup.customer_avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100">
                                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-[13px] font-semibold text-[#242424] truncate max-w-[140px]">{userGroup.customer_name}</span>
                                                </div>
                                                <span className="text-[10px] text-[#71717a] font-medium bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                                                    {new Date(userGroup.last_viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            
                                            {/* Products Row */}
                                            <div className="flex items-center gap-2 overflow-x-auto subtle-scrollbar pb-1">
                                                {userGroup.viewed_products.slice(0, 5).map((product: any) => (
                                                    <div key={product.product_id} title={product.product_name} className="w-11 h-11 rounded-lg bg-[#f4f4f5] border border-gray-100 overflow-hidden shrink-0 relative group/product cursor-help">
                                                        <img src={product.thumbnail || '/images/protein.webp'} alt={product.product_name} className="w-full h-full object-cover group-hover/product:scale-110 transition-transform" />
                                                    </div>
                                                ))}
                                                {userGroup.viewed_products.length > 5 && (
                                                    <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                                        <span className="text-[11px] font-bold text-[#71717a]">+{userGroup.viewed_products.length - 5}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                                        <Search className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-[#71717a]">No recent views found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
