import React, { forwardRef } from 'react';
import { OrderProps } from '@/components/orders/OrderCard';

interface InvoiceTemplateProps {
    order: OrderProps;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order }, ref) => {
    // Helper to format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const issueDate = order.createdAt ? formatDate(order.createdAt) : formatDate(new Date().toISOString());
    
    // Default due date to 7 days after issue date
    const dueDateObj = order.createdAt ? new Date(order.createdAt) : new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 7);
    const dueDate = formatDate(dueDateObj.toISOString());

    const totalAmount = order.totalAmount || 0;
    const amountPaid = order.amountPaid || 0;
    const remainingDue = Math.max(0, totalAmount - amountPaid);
    const totalSavings = (order.discount_on_mrp || 0) + (order.bundle_discount || 0) + (order.coupon_discount || 0);

    const customerPhone = order.customerPhone || '';
    const addressDetails = order.shippingAddress?.addressDetails || {};
    const city = order.shippingAddress?.city || addressDetails.city || '';
    const addressStr = [
        order.shippingAddress?.address,
        addressDetails.area,
        city
    ].filter(Boolean).join(', ');

    return (
        <div 
            ref={ref} 
            className="w-[794px] h-[1123px] bg-white text-black font-sans box-border flex flex-col shrink-0"
            style={{ 
                fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
        >
            {/* Header section (white background) */}
            <div className="flex justify-between items-start px-10 py-8 border-b border-gray-100">
                {/* Logo area */}
                <div className="w-1/3 flex items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/favicon.ico" alt="Supplement Nepal" className="w-12 h-12 object-contain" />
                </div>

                {/* INVOICE Title */}
                <div className="w-1/3 text-center flex flex-col items-center">
                    <h1 className="text-3xl font-black tracking-tight" style={{ fontWeight: 900 }}>INVOICE</h1>
                    <p className="text-gray-400 font-medium text-base mt-1">#{order.shortId}</p>
                </div>

                {/* Invoice Meta */}
                <div className="w-1/3 text-right">
                    <div className="inline-grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-xs text-left float-right">
                        <span className="font-bold text-gray-900">Invoice #</span>
                        <span className="text-gray-600 text-right">{order.shortId}</span>
                        
                        <span className="font-bold text-gray-900">Issue Date</span>
                        <span className="text-gray-600 text-right">{issueDate}</span>
                        
                        <span className="font-bold text-gray-900">Due Date</span>
                        <span className="text-gray-600 text-right">{dueDate}</span>
                    </div>
                </div>
            </div>

            {/* Billing Info */}
            <div className="flex justify-between px-10 py-6">
                <div className="w-1/3">
                    <h3 className="font-bold text-gray-900 mb-1 text-xs">Bill to:</h3>
                    <div className="text-gray-700 leading-relaxed text-[11px]">
                        <p>{order.customerName}</p>
                        {addressStr && <p className="capitalize">{addressStr}</p>}
                        <p className="font-bold mt-1 text-gray-900">{customerPhone}</p>
                    </div>
                </div>

                <div className="w-1/3">
                    <h3 className="font-bold text-gray-900 mb-1 text-xs">Billed By:</h3>
                    <div className="text-gray-700 leading-relaxed text-[11px]">
                        <p>Bright Nepcare Pvt Ltd</p>
                        <p>Kathmandu, Nepal</p>
                    </div>
                </div>

                <div className="w-1/3 text-right">
                    <h3 className="font-bold text-gray-900 mb-1 text-xs">Total Due:</h3>
                    <p className="text-2xl font-black tracking-tight">NPR {remainingDue.toLocaleString()}</p>
                    <div className="mt-2 flex justify-end">
                        <span className="inline-block px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                            {order.paymentMethod || 'Cash on Delivery'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="px-10 pb-6 flex-1">
                <table className="w-full text-xs border-collapse border border-gray-200">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-3 text-left font-bold text-gray-400 tracking-wider text-[10px] uppercase w-3/5">Items</th>
                            <th className="py-3 px-3 text-left font-bold text-gray-400 tracking-wider text-[10px] uppercase border-l border-gray-200">Quantity</th>
                            <th className="py-3 px-3 text-right font-bold text-gray-400 tracking-wider text-[10px] uppercase border-l border-gray-200">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {order.order_items?.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 px-3">
                                    <div className="font-medium text-gray-900 text-xs">
                                        {item.products?.brands?.title || item.products?.brands?.name || order.brand ? 
                                            `${item.products?.brands?.title || item.products?.brands?.name || order.brand} ` : ''}
                                        {item.products?.title || item.products?.name || order.title || 'Product'}
                                    </div>
                                    {(item.selected_size || item.selected_flavor) && (
                                        <div className="text-gray-500 text-[10px] mt-0.5">
                                            {[item.selected_size, item.selected_flavor].filter(Boolean).join(' · ')}
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-3 font-medium text-gray-800 border-l border-gray-200 text-[11px]">
                                    {item.quantity}
                                </td>
                                <td className="py-3 px-3 font-medium text-gray-800 text-right border-l border-gray-200 text-[11px]">
                                    NPR {(item.price * item.quantity).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {(!order.order_items || order.order_items.length === 0) && (
                            <tr>
                                <td className="py-3 px-3 font-medium text-gray-900 text-xs">
                                    {order.brand ? `${order.brand} ` : ''}
                                    {order.title || 'Product'}
                                </td>
                                <td className="py-3 px-3 font-medium text-gray-800 border-l border-gray-200 text-[11px]">1</td>
                                <td className="py-3 px-3 font-medium text-gray-800 text-right border-l border-gray-200 text-[11px]">
                                    NPR {order.totalAmount?.toLocaleString()}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary & Notes */}
            <div className="px-10 flex justify-between items-start pb-8">
                <div className="w-1/2 pt-2 pr-10">
                    <h3 className="font-bold text-gray-900 mb-1 text-xs">Notes</h3>
                    <p className="text-gray-600 text-[11px] leading-relaxed">Thank you for shopping with Supplyment Nepal. We hope you enjoy your products!</p>
                </div>
                <div className="w-[45%]">
                    <table className="w-full text-[11px] border border-gray-200">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-1.5 px-3 font-bold text-gray-900">Subtotal</td>
                                <td className="py-1.5 px-3 text-right text-gray-700">NPR {order.mrp_amount?.toLocaleString() || order.totalAmount?.toLocaleString()}</td>
                            </tr>
                            {totalSavings > 0 && (
                                <tr>
                                    <td className="py-1.5 px-3 text-gray-700">Total Savings</td>
                                    <td className="py-1.5 px-3 text-right text-gray-700">- NPR {totalSavings.toLocaleString()}</td>
                                </tr>
                            )}
                            {!!order.shipping_amount && order.shipping_amount > 0 && (
                                <tr>
                                    <td className="py-1.5 px-3 text-gray-700">Shipping</td>
                                    <td className="py-1.5 px-3 text-right text-gray-700">+ NPR {order.shipping_amount.toLocaleString()}</td>
                                </tr>
                            )}
                            {!!order.cod_fees && order.cod_fees > 0 && (
                                <tr>
                                    <td className="py-1.5 px-3 text-gray-700">COD Fee</td>
                                    <td className="py-1.5 px-3 text-right text-gray-700">+ NPR {order.cod_fees.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className={amountPaid > 0 ? "bg-gray-100 text-gray-900" : "bg-black text-white"}>
                                <td className="py-2 px-3 font-bold text-[11px]">Total</td>
                                <td className="py-2 px-3 text-right font-bold text-[11px]">NPR {totalAmount.toLocaleString()}</td>
                            </tr>
                            {amountPaid > 0 && (
                                <tr className="bg-white text-gray-900 border-b border-gray-200">
                                    <td className="py-2 px-3 font-bold text-[11px]">Amount Paid</td>
                                    <td className="py-2 px-3 text-right font-bold text-[11px] text-green-600">- NPR {amountPaid.toLocaleString()}</td>
                                </tr>
                            )}
                            {amountPaid > 0 && (
                                <tr className="bg-black text-white">
                                    <td className="py-2 px-3 font-bold text-[11px]">Balance Due</td>
                                    <td className="py-2 px-3 text-right font-bold text-[11px]">NPR {remainingDue.toLocaleString()}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer pushed to bottom */}
            <div className="mt-auto bg-black text-white px-10 py-8 flex">
                <div className="w-1/2 pr-6">
                    <h4 className="font-bold mb-1.5 text-xs">Terms & Policies</h4>
                    <div className="text-gray-400 text-[10px] space-y-1.5 leading-relaxed">
                        <p>Payment is due within 7 days of the invoice date.</p>
                        <p>For return policies, visit: <br/><span className="text-gray-300 font-mono text-[9.5px]">brightsupplements.store/info#return-policy</span></p>
                        <p>For terms and conditions, visit: <br/><span className="text-gray-300 font-mono text-[9.5px]">brightsupplements.store/info#terms-and-conditions</span></p>
                    </div>
                </div>
                <div className="w-1/2 pl-8 border-l border-white/20">
                    <h4 className="font-bold mb-1.5 text-xs">Contact</h4>
                    <div className="text-gray-400 text-[11px] space-y-1">
                        <p className="text-white">Bright Nepcare Pvt Ltd</p>
                        <p>brightnepcare@gmail.com</p>
                        <p>+977 9767609390</p>
                        <p>brightsupplements.store</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
