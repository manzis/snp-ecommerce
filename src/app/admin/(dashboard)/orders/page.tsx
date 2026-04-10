import { fetchAllOrdersAdminAction } from '@/app/actions/orderActions';
import { AdminOrderList } from '@/components/admin/AdminOrderList';
import { CreateDemoOrderBtn } from '@/components/admin/CreateDemoOrderBtn';

export default async function OrdersPage() {
  const result = await fetchAllOrdersAdminAction();

  if (!result.success) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-red-600">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="mt-2">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-100 pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Orders Management</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Manage and update status for all store orders.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <CreateDemoOrderBtn />
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100">
            Total Orders: {result.totalCount}
          </div>
        </div>
      </div>
      
      <AdminOrderList initialOrders={result.orders || []} />
    </div>
  );
}