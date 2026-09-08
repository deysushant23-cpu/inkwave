import { redirect } from 'next/navigation';

export default function AdminHomepageRedirect() {
  // Seamlessly redirect to the unified Storefront Management hub
  redirect('/admin/storefront-manage?tab=hero');
}

