import { redirect } from 'next/navigation';

export default function CollectionsPage() {
  // Seamlessly redirect /collections to the unified immersive section on the homepage
  redirect('/#immersive-store');
}
