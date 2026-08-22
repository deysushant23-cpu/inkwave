-- Migration: 011_restock_notifications
-- Description: Create restock_notifications table for "Notify Me" feature.

CREATE TABLE public.restock_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.restock_notifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts so guest users can leave their email
CREATE POLICY "Anyone can insert restock notifications"
    ON public.restock_notifications FOR INSERT
    WITH CHECK (true);

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own restock notifications"
    ON public.restock_notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Only admins can update
CREATE POLICY "Admins can update restock notifications"
    ON public.restock_notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );
