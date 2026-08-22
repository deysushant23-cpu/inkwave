'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  icon: React.ReactNode;
  content: string;
}

export default function ProductConstruction() {
  const [activeTab, setActiveTab] = useState<number | null>(0); // Default open the first tab (Fabric Tech)

  const items: AccordionItem[] = [
    {
      title: "Fabric Tech",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      content: "450GSM ultra-dense French Terry. Enzyme washed for a vintage feel with synthetic overlays that maintain luminescence."
    },
    {
      title: "Architectural Fit",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 6H3" /><path d="M21 12H3" /><path d="M21 18H3" />
          <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
      content: "Drop shoulder construction with articulated sleeve panelling — designed for an aggressive oversized profile that holds shape."
    },
    {
      title: "Care Instructions",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-11z" />
          <path d="M12 13v4" />
        </svg>
      ),
      content: "Cold wash inside out. Do not tumble dry. Air dry only. Iron on low if necessary."
    }
  ];

  const handleToggle = (index: number) => {
    setActiveTab(activeTab === index ? null : index);
  };

  return (
    <section className="wrap pb-24" style={{ borderTop: '1px solid var(--line)', paddingTop: '64px' }}>
      <p className="sec-tag mb-8">Construction</p>
      
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, index) => {
          const isOpen = activeTab === index;
          return (
            <div 
              key={index}
              className="border rounded-2xl overflow-hidden transition-all duration-300 bg-[var(--bg-card)]"
              style={{
                borderColor: isOpen ? 'var(--accent)' : 'var(--line)',
                boxShadow: isOpen ? '0 4px 20px -2px rgba(255,30,86,0.05)' : 'none'
              }}
            >
              {/* Accordion Trigger Button */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="p-2.5 rounded-xl bg-[var(--bg-alt)] border text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]"
                    style={{
                      borderColor: isOpen ? 'var(--accent)' : 'var(--line)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    {item.title}
                  </span>
                </div>
                <div 
                  className="p-1.5 rounded-full bg-[var(--bg-alt)] border text-[var(--text-dim)] group-hover:text-[var(--text)] transition-transform duration-300"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    borderColor: isOpen ? 'var(--accent)' : 'var(--line)'
                  }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Accordion Content Panel */}
              <div 
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  maxHeight: isOpen ? '120px' : '0px',
                  opacity: isOpen ? 1 : 0
                }}
              >
                <div className="px-6 pb-5 pt-1 pl-[68px] border-t border-[var(--line)]/50">
                  <p className="text-xs leading-relaxed font-mono text-[var(--text-dim)] leading-normal max-w-2xl">
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
