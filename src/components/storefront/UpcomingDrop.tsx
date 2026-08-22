'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface UpcomingDropProps {
  config: {
    targetDate: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
  };
}

export default function UpcomingDrop({ config }: UpcomingDropProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!config?.targetDate) return;

    const targetTime = new Date(config.targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config?.targetDate]);

  if (!config || !config.targetDate) return null;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="relative w-full overflow-hidden bg-black text-white py-16 md:py-24 lg:py-32">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 bg-[var(--bg)]">
        {config.mediaType === 'video' ? (
          <video
            src={config.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <img
            src={config.mediaUrl}
            alt="Upcoming Drop"
            className="w-full h-full object-cover opacity-50 scale-105 animate-hero-ken-burns"
          />
        )}
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/60 via-transparent to-[var(--bg)]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 wrap flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
          <Clock className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/90">
            Next Drop Initiating
          </span>
        </div>

        <h2 className="font-display text-[2.5rem] leading-[0.9] sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white max-w-4xl mx-auto px-4 break-words">
          {config.title || 'THE ARCHIVE'}
        </h2>
        
        <p className="text-xs sm:text-base font-mono text-white/80 max-w-sm sm:max-w-lg mb-10 px-6">
          {config.description || 'Very limited quantities. No restocks. Prepare for the drop.'}
        </p>

        {/* Countdown Grid */}
        {isClient ? (
          <div className="grid grid-cols-4 gap-3 sm:gap-6 md:gap-8 mb-10 px-4">
            {[
              { label: 'Days', value: pad(timeLeft.days) },
              { label: 'Hours', value: pad(timeLeft.hours) },
              { label: 'Minutes', value: pad(timeLeft.minutes) },
              { label: 'Seconds', value: pad(timeLeft.seconds) },
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[4.2rem] h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  <span className="font-display text-2xl sm:text-4xl md:text-6xl font-bold text-white tracking-tighter">
                    {unit.value}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-mono uppercase tracking-widest text-[var(--accent)] font-bold">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[120px] sm:h-[180px]" /> /* Skeleton height */
        )}

        <Link
          href={config.buttonLink || '#'}
          className="px-6 py-3.5 md:px-8 md:py-4 bg-[var(--text)] text-[var(--bg)] font-sans font-black text-xs sm:text-sm md:text-base uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(201,162,39,0.5)] rounded-none"
        >
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span>{config.buttonText || 'Get Notified'}</span>
        </Link>
      </div>
    </section>
  );
}
