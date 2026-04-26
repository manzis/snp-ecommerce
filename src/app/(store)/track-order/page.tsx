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
      description: 'Enter your Order ID to see real-time updates on your shipment status.',
      openGraph: {
        title: 'Track your Order',
        description: 'Enter your Order ID to see real-time updates on your shipment status.',
        images: [
          {
            url: '/images/track-order.png',
            width: 1200,
            height: 630,
            alt: 'Track your Order',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Track your Order',
        description: 'Enter your Order ID to see real-time updates on your shipment status.',
        images: ['/images/track-order.png'],
      }
    };
  }

  const shortId = id.split('-')[0].toUpperCase();

  return {
    title: `Track your Order: #${shortId}`,
    description: `Real-time updates for your order #${shortId}. See status, carrier and estimated delivery updates.`,
    openGraph: {
      title: `Track your Order: #${shortId}`,
      description: `Real-time updates for your order #${shortId}. See status, carrier and estimated delivery updates.`,
      images: [
        {
          url: '/images/track-order.png',
          width: 1200,
          height: 630,
          alt: `Track Order #${shortId}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Track your Order: #${shortId}`,
      description: `Real-time updates for your order #${shortId}. See status, carrier and estimated delivery updates.`,
      images: ['/images/track-order.png'],
    }
  };
}

export default async function TrackOrderPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const { id } = await searchParams;
  return <TrackOrderClient initialOrderId={id} />;
}
