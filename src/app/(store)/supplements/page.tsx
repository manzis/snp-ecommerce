import { redirect } from 'next/navigation';

// /supplements is not a valid route — redirect to the products listing
// Prevents soft-404 and consolidates SEO equity
export default function SupplementsPage() {
  redirect('/products');
}
