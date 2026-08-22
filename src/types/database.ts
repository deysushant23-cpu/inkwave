export type UserRole = 'user' | 'super_admin' | 'store_ops' | 'content_mgr';
export type OrderStatus = 'ORDER_PLACED' | 'IN_FULFILLMENT' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

export interface Profile {
  id: string; // uuid
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  loyalty_points: number;
  fit_preferences: Record<string, any>;
  created_at: string;
}

export interface Category {
  id: string; // uuid
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  show_in_header: boolean;
  created_at: string;
}

export interface Product {
  id: string; // uuid
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_at_price?: number | null;
  is_drop: boolean;
  overlay_mask_url: string | null;
  images?: string[];
  created_at: string;
}

export interface ProductVariant {
  id: string; // uuid
  product_id: string;
  sku: string;
  size: string;
  color: string | null;
  stock_quantity: number;
  reserved_stock: number;
  status: string;
  barcode: string | null;
  price_override: number | null;
  compare_at_price?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryHistory {
  id: string; // uuid
  variant_id: string;
  admin_id: string | null;
  order_id: string | null;
  movement_type: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  created_at: string;
}

export interface Order {
  id: string; // uuid
  user_id: string;
  total_amount: number;
  discount_amount: number;
  order_status: OrderStatus;
  payment_intent_id: string | null;
  shipping_address: Record<string, any>;
  delivery_otp_hash: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string; // uuid
  order_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
}

export interface CmsSection {
  id: string; // uuid
  section_key: string;
  json_content: Record<string, any>;
  is_published: boolean;
  author_id: string | null;
  updated_at: string;
}

export interface CmsRevision {
  id: string; // uuid
  section_id: string;
  version_number: number;
  json_snapshot: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string; // uuid
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

export interface RestockNotification {
  id: string; // uuid
  product_id: string;
  variant_id: string | null;
  email: string;
  user_id: string | null;
  status: 'pending' | 'notified';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      product_variants: { Row: ProductVariant; Insert: Partial<ProductVariant>; Update: Partial<ProductVariant> };
      inventory_history: { Row: InventoryHistory; Insert: Partial<InventoryHistory>; Update: Partial<InventoryHistory> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };

      cms_sections: { Row: CmsSection; Insert: Partial<CmsSection>; Update: Partial<CmsSection> };
      cms_revisions: { Row: CmsRevision; Insert: Partial<CmsRevision>; Update: Partial<CmsRevision> };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
      restock_notifications: { Row: RestockNotification; Insert: Partial<RestockNotification>; Update: Partial<RestockNotification> };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
  };
}
