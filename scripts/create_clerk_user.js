require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAndSetAdmin() {
  const email = 'deysusahnt23@gmail.com';
  const password = 'sushant1014_&';
  
  console.log(`Creating Clerk user for email: ${email}`);

  // Create user in Clerk
  const createRes = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
    },
    body: JSON.stringify({
      email_address: [email],
      password: password,
      first_name: 'Sushant',
      last_name: 'Admin'
    })
  });

  const userData = await createRes.json();
  
  if (userData.errors) {
    if (userData.errors[0].code === 'form_identifier_exists') {
      console.log('User already exists. Fetching existing user...');
    } else {
      console.error('Error creating user:', JSON.stringify(userData.errors, null, 2));
      return;
    }
  }

  // Fetch users from Clerk to get the ID (whether newly created or existing)
  const res = await fetch('https://api.clerk.com/v1/users?email_address=' + encodeURIComponent(email), {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
    }
  });

  const users = await res.json();
  const clerkId = users[0].id;
  console.log(`Found Clerk ID: ${clerkId}`);

  // Sleep for 3 seconds to let Clerk webhook fire and insert into Supabase first
  console.log('Waiting for webhook to process...');
  await new Promise(r => setTimeout(r, 3000));

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
    console.log('No profile found in Supabase for this clerk_id. Sync might not have run yet. Creating profile manually...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        clerk_id: clerkId,
        full_name: 'Sushant Admin',
        role: 'super_admin'
      })
      .select();
      
    if (insertError) {
       console.error('Error manually creating profile:', insertError);
    } else {
       console.log('Created profile and set to super_admin:', insertData[0]);
    }
  }
}

createAndSetAdmin();
