import React from 'react';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { mapToOrderProps } from '@/services/orderService';
import Image from 'next/image';

// Simple Barcode SVG component
const Barcode = ({ value, height = 40, className = "" }: { value: string, height?: number, className?: string }) => {
    // Basic representation of a barcode
    return (
        <div className={`flex items-end gap-[1px] ${className}`} style={{ height: `${height}px` }}>
            {value.split('').map((char, i) => (
                <div 
                    key={i} 
                    className="bg-black shrink-0" 
                    style={{ 
                        width: (i % 3 === 0) ? '2px' : '1px',
                        height: `${Math.max(60, (char.charCodeAt(0) % 100))}%` 
                    }} 
                />
            ))}
            {/* Pad to look realistic */}
            {[...Array(20)].map((_, i) => (
                <div 
                    key={`p-${i}`} 
                    className="bg-black shrink-0" 
                    style={{ 
                        width: (i % 4 === 0) ? '3px' : '1px',
                        height: '100%' 
                    }} 
                />
            ))}
        </div>
    );
};

export default async function OrderLabelPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
        return <div className="p-10 text-red-600 font-bold">Admin client initialization failed.</div>;
    }

    // 1. Fetch Order Data
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                products (name, sku, weight)
            )
        `)
        .eq('id', id)
        .single();

    if (orderError || !orderData) {
        notFound();
    }

    // 2. Fetch Admin Profile for Shipper Info
    // Assuming the user who triggered this is an admin, we just need the store profile
    // We'll try to find the first admin profile or use a fallback
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1)
        .single();

    const order = mapToOrderProps(orderData);
    const shippingAddress = orderData.shipping_address || {};
    const contactDetails = orderData.contact_details || {};
    
    // Shipper Fallback
    const shipper = {
        name: adminProfile?.full_name || 'SNP Nutrition',
        address: 'New Baneshwor, Kathmandu',
        city: 'Kathmandu',
        phone: adminProfile?.phone || '9812345678',
        email: adminProfile?.email || 'sales@snpnutrition.com'
    };

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="bg-white min-h-screen text-black p-0 sm:p-4 font-sans print:p-0">
            {/* Print Trigger Instruction */}
            <div className="bg-amber-50 p-3 mb-4 text-[13px] border border-amber-200 rounded-lg flex items-center justify-between print:hidden">
                <p className="font-medium text-amber-800">Professional Shipping Label Preview</p>
                <button 
                    onClick={() => window.print()} 
                    className="px-4 py-1.5 bg-black text-white text-[12px] rounded-md font-semibold"
                >
                    Print Now
                </button>
            </div>

            {/* THE LABEL CONTAINER - Standard Amazon/Flipkart A6 or A4 segment size logic */}
            <div className="max-w-[800px] mx-auto border-[2px] border-black p-8 bg-white print:border-none print:max-w-none">
                
                {/* Header: Company & Courier Details */}
                <div className="flex justify-between items-start border-b-[2px] border-black pb-6 mb-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">SNP LOGISTICS</h1>
                        <p className="text-[14px] font-bold tracking-tight">Express Shipping Manifest</p>
                    </div>
                    <div className="text-right">
                        <Barcode value={order.id} height={50} className="mb-1" />
                        <p className="text-[11px] font-mono font-bold tracking-[0.2em]">{order.id.toUpperCase()}</p>
                    </div>
                </div>

                {/* Main Grid: From & To */}
                <div className="grid grid-cols-2 gap-0 border-b-[2px] border-black">
                    {/* Ship To Section */}
                    <div className="border-r-[2px] border-black p-6 space-y-4">
                        <h2 className="text-[12px] font-black uppercase tracking-widest text-gray-500">Deliver To</h2>
                        <div className="space-y-1">
                            <p className="text-xl font-bold uppercase">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                            <p className="text-[15px] leading-tight font-medium">
                                {shippingAddress.address || shippingAddress.area || ''}<br />
                                {shippingAddress.city}, {shippingAddress.state || 'Nepal'}<br />
                                {shippingAddress.pincode || ''}
                            </p>
                            <div className="pt-2">
                                <p className="text-[13px] font-bold">Phone: {shippingAddress.phone || contactDetails.phone}</p>
                                <p className="text-[13px] font-medium text-gray-600">{contactDetails.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ship From Section */}
                    <div className="p-6 space-y-4 bg-zinc-50/30">
                        <h2 className="text-[12px] font-black uppercase tracking-widest text-gray-500">Return Address</h2>
                        <div className="space-y-1">
                            <p className="text-[16px] font-bold uppercase">{shipper.name}</p>
                            <p className="text-[14px] leading-tight text-gray-700">
                                {shipper.address}<br />
                                {shipper.city}, Nepal
                            </p>
                            <div className="pt-2 text-[13px]">
                                <p><span className="font-bold">Contact:</span> {shipper.phone}</p>
                                <p><span className="font-bold">GSTIN:</span> 29ABCDE1234F1Z5 (Mock)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Meta: ID, Date, Payment */}
                <div className="grid grid-cols-4 gap-0 divide-x-[2px] divide-black border-b-[2px] border-black">
                    <div className="p-4 space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Order ID</p>
                        <p className="text-[14px] font-black tracking-tight italic">#{order.shortId}</p>
                    </div>
                    <div className="p-4 space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Order Date</p>
                        <p className="text-[14px] font-bold">{today}</p>
                    </div>
                    <div className="p-4 space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Method</p>
                        <p className="text-[14px] font-black uppercase">{order.paymentMethod}</p>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center bg-zinc-100">
                         {order.paymentMethod?.toLowerCase() === 'cod' ? (
                             <div className="text-center">
                                 <p className="text-[14px] font-black leading-none">C O D</p>
                                 <p className="text-[10px] font-bold mt-1 uppercase">Collect Cash</p>
                             </div>
                         ) : (
                             <div className="text-center">
                                 <p className="text-[14px] font-black leading-none">PREPAID</p>
                                 <p className="text-[10px] font-bold mt-1 uppercase text-green-700 font-black">Authorized</p>
                             </div>
                         )}
                    </div>
                </div>

                {/* Item manifest table */}
                <div className="mt-8 border-[2px] border-black overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white text-[11px] font-black uppercase tracking-widest divide-x-[1px] divide-white/20">
                                <th className="p-3 w-12">#</th>
                                <th className="p-3">Product Description</th>
                                <th className="p-3 text-center w-24">SKU</th>
                                <th className="p-3 text-center w-16">Qty</th>
                                <th className="p-3 text-right pr-6 w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] font-medium divide-y-[1px] divide-gray-200">
                            {orderData.order_items.map((item: any, i: number) => (
                                <tr key={item.id} className="divide-x-[1px] divide-gray-200">
                                    <td className="p-3 bg-zinc-50 font-bold">{i + 1}</td>
                                    <td className="p-3">
                                        <p className="font-bold">{item.products?.name}</p>
                                        <div className="flex gap-2 text-[11px] text-gray-500 mt-1 uppercase font-bold">
                                            {item.selected_size && <span>Size: {item.selected_size}</span>}
                                            {item.selected_flavor && <span>Flavor: {item.selected_flavor}</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center font-mono text-[11px] uppercase">{item.products?.sku || 'NP-SNP'}</td>
                                    <td className="p-3 text-center font-bold">x{item.quantity}</td>
                                    <td className="p-3 text-right font-bold pr-6 italic">Rs. {Number(item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-[2px] border-black bg-zinc-50/50">
                                <td colSpan={4} className="p-4 text-right font-bold text-[13px] uppercase tracking-wider">Total Payable Amount</td>
                                <td className="p-4 text-right pr-6 font-black text-xl italic leading-none">Rs. {Number(order.totalAmount).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer: Disclaimer and QR */}
                <div className="mt-8 flex justify-between items-end">
                    <div className="max-w-[70%] space-y-3">
                        <p className="text-[10px] leading-relaxed text-gray-500">
                            <span className="font-bold text-black uppercase block mb-1 underline">Declaration:</span>
                            This is a computer generated invoice/manifest and does not require a physical signature. Returns are only subject to SNP Nutrition standard terms and conditions. If seal is broken or tampered, do not accept the package.
                        </p>
                        <div className="flex items-center gap-6 pt-4">
                            <Barcode value={order.shortId} height={30} className="w-[150px]" />
                            <p className="text-[10px] font-mono font-bold italic">MANIFEST SERIAL: {Date.now().toString().slice(-8)}</p>
                        </div>
                    </div>
                    
                    {/* Mock QR Representation */}
                    <div className="w-[100px] h-[100px] border-[1px] border-black p-1 flex flex-wrap gap-[1px]">
                         {[...Array(64)].map((_, i) => (
                             <div 
                                key={i} 
                                className={`w-[11px] h-[11px] ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`} 
                             />
                         ))}
                    </div>
                </div>

                {/* Print Script */}
                <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { setTimeout(function() { window.print(); }, 1200); }' }} />

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        margin: 0;
                        size: A4 portrait;
                    }
                    body {
                        margin: 1cm;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            ` }} />
        </div>
    );
}
