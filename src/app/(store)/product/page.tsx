import { redirect } from 'next/navigation';

// /product with no slug is not a valid route — redirect to the products listing
// This prevents a soft-404 (200 status) that Google Search Console would flag
export default function ProductIndexPage() {
  redirect('/products');
}
