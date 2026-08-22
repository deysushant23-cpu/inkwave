'use client';

import React from 'react';
import { Settings, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function MaintenanceScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--bg)]">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl">
        <div className="mb-8 relative">
          <Wrench className="w-16 h-16 text-[var(--accent)] animate-bounce" />
          <Settings className="w-8 h-8 text-[var(--text-dim)] absolute -bottom-2 -right-2 animate-spin-slow" />
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tighter">
          We'll be right back.
        </h1>
        
        <p className="text-[var(--text-dim)] text-lg md:text-xl mb-12 max-w-lg mx-auto">
          We are currently updating our systems to bring you an even better experience. Hang tight, INKWAVE will return shortly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a href="https://www.instagram.com/inkwavefashion?igsh=M3ExbWZqZ2ZyN284" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full border border-[var(--line)] bg-[var(--bg-card)] text-[var(--text)] font-bold text-sm hover:bg-[var(--line)] transition-all">
            FOLLOW UPDATES
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 text-[var(--text-dim)] text-xs font-mono uppercase tracking-widest">
        SYSTEMS OFFLINE // INKWAVE
      </div>
    </div>
  );
}
