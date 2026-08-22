-- Migration: 004_place_order_rpc
-- Description: Atomic inventory decrement and order placement.

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
BEGIN
  -- 1. Validate and Decrement Inventory (Row-level lock)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Extract values safely. If variant_id is missing/null, it's a custom print without standard stock.
    IF v_item->>'variant_id' IS NOT NULL THEN
      v_variant_id := (v_item->>'variant_id')::UUID;
      v_quantity := (v_item->>'quantity')::INTEGER;

      -- Lock the variant row to prevent concurrent checkout race conditions
      SELECT stock_quantity INTO v_current_stock
      FROM public.product_variants
      WHERE id = v_variant_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant % not found', v_variant_id;
      END IF;

      IF v_current_stock < v_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant % (Requested: %, Available: %)', v_variant_id, v_quantity, v_current_stock;
      END IF;

      -- Decrement stock safely
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity - v_quantity
      WHERE id = v_variant_id;
    END IF;
  END LOOP;

  -- 2. Create the Order
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

  -- 3. Create Order Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := (v_item->>'unit_price')::NUMERIC;
    
    IF v_item->>'variant_id' IS NOT NULL THEN
      v_variant_id := (v_item->>'variant_id')::UUID;
      INSERT INTO public.order_items (order_id, variant_id, quantity, unit_price)
      VALUES (v_order_id, v_variant_id, v_quantity, v_unit_price);
    ELSE
      INSERT INTO public.order_items (order_id, quantity, unit_price)
      VALUES (v_order_id, v_quantity, v_unit_price);
    END IF;
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
