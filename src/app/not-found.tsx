'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 30s linear infinite; }
      `}} />
      
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />

      {/* Ambient Blob */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 z-0 pointer-events-none"
        style={{ backgroundColor: 'var(--accent)' }}
      />

      {/* Infinite Marquee Text in Background */}
      <div className="absolute top-1/4 -left-[20%] w-[140%] -rotate-6 z-0 opacity-5 pointer-events-none overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee font-display font-black text-[150px] uppercase tracking-tighter">
          404 PAGE NOT FOUND / LOST IN THE ARCHIVE / 404 PAGE NOT FOUND / LOST IN THE ARCHIVE / 
        </div>
      </div>
      <div className="absolute bottom-1/4 -left-[20%] w-[140%] rotate-6 z-0 opacity-5 pointer-events-none overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee-reverse font-display font-black text-[150px] uppercase tracking-tighter">
          404 PAGE NOT FOUND / LOST IN THE ARCHIVE / 404 PAGE NOT FOUND / LOST IN THE ARCHIVE / 
        </div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Animated 404 Graphic */}
        <div className="relative mb-8">
          <h1 
            className="font-display font-black text-[150px] md:text-[220px] leading-none tracking-tighter mix-blend-exclusion"
            style={{ 
              color: 'var(--bg)',
              textShadow: '-2px -2px 0 var(--text), 2px -2px 0 var(--text), -2px 2px 0 var(--text), 2px 2px 0 var(--text), 8px 8px 0 var(--accent)'
            }}
          >
            404
          </h1>
          <div 
            className="absolute inset-0 bg-[var(--text)] mix-blend-difference pointer-events-none animate-pulse opacity-50"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 20%, 0 40%, 100% 40%, 100% 60%, 0 60%, 0 80%, 100% 80%, 100% 100%, 0 100%)' }}
          />
        </div>

        <h2 className="font-display text-3xl md:text-5xl font-extrabold uppercase mb-6 tracking-tight">
          Page Not Found
        </h2>
        
        <p className="font-mono text-sm uppercase tracking-[0.2em] mb-12 opacity-70">
          The item or collection you are looking for has been archived, deleted, or never existed in this timeline.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 border-2 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs transition-all hover:bg-[var(--text)] hover:text-[var(--bg)]"
            style={{ borderColor: 'var(--text)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          
          <Link 
            href="/" 
            className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-[var(--text)] opacity-30"></div>
      <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-[var(--text)] opacity-30"></div>
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-[var(--text)] opacity-30"></div>
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-[var(--text)] opacity-30"></div>
    </div>
  );
}
