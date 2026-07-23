import { getAbandonedCartDataAction } from '@/app/actions/marketingActions';
import AbandonedCartClient from './AbandonedCartClient';
import { redirect } from 'next/navigation';

export default function AbandonedCartPage() {
  return <AbandonedCartClient initialData={undefined} />;
}
