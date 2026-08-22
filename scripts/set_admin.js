require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setSuperAdmin() {
  const email = 'deysusahnt23@gmail.com';
  console.log(`Setting role to super_admin for email: ${email}`);

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error updating role:', error);
  } else if (data && data.length > 0) {
    console.log('Successfully updated profile:', data[0]);
  } else {
    console.log('No profile found with that email. Make sure the user has signed up in Clerk first.');
  }
}

setSuperAdmin();
