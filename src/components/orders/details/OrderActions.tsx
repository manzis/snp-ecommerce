'use client';

import React, { useState } from 'react';
import HelpIcon from '@/components/icons/HelpIcon';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import { cancelOrderAction } from '@/app/actions/orderActions';
import { useToast } from '@/components/ui/ToastProvider';

interface OrderActionsProps {
    isCancellable: boolean;
    orderId: string;
    onCancelSuccess?: (reason: string) => void;
}

export default function OrderActions({ isCancellable, orderId, onCancelSuccess }: OrderActionsProps) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const { showToast } = useToast();

    const handleCancelOrder = async (reason: string) => {
        setIsCancelling(true);
        const res = await cancelOrderAction(orderId, reason);
        setIsCancelling(false);
        if (res.success) {
            setIsCancelModalOpen(false);
            showToast('Order successfully cancelled.', 'success');
            if (onCancelSuccess) {
                onCancelSuccess(reason);
            }
        } else {
            showToast(res.message || 'Failed to cancel order.', 'error');
        }
    };
    return (
        <div className="flex w-full items-center justify-between">
            <button className="flex h-[40px] w-fit items-center justify-center gap-[4px] rounded-[8px] border border-[#f1f5f9] px-[10px] hover:bg-gray-50 transition-colors">
                <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                    <HelpIcon className="h-full w-full text-[#242424]" />
                </div>
                <span className="font-titillium text-[14px] font-[600] leading-[26px] tracking-[-0.03px] text-[#242424]">
                    Help with order
                </span>
            </button>
            <button 
              onClick={() => isCancellable && setIsCancelModalOpen(true)}
              disabled={!isCancellable}
              className={`flex h-[40px] w-fit items-center justify-center gap-[4px] rounded-[8px] border px-[10px] transition-colors ${
                  isCancellable 
                    ? 'border-[#f1f5f9] hover:bg-red-50 cursor-pointer' 
                    : 'border-[#eaebf0] opacity-60 cursor-not-allowed bg-[#f7faf6]'
              }`}
            >
                <span className={`font-titillium text-[14px] font-[600] leading-[26px] tracking-[-0.03px] ${isCancellable ? 'text-[#b64040]' : 'text-[#8a8e91]'}`}>
                    Cancel Order
                </span>
            </button>

            <CancelOrderModal 
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelOrder}
                isProcessing={isCancelling}
                savedAmount={0} 
            />
        </div>
    );
}
