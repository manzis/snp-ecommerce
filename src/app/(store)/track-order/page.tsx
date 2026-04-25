import type { Metadata } from 'next';
import TrackOrderClient from './TrackOrderClient';

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}): Promise<Metadata> {
  const { id } = await searchParams;
  
  if (!id) {
    return {
      title: 'Track your Order',
      description: 'Enter your Order ID to see real-time updates on your shipment status.'
    };
  }

  const shortId = id.split('-')[0].toUpperCase();

  return {
    title: `Track your Order: #${shortId}`,
    description: `Real-time updates for your order #${shortId}. See status, carrier and estimated delivery updates.`,
    openGraph: {
      title: `Track your Order: #${shortId}`,
      description: `Real-time updates for your order #${shortId}. See status, carrier and estimated delivery updates.`,
    }
  };
}

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
