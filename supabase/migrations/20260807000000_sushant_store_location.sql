-- Update or initialize Sushant's profile with India store location
UPDATE profiles
SET 
  full_name = COALESCE(full_name, 'Sushant Dey'),
  fit_preferences = jsonb_build_object(
    'phone', '9876543210',
    'pincode', '395007',
    'address_line1', 'B/12 Sharmjivi Soc, Umra',
    'landmark', 'Near Umra Police Station',
    'city', 'Surat',
    'state', 'Gujarat',
    'address', 'B/12 Sharmjivi Soc, Umra, Surat, Gujarat - 395007'
  )
WHERE email ILIKE '%deysushant%' 
   OR email ILIKE '%sushant%' 
   OR full_name ILIKE '%Sushant%';
