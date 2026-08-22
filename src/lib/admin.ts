import { cookies } from 'next/headers';

/**
 * Strictly verifies if the current user is an authorized admin.
 * Requires the master admin password gate cookie.
 * 
 * Throws an error if unauthorized to immediately halt Server Actions.
 */
export async function verifyAdmin() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get('admin_auth_cookie')?.value === 'true';

  if (!hasAdminCookie) {
    console.error('verifyAdmin failed: Admin session expired or missing.');
    throw new Error('Unauthorized: Admin session expired or missing.');
  }

  return true;
}
