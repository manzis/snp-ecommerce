'use client';

import { useState } from 'react';
import { updateOrderStatusAdminAction } from '@/app/actions/orderActions';
import { OrderProps } from '@/components/orders/OrderCard';

interface AdminOrderListProps {
  initialOrders: OrderProps[];
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
  rescheduled: "Delivery attempt failed. We have rescheduled your delivery for the next available slot."
};

export function AdminOrderList({ initialOrders }: AdminOrderListProps) {
  const [orders, setOrders] = useState<OrderProps[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('');

  const statuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'in_transit',
    'out_for_delivery', 'delivered', 'returned', 'cancelled', 'failed', 'rescheduled'
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
        console.log(`Order ${selectedOrderId.split('-')[0]} updated to ${targetStatus}`);
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

  return (
    <div className="overflow-x-auto relative">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                #{order.shortId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-col">
                  <span className="font-medium">{order.title}</span>
                  <span className="text-xs text-gray-500">{order.brand}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.dateText.replace('Ordered On ', '')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => openUpdateModal(order)}
                  disabled={updating === order.id}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updating === order.id ? 'Updating...' : 'Update Status'}
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                No orders found.
              </td>
            </tr>
          )}
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
