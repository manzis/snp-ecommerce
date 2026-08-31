export interface KourtierTrackingLog {
  date: string;
  message: string;
  status: {
    updated_status?: string;
    message?: string;
    branch?: {
      name?: string;
    };
  };
}

export interface KourtierTrackingResponse {
  data?: KourtierTrackingLog[];
  message?: string;
}

/**
 * Cleans raw Kourtier messages by stripping CN# numbers and internal office jargon, 
 * returning standardized, professional customer-facing messages.
 */
function formatKourtierMessage(rawMessage: string, mappedStatus: string): string {
  if (mappedStatus === 'out_for_delivery') {
    return 'Your package is out for delivery with our delivery partner and will arrive today.';
  }
  if (mappedStatus === 'delivered') {
    return 'Your package has been delivered successfully. Thank you for shopping with us!';
  }
  if (mappedStatus === 'shipment_arrived') {
    return 'Your package has arrived at the local processing hub.';
  }
  if (mappedStatus === 'in_transit') {
    return 'Your package is in transit and on its way to your destination.';
  }
  if (mappedStatus === 'shipped') {
    return 'Package dispatched and handed over to courier partner.';
  }
  if (mappedStatus === 'failed') {
    return 'Delivery attempt failed. Our team will contact you shortly to coordinate a rescheduled delivery.';
  }

  let msg = (rawMessage || '').replace(/<[^>]*>?/gm, '').trim();
  msg = msg.replace(/^CN#\d+\s*/i, '').trim();
  msg = msg
    .replace(/\s+in\s+office/gi, '')
    .replace(/\s+in\s+head\s+office/gi, '')
    .replace(/\s+to\s+head\s+office/gi, '')
    .replace(/head\s+office/gi, '')
    .trim();

  return msg ? msg.charAt(0).toUpperCase() + msg.slice(1) : 'Status updated by delivery partner.';
}

/**
 * Maps Kourtier status codes / strings to our internal order status strings.
 */
function mapKourtierStatus(rawStatus?: string, rawMessage?: string): { status: string; message: string } {
  const statusStr = (rawStatus || '').toLowerCase();
  const rawMsgStr = (rawMessage || '').replace(/<[^>]*>?/gm, '').trim();

  let targetStatus = 'in_transit';

  // 1. Out for Delivery (Must check BEFORE delivered because 'outfordelivery' contains 'deliver')
  if (
    statusStr.includes('outfordelivery') || 
    statusStr.includes('out_for_delivery') || 
    rawMsgStr.toLowerCase().includes('out for delivery')
  ) {
    targetStatus = 'out_for_delivery';
  }
  // 2. Delivered
  else if (
    statusStr.includes('delivered') || 
    rawMsgStr.toLowerCase().includes('delivered')
  ) {
    targetStatus = 'delivered';
  }
  // 3. Branch Received / Arrived at Hub
  else if (
    statusStr.includes('branchreceived') || 
    statusStr.includes('received') || 
    rawMsgStr.toLowerCase().includes('received by branch') ||
    rawMsgStr.toLowerCase().includes('warehouse')
  ) {
    targetStatus = 'shipment_arrived';
  }
  // 4. In Transit
  else if (
    statusStr.includes('intransit') || 
    statusStr.includes('in_transit') || 
    rawMsgStr.toLowerCase().includes('in transit') || 
    rawMsgStr.toLowerCase().includes('shipped')
  ) {
    targetStatus = 'in_transit';
  }
  // 5. Booking Created
  else if (
    statusStr.includes('created') || 
    rawMsgStr.toLowerCase().includes('booking is created')
  ) {
    targetStatus = 'shipped';
  }
  // 6. Failed / Returned
  else if (
    statusStr.includes('return') || 
    statusStr.includes('fail') || 
    statusStr.includes('cancel')
  ) {
    targetStatus = 'failed';
  }

  return {
    status: targetStatus,
    message: formatKourtierMessage(rawMsgStr, targetStatus)
  };
}

/**
 * Polls the public Kourtier Courier API for a tracking number.
 * Returns an array of mapped status updates (oldest to newest).
 */
export async function fetchKourtierUpdate(trackingNumber: string): Promise<Array<{ status: string; message: string; date: string }> | null> {
  if (!trackingNumber || trackingNumber.trim() === '') return null;

  try {
    const res = await fetch('https://kourtierlive.com/api/v1/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `cn_number=${encodeURIComponent(trackingNumber.trim())}`,
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`[Kourtier] API Error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: KourtierTrackingResponse = await res.json();

    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      return null;
    }

    const mappedResults: Array<{ status: string; message: string; date: string }> = [];

    for (const item of data.data) {
      const rawStatus = item.status?.updated_status;
      const rawMsg = item.message || item.status?.message || '';
      const mapped = mapKourtierStatus(rawStatus, rawMsg);

      let parsedDate = item.date;
      try {
        if (parsedDate) {
          parsedDate = parsedDate.replace('Z', '').replace('T', ' ');
        } else {
          parsedDate = new Date().toISOString().replace('T', ' ').replace('Z', '');
        }
      } catch (e) {
        parsedDate = new Date().toISOString().replace('T', ' ').replace('Z', '');
      }

      mappedResults.push({
        status: mapped.status,
        message: mapped.message,
        date: parsedDate
      });
    }

    if (mappedResults.length === 0) return null;

    // Sort oldest to newest
    mappedResults.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return mappedResults;

  } catch (err) {
    console.error('[Kourtier] Fetch Error:', err);
    return null;
  }
}
