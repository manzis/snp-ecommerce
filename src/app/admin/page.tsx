import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Redirect users who just type `/admin` directly to the dashboard
  redirect('/admin/dashboard');
}
