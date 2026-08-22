-- 1. Extensions & Custom Enums
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('user', 'super_admin', 'store_ops', 'content_mgr');
CREATE TYPE order_status AS ENUM ('ORDER_PLACED', 'IN_FULFILLMENT', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED');
CREATE TYPE tryon_status AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- 2. Core Relational Tables
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  role user_role DEFAULT 'user'::user_role,
  loyalty_points integer DEFAULT 0,
  fit_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL,
  is_drop boolean DEFAULT false,
  overlay_mask_url text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  sku text UNIQUE NOT NULL,
  size text NOT NULL,
  color text,
  stock_quantity integer DEFAULT 0,
  price_override numeric(10,2)
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) DEFAULT 0,
  order_status order_status DEFAULT 'ORDER_PLACED'::order_status,
  payment_intent_id text,
  shipping_address jsonb NOT NULL,
  delivery_otp_hash text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL
);

CREATE TABLE public.ai_tryon_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  input_image_url text NOT NULL,
  rendered_image_url text,
  latent_code text,
  quality_score numeric(3,2),
  status tryon_status DEFAULT 'QUEUED'::tryon_status,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.cms_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key text UNIQUE NOT NULL,
  json_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean DEFAULT false,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.cms_revisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id uuid REFERENCES public.cms_sections(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  json_snapshot jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Performance Indexing
CREATE INDEX idx_products_slug ON public.products USING btree (slug);
CREATE INDEX idx_product_variants_sku ON public.product_variants USING btree (sku);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_ai_tryon_history_user_id ON public.ai_tryon_history USING btree (user_id);
CREATE INDEX idx_cms_sections_json_content ON public.cms_sections USING gin (json_content);

-- 4. Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tryon_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Strict isolation
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Products: Public read, restricted write
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by admins" ON public.categories FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Categories are updatable by admins" ON public.categories FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by admins" ON public.products FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Products are updatable by admins" ON public.products FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

-- Variants
CREATE POLICY "Product variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Product variants are insertable by admins" ON public.product_variants FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Product variants are updatable by admins" ON public.product_variants FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);

-- AI Try-On History: Strict isolation
CREATE POLICY "Users view own tryon history" ON public.ai_tryon_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tryon history" ON public.ai_tryon_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tryon history" ON public.ai_tryon_history FOR UPDATE USING (auth.uid() = user_id);

-- CMS Sections: Public read (if published), admin edit
CREATE POLICY "Published CMS sections viewable by everyone" ON public.cms_sections FOR SELECT USING (is_published = true);
CREATE POLICY "CMS sections editable by content_mgr and super_admin" ON public.cms_sections FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'content_mgr'))
);

-- Orders: Users view own, admins view all
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Users view own
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

-- 5. Triggers & Functions
-- Handle New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Loyalty Points Trigger
CREATE OR REPLACE FUNCTION public.calculate_loyalty_points()
RETURNS trigger AS $$
DECLARE
  points_to_add integer;
BEGIN
  IF NEW.order_status = 'DELIVERED' AND (OLD.order_status IS NULL OR OLD.order_status != 'DELIVERED') THEN
    -- Calculate points: 1 point per $10 spent
    points_to_add := FLOOR(NEW.total_amount / 10);
    UPDATE public.profiles
    SET loyalty_points = loyalty_points + points_to_add
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_delivered
  AFTER UPDATE OF order_status ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_loyalty_points();
