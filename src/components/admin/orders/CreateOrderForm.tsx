'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createManualOrderAction } from '@/app/actions/orderActions';
import { fetchAllCustomersAction } from '@/app/actions/profile';
import { fetchAllProductsAction } from '@/app/actions/productActions';
import AdminDropdown from '@/components/admin/shared/AdminDropdown';
import AdminModal from '@/components/admin/shared/AdminModal';
import PlusIcon from '@/components/icons/PlusIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import CloseIcon from '@/components/icons/CloseIcon';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import TickIcon from '@/components/icons/TickIcon';
import MapSelector from '@/components/checkout/MapSelector';
import HorizontalDotsIcon from '@/components/icons/DotsHorizontalIcon';
import { reverseGeocode } from '@/utils/geocode';

// Skeleton Component for Shell-First Loading
const CreateOrderSkeleton = () => (
    <div className="space-y-8 animate-pulse p-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-zinc-100 rounded-lg"></div>
                <div className="h-4 w-64 bg-zinc-50 rounded-lg"></div>
            </div>
            <div className="h-10 w-32 bg-zinc-100 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                {/* Selection Cards Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-[200px] bg-zinc-50 rounded-3xl border border-zinc-100"></div>
                    <div className="h-[200px] bg-zinc-50 rounded-3xl border border-zinc-100"></div>
                </div>
                {/* Product List Skeleton */}
                <div className="h-[300px] bg-white rounded-3xl border border-zinc-200"></div>
            </div>
            <div className="lg:col-span-4 space-y-6">
                {/* Logistics Skeleton */}
                <div className="h-[400px] bg-zinc-50 rounded-3xl border border-zinc-100"></div>
                {/* Summary Skeleton */}
                <div className="h-[150px] bg-white rounded-3xl border border-zinc-200"></div>
            </div>
        </div>
    </div>
);

interface Customer {
    id: string;
    full_name: string;
    email?: string;
    phone: string;
    address_data?: any;
}

interface ProductVariant {
    id: string;
    original_price: number;
    discounted_price: number;
    stock_count: number;
    size?: { id: string, size_label: string };
    flavour?: { id: string, flavour_name: string };
}

interface Product {
    id: string;
    name: string;
    images: string[];
    original_price: number;
    discounted_price: number;
    brands?: { name: string } | null;
    product_variants: ProductVariant[];
}

interface SelectedItem {
    id: string; // Unique ID for the row
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
    mrp: number;
    name: string;
    image: string;
    selected_size: string | null;
    selected_flavor: string | null;
}

export default function CreateOrderForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { showAdminToast } = useAdminToast();

    // Data from server
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Form State
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        full_name: '',
        email: '',
        phone: ''
    });

    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        area: '',
        city: '',
        state: 'Bagmati',
        country: 'Nepal',
        pincode: '',
        option: 'home_delivery' as 'home_delivery' | 'pickup'
    });

    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
    const [paymentRemarks, setPaymentRemarks] = useState('');

    // Granular Pricing State
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [bundleDiscount, setBundleDiscount] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [shippingFeeManual, setShippingFeeManual] = useState<number | null>(null);

    // Modal states
    const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Load initial data
    useEffect(() => {
        async function loadData() {
            setInitialLoading(true);
            try {
                const [custRes, prodRes] = await Promise.all([
                    fetchAllCustomersAction(),
                    fetchAllProductsAction()
                ]);

                if (custRes.success && custRes.customers) setCustomers(custRes.customers as Customer[]);
                if (prodRes.success && prodRes.data) setProducts(prodRes.data as any);
            } catch (err) {
                console.error("Failed to load form data", err);
            } finally {
                setInitialLoading(false);
            }
        }
        loadData();
    }, []);

    // Handle customer selection
    const handleCustomerChange = (id: string) => {
        setSelectedCustomerId(id);
        const customer = customers.find(c => c.id === id);
        if (customer) {
            setCustomerInfo({
                full_name: customer.full_name,
                email: customer.email || '',
                phone: customer.phone
            });
            // Auto-fill address if available in profile
            if (customer.address_data) {
                const addr = customer.address_data.addressDetails || customer.address_data;
                const deliveryOption = customer.address_data.option || (addr.type?.toLowerCase() === 'pickup' ? 'pickup' : 'home_delivery');
                
                setShippingAddress(prev => ({
                    ...prev,
                    street: addr.street || '',
                    area: addr.area || '',
                    city: addr.city || '',
                    state: addr.state || 'Bagmati',
                    country: addr.country || 'Nepal',
                    pincode: addr.pincode || '',
                    option: deliveryOption === 'home' ? 'home_delivery' : (deliveryOption as 'home_delivery' | 'pickup')
                }));
            }
        }
    };

    // Clear selected customer
    const clearCustomer = () => {
        setSelectedCustomerId('');
        setCustomerInfo({
            full_name: '',
            email: '',
            phone: ''
        });
        setShippingAddress({
            street: '',
            area: '',
            city: '',
            state: 'Bagmati',
            country: 'Nepal',
            pincode: '',
            option: 'home_delivery'
        });
    };

    // Add Product Row
    const addProductItem = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Default to first variant if exists
        const variant = product.product_variants[0];
        
        const newItem: SelectedItem = {
            id: Math.random().toString(36).substr(2, 9),
            product_id: product.id,
            variant_id: variant?.id || '',
            name: product.name,
            image: product.images?.[0] || '/images/placeholder.png',
            quantity: 1,
            price: variant ? variant.discounted_price : product.discounted_price,
            mrp: variant ? variant.original_price : product.original_price,
            selected_size: variant?.size?.size_label || null,
            selected_flavor: variant?.flavour?.flavour_name || null
        };

        setSelectedItems(prev => [...prev, newItem]);
    };

    const removeProductItem = (id: string) => {
        setSelectedItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItemQuantity = (id: string, delta: number) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const updateItemVariant = (id: string, variantId: string) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.id === id) {
                const product = products.find(p => p.id === item.product_id);
                const variant = product?.product_variants.find(v => v.id === variantId);
                if (variant) {
                    return {
                        ...item,
                        variant_id: variant.id,
                        price: variant.discounted_price,
                        mrp: variant.original_price,
                        selected_size: variant.size?.size_label || null,
                        selected_flavor: variant.flavour?.flavour_name || null
                    };
                }
            }
            return item;
        }));
    };

    // Calculations
    const totals = useMemo(() => {
        const mrpSubtotal = selectedItems.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
        const salesSubtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        const discountOnMRP = mrpSubtotal - salesSubtotal;
        
        // COD Fee: 13 if COD selected
        const codFees = paymentMethod === 'COD' ? 13 : 0;
        
        // Shipping Logic: Home Delivery = 150, Pickup = 100
        const autoShipping = shippingAddress.option === 'home_delivery' ? 150 : 100;
        const currentShipping = shippingFeeManual !== null ? shippingFeeManual : autoShipping;
        
        const grandTotal = salesSubtotal - couponDiscount - bundleDiscount + currentShipping + codFees + taxAmount;

        return { 
            mrpSubtotal, 
            salesSubtotal, 
            discountOnMRP, 
            shipping: currentShipping, 
            couponDiscount,
            bundleDiscount,
            codFees,
            taxAmount,
            grandTotal 
        };
    }, [selectedItems, couponDiscount, bundleDiscount, taxAmount, shippingFeeManual, paymentMethod, shippingAddress.option]);

    const handleCreateOrderClick = () => {
        if (!customerInfo.email || !customerInfo.full_name) {
            showAdminToast("Please fill customer email and name.", 'error');
            return;
        }
        if (selectedItems.length === 0) {
            showAdminToast("Please add at least one product.", 'error');
            return;
        }
        setShowConfirmModal(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const names = customerInfo.full_name.trim().split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';

            const orderData = {
                user_id: selectedCustomerId || null,
                customerEmail: customerInfo.email,
                customerName: customerInfo.full_name,
                customerPhone: customerInfo.phone,
                shipping_address: {
                    option: shippingAddress.option === 'home_delivery' ? 'home' : 'pickup',
                    addressId: null,
                    shippingPrice: totals.shipping,
                    addressDetails: {
                        first_name: firstName,
                        last_name: lastName,
                        email: customerInfo.email,
                        phone: customerInfo.phone,
                        city: shippingAddress.city,
                        area: shippingAddress.area,
                        street: shippingAddress.street,
                        pincode: shippingAddress.pincode,
                        state: shippingAddress.state,
                        country: shippingAddress.country,
                        type: shippingAddress.option === 'home_delivery' ? 'Home' : 'Pickup'
                    }
                },
                total_amount: totals.grandTotal,
                mrp_amount: totals.mrpSubtotal,
                discount_amount: totals.discountOnMRP + totals.couponDiscount + totals.bundleDiscount,
                discount_on_mrp: totals.discountOnMRP,
                coupon_discount: totals.couponDiscount,
                coupon_code: couponCode || null,
                bundle_discount: totals.bundleDiscount,
                shipping_amount: totals.shipping,
                cod_fees: totals.codFees,
                tax_amount: totals.taxAmount,
                payment_method: paymentMethod,
                payment_remarks: paymentRemarks
            };

            const items = selectedItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                mrp: item.mrp,
                selected_size: item.selected_size,
                selected_flavor: item.selected_flavor
            }));

            const result = await createManualOrderAction(orderData, items);
            if (result?.success) {
                showAdminToast("Order created successfully!", 'success');
                router.push('/admin/orders');
            } else {
                showAdminToast(result?.message || "Failed to create order", 'error');
            }
        } catch (err: any) {
            showAdminToast(err.message || "Something went wrong", 'error');
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
        }
    };

    // Removal of full-page loading blocker

    const customerOptions = customers.map(c => ({
        id: c.id,
        name: c.full_name,
        subtext: c.email
    }));

    const productOptions = products.map(p => ({
        id: p.id,
        name: p.name,
        subtext: `${p.brands?.name || 'SNP Nutrition'} • Base Rs. ${p.discounted_price}`,
        image: p.images?.[0]
    }));

    const SummaryPanel = ({ isDark = true }: { isDark?: boolean }) => (
        <div className={`flex flex-col h-full ${isDark ? 'bg-[#0f172a] text-white' : 'bg-white text-zinc-900'} space-y-8 p-8 transition-colors`}>
            <div>
                <h2 className={`text-[12px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-6`}>Order Summary</h2>
                
                <div className="space-y-4">
                    <div className="flex justify-between text-[13px]">
                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Gross MRP</span>
                        <span className="font-medium font-mono">Rs. {totals.mrpSubtotal}</span>
                    </div>
                    {totals.discountOnMRP > 0 && (
                        <div className="flex justify-between text-[13px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Product Discount</span>
                            <span className="text-green-500 font-medium font-mono">- Rs. {totals.discountOnMRP}</span>
                        </div>
                    )}
                    {totals.couponDiscount > 0 && (
                        <div className="flex justify-between text-[13px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Coupon Savings</span>
                            <span className="text-green-500 font-medium font-mono">- Rs. {totals.couponDiscount}</span>
                        </div>
                    )}
                    {totals.bundleDiscount > 0 && (
                        <div className="flex justify-between text-[13px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Bundle Savings</span>
                            <span className="text-green-500 font-medium font-mono">- Rs. {totals.bundleDiscount}</span>
                        </div>
                    )}
                    <div className="h-px border-t border-dotted border-zinc-700/30 my-2" />
                    <div className="flex justify-between text-[13px]">
                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Shipping ({shippingAddress.option === 'home_delivery' ? 'Home' : 'Pickup'})</span>
                        <span className="font-medium text-blue-400 font-mono">+ Rs. {totals.shipping}</span>
                    </div>
                    {totals.codFees > 0 && (
                        <div className="flex justify-between text-[13px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>COD Service Fee</span>
                            <span className="font-medium text-blue-400 font-mono">+ Rs. {totals.codFees}</span>
                        </div>
                    )}
                    {totals.taxAmount > 0 && (
                        <div className="flex justify-between text-[13px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Tax Payload</span>
                            <span className="font-medium font-mono">+ Rs. {totals.taxAmount}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`mt-auto pt-6 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <div className="flex justify-between items-end mb-8">
                    <div className="flex flex-col">
                        <span className={`text-[10px] tracking-widest font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Total Amount</span>
                        <span className={`text-4xl font-medium tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'} font-mono`}>Rs. {totals.grandTotal}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={handleCreateOrderClick}
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl ${isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-900'} text-[13px] font-medium tracking-wider transition-all active:scale-[0.98] disabled:opacity-50`}
                    >
                        {loading ? 'Processing...' : 'Generate Order'}
                    </button>
                    {!showConfirmModal && (
                        <p className={`text-[10px] text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-[0.2em]`}>
                            Authorized Administrative Action
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-white font-rubik overflow-hidden">
            {/* Full Width Top Nav */}
            <div className="flex-none bg-white z-[100] border-b border-zinc-100">
                <DynamicAdminNav>
                    <div className="flex items-center gap-4">
                        <h1 className="text-[15px] font-bold tracking-tight px-4">New Sales Order</h1>
                    </div>
                </DynamicAdminNav>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Content Area - Scrollable */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {initialLoading ? (
                        <CreateOrderSkeleton />
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-0 pb-32">
                        
                        {/* Section 01: Select Customer */}
                        <section className="p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-medium text-zinc-400 font-mono">01</span>
                                <h2 className="text-[13px] font-medium text-zinc-800">Select Customer</h2>
                                <div className="h-px flex-1 bg-zinc-200/60" />
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-zinc-200 bg-white">
                                            <AdminDropdown 
                                                options={customerOptions}
                                                onChange={handleCustomerChange}
                                                placeholder="Search Existing Client Repository..."
                                                value={selectedCustomerId}
                                                onCreateNew={() => setShowCreateCustomerModal(true)}
                                                createNewLabel="Create Customer"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Selected/Created Customer Summary */}
                                    {(selectedCustomerId || customerInfo.email) && (
                                        <div className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl animate-in fade-in slide-in-from-left-4 group relative">
                                            <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-[12px] font-medium text-zinc-400 font-mono">
                                                {customerInfo.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-medium truncate">{customerInfo.full_name || 'Guest User'}</span>
                                                    {!selectedCustomerId && (
                                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-medium tracking-tighter border border-blue-100 rounded">New Guest</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[120px]">{customerInfo.email}</span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span className="text-[11px] text-zinc-400 font-medium">{customerInfo.phone}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={clearCustomer}
                                                className="p-2 text-zinc-400 hover:text-red-500 transition-all rounded-lg"
                                                title="Remove customer"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Section 02: Shipping Details */}
                        <section className="p-8 space-y-6 bg-zinc-50/50 border-y border-zinc-100">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-medium text-zinc-400 font-mono">02</span>
                                <h3 className="text-[11px] font-medium text-zinc-400">Shipping Details</h3>
                                <div className="h-px flex-1 bg-zinc-200/60" />
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2 p-1 bg-zinc-100/50 rounded-xl border border-zinc-200">
                                        <button 
                                            onClick={() => setShippingAddress(prev => ({...prev, option: 'home_delivery'}))}
                                            className={`px-6 py-2.5 text-[11px] font-medium transition-all rounded-lg ${shippingAddress.option === 'home_delivery' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-400 hover:text-zinc-600'}`}
                                        >Home Delivery</button>
                                        <button 
                                            onClick={() => setShippingAddress(prev => ({...prev, option: 'pickup'}))}
                                            className={`px-6 py-2.5 text-[11px] font-medium transition-all rounded-lg ${shippingAddress.option === 'pickup' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-400 hover:text-zinc-600'}`}
                                        >Local Pickup</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Map Side */}
                                    <div className="h-[400px] bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                                        <MapSelector 
                                            onLocationSelect={async (lat, lng) => {
                                                const address = await reverseGeocode(lat, lng);
                                                if (address) {
                                                    setShippingAddress(prev => ({
                                                        ...prev,
                                                        street: address.street,
                                                        area: address.area,
                                                        city: address.city,
                                                        pincode: address.pincode
                                                    }));
                                                }
                                            }} 
                                        />
                                    </div>

                                    {/* Form Side */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-medium text-zinc-500 px-1">Street / Block</label>
                                            <input 
                                                type="text"
                                                value={shippingAddress.street}
                                                onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})}
                                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 transition-all"
                                                placeholder="Street address or block no."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-medium text-zinc-500 px-1">Area</label>
                                                <input 
                                                    type="text"
                                                    value={shippingAddress.area}
                                                    onChange={e => setShippingAddress({...shippingAddress, area: e.target.value})}
                                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-medium text-zinc-500 px-1">City</label>
                                                <input 
                                                    type="text"
                                                    value={shippingAddress.city}
                                                    onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-medium text-zinc-500 px-1">Location Pincode</label>
                                            <input 
                                                type="text"
                                                value={shippingAddress.pincode}
                                                onChange={e => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 transition-all"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 03: Selected Items */}
                        <section className="p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-medium text-zinc-400 font-mono">03</span>
                                <h2 className="text-[13px] font-medium text-zinc-800">Select Product & Items</h2>
                                <div className="h-px flex-1 bg-zinc-200/60" />
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-zinc-200 bg-white">
                                    <AdminDropdown 
                                        options={productOptions}
                                        onChange={addProductItem}
                                        placeholder="Scan barcode or manual search..."
                                        value=""
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
                                {selectedItems.length === 0 ? (
                                    <div className="py-20 text-center text-zinc-400 italic text-[13px]">
                                        Manifest empty. Add products to proceed.
                                    </div>
                                ) : (
                                    selectedItems.map((item) => {
                                        const product = products.find(p => p.id === item.product_id);
                                        return (
                                            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                                                {/* Row 1: Item Identity & Price (Mobile) */}
                                                <div className="flex items-center gap-4 w-full sm:flex-1 min-w-0">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-zinc-100 p-1 sm:p-2 shrink-0">
                                                        <Image src={item.image} alt={item.name} width={64} height={64} className="object-contain w-full h-full" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-medium text-zinc-400 mb-0.5">
                                                            {product?.brands?.name || 'SNP Nutrition'}
                                                        </div>
                                                        <h4 className="text-[13px] sm:text-[14px] font-medium tracking-tight truncate">{item.name}</h4>
                                                        {/* Desktop Variant Indicator */}
                                                        <div className="hidden sm:flex mt-1 items-center gap-2">
                                                            {product && product.product_variants.length > 0 && (
                                                                <div className="relative group/menu">
                                                                    <button className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-[10px] font-medium text-zinc-500 hover:text-zinc-900 transition-all rounded">
                                                                        {item.selected_size || 'Size'} / {item.selected_flavor || 'Flavor'}
                                                                        <HorizontalDotsIcon className="w-3 h-3 ml-1" />
                                                                    </button>
                                                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-200 shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-[100] py-2 rounded-xl">
                                                                        {product.product_variants.map(v => (
                                                                            <button 
                                                                                key={v.id}
                                                                                onClick={() => updateItemVariant(item.id, v.id)}
                                                                                className={`w-full text-left px-4 py-2.5 text-[11px] hover:bg-zinc-50 transition-colors ${item.variant_id === v.id ? 'bg-zinc-100 font-medium' : ''}`}
                                                                            >
                                                                                {v.size?.size_label || 'Default'} — {v.flavour?.flavour_name || 'Standard'}
                                                                                <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">Rs. {v.discounted_price}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="sm:hidden text-[14px] font-medium text-zinc-900 shrink-0">
                                                        Rs. {(item.price * item.quantity).toFixed(0)}
                                                    </div>
                                                </div>

                                                {/* Row 2: Selection & Quantity (Mobile) */}
                                                <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-dashed border-zinc-100 sm:border-0 gap-2">
                                                    <div className="flex sm:hidden">
                                                        {product && product.product_variants.length > 0 && (
                                                            <div className="relative group/menu-mobile">
                                                                <button className="flex items-center gap-1.5 h-9 px-3 bg-zinc-50 border border-zinc-200 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-all rounded">
                                                                    {item.selected_size || 'Size'} / {item.selected_flavor || 'Flavor'}
                                                                    <HorizontalDotsIcon className="w-3 h-3 ml-1" />
                                                                </button>
                                                                <div className="fixed inset-x-4 bottom-4 bg-white border border-zinc-200 shadow-2xl opacity-0 invisible group-hover/menu-mobile:opacity-100 group-hover/menu-mobile:visible transition-all z-[1100] py-4 rounded-2xl max-h-[60vh] overflow-y-auto">
                                                                    <div className="px-6 pb-4 border-b border-zinc-100 mb-2">
                                                                        <h3 className="text-[13px] font-medium">Select Variant</h3>
                                                                    </div>
                                                                    {product.product_variants.map(v => (
                                                                        <button 
                                                                            key={v.id}
                                                                            onClick={() => updateItemVariant(item.id, v.id)}
                                                                            className={`w-full text-left px-6 py-4 text-[12px] hover:bg-zinc-50 transition-colors ${item.variant_id === v.id ? 'bg-zinc-100 font-medium' : ''}`}
                                                                        >
                                                                            {v.size?.size_label || 'Default'} — {v.flavour?.flavour_name || 'Standard'}
                                                                            <span className="block text-[11px] text-zinc-400 font-normal mt-1">Rs. {v.discounted_price}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center border border-zinc-200 h-9 sm:h-10">
                                                            <button 
                                                                onClick={() => updateItemQuantity(item.id, -1)}
                                                                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-zinc-50 text-[14px] sm:text-[16px] font-light border-r border-zinc-200"
                                                            >-</button>
                                                            <span className="w-8 sm:w-10 text-center text-[12px] sm:text-[13px] font-medium">{item.quantity}</span>
                                                            <button 
                                                                onClick={() => updateItemQuantity(item.id, 1)}
                                                                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-zinc-50 text-[14px] sm:text-[16px] font-light border-l border-zinc-200"
                                                            >+</button>
                                                        </div>
                                                        <div className="hidden sm:block text-[14px] font-medium text-zinc-900 min-w-[100px] text-right">
                                                            Rs. {(item.price * item.quantity).toFixed(0)}
                                                        </div>
                                                        <button 
                                                            onClick={() => removeProductItem(item.id)}
                                                            className="p-2 text-zinc-300 hover:text-red-500 transition-colors ml-2"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Section 04: Promotions & Payment */}
                        <section className="p-8 space-y-6 bg-zinc-50/50 border-t border-zinc-100">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-medium text-zinc-400 font-mono">04</span>
                                <h2 className="text-[13px] font-medium text-zinc-800">Promotions & Payment</h2>
                                <div className="h-px flex-1 bg-zinc-200/60" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    {/* Discount Layer */}
                                    <div className="space-y-6">
                                        <h3 className="text-[11px] font-medium text-zinc-400">Promotions</h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-medium text-zinc-500 px-1">Coupon Code</label>
                                                    <input 
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={e => setCouponCode(e.target.value)}
                                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 transition-all font-mono tracking-tight"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-medium text-zinc-500 px-1">Discount Amount</label>
                                                    <input 
                                                        type="number"
                                                        value={couponDiscount}
                                                        onChange={e => setCouponDiscount(Number(e.target.value))}
                                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 transition-all font-mono tracking-tight"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Protocol */}
                                    <div className="space-y-6">
                                        <h3 className="text-[11px] font-medium text-zinc-400">Payment Option</h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-medium text-zinc-500 px-1">Payment Method</label>
                                                <div className="flex gap-2 p-1 bg-zinc-100/50 rounded-xl border border-zinc-200 w-fit">
                                                    <button 
                                                        onClick={() => setPaymentMethod('COD')}
                                                        className={`px-8 py-2 text-[11px] font-medium transition-all rounded-lg ${paymentMethod === 'COD' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-400 hover:text-zinc-600'}`}
                                                    >COD</button>
                                                    <button 
                                                        onClick={() => setPaymentMethod('ONLINE')}
                                                        className={`px-8 py-2 text-[11px] font-medium transition-all rounded-lg ${paymentMethod === 'ONLINE' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-400 hover:text-zinc-600'}`}
                                                    >Online</button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-medium text-zinc-500">Tax Override</label>
                                                    <input 
                                                        type="number"
                                                        value={taxAmount}
                                                        onChange={e => setTaxAmount(Number(e.target.value))}
                                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[12px] outline-none focus:border-zinc-900"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-medium text-zinc-500">Shipping Override</label>
                                                    <input 
                                                        type="number"
                                                        value={shippingFeeManual === null ? '' : shippingFeeManual}
                                                        onChange={e => setShippingFeeManual(e.target.value === '' ? null : Number(e.target.value))}
                                                        placeholder="Auto"
                                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[12px] outline-none focus:border-zinc-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks & Internal Notes */}
                                <div className="flex flex-col space-y-6">
                                    <h3 className="text-[11px] font-medium text-zinc-400">Remarks</h3>
                                    <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-6">
                                        <textarea 
                                            value={paymentRemarks}
                                            onChange={e => setPaymentRemarks(e.target.value)}
                                            placeholder="Add administrative notes regarding settlement or logistics..."
                                            className="w-full h-full bg-transparent text-[13px] outline-none transition-all resize-none font-medium leading-relaxed min-h-[160px]"
                                        />
                                        <div className="mt-4 pt-4 border-t border-zinc-50 flex justify-between items-center text-[10px] text-zinc-400">
                                            <span>System Ready</span>
                                            <span>{new Date().toISOString().split('T')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        </div>
                    )}
                </main>

                {/* Right Sidebar - Fixed Summary within Form Area */}
                <div className="hidden lg:block w-[400px] flex-none h-full border-l border-zinc-100 overflow-y-auto custom-scrollbar">
                    {initialLoading ? (
                        <div className="h-full bg-zinc-900 animate-pulse" />
                    ) : (
                        <SummaryPanel isDark={true} />
                    )}
                </div>
            </div>

            {/* Create Customer Modal */}
            <AdminModal
                isOpen={showCreateCustomerModal}
                onClose={() => setShowCreateCustomerModal(false)}
                title="New Guest Registration"
                description="Create a temporary repository entry for this order."
                footerActions={
                    <>
                        <button 
                            onClick={() => setShowCreateCustomerModal(false)}
                            className="flex-1 py-4 bg-zinc-100 text-zinc-500 text-[13px] font-medium hover:bg-zinc-200 transition-all rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedCustomerId(''); 
                                setShowCreateCustomerModal(false);
                            }}
                            className="flex-[2] py-4 bg-zinc-900 text-white text-[13px] font-medium hover:bg-black transition-all rounded-xl"
                        >
                            Commit details
                        </button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 px-1">Full Identity</label>
                        <input 
                            autoFocus
                            type="text"
                            value={customerInfo.full_name}
                            onChange={e => setCustomerInfo({...customerInfo, full_name: e.target.value})}
                            placeholder="Ex: John Sebastian Doe"
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-zinc-400 px-1">Digital Mail</label>
                            <input 
                                type="email"
                                value={customerInfo.email}
                                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                                placeholder="john@example.com"
                                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-zinc-400 px-1">Contact Protocol</label>
                            <input 
                                type="text"
                                value={customerInfo.phone}
                                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                placeholder="+91 XXXXX XXXXX"
                                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>
            </AdminModal>

            {/* Confirmation Modal */}
            <AdminModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Final Authorization"
                description="Review order parameters before commitment."
                footerActions={
                    <>
                        <button 
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 px-8 py-4 bg-zinc-100 text-zinc-500 text-[13px] font-medium hover:bg-zinc-200 transition-all rounded-xl"
                        >
                            Correction
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] px-8 py-4 bg-zinc-900 text-white text-[13px] font-medium hover:bg-black transition-all rounded-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <TickIcon className="w-4 h-4" />
                                    <span>Authorize Order</span>
                                </>
                            )}
                        </button>
                    </>
                }
            >
                <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                    {/* Customer & Address Summary */}
                    <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-[11px] font-mono font-medium text-zinc-400">
                                {customerInfo.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-semibold text-zinc-900 truncate">{customerInfo.full_name}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">{customerInfo.phone} • {customerInfo.email}</p>
                            </div>
                        </div>
                        <div className="h-px bg-zinc-200/60" />
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-[12px] text-zinc-600 leading-relaxed pt-0.5">
                                <span className="font-medium text-zinc-900">{shippingAddress.option === 'home_delivery' ? 'Home Delivery' : 'Direct Pickup'}:</span> {shippingAddress.street}, {shippingAddress.area}, {shippingAddress.city} {shippingAddress.pincode}
                            </p>
                        </div>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                            <span>Settlement Summary</span>
                            <span>{selectedItems.length} Products</span>
                        </div>
                        
                        {/* Manifest List */}
                        <div className="space-y-2 max-h-[140px] overflow-y-auto px-1 -mx-1 custom-scrollbar">
                            {selectedItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 rounded px-2 -mx-2 transition-colors">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-[12px] font-medium text-zinc-800 truncate">{item.name}</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                            {item.selected_size} {item.selected_flavor ? `• ${item.selected_flavor}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-mono font-medium text-zinc-900">x{item.quantity}</p>
                                        <p className="text-[10px] text-zinc-400">Rs {item.price * item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-zinc-100" />
                        
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-[13px]">
                                <span className="text-zinc-500">Gross Subtotal</span>
                                <span className="font-mono">Rs. {totals.salesSubtotal}</span>
                            </div>
                            {totals.discountOnMRP + totals.couponDiscount + totals.bundleDiscount > 0 && (
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-zinc-500">Total Savings</span>
                                    <span className="text-green-600 font-mono">- Rs. {totals.discountOnMRP + totals.couponDiscount + totals.bundleDiscount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[13px]">
                                <span className="text-zinc-500">Logistics & Fees</span>
                                <span className="text-blue-600 font-mono">+ Rs. {totals.shipping + totals.codFees}</span>
                            </div>
                            <div className="pt-3 border-t border-zinc-100 flex justify-between items-end">
                                <span className="text-[12px] font-bold text-zinc-900">Grand Total</span>
                                <span className="text-2xl font-bold text-zinc-900 font-mono tracking-tighter">Rs. {totals.grandTotal}</span>
                            </div>
                        </div>
                    </div>

                    {/* Remarks Preview */}
                    {paymentRemarks && (
                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Special Instructions</label>
                            <p className="text-[12px] text-zinc-600 italic leading-relaxed px-1">"{paymentRemarks}"</p>
                        </div>
                    )}

                    {/* Administrative Protocol */}
                    <div className="flex items-center gap-3 px-2">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${paymentMethod === 'COD' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {paymentMethod} SETTLEMENT
                        </div>
                        <div className="h-px flex-1 bg-zinc-100" />
                        <span className="text-[10px] text-zinc-400 font-medium">REV: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </AdminModal>

            {/* Mobile Sticky Footer Actions */}
            <div className="md:hidden fixed bottom-[70px] left-0 right-0 z-[150] bg-white border-t border-zinc-100 p-4 pb-[calc(11px+env(safe-area-inset-bottom))] flex gap-3 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => router.back()}
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-zinc-100 text-zinc-500 text-[13px] font-semibold rounded-xl active:scale-[0.98] transition-all"
                >
                    Discard
                </button>
                <button 
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-[2.2] h-12 flex items-center justify-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold rounded-xl shadow-lg shadow-black/20 active:scale-[0.98] transition-all"
                >
                    <TickIcon className="w-4 h-4 text-white" />
                    Authorize Order
                </button>
            </div>
        </div>
    );
}
