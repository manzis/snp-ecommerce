import { useState, useEffect } from 'react';
import { updateOrderStatusAdminAction } from '@/app/actions/orderActions';
import { OrderProps } from '@/components/orders/OrderCard';
import DashboardOrderCard from '@/components/admin/orders/OrderCard';
import OrderActionMenu from '@/components/admin/orders/OrderActionMenu';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminOrderListProps {
  initialOrders: OrderProps[];
  lastSeenAt?: string;
  viewMode?: 'grid' | 'list';
  onViewDetails?: (order: OrderProps) => void;
  onUpdateStatus?: (order: OrderProps) => void;
  onUpdatePaymentStatus?: (order: OrderProps) => void;
  onDeleteOrder?: (order: OrderProps) => void;
}

const DEFAULT_MESSAGES: Record<string, string> = {
  pending: "Order has been placed and is awaiting confirmation.",
  confirmed: "Order confirmed. We are starting to prepare your items.",
  processing: "Your order is being packed and prepared for shipment.",
  shipped: "Order has been shipped and is on its way.",
  in_transit: "Your package is on its way to the local hub.",
  out_for_delivery: "Your order is out for delivery with our courier partner.",
  delivered: "Order successfully delivered! Thank you for shopping with us.",
  cancelled: "Order has been cancelled.",
  returned: "Order return has been processed.",
  failed: "Delivery attempt failed. Please contact support.",
  shipment_arrived: "Shipment arrived at the delivery hub.",
  rescheduled: "Delivery attempt failed. We have rescheduled your delivery for the next available slot."
};

export function AdminOrderList({
  initialOrders,
  lastSeenAt,
  viewMode = 'list',
  onViewDetails,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDeleteOrder
}: AdminOrderListProps) {
  const [orders, setOrders] = useState<OrderProps[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  // Sync when parent refreshes data (e.g. pagination)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('');

  const statuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'in_transit',
    'shipment_arrived', 'out_for_delivery', 'delivered', 'returned', 'cancelled', 'failed', 'rescheduled'
  ];

  const openUpdateModal = (order: OrderProps) => {
    setSelectedOrderId(order.id);
    const currentStatus = order.status.toLowerCase();
    setTargetStatus(currentStatus);
    setStatusMessage(DEFAULT_MESSAGES[currentStatus] || 'Order status updated.');
    setShowModal(true);
  };

  const handleStatusChange = (newStatus: string) => {
    setTargetStatus(newStatus);
    setStatusMessage(DEFAULT_MESSAGES[newStatus] || 'Order status updated.');
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrderId || !targetStatus) return;

    setUpdating(selectedOrderId);
    setShowModal(false);

    try {
      const result = await updateOrderStatusAdminAction(selectedOrderId, targetStatus, statusMessage);
      if (result.success) {
        setOrders(prev => prev.map(o =>
          o.id === selectedOrderId ? { ...o, status: targetStatus.toUpperCase() as any } : o
        ));
      } else {
        alert(result.message || 'Failed to update order');
      }
    } catch (error) {
      alert('An error occurred while updating status');
    } finally {
      setUpdating(null);
      setSelectedOrderId(null);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <DashboardOrderCard
            key={order.id}
            order={order}
            isNew={lastSeenAt && order.createdAt ? new Date(order.createdAt) > new Date(lastSeenAt) : false}
            onViewOrder={onViewDetails}
            onUpdateStatus={onUpdateStatus || openUpdateModal}
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onDeleteOrder={onDeleteOrder}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] font-rubik">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-50 bg-[#fafafa]">
            <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Order</th>
            <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Customer</th>
            <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Status</th>
            <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-right">Amount</th>
            <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => {
              const isNew = lastSeenAt && order.createdAt ? new Date(order.createdAt) > new Date(lastSeenAt) : false;

              const getStatusColors = (status?: string) => {
                const s = status?.toUpperCase();
                switch (s) {
                  case 'DELIVERED': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' };
                  case 'OUT_FOR_DELIVERY': return { bg: 'bg-[#f9fafb]', text: 'text-green-700', border: 'border-[#f5f5f5]' };
                  case 'IN_TRANSIT': case 'RESCHEDULED': return { bg: 'bg-[#fefce8]', text: 'text-[#854d0e]', border: 'border-[#fef9c3]' };
                  case 'CANCELLED': case 'FAILED': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
                  default: return { bg: 'bg-[#f9fafb]', text: 'text-[#71717a]', border: 'border-[#f5f5f5]' };
                }
              };

              const getPaymentStatusColors = (status?: string) => {
                switch (status?.toLowerCase()) {
                  case 'paid': return { bg: 'bg-green-100', label: 'Paid', text: 'text-green-800' };
                  case 'partially_paid': return { bg: 'bg-[#fef08a]', label: 'Part. Paid', text: 'text-[#854d0e]' };
                  case 'pending': default: return { bg: 'bg-zinc-100', label: 'Pending', text: 'text-[#3f3f46]' };
                }
              };

              const statusColors = getStatusColors(order.status);
              const paymentColors = getPaymentStatusColors(order.paymentStatus);

              return (
                <motion.tr
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group hover:bg-[#fafafa] transition-colors duration-200 ${isNew ? 'bg-[#fcfcfd]' : ''}`}
                >
                  {/* ORDER ID & DATE */}
                  <td className="py-4 px-4 min-w-[200px]">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-medium text-[#242424] uppercase tracking-wider">
                          #{order.shortId}
                        </h3>
                        {isNew && (
                          <span className="flex h-[18px] px-[6px] py-[2px] justify-center items-center bg-[#242424] text-white rounded-[4px] text-[9px] font-bold tracking-widest animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-[#a1a1aa] font-regular">
                        {order.dateText.replace('Ordered On ', '')}
                      </span>
                    </div>
                  </td>

                  {/* CUSTOMER & ITEMS */}
                  <td className="py-4 px-4 min-w-[240px]">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#242424] truncate max-w-[200px] md:max-w-[240px]">
                        {order.customerName}
                      </span>
                      <span className="text-[12px] font-regular text-[#71717a] truncate max-w-[240px]">
                        {order.title} {order.extraItemsCount > 0 && <span className="text-[#a1a1aa] italic">+{order.extraItemsCount} more items</span>}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-tight ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                        {order.status}
                      </div>
                    </div>
                  </td>

                  {/* AMOUNT & PAYMENT */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[14px] font-semibold text-[#242424]">
                        NPR {order.totalAmount}
                      </span>
                      <div className="flex gap-1.5 items-center mt-0.5">
                        <span className={`text-[10px] font-medium uppercase tracking-widest ${paymentColors.text}`}>
                          {paymentColors.label}
                        </span>
                        <span className="text-[10px] text-[#a1a1aa]">· {order.paymentMethod?.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <OrderActionMenu
                        order={order}
                        onViewOrder={onViewDetails}
                        onUpdateStatus={onUpdateStatus || openUpdateModal}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                        onDeleteOrder={onDeleteOrder}
                      />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 px-4 text-center text-[#71717a] text-[14px]">
                  No orders found.
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>

      {/* Comprehensive Update Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Update Order Tracking</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select New Status</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                    value={targetStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">Note: You can update to the same status to add a new progress log.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Update Message</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    rows={4}
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="Enter a message for the customer..."
                  />
                  <p className="text-[10px] text-gray-400 mt-1 italic">This message will appear in the customer's tracking timeline.</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md active:scale-95"
                >
                  Confirm Log Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
