'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import PrimaryOrderDetails from '@/components/orders/details/PrimaryOrderDetails';
import OtherShipmentItems from '@/components/orders/details/OtherShipmentItems';
import OrderActions from '@/components/orders/details/OrderActions';
import RatingSection from '@/components/orders/details/RatingSection';
import DeliveryDetails from '@/components/orders/details/DeliveryDetails';
import PriceDetails from '@/components/orders/details/PriceDetails';
import { fetchOrderDetails, mapToOrderProps } from '@/services/orderService';
import { OrderProps } from '@/components/orders/OrderCard';
import { syncExternalOrderTrackingAction } from '@/app/actions/orderActions';

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params?.id as string;
    const [order, setOrder] = useState<OrderProps | null>(null);
    const [orderData, setOrderData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getOrder() {
            if (!orderId) return;
            try {
                // Sync external tracking (Expo Express) in the background before fetching
                await syncExternalOrderTrackingAction(orderId);
                
                const data = await fetchOrderDetails(orderId);
                if (data) {
                    setOrderData(data);
                    setOrder(mapToOrderProps(data));
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
            } finally {
                setLoading(false);
            }
        }
        getOrder();
    }, [orderId]);

    const handleCancelSuccess = (reason: string) => {
        setOrder(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                status: 'CANCELLED',
                isCancellable: false,
                cancellationReason: reason,
                statusUpdates: [
                    ...(prev.statusUpdates || []),
                    {
                        status: 'CANCELLED',
                        message: `Cancelled by User. Reason: ${reason}`,
                        date: new Date().toISOString()
                    }
                ]
            };
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7faf6]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#308026] border-t-transparent"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7faf6] gap-4">
                <h1 className="text-xl font-bold">Order Not Found</h1>
                <p>We couldn't find the order you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7faf6] pb-[40px] pt-[81px]">
            {/* Dynamic Navbar */}
            <DynamicPageNav title="Order Details" />

            {/* Main Responsive Container */}
            <main className="mx-auto w-full max-w-[410px] lg:max-w-[1024px] xl:max-w-[1280px] px-0 lg:px-[24px] pt-[16px] lg:pt-[24px]">

                {/* Desktop Grid Architecture */}
                <div className="flex flex-col gap-[16px] lg:grid lg:grid-cols-12 lg:gap-[24px] lg:items-start">

                    {/* Left Column (Main Order Info) */}
                    <article className="flex flex-col gap-[16px] lg:col-span-7 xl:col-span-8">
                        {/* Section 1: Order Items & Tracking */}
                        <section className="flex flex-col gap-[8px] bg-[#ffffff] border border-[#f1f5f9] w-full">
                            <div className="flex flex-col gap-[20px] px-[24px] pt-[24px] relative z-[1]">
                                <PrimaryOrderDetails order={order} />
                            </div>

                            <div className="flex flex-col gap-[16px] p-[16px_24px_24px_24px]">
                                <OtherShipmentItems items={orderData?.order_items} total={orderData?.total_amount} />
                                <OrderActions 
                                    isCancellable={order.isCancellable} 
                                    orderId={order.id} 
                                    onCancelSuccess={handleCancelSuccess} 
                                />
                            </div>
                        </section>

                        {/* Mobile Only Rating (Moves to sidebar on desktop) */}
                        <div className="lg:hidden">
                            <RatingSection />
                        </div>
                    </article>

                    {/* Right Column (Details Sidebar) */}
                    <aside className="flex flex-col gap-[16px] lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[100px]">
                        <DeliveryDetails 
                            address={orderData?.shipping_address} 
                            contact={orderData?.contact_details} 
                        />
                        <PriceDetails 
                            total={orderData?.total_amount}
                            mrp={orderData?.mrp_amount}
                            discount={orderData?.discount_amount}
                            shipping={orderData?.shipping_amount}
                            method={orderData?.payment_method}
                            paymentStatus={orderData?.payment_status}
                            discountOnMrp={orderData?.discount_on_mrp}
                            couponDiscount={orderData?.coupon_discount}
                            couponCode={orderData?.coupon_code}
                            bundleDiscount={orderData?.bundle_discount}
                            codFees={orderData?.cod_fees}
                            taxAmount={orderData?.tax_amount}
                        />

                        {/* Desktop Only Rating */}
                        <div className="hidden lg:block w-full">
                            <RatingSection />
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}