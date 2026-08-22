'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function BrandPillarsPage() {
  useEffect(() => {
    // Parallax Effect
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxes = document.querySelectorAll('.parallax-bg');
      parallaxes.forEach(item => {
        const speed = 0.2;
        (item as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .silver-gradient-border {
            border: 1px solid transparent;
            background: linear-gradient(black, black) padding-box,
                        linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.05)) border-box;
        }
        .neon-glow-hover:hover {
            box-shadow: 0 0 20px rgba(157, 0, 255, 0.4);
            transform: scale(1.02);
            transition: all 0.3s ease;
        }
        .parallax-container {
            overflow: hidden;
            position: relative;
        }
        .parallax-bg {
            transition: transform 0.1s ease-out;
            will-change: transform;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
      `}} />

      {/* SideNavBar (Desktop Fixed Left) - Partially visible for Brand Identity */}
      <aside className="hidden lg:flex h-[calc(100vh-80px)] w-20 fixed left-0 top-20 z-[40] flex-col items-center justify-center space-y-12 bg-surface-container-lowest/95 backdrop-blur-2xl border-r border-white/5">
        <div className="rotate-[-90deg] whitespace-nowrap font-label-caps text-label-caps tracking-[0.3em] text-on-surface-variant opacity-40">EST. 2024</div>
        <div className="h-24 w-px bg-white/10"></div>
        <div className="flex flex-col space-y-8">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">info</span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">menu_book</span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">work</span>
        </div>
      </aside>

      <div className="lg:pl-20">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-margin-mobile md:px-margin-desktop relative overflow-hidden -mt-10">
          <div className="relative z-10 max-w-5xl pt-20">
            <h1 className="font-display-2xl text-[48px] md:text-display-2xl leading-none mb-8">
              THE PILLARS OF <br/>
              <span className="text-primary italic">LUXURY UNDERGROUND</span>
            </h1>
            <p className="font-body-md text-body-md text-on-secondary-container max-w-2xl mb-12">
              Inkwave is more than a brand; it's a digital-first artifact. We bridge the gap between high-fashion silhouettes and the raw energy of the global underground.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#about" 
                onClick={(e) => smoothScroll(e, 'about')}
                className="px-8 py-4 bg-black text-white border border-white/20 silver-gradient-border neon-glow-hover flex items-center gap-2 font-label-caps text-label-caps"
              >
                EXPLORE STORY <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              </a>
            </div>
          </div>
        </section>

        {/* About Section (Our Story) */}
        <section className="py-40 px-margin-mobile md:px-margin-desktop" id="about">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            <div className="lg:col-span-5 mb-12 lg:mb-0">
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8 uppercase">OUR STORY</h2>
              <div className="space-y-6 font-body-md text-body-md text-on-secondary-container leading-relaxed">
                <p>Founded in the neon-lit corridors of digital subcultures, Inkwave emerged as a response to the homogenization of luxury. We believe in the power of the glitch, the beauty of the shadow, and the precision of the stitch.</p>
                <p>Our aesthetic is a synthesis of cyber-minimalism and brutalist architecture. We strip away the unnecessary, leaving only the essential power of the form. Every garment is a statement of intent—a uniform for those who navigate the edges of the known.</p>
              </div>
            </div>
            <div className="lg:col-start-7 lg:col-span-6">
              <div className="parallax-container h-[600px] w-full rounded-xl overflow-hidden silver-gradient-border">
                <div 
                  className="parallax-bg absolute inset-0 bg-cover bg-center h-[120%]" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCL64Y7euLRnseOOZmUGLH8EOoH8HwX9A_cjMLAelLBAmn2XIf12y_7TX0EPnrEKu48FiED20WmtK6kgUSNotoRVXogncRnillaDScVSzfq59AgZMYXQsb1cEHuw2FheNLmS1TTQNUdhv8OK95kDCj899UUyAlc_zE7oQDkS4qBmkumf8HITHaT73NeXSNwSQFJxOURuxoFWNsGdI1KgHKMq3lYYsV_i7tok5oY4Q7CPbxjBMPRNmDb')"}}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Careers Section (Bento Grid) */}
        <section className="py-40 bg-surface-container-lowest/50" id="careers">
          <div className="px-margin-mobile md:px-margin-desktop mb-24 text-center">
            <h2 className="font-display-2xl text-headline-lg-mobile md:text-headline-lg mb-4">JOIN THE COHORT</h2>
            <p className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Current Openings</p>
          </div>
          
          <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Tech */}
            <div className="glass-card silver-gradient-border p-8 rounded-xl group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>code</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">01</span>
              </div>
              <h3 className="font-headline-lg text-2xl mb-4">TECH & WEB</h3>
              <p className="font-body-md text-body-md text-on-secondary-container mb-8">Building the digital architecture of the luxury underground. React, Three.js, and Shaders.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-2 text-sm opacity-70"><span className="w-1 h-1 bg-primary rounded-full"></span> Fullstack Creative Dev</li>
                <li className="flex items-center gap-2 text-sm opacity-70"><span className="w-1 h-1 bg-primary rounded-full"></span> WebGL Specialist</li>
              </ul>
              <Link href="#" className="inline-block font-label-caps text-label-caps text-primary border-b border-primary/30 pb-1 group-hover:border-primary transition-all">APPLY NOW</Link>
            </div>
            
            {/* Design */}
            <div className="glass-card silver-gradient-border p-8 rounded-xl group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>palette</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">02</span>
              </div>
              <h3 className="font-headline-lg text-2xl mb-4">CREATIVE DESIGN</h3>
              <p className="font-body-md text-body-md text-on-secondary-container mb-8">Defining the visual language of tomorrow. Textile design, 3D modeling, and branding.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-2 text-sm opacity-70"><span className="w-1 h-1 bg-primary rounded-full"></span> Senior Apparel Designer</li>
                <li className="flex items-center gap-2 text-sm opacity-70"><span className="w-1 h-1 bg-primary rounded-full"></span> Art Director</li>
              </ul>
              <Link href="#" className="inline-block font-label-caps text-label-caps text-primary border-b border-primary/30 pb-1 group-hover:border-primary transition-all">APPLY NOW</Link>
            </div>
            
            {/* Logistics */}
            <div className="glass-card silver-gradient-border p-8 rounded-xl group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>local_shipping</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">03</span>
              </div>
              <h3 className="font-headline-lg text-2xl mb-4">LOGISTICS</h3>
              <p className="font-body-md text-body-md text-on-secondary-container mb-8">Ensuring global precision in delivery and supply chain management.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-2 text-sm opacity-70"><span className="w-1 h-1 bg-primary rounded-full"></span> Global Supply Manager</li>
                <li className="flex items-center gap-2 text-sm opacity-70"><span className="w-1 h-1 bg-primary rounded-full"></span> Quality Controller</li>
              </ul>
              <Link href="#" className="inline-block font-label-caps text-label-caps text-primary border-b border-primary/30 pb-1 group-hover:border-primary transition-all">APPLY NOW</Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-40 px-margin-mobile md:px-margin-desktop relative" id="contact">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div>
                <h2 className="font-display-2xl text-[40px] md:text-headline-lg mb-8">CONTACT</h2>
                <p className="font-body-md text-body-md text-on-secondary-container mb-12 max-w-md">Reach out for collaborations, wholesale inquiries, or general questions about our mission.</p>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <div>
                      <h4 className="font-label-caps text-label-caps mb-1">HQ STUDIO</h4>
                      <p className="font-body-md text-on-surface-variant">22nd Floor, Obsidian Tower<br/>Tokyo, Shibuya Dist.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary">mail</span>
                    <div>
                      <h4 className="font-label-caps text-label-caps mb-1">GENERAL INQUIRY</h4>
                      <p className="font-body-md text-on-surface-variant">contact@inkwave.luxury</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card silver-gradient-border p-10 rounded-xl">
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                      <input className="w-full bg-transparent border-b border-white/20 py-4 font-label-caps text-label-caps focus:outline-none focus:border-primary transition-all placeholder:text-white/20" placeholder="NAME" type="text"/>
                    </div>
                    <div className="relative group">
                      <input className="w-full bg-transparent border-b border-white/20 py-4 font-label-caps text-label-caps focus:outline-none focus:border-primary transition-all placeholder:text-white/20" placeholder="EMAIL" type="email"/>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <select className="w-full bg-transparent border-b border-white/20 py-4 font-label-caps text-label-caps focus:outline-none focus:border-primary transition-all text-on-surface appearance-none">
                      <option className="bg-black">SUBJECT</option>
                      <option className="bg-black">COLLABORATION</option>
                      <option className="bg-black">PRESS</option>
                      <option className="bg-black">RETAIL</option>
                    </select>
                  </div>
                  
                  <div className="relative group">
                    <textarea className="w-full bg-transparent border-b border-white/20 py-4 font-label-caps text-label-caps focus:outline-none focus:border-primary transition-all placeholder:text-white/20 resize-none" placeholder="MESSAGE" rows={4}></textarea>
                  </div>
                  
                  <button className="w-full py-5 bg-white text-black font-label-caps text-label-caps tracking-widest neon-glow-hover hover:bg-white/90 transition-all" type="submit">
                    SEND TRANSMISSION
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
