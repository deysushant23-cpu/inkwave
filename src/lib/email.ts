import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Abstracted Email Service
export class EmailService {
  private static resend: Resend | null = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  private static defaultFrom = 'Inkwave <inkwave2016@gmail.com>';

  // SMTP Transporter
  private static getTransporter() {
    const user = process.env.SMTP_USER || 'inkwave1620@gmail.com';
    const pass = process.env.SMTP_PASS || 'zitlapbaldixdsde';

    if (!user || !pass) return null;

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  static async sendOrderConfirmation(email: string, orderId: string, total: number, name: string, address: string) {
    const transporter = this.getTransporter();
    const fromEmail = process.env.OTP_FROM_EMAIL || this.defaultFrom;
    const subject = `Order Confirmed: INKWAVE #${orderId.substring(0, 8).toUpperCase()}`;
    const htmlContent = `
      <div style="font-family: monospace; padding: 40px; background-color: #000; color: #fff; max-width: 600px; margin: 0 auto; border: 1px solid #222; border-radius: 12px;">
        <h1 style="text-transform: uppercase; letter-spacing: 2px; color: #ff1e56;">Inkwave</h1>
        <p>Your premium underground streetwear is secured.</p>
        <p><strong>Order ID:</strong> #${orderId.substring(0, 8).toUpperCase()}</p>
        <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
        <p><strong>Shipping To:</strong> ${name}<br/>${address}</p>
        <hr style="border-color: #333; margin: 20px 0;" />
        <p>We are preparing your order now. You will receive another notification when your order ships.</p>
        <p>Stay current.</p>
      </div>
    `;

    // 1. Try SMTP (Gmail)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`SMTP Order Confirmation Email sent successfully to ${email}`);
        return;
      } catch (smtpError) {
        console.error('SMTP Email failed, falling back to Resend:', smtpError);
      }
    }

    // 2. Try Resend
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Inkwave Orders <orders@resend.dev>', // Fallback to Resend default domain
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`Resend Order Confirmation Email sent successfully to ${email}`);
        return;
      } catch (resendError) {
        console.error('Resend Email failed:', resendError);
      }
    }

    console.warn(`No email provider configured. Could not send order confirmation to ${email}`);
  }

  static async sendOtpEmail(email: string, otp: string) {
    const transporter = this.getTransporter();
    const fromEmail = process.env.OTP_FROM_EMAIL || this.defaultFrom;
    const subject = `Verification Code: ${otp} - Inkwave`;
    const htmlContent = `
      <div style="font-family: monospace; padding: 40px; background-color: #000; color: #fff; max-width: 500px; margin: 0 auto; border: 1px solid #222; border-radius: 12px;">
        <h1 style="text-transform: uppercase; letter-spacing: 2px; color: #ff1e56;">Inkwave</h1>
        <p style="font-size: 14px; color: #888;">Secure Customer Login Portal</p>
        <hr style="border-color: #222; margin: 20px 0;" />
        <p>Your one-time verification code is:</p>
        <div style="background-color: #111; padding: 15px; border-radius: 8px; border: 1px solid #333; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #fff; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          This code will expire in 5 minutes. If you did not request this code, please ignore this email.
        </p>
        <hr style="border-color: #222; margin: 20px 0;" />
        <p style="font-size: 11px; color: #444;">Inkwave Lab © 2026. All rights secured.</p>
      </div>
    `;

    // 1. Try SMTP (Gmail)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`SMTP OTP Email sent successfully to ${email}`);
        return true;
      } catch (smtpError) {
        console.error('SMTP OTP Email failed, falling back to Resend:', smtpError);
      }
    }

    // 2. Try Resend
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Inkwave Auth <onboarding@resend.dev>', // Fallback to Resend default domain
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`Resend OTP Email sent successfully to ${email}`);
        return true;
      } catch (resendError) {
        console.error('Resend OTP Email failed:', resendError);
      }
    }

    console.warn(`No email provider configured. Could not send OTP to ${email}. Code was: ${otp}`);
    return false;
  }

  static async sendBulkEmail(recipients: string[], subject: string, htmlContent: string) {
    const transporter = this.getTransporter();
    const fromEmail = process.env.OTP_FROM_EMAIL || this.defaultFrom;

    if (!transporter) {
      console.warn("SMTP Transporter not configured. Trying Resend fallback...");
      if (this.resend) {
        let sent = 0;
        for (const email of recipients) {
          try {
            await this.resend.emails.send({
              from: 'Inkwave <onboarding@resend.dev>',
              to: email,
              subject,
              html: htmlContent,
            });
            sent++;
          } catch (e) {
            console.error(`Resend fallback failed for ${email}:`, e);
          }
        }
        return { success: true, sentCount: sent };
      }
      return { success: false, error: 'No email service available.', sentCount: 0 };
    }

    let sent = 0;
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
        });
        sent++;
      } catch (smtpError) {
        console.error(`SMTP failed for ${email}:`, smtpError);
      }
    }

    return { success: true, sentCount: sent };
  }

  static async sendNewsletterVerification(email: string, id: string, host: string) {
    const transporter = this.getTransporter();
    const fromEmail = process.env.OTP_FROM_EMAIL || this.defaultFrom;
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';
    const verificationLink = `${protocol}://${host}/api/newsletter/verify?id=${id}`;
    
    const subject = `Confirm Your Inkwave Subscription`;
    const htmlContent = `
      <div style="font-family: monospace; padding: 40px; background-color: #000; color: #fff; max-width: 500px; margin: 0 auto; border: 1px solid #222; border-radius: 12px;">
        <h1 style="text-transform: uppercase; letter-spacing: 2px; color: #ff1e56; margin: 0;">Inkwave</h1>
        <p style="font-size: 14px; color: #888; margin-top: 5px;">Newsletter Activation</p>
        <hr style="border-color: #222; margin: 20px 0;" />
        <p>You requested to join the Inkwave broadcast channel.</p>
        <p>Click the link below to confirm and activate your subscription:</p>
        <div style="margin: 25px 0;">
          <a href="${verificationLink}" style="display: inline-block; background-color: #ff1e56; color: #fff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Verify Subscription
          </a>
        </div>
        <p style="font-size: 11px; color: #555;">
          If the button above does not work, copy and paste this URL into your browser: <br/>
          <a href="${verificationLink}" style="color: #888;">${verificationLink}</a>
        </p>
        <hr style="border-color: #222; margin: 20px 0;" />
        <p style="font-size: 11px; color: #444;">If you did not request this subscription, you can safely ignore this email.</p>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`SMTP Verification Email sent successfully to ${email}`);
        return true;
      } catch (smtpError) {
        console.error('SMTP Verification Email failed, trying Resend:', smtpError);
      }
    }

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Inkwave <onboarding@resend.dev>',
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`Resend Verification Email sent successfully to ${email}`);
        return true;
      } catch (resendError) {
        console.error('Resend Verification Email failed:', resendError);
      }
    }

    return false;
  }
}
