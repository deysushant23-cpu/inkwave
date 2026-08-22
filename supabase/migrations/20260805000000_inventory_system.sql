-- Migration: 20260805000000_inventory_system
-- Description: Inventory management system redesign

-- 1. Add new columns to product_variants
ALTER TABLE public.product_variants
  ADD COLUMN reserved_stock integer NOT NULL DEFAULT 0,
  ADD COLUMN status text NOT NULL DEFAULT 'active',
  ADD COLUMN barcode text,
  ADD COLUMN created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Add a unique constraint to prevent duplicate sizes per product
CREATE UNIQUE INDEX idx_product_variant_size ON public.product_variants(product_id, size) WHERE size IS NOT NULL AND size != '';

-- Add a check constraint to prevent negative physical stock or negative reserved stock
ALTER TABLE public.product_variants
  ADD CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0),
  ADD CONSTRAINT chk_reserved_non_negative CHECK (reserved_stock >= 0),
  ADD CONSTRAINT chk_reserved_less_than_stock CHECK (reserved_stock <= stock_quantity);

-- 2. Create inventory_history table
CREATE TABLE public.inventory_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  movement_type text NOT NULL, -- e.g., 'Restock', 'Purchase', 'Refund', 'Return', 'Adjustment', 'Manual Update', 'Order Cancellation'
  quantity_change integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for fast history lookups
CREATE INDEX idx_inventory_history_variant_id ON public.inventory_history(variant_id);

-- RLS for inventory_history
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory history is viewable by admins" ON public.inventory_history FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'store_ops'))
);
CREATE POLICY "Inventory history is insertable by authenticated users" ON public.inventory_history FOR INSERT WITH CHECK (
  true
);

-- 3. Replace place_order RPC to record inventory history and handle available stock logic
CREATE OR REPLACE FUNCTION place_order(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_payment_intent_id TEXT,
  p_shipping_address JSONB,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_variant_id UUID;
  v_quantity INTEGER;
  v_unit_price NUMERIC;
  v_current_stock INTEGER;
  v_reserved_stock INTEGER;
BEGIN
  -- 1. Create the Order FIRST so we can use its ID in the history log
  INSERT INTO public.orders (
    user_id, 
    total_amount, 
    discount_amount, 
    order_status, 
    payment_intent_id, 
    shipping_address
  ) VALUES (
    p_user_id, 
    p_total_amount, 
    p_discount_amount, 
    'ORDER_PLACED', 
    p_payment_intent_id, 
    p_shipping_address
  ) RETURNING id INTO v_order_id;

  -- 2. Validate and Decrement Inventory (Row-level lock) & Create Order Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := (v_item->>'unit_price')::NUMERIC;
    
    IF v_item->>'variant_id' IS NOT NULL THEN
      v_variant_id := (v_item->>'variant_id')::UUID;

      -- Lock the variant row to prevent concurrent checkout race conditions
      SELECT stock_quantity, reserved_stock INTO v_current_stock, v_reserved_stock
      FROM public.product_variants
      WHERE id = v_variant_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant % not found', v_variant_id;
      END IF;

      -- Available stock is physical stock - reserved stock
      IF (v_current_stock - v_reserved_stock) < v_quantity THEN
        RAISE EXCEPTION 'Insufficient available stock for variant % (Requested: %, Available: %)', v_variant_id, v_quantity, (v_current_stock - v_reserved_stock);
      END IF;

      -- Decrement physical stock (since this is an immediate purchase without prior reservation)
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity - v_quantity
      WHERE id = v_variant_id;

      -- Insert Inventory History
      INSERT INTO public.inventory_history (
        variant_id, order_id, movement_type, quantity_change, previous_stock, new_stock, reason
      ) VALUES (
        v_variant_id, v_order_id, 'Purchase', -v_quantity, v_current_stock, v_current_stock - v_quantity, 'Checkout placed'
      );

      -- Insert Order Item
      INSERT INTO public.order_items (order_id, variant_id, quantity, unit_price)
      VALUES (v_order_id, v_variant_id, v_quantity, v_unit_price);
    ELSE
      -- Custom print without standard stock
      INSERT INTO public.order_items (order_id, quantity, unit_price)
      VALUES (v_order_id, v_quantity, v_unit_price);
    END IF;
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC for Manual Inventory Adjustment
CREATE OR REPLACE FUNCTION adjust_inventory(
  p_variant_id UUID,
  p_admin_id UUID,
  p_new_stock INTEGER,
  p_reason TEXT
) RETURNS VOID AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  -- Lock row
  SELECT stock_quantity INTO v_current_stock
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant not found';
  END IF;

  -- Update stock
  UPDATE public.product_variants
  SET stock_quantity = p_new_stock
  WHERE id = p_variant_id;

  -- Log history
  INSERT INTO public.inventory_history (
    variant_id, admin_id, movement_type, quantity_change, previous_stock, new_stock, reason
  ) VALUES (
    p_variant_id, p_admin_id, 'Manual Update', (p_new_stock - v_current_stock), v_current_stock, p_new_stock, p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC for Cancelling Order and Restoring Stock
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_order_status text;
  v_item RECORD;
  v_current_stock INTEGER;
BEGIN
  -- Lock order row
  SELECT order_status INTO v_order_status
  FROM public.orders
  WHERE id = p_order_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or unauthorized';
  END IF;

  IF v_order_status IN ('SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Order cannot be cancelled at this stage';
  END IF;

  -- Update order status
  UPDATE public.orders
  SET order_status = 'CANCELLED'
  WHERE id = p_order_id;

  -- Restore stock and log history
  FOR v_item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      -- Lock variant
      SELECT stock_quantity INTO v_current_stock
      FROM public.product_variants
      WHERE id = v_item.variant_id
      FOR UPDATE;

      IF FOUND THEN
        -- Restore physical stock
        UPDATE public.product_variants
        SET stock_quantity = stock_quantity + v_item.quantity
        WHERE id = v_item.variant_id;

        -- Log history
        INSERT INTO public.inventory_history (
          variant_id, order_id, movement_type, quantity_change, previous_stock, new_stock, reason
        ) VALUES (
          v_item.variant_id, p_order_id, 'Order Cancellation', v_item.quantity, v_current_stock, v_current_stock + v_item.quantity, 'Order cancelled by user'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

