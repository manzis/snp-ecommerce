import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface ExpoUpdate {
  WaybillNumber: string;
  UpdateCode: string;
  UpdateDescription: string;
  UpdateDateTime: string;
  UpdateLocation: string;
  Comments: string;
}

export interface ExpoTrackingResponse {
  HasErrors: boolean;
  TrackingResults?: Array<{
    Key: string;
    TrackingLink: string;
    Value: ExpoUpdate[];
  }>;
}

/**
 * Maps Expo Express descriptions to our internal order statuses and formats custom messages.
 */
function mapExpoUpdate(update: ExpoUpdate): { status: string; message: string; location?: string } | null {
  const desc = update.UpdateDescription?.toLowerCase() || '';
  const code = update.UpdateCode || '';

  let loc = update.UpdateLocation || '';
  // If the location is just GPS coordinates (numbers, dots, commas), hide it.
  if (/^[0-9.,\s-]+$/.test(loc)) {
    loc = '';
  }

  // 1. Delivered
  if (desc.includes('delivered')) {
    return {
      status: 'delivered',
      message: `Order successfully delivered.`,
      location: loc
    };
  }

  // 2. Out for Delivery / Picked by Rider
  if (desc.includes('out for delivery') || desc.includes('picked by rider')) {
    return {
      status: 'out_for_delivery',
      message: `Out for delivery.`,
      location: loc
    };
  }

  // 3. In Transit (Departed from facility)
  if (desc.includes('departed from facility') || desc.includes('dispatched')) {
    return {
      status: 'in_transit',
      message: `Your shipment is in transit and on the way to your destination.`,
      location: loc
    };
  }

  // 4. Shipment Arrived (Received at facility)
  if (desc.includes('received at facility') || desc.includes('arrived at facility')) {
    return {
      status: 'shipment_arrived',
      message: `Package arrived at local processing hub.`,
      location: loc
    };
  }

  // 5. Failed / Returned (User specified SH012)
  if (code === 'SH012' || desc.includes('fail') || desc.includes('return') || desc.includes('cancel')) {
    return {
      status: 'failed',
      message: `Delivery attempt failed. Please contact support or carrier.`,
      location: loc
    };
  }

  return null; // Ignore unknown updates to prevent cluttering the timeline
}

/**
 * Polls the Expo Express API for a specific tracking number.
 * Returns an array of mapped status updates (oldest to newest).
 */
export async function fetchExpoExpressUpdate(trackingNumber: string): Promise<Array<{ status: string; message: string; date: string }> | null> {
  const apiKey = process.env.EXPO_EXPRESS_API_KEY;
  if (!apiKey) {
    console.warn('[ExpoExpress] Missing EXPO_EXPRESS_API_KEY environment variable.');
    return null;
  }

  try {
    const res = await fetch('https://developer.expoexpressnp.com/v1/TrackShipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        APIKEY: apiKey,
        Shipments: [trackingNumber],
        GetLastTrackingUpdateOnly: false // Fetch the ENTIRE history
      })
    });

    if (!res.ok) {
      console.error(`[ExpoExpress] API Error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: ExpoTrackingResponse = await res.json();

    if (data.HasErrors || !data.TrackingResults || data.TrackingResults.length === 0) {
      return null;
    }

    const updates = data.TrackingResults[0].Value;
    if (!updates || updates.length === 0) {
      return null;
    }

    const mappedResults: Array<{ status: string; message: string; date: string; location?: string }> = [];

    // The API might return updates newest-first or oldest-first.
    // We map all of them and push them to an array.
    for (const rawUpdate of updates) {
      const mapped = mapExpoUpdate(rawUpdate);
      if (mapped) {
        let parsedDate = new Date().toISOString();
        try {
          const d = new Date(rawUpdate.UpdateDateTime);
          if (!isNaN(d.getTime())) parsedDate = d.toISOString();
        } catch (e) { }

        mappedResults.push({
          status: mapped.status,
          message: mapped.message,
          date: parsedDate,
          location: mapped.location
        });
      }
    }

    if (mappedResults.length === 0) return null;

    // Sort oldest to newest so they append to the timeline correctly
    mappedResults.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return mappedResults;

  } catch (err) {
    console.error('[ExpoExpress] Fetch Error:', err);
    return null;
  }
}
