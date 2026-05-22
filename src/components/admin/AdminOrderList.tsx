import { useState, useEffect } from 'react';
import Image from 'next/image';
import { updateOrderStatusAdminAction } from '@/app/actions/orderActions';
import { OrderProps } from '@/components/orders/OrderCard';
import DashboardOrderCard from '@/components/admin/orders/OrderCard';
import OrderActionMenu from '@/components/admin/orders/OrderActionMenu';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminOrderListProps {
  initialOrders: OrderProps[];
  lastSeenAt?: string;
  viewMode?: 'grid' | 'list';
  selectedIds?: string[];
  totalCount?: number;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
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
  selectedIds = [],
  totalCount = 0,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDeleteOrder
}: AdminOrderListProps) {
  const [orders, setOrders] = useState<OrderProps[]>(initialOrders || []);
  const [updating, setUpdating] = useState<string | null>(null);

  // Sync when parent refreshes data (e.g. pagination)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('');
  const [carrierName, setCarrierName] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  const statuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'in_transit',
    'shipment_arrived', 'out_for_delivery', 'delivered', 'returned', 'cancelled', 'failed', 'rescheduled'
  ];

  const openUpdateModal = (order: OrderProps) => {
    setSelectedOrderId(order.id);
    const currentStatus = order.status.toLowerCase();
    setTargetStatus(currentStatus);
    setStatusMessage(DEFAULT_MESSAGES[currentStatus] || 'Order status updated.');
    setCarrierName(order.carrierName || '');
    setTrackingNumber(order.trackingNumber || '');
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
      const result = await updateOrderStatusAdminAction(selectedOrderId, targetStatus, statusMessage, trackingNumber, carrierName);
      if (result.success) {
        setOrders(prev => prev.map(o =>
          o.id === selectedOrderId ? { ...o, status: targetStatus.toUpperCase() as any, carrierName, trackingNumber } : o
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

  // 1. Split orders into Recently and All
  const recentlyOrders = lastSeenAt ? orders.filter(o =>
    (o.createdAt && new Date(o.createdAt) > new Date(lastSeenAt)) ||
    (o.paymentAttemptedAt && new Date(o.paymentAttemptedAt) > new Date(lastSeenAt))
  ) : [];

  const otherOrders = recentlyOrders.length > 0
    ? orders.filter(o => !recentlyOrders.some(ro => ro.id === o.id))
    : orders;

  const renderGrid = (orderList: OrderProps[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {orderList.map((order) => (
        <DashboardOrderCard
          key={order.id}
          order={order}
          isNew={lastSeenAt && order.createdAt ? new Date(order.createdAt) > new Date(lastSeenAt) : false}
          onViewOrder={onViewDetails}
          onUpdateStatus={onUpdateStatus || openUpdateModal}
          onUpdatePaymentStatus={onUpdatePaymentStatus}
          onDeleteOrder={onDeleteOrder}
          isPaymentAttempted={lastSeenAt && order.paymentAttemptedAt ? new Date(order.paymentAttemptedAt) > new Date(lastSeenAt) : false}
        />
      ))}
    </div>
  );

  const renderTable = (orderList: OrderProps[]) => (
    <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] font-rubik">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="border-b border-gray-50 bg-[#fafafa]">
            <th className="py-4 px-4 w-[40px] border-b border-gray-100 first:rounded-tl-[12px]">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                />
              </div>
            </th>
            <th className="py-4 px-4 text-[11px] font-bold text-[#71717a] uppercase tracking-widest border-b border-gray-100">Order</th>
            <th className="py-4 px-4 text-[11px] font-bold text-[#71717a] uppercase tracking-widest border-b border-gray-100">Customer</th>
            <th className="py-4 px-4 text-[11px] font-bold text-[#71717a] uppercase tracking-widest border-b border-gray-100">Product Item</th>
            <th className="py-4 px-4 text-[11px] font-bold text-[#71717a] uppercase tracking-widest border-b border-gray-100">Status</th>
            <th className="py-4 px-4 text-[11px] font-bold text-[#71717a] uppercase tracking-widest border-b border-gray-100 text-right">Amount</th>
            <th className="py-4 px-4 text-[11px] font-bold text-[#71717a] uppercase tracking-widest border-b border-gray-100 text-center last:rounded-tr-[12px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          <AnimatePresence mode="popLayout">
            {orderList.map((order) => {
              const isNew = lastSeenAt && order.createdAt ? new Date(order.createdAt) > new Date(lastSeenAt) : false;
              const isPaymentAttempted = lastSeenAt && order.paymentAttemptedAt ? new Date(order.paymentAttemptedAt) > new Date(lastSeenAt) : false;
              const isSelected = selectedIds.includes(order.id);

              const getStatusColors = (status?: string) => {
                const s = status?.toUpperCase();
                switch (s) {
                  case 'DELIVERED': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' };
                  case 'OUT_FOR_DELIVERY': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
                  case 'SHIPPED': case 'IN_TRANSIT': case 'SHIPMENT_ARRIVED': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
                  case 'PENDING': case 'CONFIRMED': case 'PROCESSING': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
                  case 'CANCELLED': case 'FAILED': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
                  default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' };
                }
              };

              const getPaymentStatusColors = (status?: string) => {
                switch (status?.toLowerCase()) {
                  case 'paid': return { bg: 'bg-green-500', label: 'Paid', text: 'text-green-600' };
                  case 'partially_paid': return { bg: 'bg-amber-500', label: 'Partial', text: 'text-amber-600' };
                  default: return { bg: 'bg-gray-400', label: 'Pending', text: 'text-gray-500' };
                }
              };

              const statusColors = getStatusColors(order.status);
              const paymentColors = getPaymentStatusColors(order.paymentStatus);

              const addr = order.shippingAddress;
              const addressDetails = addr?.addressDetails || addr || {};
              const addressSummary = [addressDetails.area, addressDetails.city].filter(Boolean).join(', ');

              const firstItem = order.order_items?.[0];

              return (
                <motion.tr
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group hover:bg-[#fafafa] transition-colors duration-200 ${isSelected ? 'bg-[#fcfcfd]' : ''} ${isNew ? 'border-l-2 border-l-[#242424]' : ''}`}
                >
                  {/* CHECKBOX */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect?.(order.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                    />
                  </td>

                  {/* ORDER ID & DATE */}
                  <td className="py-4 px-4 min-w-[140px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#242424] tracking-tight">#{order.shortId}</span>
                        {isNew && (
                          <span className="h-[14px] px-1 bg-[#242424] text-white text-[8px] font-bold rounded flex items-center justify-center tracking-tighter">NEW</span>
                        )}
                        {isPaymentAttempted && (
                          <span className="h-[14px] px-1.5 bg-[#74a134] text-white text-[8px] font-bold rounded flex items-center justify-center tracking-tighter shadow-sm animate-pulse">ATTEMPTED</span>
                        )}
                      </div>
                      <span className="text-[12px] text-[#a1a1aa] font-medium">
                        {new Date(order.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>

                  {/* CUSTOMER NAME & ADDRESS */}
                  <td className="py-4 px-4 min-w-[170px]">
                    <div className="flex flex-col gap-1 max-w-[160px]">
                      <span className="text-[14px] font-semibold text-[#242424] truncate">{order.customerName}</span>
                      <span className="text-[11px] leading-tight text-[#71717a] line-clamp-2" title={addressSummary}>
                        {addressSummary || 'Address N/A'}
                      </span>
                    </div>
                  </td>

                  {/* PRODUCT ITEM (CONSILIATED) */}
                  <td className="py-4 px-4 min-w-[340px]">
                    {firstItem ? (
                      <div className="flex items-center gap-4">
                        <div className="w-[52px] h-[52px] rounded-lg bg-[#f4f4f5] border border-gray-100 overflow-hidden relative shrink-0">
                          <Image
                            src={firstItem.products?.images?.[0] || '/images/product-placeholder.png'}
                            alt={firstItem.products?.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-bold text-[#242424] truncate leading-tight mb-1" title={firstItem.products?.name}>
                            {firstItem.products?.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-[#a1a1aa] uppercase tracking-tighter">Size:</span>
                              <span className="text-[12px] font-semibold text-[#242424]">{firstItem.selected_size || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-[#a1a1aa] uppercase tracking-tighter">Flav:</span>
                              <span className="text-[12px] font-semibold text-[#242424] truncate max-w-[100px]">{firstItem.selected_flavor || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-[#a1a1aa] uppercase tracking-tighter">Qty:</span>
                              <span className="text-[12px] font-bold text-[#242424]">{firstItem.quantity}</span>
                            </div>
                          </div>

                          {order.extraItemsCount > 0 && (
                            <div className="mt-1.5">
                              <span className="inline-flex py-0.5 px-2 bg-[#74a134]/10 text-[#74a134] text-[10px] font-semibold  tracking-tighter rounded-full border border-[#74a134]/20">
                                + {order.extraItemsCount} More items
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No items</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                      {order.status}
                    </div>
                    {order.paymentStatus === 'paid' && (
                      <div className="mt-1 flex items-center gap-1 ml-1 text-green-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase">PAID</span>
                      </div>
                    )}
                  </td>

                  {/* AMOUNT */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[15px] font-bold text-[#242424] tracking-tight">NPR {order.totalAmount?.toLocaleString()}</span>
                      <div className={`h-1.5 w-12 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-[9px] py-0.5 px-1.5 bg-gray-100 text-gray-500 rounded font-bold uppercase tracking-tighter">{order.paymentMethod}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${paymentColors.text}`}>{paymentColors.label}</span>
                      </div>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-4 border-b border-gray-100">
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
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Recently Section */}
      {recentlyOrders.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[12px] font-medium text-[#71717a] uppercase">Recently</h2>
          </div>
          {viewMode === 'grid' ? renderGrid(recentlyOrders) : renderTable(recentlyOrders)}
        </div>
      )}

      {/* All Orders Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[12px] font-medium text-[#71717a] uppercase ">All Orders</h2>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-[#71717a] text-[10px] font-bold rounded-full border border-gray-200/50">
                {totalCount}
              </span>
            )}
          </div>
        </div>
        {viewMode === 'grid' ? renderGrid(otherOrders) : renderTable(otherOrders)}

        {orders.length === 0 && (
          <div className="py-[100px] text-center bg-white border border-gray-100 rounded-[12px]">
            <p className="text-[#a1a1aa] text-sm font-medium">No orders found matching your filters.</p>
          </div>
        )}
      </div>

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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Carrier</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                    >
                      <option value="">Manual / Other</option>
                      <option value="ExpoExpress">Expo Express</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tracking Number</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. 49621966041"
                    />
                  </div>
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
