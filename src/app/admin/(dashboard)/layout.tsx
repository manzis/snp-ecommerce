import Link from 'next/link';
import { LogoutButton } from '@/components/admin/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] text-white flex-shrink-0 hidden md:flex flex-col shadow-xl">
        <div className="p-5 text-2xl font-black border-b border-gray-800 tracking-tight text-white flex items-center justify-between">
          <span>Admin<span className="text-blue-500">Panel</span></span>
        </div>
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <ul className="space-y-1.5">
            {[
              { name: 'Dashboard', path: '/admin/dashboard' },
              { name: 'Orders', path: '/admin/orders' },
              { name: 'Products', path: '/admin/products' },
              { name: 'Categories', path: '/admin/categories' },
              { name: 'Customers', path: '/admin/customers' },
              { name: 'Reviews', path: '/admin/reviews' },
              { name: 'Abandoned Carts', path: '/admin/abandoned-cart' },
              { name: 'Analytics', path: '/admin/analytics' },
              { name: 'Settings', path: '/admin/settings' },
            ].map((item) => (
              <li key={item.name}>
                <Link href={item.path} className="block px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium text-gray-300">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="text-xl font-bold text-gray-900 md:hidden">
            AdminPanel
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              👋 Welcome back, Super Admin
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
