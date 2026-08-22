import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const errorHtml = (msg: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inkwave | Verification Failed</title>
        <style>
            body { background-color: #050505; color: #EDEAE8; font-family: 'Courier New', Courier, monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .container { max-width: 480px; width: 100%; background-color: #0b0b0d; border: 1px solid #1c1c22; padding: 50px 40px; text-align: center; border-radius: 20px; }
            h1 { font-size: 28px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 15px 0; color: #ff1e56; }
            p { font-size: 14px; line-height: 1.6; color: #8E8B85; margin: 0 0 30px 0; }
            a.btn { display: inline-block; background-color: #333; color: #fff; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; padding: 14px 28px; border-radius: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Activation Failed</h1>
            <p>${msg}</p>
            <a href="/" class="btn">Return to Store</a>
        </div>
    </body>
    </html>
  `;

  if (!id) {
    return new NextResponse(errorHtml("Invalid or missing verification link parameters."), {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    const supabase = await createAdminClient();
    
    // Select status of the subscriber
    const { data: subscriber, error: fetchError } = await (supabase.from('newsletter_subscribers') as any)
      .select('id, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !subscriber) {
      return new NextResponse(errorHtml("Subscription token not found or expired."), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (subscriber.status === 'active') {
      // Already verified, render success page
      return new NextResponse(successHtml(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Update status to active
    const { error: updateError } = await (supabase.from('newsletter_subscribers') as any)
      .update({ status: 'active' })
      .eq('id', id);

    if (updateError) {
      return new NextResponse(errorHtml("Failed to update status in database: " + updateError.message), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new NextResponse(successHtml(), {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (err: any) {
    return new NextResponse(errorHtml(err.message || "An unexpected error occurred."), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function successHtml() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inkwave | Subscription Confirmed</title>
        <style>
            body { background-color: #050505; color: #EDEAE8; font-family: 'Courier New', Courier, monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .container { max-width: 480px; width: 100%; background-color: #0b0b0d; border: 1px solid #1c1c22; padding: 50px 40px; text-align: center; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            h1 { font-size: 32px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 10px 0; color: #ff1e56; }
            p { font-size: 14px; line-height: 1.6; color: #8E8B85; margin: 0 0 30px 0; }
            .success-icon { font-size: 48px; margin-bottom: 20px; display: inline-block; animation: pulse 2s infinite; }
            a.btn { display: inline-block; background-color: #EDEAE8; color: #050505; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; padding: 16px 32px; border-radius: 12px; transition: all 0.2s ease; cursor: pointer; }
            a.btn:hover { background-color: #ff1e56; color: #fff; transform: translateY(-2px); }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">⚡</div>
            <h1>Activated</h1>
            <p>Your connection to the Inkwave broadcast channel has been verified successfully. You will receive updates, collections drop news, and limited releases.</p>
            <a href="/" class="btn">Return to Store</a>
        </div>
    </body>
    </html>
  `;
}
