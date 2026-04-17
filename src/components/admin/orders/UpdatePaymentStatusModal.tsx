'use client';

import React, { useState } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { OrderProps } from '@/components/orders/OrderCard';

interface UpdatePaymentStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderProps | null;
    onConfirm: (orderId: string, paymentStatus: string, amountPaid?: number) => Promise<void>;
}

const paymentStatuses = [
    { id: 'pending', label: 'PENDING', bgClass: 'bg-zinc-100 text-[#3f3f46]', activeBg: 'bg-[#3f3f46] text-white' },
    { id: 'partially_paid', label: 'PART. PAID', bgClass: 'bg-[#fef08a] text-[#854d0e]', activeBg: 'bg-[#ca8a04] text-white' },
    { id: 'paid', label: 'PAID', bgClass: 'bg-green-100 text-green-800', activeBg: 'bg-green-600 text-white' }
];

export default function UpdatePaymentStatusModal({ isOpen, onClose, order, onConfirm }: UpdatePaymentStatusModalProps) {
    const [targetStatus, setTargetStatus] = useState<string>(order?.paymentStatus?.toLowerCase() || 'pending');
    const [amountPaid, setAmountPaid] = useState<number | ''>(order?.amountPaid || '');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Reset when modal opens
    React.useEffect(() => {
        if (isOpen && order) {
            setTargetStatus(order.paymentStatus?.toLowerCase() || 'pending');
            setAmountPaid(order.amountPaid || '');
        }
    }, [isOpen, order]);

    if (!order) return null;

    const handleConfirm = async () => {
        if (targetStatus === 'partially_paid') {
            const numAmount = Number(amountPaid);
            if (numAmount > (order.totalAmount || 0)) {
                setErrorMsg('Partial payment cannot exceed the total order value.');
                return;
            }
            if (numAmount < 0) {
                setErrorMsg('Amount paid cannot be a negative value.');
                return;
            }
        }

        setErrorMsg('');
        setLoading(true);
        try {
            await onConfirm(order.id, targetStatus, amountPaid === '' ? undefined : Number(amountPaid));
            onClose();
        } catch (error) {
            console.error('Failed to update payment status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Payment Status: #${order.shortId}`}
            description={order.title}
            maxWidth="max-w-md"
        >
            <div className="space-y-8 py-2">
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Select Payment State</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2 rounded-[6px]">
                        {paymentStatuses.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setTargetStatus(s.id);
                                    if (s.id === 'paid') setAmountPaid(order.totalAmount || 0);
                                    if (s.id === 'pending') setAmountPaid(0);
                                }}
                                className={`flex items-center justify-between p-4 border border-dotted transition-all rounded-[6px] ${
                                    targetStatus === s.id 
                                    ? `border-transparent ${s.activeBg}` 
                                    : 'border-gray-300 bg-zinc-50/20 text-[#71717a] hover:bg-zinc-50'
                                }`}
                            >
                                <span className={`text-[12px] font-bold tracking-wider ${targetStatus === s.id ? 'text-white' : 'text-[#242424]'}`}>
                                    {s.label}
                                </span>
                                {targetStatus === s.id && (
                                    <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {targetStatus === 'partially_paid' && (
                    <section className="space-y-4 pt-2">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Partial Amount</h4>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium font-rubik text-[14px]">NPR</span>
                                <input 
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="0"
                                    className="w-full pl-[52px] pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[8px] text-[15px] font-medium text-[#242424] focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2 flex justify-between">
                                <span>Total Order Value:</span>
                                <span className="font-semibold text-[#242424]">NPR {order.totalAmount}</span>
                            </p>
                            {errorMsg && (
                                <p className="text-[12px] text-red-500 mt-2 font-medium bg-red-50 p-2 rounded-[6px] border border-red-100">
                                    {errorMsg}
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Confirm Actions */}
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-8 py-3.5 text-[13px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 rounded-2xl transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || targetStatus === order.paymentStatus?.toLowerCase()}
                        className="flex-[2] md:flex-none md:px-12 py-3.5 bg-[#242424] text-white rounded-2xl text-[13px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Confirm Change</span>
                        )}
                    </button>
                </div>
            </div>
        </AdminModal>
    );
}
