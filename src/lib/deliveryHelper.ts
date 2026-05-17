/**
 * Utility to calculate expected delivery date range based on order date and stock status of products.
 */

export function getExpectedDeliveryRange(createdAt?: string, orderItems?: any[]): string {
  // 1. Parse order date safely
  const orderDate = createdAt ? new Date(createdAt) : new Date();
  if (isNaN(orderDate.getTime())) {
    return "";
  }

  // 2. Check if any item is a pre-order product
  const hasPreOrder = orderItems?.some((item: any) => {
    const productStock = item?.products?.stock_status;
    const itemStock = item?.stock_status;
    return productStock === 'pre_order' || itemStock === 'pre_order';
  }) || false;

  let startDays = 0;
  let endDays = 0;

  if (hasPreOrder) {
    // Scenario 1: Pre-order items present (always 4 to 6 days)
    startDays = 4;
    endDays = 6;
  } else {
    // Scenario 2: In-stock items only
    // Convert order date to Nepal Time (UTC + 5 hours 45 minutes)
    const utcTime = orderDate.getTime() + (orderDate.getTimezoneOffset() * 60000);
    const nepalOffset = 5.75 * 60 * 60 * 1000; // 5 hours 45 minutes in milliseconds
    const nepalDate = new Date(utcTime + nepalOffset);

    const hour = nepalDate.getHours();
    const minutes = nepalDate.getMinutes();

    // Checked if ordered on or before 12:00 PM Nepal Time
    const isBeforeNoon = hour < 12 || (hour === 12 && minutes === 0);

    if (isBeforeNoon) {
      // Ordered before 12:00 PM: 1 to 2 days
      startDays = 1;
      endDays = 2;
    } else {
      // Ordered after 12:00 PM: 2 to 3 days
      startDays = 2;
      endDays = 3;
    }
  }

  // 3. Calculate target dates
  const startDate = new Date(orderDate);
  startDate.setDate(orderDate.getDate() + startDays);

  const endDate = new Date(orderDate);
  endDate.setDate(orderDate.getDate() + endDays);

  // 4. Format date with English ordinal suffixes (e.g. 22nd May)
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

  const startDay = startDate.getDate();
  const startMonth = months[startDate.getMonth()];
  const startStr = `${startDay}${getOrdinalSuffix(startDay)} ${startMonth}`;

  const endDay = endDate.getDate();
  const endMonth = months[endDate.getMonth()];
  const endStr = `${endDay}${getOrdinalSuffix(endDay)} ${endMonth}`;

  return `${startStr} - ${endStr}`;
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
