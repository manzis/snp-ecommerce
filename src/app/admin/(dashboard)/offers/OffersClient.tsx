'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Calendar, Clock, Activity, Search, Image as ImageIcon, ChevronDown, Check, X, AlertCircle } from 'lucide-react';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import AdminModal from '@/components/admin/shared/AdminModal';
import ImageUpload from '@/components/admin/products/ImageUpload';
import { createSaleAction, updateSaleAction, toggleSaleActiveAction, deleteSaleAction } from '@/app/actions/saleActions';

// Components mirroring Finance UI
const MetricCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-xl border border-gray-100 hover:border-gray-300 transition-all group cursor-default"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
                <Icon className="w-5 h-5 text-[#242424]" />
            </div>
            {trend && (
                <div className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {trend > 0 ? 'Active' : 'Inactive'}
                </div>
            )}
        </div>
        <div>
            <p className="text-[#71717a] text-[10px] font-semibold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-[22px] md:text-2xl font-semibold font-rubik text-[#242424] tracking-tight truncate">{value}</h3>
            {subValue && <p className="text-[10px] text-[#a1a1aa] mt-1 font-normal">{subValue}</p>}
        </div>
    </motion.div>
);

export default function OffersClient({ initialSales, availableProducts }: { initialSales: any[], availableProducts: any[] }) {
    const [sales, setSales] = useState(initialSales);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        banner_image: '',
        discount_type: 'AMOUNT' as 'AMOUNT' | 'PERCENTAGE',
        discount_value: '',
        max_discount_percentage: '',
        ends_at: '',
        selectedProducts: [] as string[]
    });
    
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const { showAdminToast } = useAdminToast();
    const { setPrimaryAction, setOverrideTitle } = useAdminUI();

    useEffect(() => {
        setOverrideTitle(null);
        setPrimaryAction(() => openCreateModal);
        return () => {
            setPrimaryAction(null);
        };
    }, []);

    const filteredSales = sales.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Track products that are already in unexpired sales to prevent overlapping
    const unavailableProductsMap = new Map<string, { saleId: string, saleName: string }>();
    sales.forEach(sale => {
        const isExpired = new Date(sale.ends_at) < new Date();
        if (!isExpired) {
            sale.product_ids?.forEach((pid: string) => {
                unavailableProductsMap.set(pid, { saleId: sale.id, saleName: sale.name });
            });
        }
    });

    const activeSalesCount = sales.filter(s => s.is_active && new Date(s.ends_at) > new Date()).length;
    const totalProductsOnSale = sales.reduce((acc, s) => acc + (s.sales_offers_products?.[0]?.count || 0), 0);

    const toggleSaleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const result = await toggleSaleActiveAction(id, !currentStatus);
            if (result.success) {
                setSales(sales.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
                showAdminToast(`Sale ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
            } else {
                showAdminToast(result.message || 'Failed to toggle status', 'error');
            }
        } catch (error) {
            showAdminToast('An error occurred', 'error');
        }
    };

    const handleDeleteSale = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) return;
        
        try {
            const result = await deleteSaleAction(id);
            if (result.success) {
                setSales(sales.filter(s => s.id !== id));
                showAdminToast('Sale deleted successfully', 'success');
            } else {
                showAdminToast(result.message || 'Failed to delete sale', 'error');
            }
        } catch (error) {
            showAdminToast('An error occurred', 'error');
        }
    };

    const openCreateModal = () => {
        setEditingSaleId(null);
        setFormData({
            name: '', slug: '', banner_image: '', discount_type: 'AMOUNT', discount_value: '', max_discount_percentage: '', ends_at: '', selectedProducts: []
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (sale: any) => {
        // Fix: Convert UTC date to local timezone string for datetime-local input
        const d = new Date(sale.ends_at);
        const localDateTime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        setEditingSaleId(sale.id);
        setFormData({
            name: sale.name,
            slug: sale.slug,
            banner_image: sale.banner_image || '',
            discount_type: sale.discount_type,
            discount_value: sale.discount_value.toString(),
            max_discount_percentage: sale.max_discount_percentage?.toString() || '',
            ends_at: localDateTime,
            selectedProducts: sale.product_ids || []
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.discount_value || !formData.ends_at || formData.selectedProducts.length === 0) {
            showAdminToast('Please fill all required fields and select at least one product.', 'error');
            return;
        }

        const value = parseFloat(formData.discount_value);
        if (isNaN(value) || value <= 0 || (formData.discount_type === 'PERCENTAGE' && value > 100)) {
            showAdminToast('Please enter a valid discount value.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Generate a unique slug only on creation to prevent DB conflicts. 
            // On edit, we preserve the original slug to avoid breaking live URLs.
            let finalSlug = formData.slug;
            if (!editingSaleId) {
                const baseSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                const uniqueSuffix = Math.random().toString(36).substring(2, 6);
                finalSlug = `${baseSlug}-${uniqueSuffix}`;
            }
            
            if (editingSaleId) {
                const result = await updateSaleAction(editingSaleId, {
                    name: formData.name,
                    slug: finalSlug,
                    banner_image: formData.banner_image || null,
                    discount_type: formData.discount_type,
                    discount_value: value,
                    max_discount_percentage: parseFloat(formData.max_discount_percentage) || 0,
                    ends_at: new Date(formData.ends_at).toISOString(),
                    product_ids: formData.selectedProducts
                });

                if (result.success && result.data) {
                    showAdminToast('Sale updated successfully!', 'success');
                    setSales(sales.map(s => s.id === editingSaleId ? { ...result.data, product_ids: formData.selectedProducts, product_count: formData.selectedProducts.length } : s));
                    setIsCreateModalOpen(false);
                } else {
                    showAdminToast(result.message || 'Failed to update sale', 'error');
                }
            } else {
                const result = await createSaleAction({
                    name: formData.name,
                    slug: finalSlug,
                    banner_image: formData.banner_image || null,
                    discount_type: formData.discount_type,
                    discount_value: value,
                    max_discount_percentage: parseFloat(formData.max_discount_percentage) || 0,
                    ends_at: new Date(formData.ends_at).toISOString(),
                    product_ids: formData.selectedProducts
                });

                if (result.success && result.data) {
                    showAdminToast('Sale created successfully!', 'success');
                    setSales([{ ...result.data, product_ids: formData.selectedProducts, product_count: formData.selectedProducts.length }, ...sales]);
                    setIsCreateModalOpen(false);
                } else {
                    showAdminToast(result.message || 'Failed to create sale', 'error');
                }
            }
        } catch (error) {
            showAdminToast('An error occurred while saving sale', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleProductSelection = (productId: string) => {
        const unavailableInfo = unavailableProductsMap.get(productId);
        if (unavailableInfo && unavailableInfo.saleId !== editingSaleId) {
            return; // Prevent selecting if it's in another unexpired sale
        }

        setFormData(prev => ({
            ...prev,
            selectedProducts: prev.selectedProducts.includes(productId)
                ? prev.selectedProducts.filter(id => id !== productId)
                : [...prev.selectedProducts, productId]
        }));
    };

    const searchFilteredProducts = availableProducts.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.brands?.name?.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik tracking-tight">
            <AdminSubNav
                onSearch={setSearchQuery}
                searchPlaceholder="Search sales & offers..."
                searchOnLeft={true}
                refreshLoading={false}
                filterDropdown={
                    <button
                        onClick={() => openCreateModal()}
                        className="flex items-center gap-2 bg-[#242424] text-white px-4 h-[38px] rounded-[10px] text-[13px] font-semibold hover:bg-black transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Sale</span>
                        <span className="sm:hidden">New</span>
                    </button>
                }
            />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[200px] flex flex-col gap-8 md:gap-10">
                {!searchQuery && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <MetricCard
                            title="Active Sales"
                            value={activeSalesCount}
                            subValue="Currently running promotions"
                            icon={Activity}
                            trend={activeSalesCount > 0 ? 1 : 0}
                        />
                        <MetricCard
                            title="Total Sales History"
                            value={sales.length}
                            subValue="All time promotions created"
                            icon={Calendar}
                        />
                        <MetricCard
                            title="Products on Sale"
                            value={totalProductsOnSale}
                            subValue="Items currently discounted"
                            icon={Tag}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl border border-gray-100">
                                    <Tag className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base text-[#242424]">Campaigns & Offers</h3>
                                    <p className="text-[11px] text-[#71717a] font-normal uppercase tracking-wider">Manage active discounts</p>
                                </div>
                            </div>
                        </div>

                        {sales.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Tag className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-gray-900 font-medium mb-1">No sales found</h4>
                                <p className="text-sm text-gray-500 max-w-sm mb-6">Create a sale campaign to offer discounts on specific products.</p>
                                <button
                                    onClick={() => openCreateModal()}
                                    className="bg-[#242424] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                                >
                                    Create First Sale
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[#a1a1aa] text-[10px] uppercase tracking-[0.1em] font-semibold border-b border-gray-100">
                                            <th className="px-6 py-5">Sale Name</th>
                                            <th className="px-6 py-5">Discount</th>
                                            <th className="px-6 py-5">Ends At</th>
                                            <th className="px-6 py-5 text-center">Products</th>
                                            <th className="px-6 py-5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSales.map((sale) => {
                                            const isExpired = new Date(sale.ends_at) < new Date();
                                            const statusText = isExpired ? 'Expired' : sale.is_active ? 'Live' : 'Paused';
                                            const statusColor = isExpired ? 'bg-gray-100 text-gray-600' : sale.is_active ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600';
                                            
                                            return (
                                                <tr key={sale.id} className={`group transition-colors ${!sale.is_active ? 'opacity-60 hover:opacity-100' : 'hover:bg-gray-50/80'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {sale.banner_image ? (
                                                                <img src={sale.banner_image} alt={sale.name} className="w-12 h-8 rounded object-cover border border-gray-200" />
                                                            ) : (
                                                                <div className="w-12 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] font-semibold text-[#242424] tracking-tight">{sale.name}</span>
                                                                <span className="text-[10px] text-[#a1a1aa] font-normal mt-0.5">/{sale.slug}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700">
                                                            {sale.discount_type === 'PERCENTAGE' ? `${sale.discount_value}% OFF` : `रु ${sale.discount_value} OFF`}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-[#71717a] font-medium">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(sale.ends_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[13px] font-bold text-[#242424]">{sale.product_count || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                                                                {statusText}
                                                            </span>
                                                            <button 
                                                                onClick={() => openEditModal(sale)}
                                                                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                Edit
                                                            </button>
                                                            {!isExpired && (
                                                                <button 
                                                                    onClick={() => toggleSaleStatus(sale.id, sale.is_active)}
                                                                    className="text-[11px] font-medium text-gray-500 hover:text-black underline"
                                                                >
                                                                    {sale.is_active ? 'Pause' : 'Resume'}
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handleDeleteSale(sale.id)}
                                                                className="text-[11px] font-medium text-red-500 hover:text-red-700 underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Sale Modal */}
            <AdminModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={editingSaleId ? 'Edit Sale Campaign' : 'Create New Sale Campaign'}
                description="Configure discount rules and select applicable products."
                maxWidth="max-w-xl"
                footerActions={
                    <div className="flex w-full gap-4">
                        <button 
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 px-8 py-3.5 text-[13px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 rounded-2xl transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="create-sale-form"
                            disabled={isSubmitting || formData.selectedProducts.length === 0}
                            className="flex-[2] md:flex-none md:px-12 py-3.5 bg-[#242424] text-white rounded-2xl text-[13px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                editingSaleId ? 'Update Campaign' : 'Launch Campaign'
                            )}
                        </button>
                    </div>
                }
            >
                <form id="create-sale-form" onSubmit={handleCreateSubmit} className="space-y-6">
                    
                    {/* Basics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Sale Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Dashain Mega Sale"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#242424] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Ends At <span className="text-red-500">*</span></label>
                            <input 
                                type="datetime-local" 
                                required
                                value={formData.ends_at}
                                onChange={e => setFormData({...formData, ends_at: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#242424] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Banner Image</label>
                        <ImageUpload
                            value={formData.banner_image}
                            onChange={(url) => setFormData({...formData, banner_image: url})}
                            path="sales"
                            className="w-full"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Upload the campaign banner. Used on Homepage and Sale page.</p>
                    </div>

                    {/* Discount Configuration */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                        <h4 className="text-sm font-semibold text-[#242424] flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-600" />
                            Discount Value
                        </h4>
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <select 
                                    value={formData.discount_type}
                                    onChange={e => setFormData({...formData, discount_type: e.target.value as any})}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#242424] outline-none"
                                >
                                    <option value="AMOUNT">Flat Amount (रु)</option>
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                </select>
                            </div>
                            <div className="flex-1 relative">
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    step="any"
                                    placeholder={formData.discount_type === 'PERCENTAGE' ? "e.g. 15" : "e.g. 500"}
                                    value={formData.discount_value}
                                    onChange={e => setFormData({...formData, discount_value: e.target.value})}
                                    className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#242424] outline-none font-semibold"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                                    {formData.discount_type === 'PERCENTAGE' ? '%' : 'रु'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                                This discount is applied <strong>additionally</strong> on top of the product's existing discounted price. A product normally selling for रु 1,500 with a रु 200 Sale will be priced at रु 1,300 during the campaign.
                            </p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Advertised Max Discount (%) <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        placeholder="e.g. 50"
                                        value={formData.max_discount_percentage}
                                        onChange={e => setFormData({...formData, max_discount_percentage: e.target.value})}
                                        className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-sm focus:ring-2 focus:ring-[#242424] outline-none font-semibold"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">If set, the storefront will boldly display "Up to X% OFF" to make the sale look more appealing.</p>
                            </div>
                        </div>
                    </div>

                    {/* Products Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Products <span className="text-red-500">*</span></label>
                            <span className="text-[11px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{formData.selectedProducts.length} selected</span>
                        </div>
                        
                        <div className="relative border border-gray-300 rounded-xl bg-white shadow-sm overflow-visible">
                            <div className="flex items-center px-4 py-3 border-b border-gray-100 relative">
                                <Search className="w-4 h-4 text-gray-400 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search products by name or brand..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    onFocus={() => setIsProductDropdownOpen(true)}
                                    className="w-full outline-none text-sm bg-transparent"
                                />
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                {searchFilteredProducts.length === 0 ? (
                                    <p className="text-center text-xs text-gray-400 py-4">No products found</p>
                                ) : (
                                    searchFilteredProducts.map(product => {
                                        const isSelected = formData.selectedProducts.includes(product.id);
                                        const unavailableInfo = unavailableProductsMap.get(product.id);
                                        const isUnavailable = unavailableInfo && unavailableInfo.saleId !== editingSaleId;

                                        return (
                                            <div 
                                                key={product.id}
                                                onClick={() => toggleProductSelection(product.id)}
                                                className={`flex items-center p-2 rounded-lg transition-colors ${
                                                    isUnavailable 
                                                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                                        : isSelected 
                                                            ? 'bg-blue-50 border border-blue-100 cursor-pointer' 
                                                            : 'hover:bg-gray-50 border border-transparent cursor-pointer'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mr-3 transition-colors ${
                                                    isUnavailable
                                                        ? 'bg-gray-200 border-gray-300'
                                                        : isSelected 
                                                            ? 'bg-blue-600 border-blue-600 text-white' 
                                                            : 'border-gray-300 bg-white'
                                                }`}>
                                                    {isSelected && !isUnavailable && <Check className="w-3.5 h-3.5" />}
                                                    {isUnavailable && <X className="w-3.5 h-3.5 text-gray-500" />}
                                                </div>
                                                <img src={product.images?.[0] || ''} className={`w-8 h-8 rounded bg-gray-100 object-cover mr-3 shrink-0 ${isUnavailable ? 'grayscale' : ''}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-semibold truncate ${isSelected && !isUnavailable ? 'text-blue-900' : 'text-gray-800'}`}>{product.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-gray-500 truncate">{product.brands?.name || 'No Brand'}</p>
                                                        {isUnavailable && (
                                                            <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded truncate">
                                                                In: {unavailableInfo.saleName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2 shrink-0">
                                                    <p className="text-xs font-bold text-[#242424]">रु {product.discounted_price}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                    
                </form>
            </AdminModal>
        </div>
    );
}
