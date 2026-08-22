'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

// Helper to get Resend client
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

import { subscribeSchema, broadcastSchema } from '@/lib/validations/newsletter.schema';
import { EmailService } from '@/lib/email';

import { headers } from 'next/headers';

export async function subscribeAction(email: string) {
  try {
    const parseResult = subscribeSchema.safeParse({ email });
    if (!parseResult.success) {
      return { success: false, error: 'Invalid email address' };
    }
    const validatedEmail = parseResult.data.email;

    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';

    // 1. Check if subscriber already exists
    const { data: existing, error: fetchError } = await (supabase.from('newsletter_subscribers') as any)
      .select('id, status')
      .eq('email', validatedEmail.toLowerCase())
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (existing) {
      if (existing.status === 'active') {
        return { success: false, error: 'This email is already subscribed.' };
      }
      // Re-send verification link if currently pending
      const sent = await EmailService.sendNewsletterVerification(validatedEmail.toLowerCase(), existing.id, host);
      if (!sent) {
        return { success: false, error: 'Failed to send verification email.' };
      }
      return { success: true, message: 'Verification email re-sent! Please check your inbox.' };
    }

    // 2. Insert new subscriber as pending
    const { data: inserted, error: insertError } = await (supabase.from('newsletter_subscribers') as any)
      .insert({ email: validatedEmail.toLowerCase(), status: 'pending' })
      .select('id')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // 3. Send verification email
    const sent = await EmailService.sendNewsletterVerification(validatedEmail.toLowerCase(), inserted.id, host);
    if (!sent) {
      return { success: false, error: 'Failed to send verification email.' };
    }

    return { success: true, message: 'Please check your inbox to verify your subscription!' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server error' };
  }
}

export async function sendBroadcastAction(subject: string, htmlContent: string) {
  try {
    const parseResult = broadcastSchema.safeParse({ subject, htmlContent });
    if (!parseResult.success) {
      return { success: false, error: 'Subject and content are required' };
    }
    const validatedData = parseResult.data;

    const supabase = await createClient();
    
    // Fetch active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active');

    if (fetchError) {
      return { success: false, error: 'Failed to fetch subscribers: ' + fetchError.message };
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: false, error: 'No active subscribers found.', sentCount: 0 };
    }

    // Map to array of emails
    const bccList = subscribers.map((sub: any) => sub.email);

    // Send via EmailService SMTP (Gmail) for production reliability
    const result = await EmailService.sendBulkEmail(bccList, validatedData.subject, validatedData.htmlContent);
    return result;

  } catch (err: any) {
    return { success: false, error: err.message || 'Server error', sentCount: 0 };
  }
}
