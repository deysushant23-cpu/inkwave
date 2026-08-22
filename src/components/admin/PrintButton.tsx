'use client';

import { Printer } from 'lucide-react';
import React from 'react';

export default function PrintButton({ className }: { className?: string }) {
  return (
    <button 
      onClick={() => window.print()} 
      className={className || "flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-[var(--text)] transition-colors"}
    >
      <Printer className="w-4 h-4" /> Print
    </button>
  );
}
