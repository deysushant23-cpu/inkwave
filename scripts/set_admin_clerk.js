require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setSuperAdmin() {
  const email = 'deysusahnt23@gmail.com';
  console.log(`Looking up Clerk user for email: ${email}`);

  // Fetch users from Clerk
  const res = await fetch('https://api.clerk.com/v1/users?email_address=' + encodeURIComponent(email), {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
    }
  });

  const users = await res.json();
  
  if (!users || users.length === 0) {
    console.log('User not found in Clerk. Please sign up first.');
    return;
  }

  const clerkId = users[0].id;
  console.log(`Found Clerk ID: ${clerkId}`);

  // Update Supabase profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('clerk_id', clerkId)
    .select();

  if (error) {
    console.error('Error updating role:', error);
  } else if (data && data.length > 0) {
    console.log('Successfully updated profile to super_admin:', data[0]);
  } else {
    console.log('No profile found in Supabase for this clerk_id. Sync might not have run yet.');
  }
}

setSuperAdmin();
