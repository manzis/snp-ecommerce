/**
 * Utility functions for detecting overdue/delayed orders and managing seen states.
 */

export interface OverdueStatus {
  isOverdue: boolean;
  reason?: 'unshipped' | 'undelivered';
  label?: string;
}

const TERMINAL_STATUSES = ['DELIVERED', 'CANCELLED', 'RETURNED', 'FAILED'];
const SHIPPED_OR_TERMINAL_STATUSES = [
  'SHIPPED', 'IN_TRANSIT', 'SHIPMENT_ARRIVED', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'CANCELLED', 'RETURNED', 'FAILED', 'RESCHEDULED'
];

/**
 * Checks if an order is overdue based on creation date & current status:
 * 1. > 7 days old and not yet shipped (Pending, Confirmed, Processing, etc.)
 * 2. > 10 days old and not yet delivered (any status except Delivered, Cancelled, Returned, Failed)
 */
export function getOrderOverdueStatus(order: { createdAt?: string; status?: string }): OverdueStatus {
  if (!order?.createdAt) return { isOverdue: false };

  const createdDate = new Date(order.createdAt);
  if (isNaN(createdDate.getTime())) return { isOverdue: false };

  const now = new Date();
  const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);

  const status = (order.status || '').toUpperCase().trim();

  // Condition 1: > 10 days and not delivered/terminal
  if (diffDays > 10 && !TERMINAL_STATUSES.includes(status)) {
    return {
      isOverdue: true,
      reason: 'undelivered',
      label: 'Order > 10 days undelivered'
    };
  }

  // Condition 2: > 7 days and not shipped
  if (diffDays > 7 && !SHIPPED_OR_TERMINAL_STATUSES.includes(status)) {
    return {
      isOverdue: true,
      reason: 'unshipped',
      label: 'Order > 7 days unshipped'
    };
  }

  return { isOverdue: false };
}

const STORAGE_KEY = 'admin_seen_overdue_orders';

/**
 * Retrieves the set of seen overdue order IDs from sessionStorage/localStorage.
 */
export function getSeenOverdueOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Marks an overdue order as seen.
 */
export function markOverdueOrderAsSeen(orderId: string): string[] {
  if (typeof window === 'undefined' || !orderId) return [];
  try {
    const seen = getSeenOverdueOrderIds();
    if (!seen.includes(orderId)) {
      const updated = [...seen, orderId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return seen;
  } catch {
    return [];
  }
}
