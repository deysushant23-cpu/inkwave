'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Save, Loader2, Type, LayoutTemplate, Film, Image as ImageIcon, 
  Sparkles, Sliders, Eye, SunMedium, Layers, ArrowUpRight, Tag 
} from 'lucide-react';
import { toast } from 'sonner';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminHomepageConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Hero State
  const [heroEyebrow, setHeroEyebrow] = useState('SS26 — Vol. 01 — Small Batch');
  const [heroTitle1, setHeroTitle1] = useState('Drip that');
  const [heroTitle2, setHeroTitle2] = useState('Matches You');
  const [heroLede, setHeroLede] = useState('Premium readymade apparel. Designed for everyday comfort and effortless style.');
  const [catalogEyebrow, setCatalogEyebrow] = useState('Catalog Directory');
  const [catalogTitle, setCatalogTitle] = useState('All Garments');
  const [catalogLede, setCatalogLede] = useState('Premium menswear silhouette database. Grouped by category, dyed in small vats. Built to hold shape.');
  
  // Switcher State
  const [switcherTitle, setSwitcherTitle] = useState('Switch to Immersive Home');
  const [switcherSubtitle, setSwitcherSubtitle] = useState('featuring shoppable reels & active offers');
  const [switcherLede, setSwitcherLede] = useState('Step into the Inkwave Universe. Watch shoppable Reels & TikToks, check curated seasonal fits, and grab active sales/offers on our immersive home page.');
  const [switcherButtonText, setSwitcherButtonText] = useState('Explore Immersive Store');
  const [switcherButtonLink, setSwitcherButtonLink] = useState('/collections');
  const [switcherMediaUrl, setSwitcherMediaUrl] = useState('/new.mp4');
  
  // Carousel State
  const [carouselShow, setCarouselShow] = useState<boolean>(true);
  const [carouselHideText, setCarouselHideText] = useState<boolean>(false);
  const [carouselSlides, setCarouselSlides] = useState<{
    id: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    title: string;
    subtitle: string;
    btnText: string;
    btnLink: string;
  }[]>([]);
  
  // Cinematic Media & Atmosphere State
  const [heroMediaType, setHeroMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [heroMediaUrl, setHeroMediaUrl] = useState('');
  const [heroMediaPoster, setHeroMediaPoster] = useState('');
  const [heroMediaDarkness, setHeroMediaDarkness] = useState<number>(45);
  const [heroMediaVignette, setHeroMediaVignette] = useState<boolean>(true);
  const [heroMediaBlur, setHeroMediaBlur] = useState<number>(0);
  const [heroMediaKenBurns, setHeroMediaKenBurns] = useState<boolean>(true);
  const [heroCtaPrimaryText, setHeroCtaPrimaryText] = useState('Shop New Drops');
  const [heroCtaPrimaryLink, setHeroCtaPrimaryLink] = useState('#new');
  const [heroCtaSecondaryText, setHeroCtaSecondaryText] = useState('View Lookbook');
  const [heroCtaSecondaryLink, setHeroCtaSecondaryLink] = useState('#lookbook');

  // Marquee State
  const [marqueeItems, setMarqueeItems] = useState<{text: string, link: string}[]>([]);
  const [newMarquee, setNewMarquee] = useState('');
  const [newMarqueeLink, setNewMarqueeLink] = useState('');
  const [giantMarqueeText, setGiantMarqueeText] = useState('INKWAVE // VOL 04 // NO TWO VATS RUN IDENTICAL //');
  const [giantMarqueeLink, setGiantMarqueeLink] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', 'homepage_config')
      .single();

    if (data?.json_content) {
      const j = data.json_content;
      if (j.heroEyebrow) setHeroEyebrow(j.heroEyebrow);
      if (j.heroTitle1) setHeroTitle1(j.heroTitle1);
      if (j.heroTitle2) setHeroTitle2(j.heroTitle2);
      if (j.heroLede) setHeroLede(j.heroLede);
      if (j.heroMediaType) setHeroMediaType(j.heroMediaType);
      if (j.heroMediaUrl) setHeroMediaUrl(j.heroMediaUrl);
      if (j.heroMediaPoster) setHeroMediaPoster(j.heroMediaPoster);
      if (typeof j.heroMediaDarkness === 'number') setHeroMediaDarkness(j.heroMediaDarkness);
      if (typeof j.heroMediaVignette === 'boolean') setHeroMediaVignette(j.heroMediaVignette);
      if (typeof j.heroMediaBlur === 'number') setHeroMediaBlur(j.heroMediaBlur);
      if (typeof j.heroMediaKenBurns === 'boolean') setHeroMediaKenBurns(j.heroMediaKenBurns);
      if (j.heroCtaPrimaryText) setHeroCtaPrimaryText(j.heroCtaPrimaryText);
      if (j.heroCtaPrimaryLink) setHeroCtaPrimaryLink(j.heroCtaPrimaryLink);
      if (j.heroCtaSecondaryText) setHeroCtaSecondaryText(j.heroCtaSecondaryText);
      if (j.heroCtaSecondaryLink) setHeroCtaSecondaryLink(j.heroCtaSecondaryLink);
      if (j.giantMarqueeText) setGiantMarqueeText(j.giantMarqueeText);
      if (j.giantMarqueeLink) setGiantMarqueeLink(j.giantMarqueeLink);

      if (j.catalogEyebrow) setCatalogEyebrow(j.catalogEyebrow);
      if (j.catalogTitle) setCatalogTitle(j.catalogTitle);
      if (j.catalogLede) setCatalogLede(j.catalogLede);

      if (j.switcherTitle) setSwitcherTitle(j.switcherTitle);
      if (j.switcherSubtitle) setSwitcherSubtitle(j.switcherSubtitle);
      if (j.switcherLede) setSwitcherLede(j.switcherLede);
      if (j.switcherButtonText) setSwitcherButtonText(j.switcherButtonText);
      if (j.switcherButtonLink) setSwitcherButtonLink(j.switcherButtonLink);
      if (j.switcherMediaUrl) setSwitcherMediaUrl(j.switcherMediaUrl);

      if (typeof j.carouselShow === 'boolean') setCarouselShow(j.carouselShow);
      else setCarouselShow(true);

      if (typeof j.carouselHideText === 'boolean') setCarouselHideText(j.carouselHideText);
      else setCarouselHideText(false);

      if (j.carouselSlides) {
        setCarouselSlides(j.carouselSlides);
      } else {
        setCarouselSlides([
          {
            id: 'slide-1',
            mediaType: 'video',
            mediaUrl: '/new.mp4',
            title: 'ALL GARMENTS',
            subtitle: 'Catalog Directory',
            btnText: 'Shop Hoodies',
            btnLink: '/category/hoodies'
          }
        ]);
      }

      if (j.marqueeItems) {
        setMarqueeItems(j.marqueeItems.map((item: any) => typeof item === 'string' ? { text: item, link: '' } : item));
      }
    } else {
      setMarqueeItems([
        { text: "New drop — Vol. 04", link: "" },
        { text: "Free shipping over ₹2000", link: "" },
        { text: "Small batch, never restocked", link: "" },
        { text: "Dyed in small vats", link: "" }
      ]);
      setCatalogEyebrow('Catalog Directory');
      setCatalogTitle('All Garments');
      setCatalogLede('Premium menswear silhouette database. Grouped by category, dyed in small vats. Built to hold shape.');
      setSwitcherTitle('Switch to Immersive Home');
      setSwitcherSubtitle('featuring shoppable reels & active offers');
      setSwitcherLede('Step into the Inkwave Universe. Watch shoppable Reels & TikToks, check curated seasonal fits, and grab active sales/offers on our immersive home page.');
      setSwitcherButtonText('Explore Immersive Store');
      setSwitcherButtonLink('/collections');
      setSwitcherMediaUrl('/new.mp4');
      setCarouselShow(true);
      setCarouselHideText(false);
      setCarouselSlides([
        {
          id: 'slide-1',
          mediaType: 'video',
          mediaUrl: '/new.mp4',
          title: 'ALL GARMENTS',
          subtitle: 'Catalog Directory',
          btnText: 'Shop Hoodies',
          btnLink: '/category/hoodies'
        }
      ]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const payload = {
      heroEyebrow,
      heroTitle1,
      heroTitle2,
      heroLede,
      heroMediaType,
      heroMediaUrl,
      heroMediaPoster,
      heroMediaDarkness,
      heroMediaVignette,
      heroMediaBlur,
      heroMediaKenBurns,
      heroCtaPrimaryText,
      heroCtaPrimaryLink,
      heroCtaSecondaryText,
      heroCtaSecondaryLink,
      marqueeItems,
      giantMarqueeText,
      giantMarqueeLink,
      catalogEyebrow,
      catalogTitle,
      catalogLede,
      switcherTitle,
      switcherSubtitle,
      switcherLede,
      switcherButtonText,
      switcherButtonLink,
      switcherMediaUrl,
      carouselShow,
      carouselHideText,
      carouselSlides
    };

    const { data: existing } = await (supabase.from('cms_sections') as any)
      .select('id')
      .eq('section_key', 'homepage_config')
      .single();

    let error;
    if (existing) {
      const res = await (supabase.from('cms_sections') as any).update({ json_content: payload }).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await (supabase.from('cms_sections') as any).insert([{ section_key: 'homepage_config', json_content: payload, is_published: true }]);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save homepage config: ' + error.message);
    } else {
      toast.success('Cinematic Hero & Homepage updated live!');
    }
  };

  const addMarqueeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarquee.trim()) return;
    setMarqueeItems([...marqueeItems, { text: newMarquee.trim(), link: newMarqueeLink.trim() }]);
    setNewMarquee('');
    setNewMarqueeLink('');
  };

  const removeMarqueeItem = (index: number) => {
    setMarqueeItems(marqueeItems.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading configuration...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header with Save */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Film className="w-6 h-6 text-[var(--accent)]" /> New Home Banner Manage
          </h1>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Manage sliding carousel banners, image/video slides, typography overlays, and CTA button destinations for the storefront catalog home page.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--accent)] text-[var(--bg)] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Live Mini Hero Preview */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-widest flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Live Storefront Viewport Preview (Cinematic 21:9 Aspect)
          </span>
          <span className="text-[10px] font-mono text-[var(--text-dim)]">
            Mode: {carouselShow ? 'SLIDING CAROUSEL' : heroMediaType.toUpperCase()} • Slides/Media: {carouselShow ? carouselSlides.length : (heroMediaType !== 'none' ? 1 : 0)}
          </span>
        </div>

        <div className="relative w-full aspect-[21/9] min-h-[200px] max-h-[340px] rounded-xl overflow-hidden border border-[var(--line)] bg-[#0a0a0c] flex items-center p-6 md:p-10 select-none">
          {carouselShow && carouselSlides && carouselSlides.length > 0 ? (
            // Carousel Active Slide Preview
            <>
              {carouselSlides[0].mediaType === 'video' && carouselSlides[0].mediaUrl ? (
                <video 
                  src={carouselSlides[0].mediaUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : carouselSlides[0].mediaUrl ? (
                <img 
                  src={carouselSlides[0].mediaUrl} 
                  alt="Slide Preview" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-48 h-48 rounded-full bg-[var(--accent)]/30 blur-2xl animate-pulse" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/45 z-[1]" />

              <div className="relative z-10 w-full text-left space-y-2">
                {!carouselHideText && (carouselSlides[0].title || carouselSlides[0].subtitle || carouselSlides[0].btnText) ? (
                  <>
                    {carouselSlides[0].subtitle && carouselSlides[0].subtitle.trim() && (
                      <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--accent)] mb-1 bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20 inline-block font-bold">
                        {carouselSlides[0].subtitle}
                      </span>
                    )}
                    {carouselSlides[0].title && carouselSlides[0].title.trim() && (
                      <h2 className="font-display text-lg sm:text-2xl font-black uppercase text-white tracking-tight leading-none mb-3">
                        {carouselSlides[0].title}
                      </h2>
                    )}
                    {carouselSlides[0].btnText && carouselSlides[0].btnText.trim() && (
                      <span className="bg-white text-black px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider inline-block">
                        {carouselSlides[0].btnText}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded border border-white/10 uppercase tracking-widest inline-block font-bold">
                    Text Overlays Hidden
                  </span>
                )}
              </div>
            </>
          ) : (
            // Cinematic Background Preview
            <>
              {heroMediaType === 'video' && heroMediaUrl ? (
                <video 
                  src={heroMediaUrl} 
                  poster={heroMediaPoster || undefined} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover" 
                  style={{ filter: heroMediaBlur > 0 ? `blur(${heroMediaBlur}px)` : 'none' }}
                />
              ) : heroMediaType === 'image' && heroMediaUrl ? (
                <img 
                  src={heroMediaUrl} 
                  alt="Preview" 
                  className={`absolute inset-0 w-full h-full object-cover ${heroMediaKenBurns ? 'animate-hero-ken-burns' : ''}`}
                  style={{ filter: heroMediaBlur > 0 ? `blur(${heroMediaBlur}px)` : 'none' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-48 h-48 rounded-full bg-[var(--accent)]/30 blur-2xl animate-pulse" />
                  <div className="w-36 h-36 rounded-full bg-[var(--wave)]/30 blur-2xl ml-[-40px]" />
                </div>
              )}

              {heroMediaType !== 'none' && heroMediaUrl && (
                <>
                  <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.7) 50%, rgba(8,8,10,0.3) 100%)' }} />
                  <div className="absolute inset-0 z-[1]" style={{ backgroundColor: `rgba(0, 0, 0, ${heroMediaDarkness / 100})` }} />
                  {heroMediaVignette && (
                    <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)' }} />
                  )}
                </>
              )}

              <div className="relative z-10 max-w-xl space-y-2">
                <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase text-[var(--accent)] font-bold">
                  {heroEyebrow || 'SS26 — VOL. 01 — SMALL BATCH'}
                </span>
                <h2 className="font-display text-xl md:text-3xl font-bold uppercase text-white leading-tight">
                  {heroTitle1} <span className="stroke">{heroTitle2}</span>
                </h2>
                <p className="text-[10px] md:text-xs text-white/70 line-clamp-2 max-w-md">
                  {heroLede}
                </p>
                <div className="flex gap-2 pt-2">
                  <span className="bg-[var(--accent)] text-[var(--bg)] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    {heroCtaPrimaryText}
                  </span>
                  <span className="border border-white/30 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    {heroCtaSecondaryText}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 0: Top Hero Carousel Configuration */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text)] uppercase">Top Hero Carousel Setting</h2>
              <p className="text-[10px] text-[var(--text-dim)]">Configure a big, responsive video/image slider at the top of your homepage.</p>
            </div>
          </div>
        </div>

        {/* Global Carousel Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl cursor-pointer hover:border-[var(--accent)]/30 transition-all">
            <input 
              type="checkbox" 
              checked={carouselShow} 
              onChange={e => setCarouselShow(e.target.checked)} 
              className="accent-[var(--accent)] w-5 h-5" 
            />
            <div>
              <span className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">Enable Top Hero Carousel</span>
              <span className="block text-[10px] text-[var(--text-dim)]">Replaces static All Garments title with a large media slider</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl cursor-pointer hover:border-[var(--accent)]/30 transition-all">
            <input 
              type="checkbox" 
              checked={carouselHideText} 
              onChange={e => setCarouselHideText(e.target.checked)} 
              className="accent-[var(--accent)] w-5 h-5" 
            />
            <div>
              <span className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">Hide Text Overlay</span>
              <span className="block text-[10px] text-[var(--text-dim)]">Removes titles and buttons; displays pure media only</span>
            </div>
          </label>
        </div>

        {carouselShow && (
          <div className="space-y-6 pt-4 border-t border-[var(--line)]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-widest">
                Slides ({carouselSlides.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setCarouselSlides([
                    ...carouselSlides,
                    {
                      id: `slide-${Date.now()}`,
                      mediaType: 'image',
                      mediaUrl: '',
                      title: 'NEW DROP',
                      subtitle: 'Collection',
                      btnText: 'Shop Now',
                      btnLink: '/catalog'
                    }
                  ]);
                }}
                className="bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--text)] text-[var(--text)] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                + Add Slide
              </button>
            </div>

            {carouselSlides.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--text-dim)] border border-dashed border-[var(--line)] rounded-xl">
                No slides added. Please click "+ Add Slide" to create your first hero banner.
              </div>
            ) : (
              <div className="space-y-4">
                {carouselSlides.map((slide, idx) => (
                  <div key={slide.id} className="border border-[var(--line)] bg-[var(--bg-alt)]/40 p-4 rounded-xl space-y-4 relative">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center border-b border-[var(--line)] pb-2 text-[10px] font-mono text-[var(--text-dim)]">
                      <span>SLIDE #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...carouselSlides];
                              const temp = list[idx];
                              list[idx] = list[idx - 1];
                              list[idx - 1] = temp;
                              setCarouselSlides(list);
                            }}
                            className="hover:text-[var(--text)]"
                          >
                            ▲ Move Up
                          </button>
                        )}
                        {idx < carouselSlides.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...carouselSlides];
                              const temp = list[idx];
                              list[idx] = list[idx + 1];
                              list[idx + 1] = temp;
                              setCarouselSlides(list);
                            }}
                            className="hover:text-[var(--text)]"
                          >
                            ▼ Move Down
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setCarouselSlides(carouselSlides.filter(s => s.id !== slide.id));
                          }}
                          className="text-red-400 hover:text-red-300 font-bold ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Media Source & Type */}
                      <div className="space-y-3 md:col-span-1">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Media Type</label>
                          <select
                            value={slide.mediaType}
                            onChange={e => {
                              const list = [...carouselSlides];
                              list[idx].mediaType = e.target.value as 'image' | 'video';
                              setCarouselSlides(list);
                            }}
                            className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-lg p-2 text-xs font-bold text-[var(--text)] cursor-pointer outline-none"
                          >
                            <option value="image">Still Image</option>
                            <option value="video">Looping Video</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Media Upload</label>
                          <MediaUploader 
                            onUploadSuccess={(url) => {
                              const list = [...carouselSlides];
                              list[idx].mediaUrl = url;
                              setCarouselSlides(list);
                            }} 
                            label={slide.mediaType === 'video' ? "Upload Video" : "Upload Image"} 
                          />
                        </div>
                      </div>

                      {/* Title & Copy */}
                      <div className="space-y-3 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Slide Title / Eyebrow</label>
                            <input 
                              type="text" 
                              value={slide.subtitle} 
                              disabled={carouselHideText}
                              onChange={e => {
                                const list = [...carouselSlides];
                                list[idx].subtitle = e.target.value;
                                setCarouselSlides(list);
                              }} 
                              placeholder="e.g. Catalog Directory" 
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-lg p-2 text-xs text-[var(--text)] outline-none animate-fade-in" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Main Heading</label>
                            <input 
                              type="text" 
                              value={slide.title} 
                              disabled={carouselHideText}
                              onChange={e => {
                                const list = [...carouselSlides];
                                list[idx].title = e.target.value;
                                setCarouselSlides(list);
                              }} 
                              placeholder="e.g. ALL GARMENTS" 
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-lg p-2 text-xs text-[var(--text)] outline-none animate-fade-in" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Button Text</label>
                            <input 
                              type="text" 
                              value={slide.btnText} 
                              disabled={carouselHideText}
                              onChange={e => {
                                const list = [...carouselSlides];
                                list[idx].btnText = e.target.value;
                                setCarouselSlides(list);
                              }} 
                              placeholder="e.g. Shop Now" 
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-lg p-2 text-xs text-[var(--text)] outline-none animate-fade-in" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Redirect URL</label>
                            <input 
                              type="text" 
                              value={slide.btnLink} 
                              onChange={e => {
                                const list = [...carouselSlides];
                                list[idx].btnLink = e.target.value;
                                setCarouselSlides(list);
                              }} 
                              placeholder="e.g. /category/hoodies" 
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-lg p-2 text-xs text-[var(--text)] outline-none animate-fade-in" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Direct Media URL (fallback / paste)</label>
                          <input 
                            type="text" 
                            value={slide.mediaUrl} 
                            onChange={e => {
                              const list = [...carouselSlides];
                              list[idx].mediaUrl = e.target.value;
                              setCarouselSlides(list);
                            }} 
                            placeholder="https://cloudinary.com/..." 
                            className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-lg p-2 text-xs font-mono text-[var(--text)] outline-none animate-fade-in" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Display Priority Shortcut Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-sm font-bold text-[var(--text)] uppercase flex items-center gap-2">
            <Tag className="w-4 h-4 text-[var(--accent)]" /> Category Display Priority Settings
          </h2>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Choose which category product sections (Jeans, T-Shirts, Hoodies, etc.) display first on the storefront homepage catalog directory.
          </p>
        </div>
        <Link 
          href="/admin/categories"
          className="bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--text)] text-[var(--text)] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          Manage Category Order →
        </Link>
      </div>
    </div>
  );
}
