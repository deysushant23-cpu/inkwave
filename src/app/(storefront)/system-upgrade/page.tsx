'use client';

import Link from 'next/link';

export default function SystemUpgradePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden flex-col -mt-20">
      <style dangerouslySetInnerHTML={{__html: `
        .neon-glow {
            text-shadow: 0 0 20px rgba(157, 0, 255, 0.8), 0 0 40px rgba(157, 0, 255, 0.4);
        }
        .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 400px;
            border-radius: 50%;
            border: 1px solid rgba(223, 183, 255, 0.3);
            animation: pulse 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            pointer-events: none;
        }
        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        .progress-bar {
            width: 100%;
            height: 2px;
            background: rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
            margin-bottom: 2rem;
        }
        .progress-fill {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #dfb7ff;
            width: 65%;
            box-shadow: 0 0 10px #dfb7ff;
            animation: load 10s ease-in-out infinite alternate;
        }
        @keyframes load {
            0% { width: 30%; }
            100% { width: 85%; }
        }
      `}} />
      
      <div className="pulse-ring"></div>
      <div className="pulse-ring" style={{ animationDelay: '1s' }}></div>
      <div className="pulse-ring" style={{ animationDelay: '2s' }}></div>
      
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary/20 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <span className="material-symbols-outlined text-[80px] text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>sync</span>
        </div>
        
        <h1 className="font-display-2xl text-[60px] md:text-[80px] leading-none mb-6 text-white neon-glow font-bold uppercase tracking-tighter">
          System<br/>Upgrade
        </h1>
        
        <p className="font-label-caps text-label-caps text-tertiary tracking-[0.4em] mb-12">
          VANGUARD PROTOCOL V2.4 INITIALIZING
        </p>
        
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        
        <div className="flex justify-between font-mono text-[10px] text-on-surface-variant mb-12 uppercase">
          <span>Processing Data...</span>
          <span>65% Complete</span>
        </div>
        
        <p className="font-body-md text-on-surface-variant mb-12">
          We are currently upgrading the mainframe to bring you an enhanced digital experience. 
          The collective will be back online shortly.
        </p>
        
        <Link href="/" className="px-12 py-4 border border-white/20 text-white font-label-caps text-label-caps uppercase tracking-widest hover:bg-white/5 transition-colors">
          Return to Hub
        </Link>
      </div>
      
      <div className="absolute bottom-8 text-[10px] font-mono text-on-surface-variant opacity-50">
        SYS.MAINTENANCE. {new Date().toISOString()}
      </div>
    </div>
  );
}
