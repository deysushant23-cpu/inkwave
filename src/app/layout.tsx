import type { Metadata } from "next";
import { Space_Grotesk, Syne, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/server';
import ReferralTracker from '@/components/storefront/ReferralTracker';
import Script from 'next/script';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Inkwave | Premium Gen-Z Streetwear & Custom Prints",
  description: "Luxury underground streetwear. Shop limited oversized t-shirts, custom 3D printed tees, and small-batch ink-dyed clothing.",
  keywords: [
    "streetwear", "oversized tshirts", "ink-dyed garments", "menswear silhouettes",
    "small batch apparel", "premium clothing", "custom 3D print tshirts", "printed tees",
    "baggy cargo pants", "inkwave fashion", "indie streetwear brand", "buy streetwear india"
  ],
  openGraph: {
    title: "Inkwave | Premium Gen-Z Streetwear & Custom Prints",
    description: "Luxury underground streetwear. Shop limited oversized t-shirts, custom 3D printed tees, and small-batch ink-dyed clothing.",
    url: 'https://inkwavefashion.com',
    siteName: 'Inkwave',
    images: [
      {
        url: 'https://inkwavefashion.com/logo.png', // Assuming a logo exists or will be replaced with actual OG image
        width: 1200,
        height: 630,
        alt: 'Inkwave Streetwear',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Inkwave | Premium Gen-Z Streetwear & Custom Prints",
    description: "Luxury underground streetwear. Shop limited oversized t-shirts, custom 3D printed tees, and small-batch ink-dyed clothing.",
    images: ['https://inkwavefashion.com/logo.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0B0D',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: themeData } = await (supabase.from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'theme_config')
    .single();
  const defaultTheme = {
    bg: '#0B0B0D',
    bgAlt: '#131316',
    bgCard: '#17171B',
    text: '#EDEAE8',
    textDim: '#8E8B85',
    accent: '#C9A227',
    line: 'rgba(237,234,232,0.12)',
    wave: '#1B3A5C',
    wave2: '#2A5079',
    tileA: '#1B3A5C',
    tileB: '#0B0B0D',
  };
  
  const theme = { ...defaultTheme, ...(themeData?.json_content || {}) };

  const themeVariables = `
    :root {
      --bg: ${theme.bg};
      --bg-alt: ${theme.bgAlt};
      --bg-card: ${theme.bgCard};
      --text: ${theme.text};
      --text-dim: ${theme.textDim};
      --accent: ${theme.accent};
      --accent-text: ${theme.bg}; /* Inverse */
      --line: ${theme.line};
      --wave: ${theme.wave};
      --wave-2: ${theme.wave2};
      --tile-a: ${theme.tileA};
      --tile-b: ${theme.tileB};
      
      /* Shadcn core mappings */
      --background: ${theme.bg};
      --foreground: ${theme.text};
      --primary: ${theme.accent};
      --primary-foreground: ${theme.bg};
      --card: ${theme.bgCard};
      --card-foreground: ${theme.text};
      --border: ${theme.line};
    }
  `;

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVariables }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6H284Z9JF7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6H284Z9JF7');
          `}
        </Script>
      </head>
      <body className={`${spaceGrotesk.variable} ${syne.variable} ${jetbrainsMono.variable} font-sans`}>
        <ReferralTracker />
        <div className="grain"></div>
        <div className="wipe" id="wipe"></div>
        {children}
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}

