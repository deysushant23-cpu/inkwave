import { z } from 'zod';

export const checkoutItemSchema = z.object({
  id: z.string().uuid().optional().or(z.string()),
  variant_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required'),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().min(0, 'Price cannot be negative'),
  custom_print_metadata: z.any().optional(),
});

export const checkoutSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code'),
  address_line1: z.string().min(5, 'Flat / House No. and Street address is required'),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  address: z.string().optional(),
  total: z.number().positive('Total must be positive'),
  paymentMethod: z.enum(['cod', 'razorpay']),
  razorpay_payment_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
}).refine(data => {
  if (data.paymentMethod === 'razorpay' && (!data.razorpay_payment_id || data.razorpay_payment_id.length < 5)) {
    return false;
  }
  return true;
}, {
  message: "Payment verification failed or is missing",
  path: ["razorpay_payment_id"]
});

export type CheckoutParams = z.infer<typeof checkoutSchema>;
