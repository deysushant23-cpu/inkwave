import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

export const broadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255),
  htmlContent: z.string().min(1, 'Content is required'),
});
