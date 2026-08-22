import { createClient } from '@/lib/supabase/server';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimatedSection, AnimatedItem } from '@/components/ui/animated-section';



export default async function ArchivePage() {
  const supabase = await createClient();
  let { data: rawProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(6);

  let products = rawProducts as any[] | null;

  if (!products) {
    products = [];
  }

  const editorialProducts = products.slice(0, 3);
  const gridProducts = products.slice(3, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-[65vh] md:h-[80vh] md:min-h-[650px] w-full overflow-hidden flex items-end md:items-center -mt-20 bg-cover bg-center md:bg-fixed" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAJUhrinry6w3H7bDVQkd8jBhYBB6B9wE1QIc4EsSuTZkBSQSb4OZP_FNhg26N2SQ4yqcZb3N7_JDLcAVZhp-_7ClZYepTXy0XFuzgsHtMvJTzpuzVhC7bo4lHdmQJNPWE3v7PDsAr2ELDfWL6o8C_kZR0cVmD4sobqN1J_cL1gHhioaQLLzcJWruizeXImMi8ujrhPYHsIug1pYhWjlsA9HcsTSYGWCA8_MAYba0yGiP7_80Oekt2')" }}>
        <div className="absolute inset-0 z-0 bg-black/50"></div>
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 flex justify-between items-end pb-8 md:pb-24 pt-24">
          <AnimatedSection className="max-w-xl">
            <p className="font-label-caps text-[10px] sm:text-label-caps text-primary tracking-[0.3em] mb-2 sm:mb-4">SEASON ARCHIVE // 2024</p>
            <h1 className="font-display-2xl text-4xl sm:text-6xl md:text-[80px] leading-none uppercase mb-6 sm:mb-8 text-white">Nocturnal<br/>Pulse</h1>
            <Button size="lg" className="rounded-none font-label-caps bg-black border border-white/20 text-white hover:bg-white/10 group text-xs sm:text-sm">
              VIEW COLLECTION
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Button>
          </AnimatedSection>
          <div className="hidden md:block">
            <h2 className="font-display-2xl text-8xl opacity-20 select-none tracking-tighter text-white" style={{ writingMode: 'vertical-rl' }}>THE LOOKBOOK 04</h2>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-8 md:py-12 border-y border-white/5 bg-black overflow-hidden flex">
        <div className="flex gap-8 md:gap-12 items-center animate-pulse opacity-50 whitespace-nowrap">
          <span className="font-display-2xl text-2xl sm:text-[40px] md:text-[64px] uppercase text-white/10">STREETWEAR INSPIRATION</span>
          <span className="material-symbols-outlined text-primary text-2xl sm:text-4xl">star</span>
          <span className="font-display-2xl text-2xl sm:text-[40px] md:text-[64px] uppercase text-white">THE ARCHIVE</span>
          <span className="material-symbols-outlined text-primary text-2xl sm:text-4xl">star</span>
        </div>
      </section>

      {/* Horizontal Editorial Spreads */}
      <section className="py-16 md:py-32 overflow-hidden bg-black">
        <AnimatedSection className="px-4 sm:px-8 md:px-12 mb-8 md:mb-16 flex justify-between items-center">
          <h3 className="font-headline-lg text-2xl sm:text-3xl md:text-headline-lg uppercase italic text-white">Editorial Spreads</h3>
        </AnimatedSection>
        
        <div className="flex overflow-x-auto gap-5 sm:gap-8 px-4 sm:px-8 md:px-12 scroll-smooth pb-8 md:pb-12">
          {editorialProducts.map((product, idx) => (
            <AnimatedItem key={product.id} delay={idx * 0.1} className="flex-none w-[75vw] sm:w-[50vw] md:w-[40vw] lg:w-[32vw] group relative">
              <div className="aspect-[4/5] overflow-hidden bg-surface-container-low mb-6 rounded-lg">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale" alt={product.title} src={product.overlay_mask_url || product.images?.[0] || 'https://via.placeholder.com/800'}/>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center backdrop-blur-sm p-12 text-center pointer-events-none group-hover:pointer-events-auto rounded-lg">
                <span className="font-label-caps text-label-caps text-primary mb-4">LOOK 0{idx + 1} / ARCHIVE</span>
                <h4 className="font-headline-lg text-3xl uppercase mb-6 text-white">{product.title}</h4>
                <Link href={`/product/${product.slug}`}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black font-label-caps rounded-none">SHOP THE LOOK</Button>
                </Link>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-caps text-[10px] text-primary mb-1">0{idx + 1}. VOLUME</p>
                  <h4 className="font-headline-lg text-2xl uppercase text-white">{product.title}</h4>
                </div>
                <p className="text-on-surface-variant font-body-md text-xs max-w-[200px] text-right">
                  {product.description?.substring(0, 80)}...
                </p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </section>

      {/* Dynamic Footer CTA */}
      <AnimatedSection className="py-40 bg-white text-black flex flex-col items-center justify-center text-center px-margin-mobile">
        <h2 className="font-display-2xl text-5xl md:text-8xl uppercase mb-12 max-w-4xl tracking-tighter">Enter the Underground Ecosystem</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <Button size="lg" className="rounded-none font-label-caps bg-black text-white hover:scale-105 transition-transform flex items-center gap-4">
            JOIN THE INNER CIRCLE
            <span className="material-symbols-outlined ml-2">mail</span>
          </Button>
          <Button variant="outline" size="lg" className="rounded-none border-2 border-black text-black font-label-caps hover:bg-black hover:text-white transition-all flex items-center gap-4">
            FOLLOW @INKWAVE
            <span className="material-symbols-outlined ml-2">share</span>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  );
}
