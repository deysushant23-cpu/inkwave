import { redirect } from 'next/navigation';

export default function BillingPage() {
  redirect('/admin/orders?tab=billing');
}
