import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, User, Search } from 'lucide-react';

interface RecentViewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    views: any[];
}

export const RecentViewsModal = ({ isOpen, onClose, views }: RecentViewsModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredViews = views.filter((view) => {
        const matchesSearch =
            (view.product_name && view.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (view.customer_name && view.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
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

                        {/* Table */}
                        <div className="flex-1 overflow-y-auto bg-white">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm shadow-sm z-10">
                                    <tr className="text-[#71717a] text-xs font-semibold border-b border-gray-200">
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredViews.length > 0 ? (
                                        filteredViews.map((view: any, index) => (
                                            <motion.tr 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                                                key={view.id} 
                                                className="group hover:bg-gray-50/80 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-white overflow-hidden shrink-0 shadow-sm group-hover:border-gray-200 transition-all">
                                                            <img src={view.thumbnail || '/images/protein.webp'} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-[#242424] truncate max-w-[300px] group-hover:text-blue-600 transition-colors">{view.product_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {view.customer_avatar ? (
                                                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm">
                                                                <img src={view.customer_avatar} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                                                                <User className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-[#242424]">{view.customer_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs text-[#71717a] font-normal px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                        {new Date(view.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                    <Search className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-medium text-[#71717a]">No recent views found matching your search.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
