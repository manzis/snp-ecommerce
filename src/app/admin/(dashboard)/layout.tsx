import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import Breadcrumb from '@/components/layout/AdminBreadcrumb';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminMobileNav from '@/components/admin/layout/AdminMobileNav';
import RealtimeOrderListener from '@/components/admin/layout/RealtimeOrderListener';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] font-sans bg-gray-100 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0  overflow-hidden relative md:py-[8px] md:pr-[8px] gap-[8px]  ">
        <AdminHeader />

        <main className="flex-1 bg-white rounded-[12px] relative overflow-hidden flex flex-col">
          <DynamicAdminNav />
          <div className="flex-1 overflow-y-auto flex flex-col relative w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminMobileNav />

      {/* Real-time Event Handlers */}
      <RealtimeOrderListener />
    </div>
  );
}
