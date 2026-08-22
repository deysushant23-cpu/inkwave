-- 1. Ensure Super Admin role for deysushant23@gmail.com
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('deysushant23@gmail.com', 'inkwave6000@gmail.com')
);

-- 2. If profiles have full_name or email matching deysushant23@gmail.com
UPDATE public.profiles
SET role = 'super_admin'
WHERE full_name ILIKE '%deysushant23@gmail.com%' OR full_name ILIKE '%Sushant%';
