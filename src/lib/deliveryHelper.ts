/**
 * Utility to calculate expected delivery date range based on order date and stock status of products.
 */

export interface DeliveryDetails {
  originalRange: string;
  revisedRange: string;
  maxExpectedDate: Date;
  isDelayed: boolean;
}

export function getExpectedDeliveryDetails(createdAt?: string, orderItems?: any[]): DeliveryDetails {
  const orderDate = createdAt ? new Date(createdAt) : new Date();
  
  const hasPreOrder = orderItems?.some((item: any) => {
    const productStock = item?.products?.stock_status;
    const itemStock = item?.stock_status;
    return productStock === 'pre_order' || itemStock === 'pre_order';
  }) || false;

  let startDays = 0;
  let endDays = 0;

  if (hasPreOrder) {
    startDays = 4;
    endDays = 6;
  } else {
    const utcTime = orderDate.getTime() + (orderDate.getTimezoneOffset() * 60000);
    const nepalOffset = 5.75 * 60 * 60 * 1000;
    const nepalDate = new Date(utcTime + nepalOffset);

    const hour = nepalDate.getHours();
    const minutes = nepalDate.getMinutes();
    const isBeforeNoon = hour < 12 || (hour === 12 && minutes === 0);

    if (isBeforeNoon) {
      startDays = 1;
      endDays = 2;
    } else {
      startDays = 2;
      endDays = 3;
    }
  }

  const startDate = new Date(orderDate);
  startDate.setDate(orderDate.getDate() + startDays);

  const endDate = new Date(orderDate);
  endDate.setDate(orderDate.getDate() + endDays);

  // Set time of endDate to 23:59:59 to give full buffer for the day
  endDate.setHours(23, 59, 59, 999);

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatRange = (start: Date, end: Date) => {
    const startDay = start.getDate();
    const startMonth = months[start.getMonth()];
    const startStr = `${startDay}${getOrdinalSuffix(startDay)} ${startMonth}`;

    const endDay = end.getDate();
    const endMonth = months[end.getMonth()];
    const endStr = `${endDay}${getOrdinalSuffix(endDay)} ${endMonth}`;

    return `${startStr} - ${endStr}`;
  };

  const originalRange = formatRange(startDate, endDate);

  // Check if current local time is past the endDate
  const today = new Date();
  const isDelayed = today.getTime() > endDate.getTime();

  // If delayed, revised range will be Today + 1 day to Today + 2 days
  const revisedStartDate = new Date(today);
  revisedStartDate.setDate(today.getDate() + 1);

  const revisedEndDate = new Date(today);
  revisedEndDate.setDate(today.getDate() + 2);

  const revisedRange = formatRange(revisedStartDate, revisedEndDate);

  return {
    originalRange,
    revisedRange,
    maxExpectedDate: endDate,
    isDelayed
  };
}

export function getExpectedDeliveryRange(createdAt?: string, orderItems?: any[]): string {
  const details = getExpectedDeliveryDetails(createdAt, orderItems);
  return details.originalRange;
}

export function formatSingleDate(dateInput?: string | Date): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day}${getOrdinalSuffix(day)} ${month}`;
}
