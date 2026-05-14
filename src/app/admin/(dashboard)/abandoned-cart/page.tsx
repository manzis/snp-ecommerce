import { getAbandonedCartDataAction } from '@/app/actions/marketingActions';
import AbandonedCartClient from './AbandonedCartClient';
import { redirect } from 'next/navigation';

export default async function AbandonedCartPage() {
  const result = await getAbandonedCartDataAction();
  const initialData = result.success ? result.data : undefined;
  return <AbandonedCartClient initialData={initialData} />;
}
