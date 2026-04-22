import { Metadata } from 'next';
import CreateOrderForm from '@/components/admin/orders/CreateOrderForm';

export const metadata: Metadata = {
  title: 'Create Order | Admin Dashboard',
  description: 'Manually create a new order',
};

export default function CreateOrderPage() {
  return <CreateOrderForm />;
}
