import Link from 'next/link';
import { fetchAllOrdersAdminAction } from '@/app/actions/orderActions';

import DynamicAdminNav from '@/components/layout/DynamicAdminNav';

export default async function DashboardPage() {
  const result = await fetchAllOrdersAdminAction(1, 10);
  
  const totalOrders = result.success ? result.totalCount : 0;
  const recentOrders = result.success ? (result.orders || []).slice(0, 5) : [];

  return (
    <>
      <DynamicAdminNav />
      <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-black text-[#111827] tracking-tight">System Overview</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Welcome to your store's administrative command center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">{totalOrders}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Revenue</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">Rs 0</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center opacity-50">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Users</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">--</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Now</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">1</h3>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-lg text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-blue-600 text-sm font-bold hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-xs">
                  #{order.shortId}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.title}</p>
                  <p className="text-xs text-gray-500">{order.dateText}</p>
                </div>
              </div>
              <div className={`px-3 py-1 text-xs font-bold rounded-full 
                ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.status}
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="p-10 text-center text-gray-500">No recent orders.</div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}