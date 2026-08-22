-- 1. Add Admin Policies for Orders
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can delete all orders" ON public.orders FOR DELETE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

-- 2. Add Admin Policies for Order Items
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can update all order items" ON public.order_items FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can delete all order items" ON public.order_items FOR DELETE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

-- 3. Add Admin Policies for Profiles (Customers)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

-- 4. Add Admin Policies for Product Reviews
CREATE POLICY "Admins can view all reviews" ON public.product_reviews FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can update all reviews" ON public.product_reviews FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Admins can delete all reviews" ON public.product_reviews FOR DELETE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

-- 5. Promote specific users to super_admin (This bypasses RLS issues for the admin panel)
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('inkwave6000@gmail.com', 'deysushant23@gmail.com')
);
