-- Migration: 005_product_reviews
-- Description: Creates the product_reviews table for storing user ratings and comments.

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_text text,
  is_approved boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure a user can only review a product once
CREATE UNIQUE INDEX idx_product_reviews_user_product ON public.product_reviews (user_id, product_id);

-- Indexes for fast fetching
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews USING btree (product_id);
CREATE INDEX idx_product_reviews_is_approved ON public.product_reviews USING btree (is_approved);

-- RLS Policies
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Approved reviews are viewable by everyone" ON public.product_reviews FOR SELECT USING (is_approved = true);

-- Note: Inserting and updating will be handled securely via the Service Role Key in Next.js Server Actions.
