import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ReelsCarousel from './ReelsCarousel';
import ScrollRevealText from './ScrollRevealText';

export default async function ReelsSection() {
  const supabase = await createClient();
  
  const { data } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'reels_config')
    .single();
    
  let reels = data?.json_content as any[] || [];
  
  if (reels.length === 0) {
    reels = [
      { id: 'mock-1', title: 'Dyeing Process Vol 4', videoUrl: 'https://videos.pexels.com/video-files/3205307/3205307-hd_1080_1920_25fps.mp4', productSlug: 'fathom-overshirt' },
      { id: 'mock-2', title: 'Street Style Shoot', videoUrl: 'https://videos.pexels.com/video-files/5004554/5004554-uhd_1440_2560_30fps.mp4', productSlug: 'monsoon-cargo-jeans' },
      { id: 'mock-3', title: 'Behind the Seams', videoUrl: 'https://videos.pexels.com/video-files/8468305/8468305-hd_1080_1920_30fps.mp4', productSlug: 'static-crew-tee' }
    ];
  }

  return (
    <section className="relative overflow-hidden w-full flex flex-col justify-center items-center py-12 md:py-24 z-10 bg-black">
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)'
      }} />

      <div className="text-center mb-12 relative z-10 w-full max-w-4xl mx-auto px-4">
        <span className="font-mono text-xs uppercase tracking-[0.3em] font-semibold mb-4 block text-[#d4af37]">
          Inkwave Editorial
        </span>
        <ScrollRevealText 
          text="BEHIND THE PROCESS"
          className="font-display font-extrabold text-5xl md:text-7xl uppercase text-white tracking-tighter"
        />
        <p className="mt-6 text-[var(--text-dim)] font-mono text-sm max-w-xl mx-auto">
          Explore short films documenting our styling and design process. Shop the looks directly.
        </p>
      </div>

      <div className="w-full relative z-10 max-w-[1600px] mx-auto">
        <ReelsCarousel reels={reels} />
      </div>
    </section>
  );
}
