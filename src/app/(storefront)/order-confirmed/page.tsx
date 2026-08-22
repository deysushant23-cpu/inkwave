'use client';

import Link from 'next/link';

export default function OrderConfirmedPage() {
  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const el = e.currentTarget;
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = text;
      el.innerText = 'COPIED';
      el.classList.add('text-tertiary');
      setTimeout(() => {
        el.innerText = originalText;
        el.classList.remove('text-tertiary');
      }, 1500);
    });
  };

  return (
    <div className="relative z-10 min-h-screen pt-12 pb-24 px-margin-mobile md:px-margin-desktop">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(198, 198, 198, 0.2);
        }
        .neon-pulse {
          box-shadow: 0 0 20px rgba(157, 0, 255, 0.2);
        }
        .track-active {
          background: linear-gradient(90deg, #c6c6c6 0%, #dfb7ff 100%);
        }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: subtle-float 6s ease-in-out infinite;
        }
      `}} />

      {/* SUCCESS HERO */}
      <section className="max-w-4xl mx-auto text-center flex flex-col items-center mb-24 mt-20">
        <div className="w-20 h-20 bg-tertiary text-on-tertiary rounded-full flex items-center justify-center mb-8 neon-pulse animate-float">
          <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
        </div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase mb-4 leading-none">
          ORDER CONFIRMED.<br/>WELCOME TO THE WAVE.
        </h1>
        <div className="mt-8">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">IDENTIFICATION NUMBER</p>
          <p 
            className="font-display-2xl text-[40px] md:text-[64px] text-primary tracking-widest cursor-pointer transition-colors"
            onClick={handleCopy}
            title="Click to copy"
          >
            #IW-8829-01X
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <button className="bg-white text-black px-10 py-4 font-label-caps text-label-caps hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(157,0,255,0.4)] border border-white/20">
            DOWNLOAD INVOICE
          </button>
          <Link href="/dashboard">
            <button className="bg-transparent text-white border border-white/20 px-10 py-4 font-label-caps text-label-caps hover:bg-white/5 transition-colors duration-300">
              VIEW ORDER DETAILS
            </button>
          </Link>
        </div>
      </section>

      {/* TRACKING TIMELINE */}
      <section className="max-w-5xl mx-auto mb-32">
        <div className="glass-card p-10 md:p-16 rounded-xl">
          <h2 className="font-label-caps text-label-caps text-primary mb-12 flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">cloud_upload</span> 
            LOGISTICS TRACKING
          </h2>
          <div className="relative">
            {/* Desktop Horizontal Timeline */}
            <div className="hidden md:flex justify-between items-start relative">
              <div className="absolute top-[11px] left-0 w-full h-[2px] bg-white/10 z-0"></div>
              <div className="absolute top-[11px] left-0 w-1/4 h-[2px] track-active z-10"></div>
              
              <div className="relative z-20 flex flex-col items-center group">
                <div className="w-6 h-6 rounded-full bg-primary border-4 border-background group-hover:scale-125 transition-transform"></div>
                <p className="mt-4 font-label-caps text-[10px] text-white">ORDER PLACED</p>
                <p className="mt-1 text-[10px] text-on-surface-variant">OCT 24, 14:02</p>
              </div>
              
              <div className="relative z-20 flex flex-col items-center group">
                <div className="w-6 h-6 rounded-full bg-white/20 border-4 border-background group-hover:scale-125 transition-transform"></div>
                <p className="mt-4 font-label-caps text-[10px] text-on-surface-variant">PROCESSING</p>
                <p className="mt-1 text-[10px] text-on-surface-variant">EST. OCT 25</p>
              </div>
              
              <div className="relative z-20 flex flex-col items-center group opacity-40">
                <div className="w-6 h-6 rounded-full bg-white/10 border-4 border-background"></div>
                <p className="mt-4 font-label-caps text-[10px] text-on-surface-variant">SHIPPED</p>
              </div>
              
              <div className="relative z-20 flex flex-col items-center group opacity-40">
                <div className="w-6 h-6 rounded-full bg-white/10 border-4 border-background"></div>
                <p className="mt-4 font-label-caps text-[10px] text-on-surface-variant">OUT FOR DELIVERY</p>
              </div>
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="flex md:hidden flex-col gap-12 relative pl-8">
              <div className="absolute left-[11px] top-0 h-full w-[2px] bg-white/10"></div>
              <div className="absolute left-[11px] top-0 h-1/4 w-[2px] track-active"></div>
              
              <div className="relative">
                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-primary border-4 border-background"></div>
                <p className="font-label-caps text-label-caps text-white">ORDER PLACED</p>
                <p className="text-xs text-on-surface-variant mt-1">OCT 24, 2024 — 14:02</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white/20 border-4 border-background"></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">PROCESSING</p>
                <p className="text-xs text-on-surface-variant mt-1">Estimated OCT 25</p>
              </div>
              
              <div className="relative opacity-40">
                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white/10 border-4 border-background"></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">SHIPPED</p>
              </div>
              
              <div className="relative opacity-40">
                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white/10 border-4 border-background"></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">OUT FOR DELIVERY</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDED SECTION */}
      <section className="max-w-container-max mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-label-caps text-label-caps text-tertiary mb-2">COMPLETE THE LOOK</p>
            <h3 className="font-headline-lg-mobile md:font-headline-lg text-[24px] md:text-[40px] uppercase">YOU MIGHT ALSO NEED</h3>
          </div>
          <Link href="/showcase" className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface hover:text-tertiary transition-colors">
            EXPLORE ALL <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {/* Product 1 */}
          <div className="group relative">
            <div className="aspect-[3/4] w-full overflow-hidden mb-6 relative">
              <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Hoodie" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4z61SUvdXiuzfplyF2ljdKenPkdXwEVUoOAS9yByQ0fWtLqAOQFrLNHWrpDuR4dmx--DC0d7DCb__9MA50Kk3PX-riSGSKPCKM-Mnly-rf-Y4IaB1SkDU25GHa5yHWqkF-dlOGjljf2Pi24xsZlf_R90o0ndfzK9ar6EUik83iGSocGEFwlZfISdYyLECJz-O-pQA52PPlD7K_2fnFfNTWn3VTiKa2wiDwvPVMMm-edb_PHAWJHbz"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <button className="w-full bg-white text-black py-3 font-label-caps text-label-caps translate-y-4 group-hover:translate-y-0 transition-transform">QUICK ADD</button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-label-caps text-label-caps text-white group-hover:text-tertiary transition-colors">ONYX VANGUARD HOODIE</p>
                <p className="font-body-md text-on-surface-variant mt-1">$220.00</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white">favorite</span>
            </div>
          </div>
          
          {/* Product 2 */}
          <div className="group relative">
            <div className="aspect-[3/4] w-full overflow-hidden mb-6 relative">
              <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Sneakers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF5xZjfpe-MZqCnEBR9c-4zIiyis77pDX6Q4D1Ei8bckR7cvEtxAm3WIa7lLCs41Te3TKEF0BJQB4iK2HzBXkcQZbOvDaDk-o0csdyhqQyhMIArmD7Tl1ifmrg1sdMBTxh-P_KQGwhGWKy6n_aCtuy17EaISHoZ1qhlIcnq7rJk8v8uvmvekg3PTiPbYv_EPmY77xGhgoIBg7QDBOfTV_8AG8chB2JXn35vtw1qKZBwPYSU0Q_Db5G"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <button className="w-full bg-white text-black py-3 font-label-caps text-label-caps translate-y-4 group-hover:translate-y-0 transition-transform">QUICK ADD</button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-label-caps text-label-caps text-white group-hover:text-tertiary transition-colors">PULSE-01 STRIDER</p>
                <p className="font-body-md text-on-surface-variant mt-1">$450.00</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white">favorite</span>
            </div>
          </div>
          
          {/* Product 3 */}
          <div className="group relative">
            <div className="aspect-[3/4] w-full overflow-hidden mb-6 relative">
              <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Chain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDmHamGotPuv4Ib3FCLOTTjYOuZAa5GrENBEi5v3dZY3vQd9VGo__ml2durcUPYCmv9UYy3OlslsgIsJhie4003P2e0x6_5BelW0yUIn5ACsVcMbPEzyfLJQHI2rvBWVyEF7CMUBzJhLRLpYrCIGwrPH1fSk8q5sy2Ejbbg5L4i99QU4E-DpG4JnQ4xn7BywfGczFus7Ccm9J9lv9Hkg-UA52bn4h5oXI-INzg87JoCh0KMgUjKtxs"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <button className="w-full bg-white text-black py-3 font-label-caps text-label-caps translate-y-4 group-hover:translate-y-0 transition-transform">QUICK ADD</button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-label-caps text-label-caps text-white group-hover:text-tertiary transition-colors">OBSIDIAN FRAGMENT CHAIN</p>
                <p className="font-body-md text-on-surface-variant mt-1">$145.00</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white">favorite</span>
            </div>
          </div>
          
          {/* Product 4 */}
          <div className="group relative">
            <div className="aspect-[3/4] w-full overflow-hidden mb-6 relative">
              <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Cargo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwAJIXaqjSanOejOp6-ZpE44kx1pvfPJStsqjx17s_8NMuViwtnIjb0PQEZtGpZYe8G5QXGyn58E7fcFQCXhZcOlJsST0yExo1Kem3FVBLYizkODQXz9L84aLBoSPw6UOj2gVZ3nb5P_1owIBS6C2--K6Q6rie6yMK_9lp31WflSzS8v76RdmkxpnW8ByPVs899d5OWqnbqqVYm7XXDrad9q0gePLLRLo1L-KNDQm6XpWQBCDYYo9a"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <button className="w-full bg-white text-black py-3 font-label-caps text-label-caps translate-y-4 group-hover:translate-y-0 transition-transform">QUICK ADD</button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-label-caps text-label-caps text-white group-hover:text-tertiary transition-colors">CHROME SHIFT CARGO</p>
                <p className="font-body-md text-on-surface-variant mt-1">$280.00</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white">favorite</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
