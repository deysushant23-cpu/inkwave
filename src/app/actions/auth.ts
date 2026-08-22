'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { EmailService } from '@/lib/email';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits');

export async function savePhoneNumber(phone: string) {
  try {
    // 1. Strict Validation
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      return { success: false, error: (parsed.error as any).errors[0].message };
    }

    const validatedPhone = parsed.data;

    // 2. Secure Auth Verification
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please login again.' };
    }

    // 3. Update the Profile in Database
    const { data, error } = await (supabase.from('profiles') as any).update({
      phone: validatedPhone
    }).eq('id', user.id).select().single();

    if (error) {
      console.error('Save phone error:', error);
      return { success: false, error: 'Failed to save phone number.' };
    }

    return { success: true, profile: data };

  } catch (err: any) {
    console.error('Unexpected error saving phone:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

const emailSchema = z.string().email('Invalid email address');

export async function requestEmailOtpAction(email: string) {
  try {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid email address' };
    }
    const cleanEmail = parsed.data.trim().toLowerCase();

    // 1. Check our own server-side rate limits in cms_sections
    const adminSupabase = await createAdminClient();
    const { data: section } = await (adminSupabase.from('cms_sections') as any)
      .select('id, json_content')
      .eq('section_key', 'email_otp_store')
      .single();

    const otpStore = section?.json_content || {};
    const record = otpStore[cleanEmail] || null;
    const now = Date.now();

    if (record) {
      // Cooldown of 60 seconds
      if (now - record.lastRequestedAt < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - (now - record.lastRequestedAt)) / 1000);
        return { success: false, error: `Please wait ${secondsLeft} seconds before requesting another code.` };
      }
      // Hourly cap (max 5 OTPs per hour)
      const oneHourAgo = now - 60 * 60 * 1000;
      const hourlyRequests = record.hourlyRequests ? record.hourlyRequests.filter((t: number) => t > oneHourAgo) : [];
      if (hourlyRequests.length >= 5) {
        return { success: false, error: 'Too many OTP requests. Please try again after an hour.' };
      }
      hourlyRequests.push(now);
      record.hourlyRequests = hourlyRequests;
    }

    // 2. Ask Supabase to generate the link and OTP code
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (linkError || !linkData?.properties) {
      console.error('Generate Link Error:', linkError);
      return { success: false, error: linkError?.message || 'Failed to generate verification code.' };
    }

    const { email_otp, verification_type } = linkData.properties;

    // 3. Save rate limit & verification details
    const newRecord = {
      verificationType: verification_type,
      lastRequestedAt: now,
      hourlyRequests: record ? record.hourlyRequests : [now]
    };
    otpStore[cleanEmail] = newRecord;

    if (section) {
      await (adminSupabase.from('cms_sections') as any)
        .update({ json_content: otpStore })
        .eq('id', section.id);
    } else {
      await (adminSupabase.from('cms_sections') as any)
        .insert([{
          section_key: 'email_otp_store',
          json_content: otpStore,
          is_published: true
        }]);
    }

    // 4. Send the OTP code via Resend
    const sent = await EmailService.sendOtpEmail(cleanEmail, email_otp);
    if (!sent) {
      return { success: false, error: 'Failed to send verification code. Please check your mail credentials.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Request OTP Error:', err);
    return { success: false, error: 'Failed to request verification code. Please try again.' };
  }
}

export async function verifyEmailOtpAction(email: string, otpInput: string) {
  try {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid email address' };
    }
    const cleanEmail = parsed.data.trim().toLowerCase();

    if (!otpInput || otpInput.trim().length < 6) {
      return { success: false, error: 'Verification code must be at least 6 digits.' };
    }
    const cleanOtp = otpInput.trim();

    const clientSupabase = await createClient();

    // 1. Try signing in with password (for test/auditor accounts)
    const { data: pwdData, error: pwdError } = await clientSupabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanOtp
    });

    if (!pwdError && pwdData.session) {
      return {
        success: true,
        session: {
          access_token: pwdData.session.access_token,
          refresh_token: pwdData.session.refresh_token
        }
      };
    }

    // 2. Fetch OTP store to retrieve verification type for standard OTP
    const adminSupabase = await createAdminClient();
    const { data: section } = await (adminSupabase.from('cms_sections') as any)
      .select('id, json_content')
      .eq('section_key', 'email_otp_store')
      .single();

    if (!section || !section.json_content || !section.json_content[cleanEmail]) {
      return { success: false, error: 'No verification code found. Please request a new one.' };
    }

    const otpStore = section.json_content;
    const record = otpStore[cleanEmail];

    // 3. Call Supabase auth verifyOtp using the correct verification type
    const { data: authData, error: authError } = await clientSupabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanOtp,
      type: record.verificationType
    });

    if (authError || !authData.session) {
      return { success: false, error: authError?.message || 'Verification failed. Incorrect or expired code.' };
    }

    // 3. Clear the OTP entry upon successful verification
    delete otpStore[cleanEmail];
    await (adminSupabase.from('cms_sections') as any).update({ json_content: otpStore }).eq('id', section.id);

    return {
      success: true,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      }
    };
  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return { success: false, error: err.message || 'Verification failed.' };
  }
}
