'use client';

import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
    >
      Log out
    </button>
  );
}
