'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Loader2, Image as ImageIcon, Video, Plus, Trash2, 
  Link as LinkIcon, Type, LayoutTemplate, Sparkles, Columns3, 
  LayoutGrid, Tag, Check, ArrowUpRight, Search, Palette,
  Film, Eye, Sliders, Play, SunMedium, ZoomIn, Layers,
  RotateCw, ToggleLeft, ToggleRight, SlidersHorizontal, CheckCircle2,
  ArrowUp, ArrowDown, ShoppingBag, Package, ExternalLink, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import MediaUploader from '@/components/admin/MediaUploader';
import { saveCmsSectionAction } from '@/app/actions/cms';

/* ── Interfaces ─────────────────────────────────────────────────────────── */
interface FitItem {
  name: string;
  price: number;
  slug: string;
  type: string;
}

interface CuratedFit {
  id: string;
  title: string;
  image: string;
  images?: string[];
  items: FitItem[];
}

interface CategoryCardProps {
  title: string;
  tag: string;
  bgImage: string;
  link: string;
  className?: string;
  large?: boolean;
}

interface OfferProps {
  title: string;
  subtitle: string;
  discount: string;
  bgImage: string;
  link: string;
  accent: string;
  endTime?: string;
}

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

type BannerConfig = {
  url: string;
  type: 'image' | 'video';
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
};

export interface ShowcaseProductItem {
  slug: string;
  badge?: string;
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.includes('/video/upload/');
};

export default function StorefrontManageClient({ initialProducts, initialCategories, initialSections }: { initialProducts: any[], initialCategories: any[], initialSections: any[] }) {
  const [activeTab, setActiveTab] = useState<'hero' | 'fits' | 'banners' | 'grid' | 'offers' | 'footer' | 'print' | 'theme' | 'newdrops' | 'bestsellers' | 'reels' | 'showcase' | 'sliding-marquee'>('hero');
  const [loading, setLoading] = useState(false);
  const [savingTab, setSavingTab] = useState(false);

  // Showcase Page & Products State
  const [showcaseMode, setShowcaseMode] = useState<'custom' | 'all'>('custom');
  const [showcaseHeadline, setShowcaseHeadline] = useState('FEATURED PIECES');
  const [showcaseEyebrow, setShowcaseEyebrow] = useState('VANGUARD SERIES');
  const [showcaseSubtitle, setShowcaseSubtitle] = useState('EXPLORE THE LATEST DROPS FROM OUR VANGUARD COLLECTION. ENGINEERED FOR THE NEW ERA.');
  const [showcaseCtaText, setShowcaseCtaText] = useState('VIEW ALL COLLECTIONS');
  const [showcaseCtaLink, setShowcaseCtaLink] = useState('/collections');
  const [showcaseSelectedProducts, setShowcaseSelectedProducts] = useState<ShowcaseProductItem[]>([]);
  const [showcaseProductSearch, setShowcaseProductSearch] = useState('');
  const [showcaseCategoryFilter, setShowcaseCategoryFilter] = useState('all');
  const [showcaseImages, setShowcaseImages] = useState<string[]>(['', '', '', '']);

  // Database products & categories for helper dropdowns
  const [dbProducts, setDbProducts] = useState<any[]>(initialProducts);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>(initialCategories);

  // ── Tab 11: Sliding Marquee Ribbon State
  const [marqueeEnabled, setMarqueeEnabled] = useState<boolean>(true);
  const [marqueeTags, setMarqueeTags] = useState<string[]>([
    "OVERSIZED", "BAGGY", "SLIM", "DISTRESSED", "WASHED", "RAW",
    "HEAVYWEIGHT", "BOXY", "CROPPED", "VINTAGE FIT"
  ]);
  const [newMarqueeTag, setNewMarqueeTag] = useState('');
  const [marqueeTheme, setMarqueeTheme] = useState<'midnight' | 'crimson' | 'cyberpunk' | 'mono' | 'gold' | 'custom'>('midnight');
  const [marqueeBgColor, setMarqueeBgColor] = useState('#08080a');
  const [marqueeTextColor, setMarqueeTextColor] = useState('#8f9099');
  const [marqueeAccentColor, setMarqueeAccentColor] = useState('#00f2fe');
  const [marqueeBorderColor, setMarqueeBorderColor] = useState('rgba(255, 255, 255, 0.08)');
  const [marqueeSpeed, setMarqueeSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [marqueeDirection, setMarqueeDirection] = useState<'left' | 'right'>('left');
  const [marqueeBadgeStyle, setMarqueeBadgeStyle] = useState<'brackets' | 'minimal' | 'pills' | 'outline'>('brackets');

  // ── Tab 1: Hero & Marquee State
  const [heroEyebrow, setHeroEyebrow] = useState('SS26 — Vol. 01 — Small Batch');
  const [heroTitle1, setHeroTitle1] = useState('Drip that');
  const [heroTitle2, setHeroTitle2] = useState('Matches You');
  const [heroLede, setHeroLede] = useState('Premium readymade apparel. Designed for everyday comfort and effortless style.');
  const [catalogEyebrow, setCatalogEyebrow] = useState('Catalog Directory');
  const [catalogTitle, setCatalogTitle] = useState('All Garments');
  const [catalogLede, setCatalogLede] = useState('Premium menswear silhouette database. Grouped by category, dyed in small vats. Built to hold shape.');
  
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

  const [marqueeItems, setMarqueeItems] = useState<{text: string, link: string}[]>([
    { text: "New drop — Vol. 04", link: "" },
    { text: "Free shipping over ₹2000", link: "" },
    { text: "Small batch, never restocked", link: "" },
    { text: "Dyed in small vats", link: "" }
  ]);
  const [newMarquee, setNewMarquee] = useState('');
  const [newMarqueeLink, setNewMarqueeLink] = useState('');
  
  const [giantMarqueeText, setGiantMarqueeText] = useState('INKWAVE // VOL 04 // NO TWO VATS RUN IDENTICAL //');
  const [giantMarqueeLink, setGiantMarqueeLink] = useState('');

  // ── Tab 2: Curated Fits (Shop the Look) State
  const [fits, setFits] = useState<CuratedFit[]>([
    {
      id: 'fit-01',
      title: 'NIGHT CRAWLER',
      image: '',
      images: [
        'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop'
      ],
      items: [
        { name: 'Fathom Overshirt', price: 8900, slug: 'fathom-overshirt', type: 'SHIRT' },
        { name: 'Riptide Tee', price: 2400, slug: 'riptide-tee', type: 'T-SHIRT' },
        { name: 'Slate Selvedge Denim', price: 6500, slug: 'slate-selvedge-denim', type: 'JEANS' }
      ]
    },
    {
      id: 'fit-02',
      title: 'URBAN NOMAD',
      image: '',
      images: [
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'
      ],
      items: [
        { name: 'Monsoon Cargo Jeans', price: 7200, slug: 'monsoon-cargo-jeans', type: 'JEANS' },
        { name: 'Static Crew Tee', price: 5400, slug: 'static-crew-tee', type: 'T-SHIRT' }
      ]
    }
  ]);
  const [showFits, setShowFits] = useState(true);


  // ── Tab 3: Category Hero Banners State
  const [banners, setBanners] = useState<Record<string, BannerConfig>>({});
  const [savingBannerSlug, setSavingBannerSlug] = useState<Record<string, boolean>>({});
  const [successBannerSlug, setSuccessBannerSlug] = useState<Record<string, boolean>>({});

  // ── Tab 4: Categories Grid State
  const [gridCategories, setGridCategories] = useState<CategoryCardProps[]>([
    {
      title: 'T-Shirts',
      tag: 'Shop Now',
      bgImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop',
      link: '/category/t-shirts',
    },
    {
      title: 'Shirts',
      tag: 'Explore',
      bgImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1600&auto=format&fit=crop',
      link: '/category/shirts',
    },
    {
      title: 'Jeans',
      tag: 'View Fits',
      bgImage: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1600&auto=format&fit=crop',
      link: '/category/jeans',
    },
    {
      title: 'Hoodies',
      tag: 'Drop Now',
      bgImage: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=1600&auto=format&fit=crop',
      link: '/category/hoodies',
    },
  ]);

  // ── Tab 5: Offers State
  const [offers, setOffers] = useState<OfferProps[]>([
    {
      title: 'Monsoon Drop',
      subtitle: 'Limited Time Event',
      discount: '20% OFF',
      bgImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1600&auto=format&fit=crop',
      link: '/category/t-shirts',
      accent: 'var(--accent)',
    },
    {
      title: 'Archive Sale',
      subtitle: 'Last Units Remaining',
      discount: 'EXTRA 15%',
      bgImage: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1600&auto=format&fit=crop',
      link: '/category/jeans',
      accent: 'var(--wave)',
    },
  ]);


  // ── Tab 6: Footer Config State
  const [footerCols, setFooterCols] = useState<FooterColumn[]>([]);

  // ── Tab 7: Custom Print Studio Config State
  const [printColors, setPrintColors] = useState<any[]>([]);

  // ── Tab 8: Dynamic Theme Colors Config State
  const [themePreset, setThemePreset] = useState('ink');
  const [themeAccent, setThemeAccent] = useState('#C9A227');
  const [themeBg, setThemeBg] = useState('#0B0B0D');
  const [themeBgAlt, setThemeBgAlt] = useState('#131316');
  const [themeBgCard, setThemeBgCard] = useState('#17171B');
  const [themeText, setThemeText] = useState('#EDEAE8');
  const [themeTextDim, setThemeTextDim] = useState('#8E8B85');
  const [themeLine, setThemeLine] = useState('rgba(237,234,232,0.12)');

  // ── Tab 9: New Drops State
  const [newDrops, setNewDrops] = useState<string[]>([]);

  // ── Tab Bestsellers State
  const [bestsellers, setBestsellers] = useState<string[]>([]);

  // ── Tab 10: Reels State
  const [reels, setReels] = useState<any[]>([]);



  /* ── Load Data ────────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const sectionMap = new Map();
      initialSections.forEach((s: any) => sectionMap.set(s.section_key, s.json_content));

      // 2. Process Homepage Config
      const homeData = sectionMap.get('homepage_config');
      if (homeData) {
        const j = homeData;
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
        if (j.marqueeItems) setMarqueeItems(j.marqueeItems.map((item: any) => typeof item === 'string' ? { text: item, link: '' } : item));
        if (j.giantMarqueeText) setGiantMarqueeText(j.giantMarqueeText);
        if (j.giantMarqueeLink) setGiantMarqueeLink(j.giantMarqueeLink);
        if (j.catalogEyebrow) setCatalogEyebrow(j.catalogEyebrow);
        if (j.catalogTitle) setCatalogTitle(j.catalogTitle);
        if (j.catalogLede) setCatalogLede(j.catalogLede);
      } else {
        setHeroEyebrow('SS26 — Vol. 01 — Small Batch');
        setHeroTitle1('Drip that');
        setHeroTitle2('Matches You');
        setHeroLede('Premium readymade apparel. Designed for everyday comfort and effortless style.');
        setMarqueeItems([{ text: "New drop — Vol. 04", link: "" }, { text: "Free shipping over ₹2000", link: "" }, { text: "Premium quality, always in style", link: "" }, { text: "Designed for effortless comfort", link: "" }]);
        setCatalogEyebrow('Catalog Directory');
        setCatalogTitle('All Garments');
        setCatalogLede('Premium menswear silhouette database. Grouped by category, dyed in small vats. Built to hold shape.');
      }

      // 3. Process Curated Fits (Shop the Look)
      const fitsData = sectionMap.get('curated_fits_config');
      if (fitsData) {
        if (fitsData.fits && fitsData.fits.length > 0) {
          const sanitized = fitsData.fits.map((f: any) => ({
            ...f,
            images: f.images || (f.image ? [f.image] : [])
          }));
          setFits(sanitized);
        }
        if (typeof fitsData.show === 'boolean') {
          setShowFits(fitsData.show);
        }
      } else {
        setFits([
          {
            id: 'fit-01',
            title: 'NIGHT CRAWLER',
            image: '',
            images: [
              'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop'
            ],
            items: [
              { name: 'Fathom Overshirt', price: 8900, slug: 'fathom-overshirt', type: 'SHIRT' },
              { name: 'Riptide Tee', price: 2400, slug: 'riptide-tee', type: 'T-SHIRT' },
              { name: 'Slate Selvedge Denim', price: 6500, slug: 'slate-selvedge-denim', type: 'JEANS' }
            ]
          },
          {
            id: 'fit-02',
            title: 'URBAN NOMAD',
            image: '',
            images: [
              'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'
            ],
            items: [
              { name: 'Monsoon Cargo Jeans', price: 7200, slug: 'monsoon-cargo-jeans', type: 'JEANS' },
              { name: 'Static Crew Tee', price: 5400, slug: 'static-crew-tee', type: 'T-SHIRT' }
            ]
          }
        ]);
      }

      // 4. Process Category Banners
      const cmsBanners = initialSections.filter((s: any) => s.section_key.startsWith('category_banner_'));
      if (cmsBanners && cmsBanners.length > 0) {
        const bannerMap: Record<string, BannerConfig> = {};
        cmsBanners.forEach((section: any) => {
          const slug = section.section_key.replace('category_banner_', '');
          bannerMap[slug] = section.json_content as BannerConfig;
        });
        setBanners(bannerMap);
      }

      // 5. Process Categories Grid
      const gridData = sectionMap.get('categories_config');
      if (gridData?.categories) {
        setGridCategories(gridData.categories);
      } else {
        setGridCategories([
          {
            title: 'T-Shirts',
            tag: 'Shop Now',
            bgImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop',
            link: '/category/t-shirts',
          },
          {
            title: 'Shirts',
            tag: 'Explore',
            bgImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1600&auto=format&fit=crop',
            link: '/category/shirts',
          },
          {
            title: 'Jeans',
            tag: 'View Fits',
            bgImage: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1600&auto=format&fit=crop',
            link: '/category/jeans',
          },
          {
            title: 'Hoodies',
            tag: 'Drop Now',
            bgImage: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=1600&auto=format&fit=crop',
            link: '/category/hoodies',
          },
        ]);
      }

      // 6. Process Offers
      const offersData = sectionMap.get('offers_config');
      if (offersData?.offers) {
        setOffers(offersData.offers);
      } else {
        setOffers([
          {
            title: 'Monsoon Drop',
            subtitle: 'Limited Time Event',
            discount: '20% OFF',
            bgImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1600&auto=format&fit=crop',
            link: '/category/t-shirts',
            accent: 'var(--accent)',
          },
          {
            title: 'Archive Sale',
            subtitle: 'Last Units Remaining',
            discount: 'EXTRA 15%',
            bgImage: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1600&auto=format&fit=crop',
            link: '/category/jeans',
            accent: 'var(--wave)',
          },
        ]);
      }

      // 7. Process Footer Config
      const footerData = sectionMap.get('footer_config');
      if (footerData?.columns) {
        setFooterCols(footerData.columns);
      } else {
        setFooterCols([
          { title: 'Help', links: [{ label: 'Size Guide', url: '/size-guide' }] },
          { title: 'Social', links: [{ label: 'Instagram', url: 'https://instagram.com' }] }
        ]);
      }

      // 8. Process Custom Print Config
      const printData = sectionMap.get('custom_print_config');
      if (printData?.colors) {
        setPrintColors(printData.colors);
      } else {
        setPrintColors([
          { name: 'Pure White', hex: '#ffffff', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop' },
          { name: 'Ink Black', hex: '#111111', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop' },
          { name: 'Crimson Red', hex: '#b31a1a', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop' },
          { name: 'Light Pink', hex: '#ffc0cb', image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop' },
          { name: 'Light Green', hex: '#90ee90', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1000&auto=format&fit=crop' }
        ]);
      }

      // 9. Process Theme Colors Config
      const themeData = sectionMap.get('theme_config');
      if (themeData) {
        const t = themeData;
        if (t.accent) setThemeAccent(t.accent);
        if (t.bg) setThemeBg(t.bg);
        if (t.bgAlt) setThemeBgAlt(t.bgAlt);
        if (t.bgCard) setThemeBgCard(t.bgCard);
        if (t.text) setThemeText(t.text);
        if (t.textDim) setThemeTextDim(t.textDim);
        if (t.line) setThemeLine(t.line);
      }

      // 10. Process New Drops Config
      const newDropsData = sectionMap.get('new_drops_config');
      if (newDropsData?.slugs) {
        setNewDrops(newDropsData.slugs);
      }

      // Process Bestsellers Config
      const bestsellersData = sectionMap.get('bestsellers_config');
      if (bestsellersData?.slugs) {
        setBestsellers(bestsellersData.slugs);
      }

      // 11. Process Reels Config
      const reelsData = sectionMap.get('reels_config');
      if (reelsData) {
        setReels(reelsData);
      } else {
        setReels([
          { id: 'mock-1', title: 'Dyeing Process Vol 4', videoUrl: 'https://videos.pexels.com/video-files/3205307/3205307-hd_1080_1920_25fps.mp4', productSlug: 'fathom-overshirt' },
          { id: 'mock-2', title: 'Street Style Shoot', videoUrl: 'https://videos.pexels.com/video-files/5004554/5004554-uhd_1440_2560_30fps.mp4', productSlug: 'monsoon-cargo-jeans' },
          { id: 'mock-3', title: 'Behind the Seams', videoUrl: 'https://videos.pexels.com/video-files/8468305/8468305-hd_1080_1920_30fps.mp4', productSlug: 'static-crew-tee' }
        ]);
      }

      // 12. Process Showcase Page & Products Config
      const showcasePageData = sectionMap.get('showcase_page_config');
      const showcaseBannerData = sectionMap.get('showcase_banner_set');

      if (showcasePageData) {
        if (showcasePageData.mode) setShowcaseMode(showcasePageData.mode);
        if (showcasePageData.headline) setShowcaseHeadline(showcasePageData.headline);
        if (showcasePageData.eyebrow) setShowcaseEyebrow(showcasePageData.eyebrow);
        if (showcasePageData.subtitle) setShowcaseSubtitle(showcasePageData.subtitle);
        if (showcasePageData.ctaText) setShowcaseCtaText(showcasePageData.ctaText);
        if (showcasePageData.ctaLink) setShowcaseCtaLink(showcasePageData.ctaLink);
        if (showcasePageData.selectedProducts && Array.isArray(showcasePageData.selectedProducts)) {
          setShowcaseSelectedProducts(showcasePageData.selectedProducts);
        }
        if (showcasePageData.images && Array.isArray(showcasePageData.images)) {
          setShowcaseImages(showcasePageData.images);
        }
      } else {
        // Default initial items from products catalog
        const listToUse = initialProducts && initialProducts.length > 0 ? initialProducts : dbProducts;
        if (listToUse && listToUse.length > 0) {
          const defaultList = listToUse.slice(0, 8).map((p: any, idx: number) => ({
            slug: p.slug,
            badge: idx === 0 ? 'NEW' : idx === 1 ? 'LIMITED STOCK' : idx === 2 ? 'BESTSELLER' : 'FEATURED'
          }));
          setShowcaseSelectedProducts(defaultList);
        }
        if (showcaseBannerData?.images && Array.isArray(showcaseBannerData.images)) {
          setShowcaseImages(showcaseBannerData.images);
        }
      }

      // 13. Process Category Sliding Marquee Carousel Config
      const marqueeData = sectionMap.get('category_marquee_config');
      if (marqueeData) {
        if (marqueeData.enabled !== undefined) setMarqueeEnabled(marqueeData.enabled);
        if (marqueeData.tags && Array.isArray(marqueeData.tags)) setMarqueeTags(marqueeData.tags);
        if (marqueeData.theme) setMarqueeTheme(marqueeData.theme);
        if (marqueeData.bgColor) setMarqueeBgColor(marqueeData.bgColor);
        if (marqueeData.textColor) setMarqueeTextColor(marqueeData.textColor);
        if (marqueeData.accentColor) setMarqueeAccentColor(marqueeData.accentColor);
        if (marqueeData.borderColor) setMarqueeBorderColor(marqueeData.borderColor);
        if (marqueeData.speed) setMarqueeSpeed(marqueeData.speed);
        if (marqueeData.direction) setMarqueeDirection(marqueeData.direction);
        if (marqueeData.badgeStyle) setMarqueeBadgeStyle(marqueeData.badgeStyle);
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to load some storefront components');
    }
    setLoading(false);
  };

  /* ── Tab 11: Sliding Marquee Ribbon Actions ────────────────────────────── */
  const handleSaveMarqueeConfig = () => {
    saveSectionKey('category_marquee_config', {
      enabled: marqueeEnabled,
      tags: marqueeTags,
      theme: marqueeTheme,
      bgColor: marqueeBgColor,
      textColor: marqueeTextColor,
      accentColor: marqueeAccentColor,
      borderColor: marqueeBorderColor,
      speed: marqueeSpeed,
      direction: marqueeDirection,
      badgeStyle: marqueeBadgeStyle
    }, 'Sliding Marquee settings saved live!');
  };

  const handleAddMarqueeTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMarqueeTag.trim().toUpperCase();
    if (!trimmed) return;
    if (marqueeTags.includes(trimmed)) {
      toast.error('Tag already exists in list');
      return;
    }
    setMarqueeTags([...marqueeTags, trimmed]);
    setNewMarqueeTag('');
  };

  const handleRemoveMarqueeTag = (index: number) => {
    setMarqueeTags(marqueeTags.filter((_, i) => i !== index));
  };

  const handleQuickAddTag = (tag: string) => {
    if (marqueeTags.includes(tag)) return;
    setMarqueeTags([...marqueeTags, tag]);
  };

  const handleResetMarqueeTags = () => {
    setMarqueeTags([
      "OVERSIZED", "BAGGY", "SLIM", "DISTRESSED", "WASHED", "RAW",
      "HEAVYWEIGHT", "BOXY", "CROPPED", "VINTAGE FIT"
    ]);
    toast.info('Tags reset to standard run');
  };

  const handleSelectThemePreset = (presetId: string) => {
    setMarqueeTheme(presetId as any);
    if (presetId === 'midnight') {
      setMarqueeBgColor('#08080a');
      setMarqueeTextColor('#8f9099');
      setMarqueeAccentColor('#00f2fe');
      setMarqueeBorderColor('rgba(255, 255, 255, 0.08)');
    } else if (presetId === 'crimson') {
      setMarqueeBgColor('#0e0406');
      setMarqueeTextColor('#ff4d6d');
      setMarqueeAccentColor('#ff0055');
      setMarqueeBorderColor('rgba(255, 77, 109, 0.25)');
    } else if (presetId === 'cyberpunk') {
      setMarqueeBgColor('#090514');
      setMarqueeTextColor('#c084fc');
      setMarqueeAccentColor('#38bdf8');
      setMarqueeBorderColor('rgba(192, 132, 252, 0.2)');
    } else if (presetId === 'gold') {
      setMarqueeBgColor('#0d0b06');
      setMarqueeTextColor('#f59e0b');
      setMarqueeAccentColor('#fbbf24');
      setMarqueeBorderColor('rgba(245, 158, 11, 0.25)');
    } else if (presetId === 'mono') {
      setMarqueeBgColor('#000000');
      setMarqueeTextColor('#ffffff');
      setMarqueeAccentColor('#aaaaaa');
      setMarqueeBorderColor('rgba(255, 255, 255, 0.2)');
    }
  };

  /* ── Showcase Page & Products Handlers ───────────────────────────────── */
  const handleSaveShowcaseFull = async () => {
    setSavingTab(true);
    const payload = {
      mode: showcaseMode,
      headline: showcaseHeadline,
      eyebrow: showcaseEyebrow,
      subtitle: showcaseSubtitle,
      ctaText: showcaseCtaText,
      ctaLink: showcaseCtaLink,
      selectedProducts: showcaseSelectedProducts,
      images: showcaseImages
    };

    try {
      const [res1, res2] = await Promise.all([
        saveCmsSectionAction('showcase_page_config', payload),
        saveCmsSectionAction('showcase_banner_set', { images: showcaseImages })
      ]);

      setSavingTab(false);
      if (res1.success && res2.success) {
        toast.success('Showcase page, products & banner configuration saved live!');
      } else {
        toast.error(res1.error || res2.error || 'Failed to save showcase settings');
      }
    } catch (err: any) {
      setSavingTab(false);
      toast.error('Save failed: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleAddShowcaseProduct = (slug: string, badge?: string) => {
    if (!slug) return;
    if (showcaseSelectedProducts.some(p => p.slug === slug)) {
      toast.info('This product is already in the showcase list');
      return;
    }
    setShowcaseSelectedProducts([...showcaseSelectedProducts, { slug, badge: badge || 'NEW' }]);
    toast.success('Product added to Showcase!');
  };

  const handleRemoveShowcaseProduct = (index: number) => {
    setShowcaseSelectedProducts(showcaseSelectedProducts.filter((_, i) => i !== index));
  };

  const handleMoveShowcaseProductUp = (index: number) => {
    if (index === 0) return;
    const list = [...showcaseSelectedProducts];
    const item = list[index];
    list[index] = list[index - 1];
    list[index - 1] = item;
    setShowcaseSelectedProducts(list);
  };

  const handleMoveShowcaseProductDown = (index: number) => {
    if (index >= showcaseSelectedProducts.length - 1) return;
    const list = [...showcaseSelectedProducts];
    const item = list[index];
    list[index] = list[index + 1];
    list[index + 1] = item;
    setShowcaseSelectedProducts(list);
  };

  const handleUpdateShowcaseBadge = (index: number, badge: string) => {
    const list = [...showcaseSelectedProducts];
    list[index] = { ...list[index], badge };
    setShowcaseSelectedProducts(list);
  };

  const handleAddAllCategoryToShowcase = (categoryKeyword: string) => {
    const catProducts = dbProducts.filter(p => {
      if (categoryKeyword === 'all') return true;
      const catName = p.categories?.name?.toLowerCase() || '';
      const pTitle = p.title?.toLowerCase() || '';
      return catName.includes(categoryKeyword.toLowerCase()) || pTitle.includes(categoryKeyword.toLowerCase());
    });

    const newItems = catProducts
      .filter(p => !showcaseSelectedProducts.some(sp => sp.slug === p.slug))
      .map(p => ({ slug: p.slug, badge: 'FEATURED' }));

    if (newItems.length === 0) {
      toast.info('All matched products are already in the showcase');
      return;
    }

    setShowcaseSelectedProducts([...showcaseSelectedProducts, ...newItems]);
    toast.success(`Added ${newItems.length} products to Showcase!`);
  };

  const handleResetShowcaseProducts = () => {
    const defaultList = dbProducts.slice(0, 8).map((p, idx) => ({
      slug: p.slug,
      badge: idx === 0 ? 'NEW' : idx === 1 ? 'LIMITED STOCK' : idx === 2 ? 'BESTSELLER' : 'FEATURED'
    }));
    setShowcaseSelectedProducts(defaultList);
    toast.success('Reset showcase to 8 newest catalog products');
  };

  const updateShowcaseImage = (index: number, url: string) => {
    const next = [...showcaseImages];
    while (next.length < 4) next.push('');
    next[index] = url;
    setShowcaseImages(next);
  };

  /* ── Save Helper ──────────────────────────────────────────────────────── */
  const saveSectionKey = async (sectionKey: string, payload: any, successMsg: string) => {
    setSavingTab(true);
    
    const result = await saveCmsSectionAction(sectionKey, payload);

    setSavingTab(false);
    if (!result.success) {
      toast.error(`Save failed: ${result.error}`);
    } else {
      toast.success(successMsg);
    }
  };

  /* ── Tab 8: Theme Config Actions ──────────────────────────────────────── */
  const handleSaveTheme = () => {
    saveSectionKey('theme_config', {
      preset: themePreset,
      accent: themeAccent,
      bg: themeBg,
      bgAlt: themeBgAlt,
      bgCard: themeBgCard,
      text: themeText,
      textDim: themeTextDim,
      line: themeLine
    }, 'Store theme colors updated successfully!');
  };

  /* ── Tab 9: New Drops Actions ─────────────────────────────────────────── */
  const handleSaveNewDrops = () => {
    saveSectionKey('new_drops_config', { slugs: newDrops.filter(Boolean) }, 'New Drops products updated successfully!');
  };

  /* ── Tab Bestsellers Actions ─────────────────────────────────────────── */
  const handleSaveBestsellers = () => {
    saveSectionKey('bestsellers_config', { slugs: bestsellers.filter(Boolean) }, 'Bestsellers products updated successfully!');
  };

  /* ── Tab 1: Hero & Marquee Actions ────────────────────────────────────── */
  const handleSaveHero = () => {
    saveSectionKey('homepage_config', { 
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
      catalogLede
    }, 'Cinematic Hero Media & Homepage live!');
  };

  const addMarqueeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarquee.trim()) return;
    setMarqueeItems([...marqueeItems, { text: newMarquee.trim(), link: newMarqueeLink.trim() }]);
    setNewMarquee('');
    setNewMarqueeLink('');
  };

  /* ── Tab 2: Curated Fits (Shop the Look) Actions ───────────────────────── */
  const handleSaveFits = () => {
    const sanitized = fits.map(f => ({
      ...f,
      image: f.images?.[0] || f.image || ''
    }));
    saveSectionKey('curated_fits_config', { fits: sanitized, show: showFits }, 'Shop the Look configured live!');
  };

  const selectPresetProduct = (fitIdx: number, itemIdx: number, productSlug: string) => {
    const found = dbProducts.find(p => p.slug === productSlug);
    if (!found) return;

    const newFits = [...fits];
    newFits[fitIdx].items[itemIdx] = {
      ...newFits[fitIdx].items[itemIdx],
      name: found.title,
      slug: found.slug,
      price: found.base_price || 0
    };
    setFits(newFits);
    toast.success(`Attached "${found.title}"`);
  };

  const updateFit = (fitIdx: number, field: keyof CuratedFit, val: string) => {
    const newFits = [...fits];
    newFits[fitIdx] = { ...newFits[fitIdx], [field]: val };
    setFits(newFits);
  };

  const updateFitImage = (fitIdx: number, imgIdx: number, val: string) => {
    const newFits = [...fits];
    const imgs = [...(newFits[fitIdx].images || [])];
    imgs[imgIdx] = val;
    newFits[fitIdx].images = imgs;
    if (imgIdx === 0) newFits[fitIdx].image = val;
    setFits(newFits);
  };

  const addImageToFit = (fitIdx: number) => {
    const newFits = [...fits];
    newFits[fitIdx].images = [...(newFits[fitIdx].images || []), ''];
    setFits(newFits);
  };

  const removeFitImage = (fitIdx: number, imgIdx: number) => {
    const newFits = [...fits];
    const imgs = (newFits[fitIdx].images || []).filter((_, i) => i !== imgIdx);
    newFits[fitIdx].images = imgs;
    newFits[fitIdx].image = imgs[0] || '';
    setFits(newFits);
  };

  /* ── Tab 3: Category Banners Actions ──────────────────────────────────── */
  const handleSaveBanner = async (slug: string) => {
    setSavingBannerSlug(prev => ({ ...prev, [slug]: true }));
    const sectionKey = `category_banner_${slug}`;
    const bannerData = banners[slug] || { type: 'image', url: '' };

    const result = await saveCmsSectionAction(sectionKey, bannerData);

    setSavingBannerSlug(prev => ({ ...prev, [slug]: false }));
    if (result.success) {
      setSuccessBannerSlug(prev => ({ ...prev, [slug]: true }));
      setTimeout(() => setSuccessBannerSlug(prev => ({ ...prev, [slug]: false })), 3000);
      toast.success(`Banner for /category/${slug} updated!`);
    } else {
      toast.error(`Failed: ${result.error}`);
    }
  };

  const handleUpdateBanner = (slug: string, field: keyof BannerConfig, value: string) => {
    setBanners(prev => ({
      ...prev,
      [slug]: { ...prev[slug] || { type: 'image', url: '' }, [field]: value }
    }));
  };

  /* ── Tab 4: Categories Grid Actions ───────────────────────────────────── */
  const handleSaveGrid = () => {
    saveSectionKey('categories_config', { categories: gridCategories }, 'Storefront Categories Grid saved!');
  };

  /* ── Tab 5: Offers Actions ────────────────────────────────────────────── */
  const handleSaveOffers = () => {
    saveSectionKey('offers_config', { offers }, 'Storefront Promotional Offers updated!');
  };

  /* ── Tab 6: Footer Actions ────────────────────────────────────────────── */
  const handleSaveFooter = () => {
    saveSectionKey('footer_config', { columns: footerCols }, 'Footer links columns updated!');
  };

  /* ── Tab 7: Custom Print Studio Actions ────────────────────────────────── */
  const handleSavePrintColors = () => {
    saveSectionKey('custom_print_config', { colors: printColors }, 'Custom Print color options updated!');
  };

  /* ── Tab 10: Reels Actions ────────────────────────────────────────────── */
  const handleSaveReels = () => {
    saveSectionKey('reels_config', reels, 'Storefront Reels updated successfully!');
  };


  /* ── Render ───────────────────────────────────────────────────────────── */
  if (loading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading unified configuration...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="font-display text-4xl font-black text-[var(--text)] uppercase tracking-tighter">Storefront Manage</h1>
          <p className="text-[var(--text-dim)] mt-1">Configure layout blocks, headers, banners, lookbooks, and footer columns.</p>
        </div>
        <div className="flex items-center gap-2">
          {savingTab && (
            <span className="text-xs text-[var(--accent)] flex items-center gap-1.5 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> saving to database...
            </span>
          )}
        </div>
      </div>

      {/* ── Sub Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8 bg-[var(--bg-card)] p-1.5 border border-[var(--line)]">
        {[
          { id: 'hero', label: 'Hero & Marquee', icon: LayoutTemplate },
          { id: 'sliding-marquee', label: 'Sliding Carousel (Tags)', icon: SlidersHorizontal },
          { id: 'showcase', label: 'Showcase Page & Products', icon: Sparkles },
          { id: 'newdrops', label: 'New Drops', icon: Sparkles },
          { id: 'bestsellers', label: 'Bestsellers', icon: ShoppingBag },
          { id: 'reels', label: 'Reels / TikToks', icon: Video },
          { id: 'fits', label: 'Shop The Look', icon: Sparkles },
          { id: 'banners', label: 'Category Hero Banners', icon: ImageIcon },
          { id: 'grid', label: 'Categories Grid', icon: LayoutGrid },
          { id: 'offers', label: 'Promo Offers', icon: Tag },
          { id: 'footer', label: 'Footer Links', icon: Columns3 },
          { id: 'print', label: 'Custom Print Lab', icon: Sparkles },
          { id: 'theme', label: 'Theme Colors', icon: Palette }
        ].map(t => {
          const Icon = t.icon;
          const isAct = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${isAct ? 'bg-[var(--accent)] text-[var(--bg)] border-transparent' : 'bg-transparent text-[var(--text-dim)] border-transparent hover:text-[var(--text)]'}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>


      {/* ── Tab Content Container ────────────────────────────────────── */}
      <div className="space-y-8">
        
        {/* ══ Tab 1: Hero & Cinematic Media ════════════════════════════════ */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            
            {/* Top Bar with Save Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)] flex items-center gap-2">
                  <Film className="w-5 h-5 text-[var(--accent)]" /> Cinematic Hero Media & Layout
                </h3>
                <p className="text-xs text-[var(--text-dim)] mt-0.5">
                  Configure high-resolution background video/image, theatrical contrast overlays, and storefront headlines.
                </p>
              </div>
              <button 
                onClick={handleSaveHero} 
                disabled={savingTab} 
                className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2.5 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-2 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer shrink-0"
              >
                {savingTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes Live
              </button>
            </div>

            {/* Live Interactive Mini-Hero Preview */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-widest flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Live Storefront Viewport Preview (21:9 Cinematic Aspect)
                </span>
                <span className="text-[10px] font-mono text-[var(--text-dim)]">
                  Mode: {heroMediaType.toUpperCase()} • Darkness: {heroMediaDarkness}%
                </span>
              </div>

              <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[360px] rounded-xl overflow-hidden border border-[var(--line)] bg-[#0a0a0c] flex items-center p-6 md:p-10 select-none">
                {/* Background Layer in Preview */}
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

                {/* Layered Gradient Overlays in Preview */}
                {heroMediaType !== 'none' && heroMediaUrl && (
                  <>
                    <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.7) 50%, rgba(8,8,10,0.3) 100%)' }} />
                    <div className="absolute inset-0 z-[1]" style={{ backgroundColor: `rgba(0, 0, 0, ${heroMediaDarkness / 100})` }} />
                    {heroMediaVignette && (
                      <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)' }} />
                    )}
                  </>
                )}

                {/* Foreground Text in Preview */}
                <div className="relative z-10 max-w-xl space-y-2">
                  <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase text-[var(--accent)] font-bold">
                    {heroEyebrow || 'SS26 — VOL. 01 — SMALL BATCH'}
                  </span>
                  <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold uppercase text-white leading-tight">
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
              </div>
            </div>

            {/* CARD 1: Media Type & Upload Source */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
              <h4 className="font-display text-lg font-bold uppercase text-[var(--text)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--accent)]" /> Background Media Source
              </h4>

              {/* Media Type Selector */}
              <div>
                <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-2 font-bold">
                  Select Background Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setHeroMediaType('none')}
                    className={`p-4 border rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                      heroMediaType === 'none'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]'
                        : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:border-[var(--text)]'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase">Signature Blobs</span>
                    <span className="text-[10px] text-[var(--text-dim)]">Animated glowing liquid mesh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroMediaType('image')}
                    className={`p-4 border rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                      heroMediaType === 'image'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]'
                        : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:border-[var(--text)]'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase">Cinematic Image</span>
                    <span className="text-[10px] text-[var(--text-dim)]">High-res editorial still with zoom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroMediaType('video')}
                    className={`p-4 border rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                      heroMediaType === 'video'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]'
                        : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:border-[var(--text)]'
                    }`}
                  >
                    <Film className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase">Looping Video</span>
                    <span className="text-[10px] text-[var(--text-dim)]">Ultra-cinematic MP4 / WebM video</span>
                  </button>
                </div>
              </div>

              {/* If Image or Video Selected: URL & Upload Fields */}
              {heroMediaType !== 'none' && (
                <div className="space-y-4 pt-4 border-t border-[var(--line)]">
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">
                      {heroMediaType === 'video' ? 'Hero Video Source (MP4 / WebM / Cloudinary URL)' : 'Hero Image Source (High-Res 16:9 / 21:9 URL)'}
                    </label>
                    <div className="space-y-3">
                      <MediaUploader 
                        onUploadSuccess={(url) => setHeroMediaUrl(url)} 
                        label={heroMediaType === 'video' ? "Upload Looping Video (MP4 / WebM)" : "Upload High-Res Hero Image"} 
                      />
                      <input 
                        type="text" 
                        value={heroMediaUrl} 
                        onChange={e => setHeroMediaUrl(e.target.value)} 
                        placeholder={heroMediaType === 'video' ? 'https://res.cloudinary.com/.../video.mp4' : 'https://images.unsplash.com/...'} 
                        className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" 
                      />
                    </div>
                  </div>

                  {heroMediaType === 'video' && (
                    <div>
                      <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">
                        Video Poster Fallback Image (Optional)
                      </label>
                      <input 
                        type="text" 
                        value={heroMediaPoster} 
                        onChange={e => setHeroMediaPoster(e.target.value)} 
                        placeholder="https://images.unsplash.com/... (Image shown while video streams)" 
                        className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CARD 2: Cinematic Atmosphere & Text Protection Controls */}
            {heroMediaType !== 'none' && (
              <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
                <h4 className="font-display text-lg font-bold uppercase text-[var(--text)] flex items-center gap-2">
                  <SunMedium className="w-4 h-4 text-[var(--accent)]" /> Cinematic Atmosphere & Contrast Tuning
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Overlay Darkness Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">
                        Overlay Darkness Protection
                      </label>
                      <span className="text-xs font-mono font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">
                        {heroMediaDarkness}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="90" 
                      step="5" 
                      value={heroMediaDarkness} 
                      onChange={e => setHeroMediaDarkness(parseInt(e.target.value))} 
                      className="w-full accent-[var(--accent)] cursor-pointer" 
                    />
                    <p className="text-[10px] text-[var(--text-dim)]">
                      Tip: 40% - 60% ensures headline text is 100% crisp and readable over bright visuals.
                    </p>
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">
                        Background Softness / Defocus
                      </label>
                      <span className="text-xs font-mono font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">
                        {heroMediaBlur}px
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="12" 
                      step="1" 
                      value={heroMediaBlur} 
                      onChange={e => setHeroMediaBlur(parseInt(e.target.value))} 
                      className="w-full accent-[var(--accent)] cursor-pointer" 
                    />
                    <p className="text-[10px] text-[var(--text-dim)]">
                      Set to 0px for razor-sharp 4K look, or 2-4px for depth-of-field effect.
                    </p>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--line)]">
                  <label className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--line)] rounded-xl cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={heroMediaVignette} 
                      onChange={e => setHeroMediaVignette(e.target.checked)} 
                      className="accent-[var(--accent)] w-4 h-4" 
                    />
                    <div>
                      <span className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">Theatrical Vignette</span>
                      <span className="block text-[10px] text-[var(--text-dim)]">Darkens outer frame edges for movie-grade focus</span>
                    </div>
                  </label>

                  {heroMediaType === 'image' && (
                    <label className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--line)] rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={heroMediaKenBurns} 
                        onChange={e => setHeroMediaKenBurns(e.target.checked)} 
                        className="accent-[var(--accent)] w-4 h-4" 
                      />
                      <div>
                        <span className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">Ken Burns Slow Motion</span>
                        <span className="block text-[10px] text-[var(--text-dim)]">Subtle slow-panning atmospheric camera drift</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* CARD 3: Headline Copy & Call-to-Actions */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-4">
              <h4 className="font-display text-lg font-bold uppercase text-[var(--text)] flex items-center gap-2">
                <Type className="w-4 h-4 text-[var(--accent)]" /> Hero Headlines & Call to Actions
              </h4>

              <div>
                <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Eyebrow Tagline</label>
                <input type="text" value={heroEyebrow} onChange={e => setHeroEyebrow(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Headline Line 1 (Solid White)</label>
                  <input type="text" value={heroTitle1} onChange={e => setHeroTitle1(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Headline Line 2 (Stroke Outline)</label>
                  <input type="text" value={heroTitle2} onChange={e => setHeroTitle2(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Lede Description</label>
                <textarea value={heroLede} onChange={e => setHeroLede(e.target.value)} rows={3} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
              </div>

              {/* Catalog Landing Page Copy Inputs */}
              <div className="pt-4 border-t border-[var(--line)] space-y-4">
                <span className="block text-[10px] uppercase font-bold text-[var(--accent)] tracking-widest">
                  📂 Public Catalog Landing Page Copy (Categories View)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Catalog Eyebrow</label>
                    <input type="text" value={catalogEyebrow} onChange={e => setCatalogEyebrow(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Catalog Title Headline</label>
                    <input type="text" value={catalogTitle} onChange={e => setCatalogTitle(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Catalog Lede Description</label>
                  <textarea value={catalogLede} onChange={e => setCatalogLede(e.target.value)} rows={2} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Primary Button</label>
                  <div className="flex gap-2">
                    <input type="text" value={heroCtaPrimaryText} onChange={e => setHeroCtaPrimaryText(e.target.value)} placeholder="Button Text" className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] rounded-lg outline-none" />
                    <input type="text" value={heroCtaPrimaryLink} onChange={e => setHeroCtaPrimaryLink(e.target.value)} placeholder="Link URL (#new)" className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] rounded-lg outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Secondary Button</label>
                  <div className="flex gap-2">
                    <input type="text" value={heroCtaSecondaryText} onChange={e => setHeroCtaSecondaryText(e.target.value)} placeholder="Button Text" className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] rounded-lg outline-none" />
                    <input type="text" value={heroCtaSecondaryLink} onChange={e => setHeroCtaSecondaryLink(e.target.value)} placeholder="Link URL (#lookbook)" className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] rounded-lg outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Giant Marquee Ribbon */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <h4 className="font-display text-lg font-bold uppercase text-[var(--text)] mb-4">Giant Marquee Ribbon</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Ribbon Text</label>
                  <input type="text" value={giantMarqueeText} onChange={e => setGiantMarqueeText(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold">Link URL (Optional)</label>
                  <input type="text" value={giantMarqueeLink} onChange={e => setGiantMarqueeLink(e.target.value)} placeholder="/category/t-shirts" className="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] rounded-lg" />
                </div>
              </div>
            </div>

            {/* CARD 5: Scrolling Marquee Items */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <h4 className="font-display text-lg font-bold uppercase text-[var(--text)] mb-4">Scrolling Marquee Text Items</h4>
              <div className="space-y-3 mb-6">
                {marqueeItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--bg)] border border-[var(--line)] p-3 rounded-lg">
                    <div className="flex-1 w-full space-y-2">
                      <input type="text" value={item.text} onChange={e => {
                        const newItems = [...marqueeItems];
                        newItems[idx].text = e.target.value;
                        setMarqueeItems(newItems);
                      }} className="w-full bg-transparent border-b border-[var(--line)] text-sm font-mono pb-1 outline-none focus:border-[var(--accent)]" placeholder="Marquee Text" />
                      
                      <input type="text" value={item.link} onChange={e => {
                        const newItems = [...marqueeItems];
                        newItems[idx].link = e.target.value;
                        setMarqueeItems(newItems);
                      }} className="w-full bg-[var(--bg-card)] border border-[var(--line)] p-1.5 text-xs text-[var(--text)] outline-none rounded" placeholder="Link URL (Optional, e.g. /category/shirts)" />
                    </div>
                    <button type="button" onClick={() => setMarqueeItems(marqueeItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 text-xs uppercase tracking-wider font-bold shrink-0 cursor-pointer">Remove</button>
                  </div>
                ))}
              </div>
              <form onSubmit={addMarqueeItem} className="flex flex-col md:flex-row gap-2">
                <input type="text" value={newMarquee} onChange={e => setNewMarquee(e.target.value)} placeholder="New Marquee Text..." className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-sm outline-none rounded-lg" />
                <input type="text" value={newMarqueeLink} onChange={e => setNewMarqueeLink(e.target.value)} placeholder="Link URL (Optional)" className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-sm outline-none rounded-lg" />
                <button type="submit" className="bg-[var(--text)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 rounded-lg cursor-pointer">Add Item</button>
              </form>
            </div>
          </div>
        )}

        {/* ══ Tab 2: Curated Fits (Shop the Look) ═══════════════════════ */}
        {activeTab === 'fits' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)] flex items-center gap-2.5">
                  Styled Looks Slideshows
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                    showFits 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {showFits ? 'VISIBLE ON STOREFRONT' : 'HIDDEN ON STOREFRONT'}
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-dim)]">Attach multiple images to create slideshows, and assign real catalog products.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowFits(!showFits)}
                  className={`flex-1 md:flex-none px-4 py-3 text-xs uppercase tracking-wider font-bold transition-all border cursor-pointer ${
                    showFits 
                      ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {showFits ? '🙈 Hide Section' : '👁️ Show Section'}
                </button>
                <button onClick={handleSaveFits} disabled={savingTab} className="flex-1 md:flex-none bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer">
                  <Save className="w-4 h-4" /> Save All Looks
                </button>
              </div>
            </div>

            {fits.map((fit, fitIdx) => (
              <div key={fit.id} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-[var(--line)] pb-6 bg-black/10 -m-6 p-6">
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="w-20 h-20 bg-[var(--bg-alt)] border border-[var(--line)] overflow-hidden shrink-0">
                      {(fit.images?.[0] || fit.image) && <img src={fit.images?.[0] || fit.image} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input type="text" value={fit.title} onChange={e => updateFit(fitIdx, 'title', e.target.value)} className="w-full bg-transparent font-display text-2xl font-bold text-[var(--text)] outline-none border-b border-transparent focus:border-[var(--accent)]" placeholder="Title" />
                      
                      <div className="space-y-2">
                        <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider font-bold">Slideshow Images</label>
                        {(fit.images || []).map((img, imgIdx) => (
                          <div key={imgIdx} className="flex gap-2 items-center">
                            <input type="text" value={img} onChange={e => updateFitImage(fitIdx, imgIdx, e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] text-xs p-2 text-[var(--text)] outline-none" placeholder="Image URL" />
                            <div className="shrink-0">
                              <MediaUploader onUploadSuccess={url => updateFitImage(fitIdx, imgIdx, url)} label="Upload" />
                            </div>
                            <button onClick={() => removeFitImage(fitIdx, imgIdx)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1.5 border border-red-500/10 rounded">Remove</button>
                          </div>
                        ))}
                        <button onClick={() => addImageToFit(fitIdx)} className="text-xs bg-[var(--bg)] border border-[var(--line)] text-[var(--text)] px-3 py-1.5 rounded hover:bg-[var(--line)]">+ Add Slide Image</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setFits(fits.filter(f => f.id !== fit.id))} className="text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 text-xs uppercase tracking-wider font-bold">Delete Look</button>
                </div>

                {/* Attached Products */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[var(--text-dim)] text-xs uppercase tracking-wider flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Attached Products</h4>
                  <div className="space-y-3">
                    {fit.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-[var(--bg)] border border-[var(--line)] p-4">
                        
                        {/* Selector */}
                        <div className="md:col-span-4">
                          <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Catalog Sync</label>
                          <select value={item.slug} onChange={e => selectPresetProduct(fitIdx, itemIdx, e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--line)] text-xs p-1.5 text-[var(--text)] outline-none">
                            <option value="">-- Bind catalog product --</option>
                            {dbProducts.map(p => (
                              <option key={p.slug} value={p.slug}>{p.title} (₹{p.base_price})</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Display Label</label>
                          <input type="text" value={item.name} onChange={e => {
                            const n = [...fits];
                            n[fitIdx].items[itemIdx].name = e.target.value;
                            setFits(n);
                          }} className="w-full bg-transparent border-b border-[var(--line)] text-xs text-[var(--text)] font-bold outline-none" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Type tag</label>
                          <input type="text" value={item.type} onChange={e => {
                            const n = [...fits];
                            n[fitIdx].items[itemIdx].type = e.target.value;
                            setFits(n);
                          }} className="w-full bg-transparent border-b border-[var(--line)] text-xs outline-none" placeholder="e.g. TOP" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Price (₹)</label>
                          <input type="number" value={item.price} onChange={e => {
                            const n = [...fits];
                            n[fitIdx].items[itemIdx].price = Number(e.target.value);
                            setFits(n);
                          }} className="w-full bg-transparent border-b border-[var(--line)] text-xs outline-none font-mono" />
                        </div>

                        <div className="md:col-span-1 flex justify-end">
                          <button onClick={() => {
                            const n = [...fits];
                            n[fitIdx].items = n[fitIdx].items.filter((_, idx) => idx !== itemIdx);
                            setFits(n);
                          }} className="text-[var(--text-dim)] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => {
                    const n = [...fits];
                    n[fitIdx].items.push({ name: 'New Piece', price: 0, slug: 'new-piece-slug', type: 'TOP' });
                    setFits(n);
                  }} className="w-full border border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] p-3 text-xs uppercase tracking-wider font-bold">+ Add Piece to Look</button>
                </div>
              </div>
            ))}

            <button onClick={() => setFits([...fits, { id: `fit-${Date.now()}`, title: 'NEW FIT LOOK', image: '', images: [''], items: [] }])} className="w-full border-2 border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] p-8 text-center uppercase tracking-wider font-bold">
              + Create New Curated Look
            </button>
          </div>
        )}

        {/* ══ Tab 3: Category Banners ══════════════════════════════════ */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Quick Link to Sliding Marquee */}
            <div className="bg-[var(--bg-card)] border border-[var(--accent)]/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Moving Sliding Carousel (Tags) Below Banners</h4>
                  <p className="text-[11px] text-[var(--text-dim)]">Want to customize the moving text marquee (OVERSIZED, BAGGY, etc.) or turn it on/off?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('sliding-marquee')}
                className="bg-[var(--accent)] text-[var(--bg)] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                Configure Sliding Carousel & Colors →
              </button>
            </div>

            {dbCategories.map(cat => {
              const conf = banners[cat.slug] || { type: 'image', url: '' };
              const isSav = savingBannerSlug[cat.slug];
              const isSucc = successBannerSlug[cat.slug];
              return (
                <div key={cat.id} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 flex flex-col md:flex-row gap-6">
                  {/* Media Preview Box */}
                  <div className="w-full md:w-64 h-36 bg-[var(--bg-alt)] border border-[var(--line)] overflow-hidden relative flex items-center justify-center shrink-0">
                    {conf.url ? (
                      conf.type === 'video' ? (
                        <video src={conf.url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={conf.url} className="w-full h-full object-cover" alt="" />
                      )
                    ) : (
                      <span className="text-xs uppercase tracking-wider text-[var(--text-dim)]">No Hero Media</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text)]">{cat.name}</h4>
                      <p className="text-xs text-[var(--text-dim)] font-mono">/category/{cat.slug}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] w-16">Type</label>
                        <select value={conf.type} onChange={e => handleUpdateBanner(cat.slug, 'type', e.target.value as any)} className="bg-[var(--bg)] border border-[var(--line)] text-xs p-1.5 outline-none">
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] w-16">URL</label>
                        <input type="text" value={conf.url} onChange={e => handleUpdateBanner(cat.slug, 'url', e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] text-xs p-2 text-[var(--text)] outline-none" placeholder="https://..." />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16"></div>
                        <MediaUploader onUploadSuccess={url => handleUpdateBanner(cat.slug, 'url', url)} label={`Upload ${conf.type}`} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button onClick={() => handleSaveBanner(cat.slug)} disabled={isSav} className={`px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 ${isSucc ? 'bg-green-500 text-white' : 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90'}`}>
                      {isSav ? 'Saving...' : isSucc ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Banner</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ Tab: Sliding Carousel (Category Marquee Ribbon) ════════════ */}
        {activeTab === 'sliding-marquee' && (
          <div className="space-y-8">
            {/* Header & Save Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl">
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-[var(--text)] flex items-center gap-2">
                  <SlidersHorizontal className="w-6 h-6 text-[var(--accent)]" /> Moving Sliding Carousel (Marquee Ribbon)
                </h3>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Manage the animated scrolling tags strip shown directly below category banners (e.g. /category/jeans).
                </p>
              </div>
              <button 
                onClick={handleSaveMarqueeConfig} 
                disabled={savingTab} 
                className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2.5 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-2 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer shrink-0 rounded-xl"
              >
                {savingTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes Live
              </button>
            </div>

            {/* CARD 1: Master ON / OFF Toggle Switch */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                    Visibility & Display State
                  </span>
                  <h4 className="font-display text-lg font-bold text-[var(--text)] flex items-center gap-2">
                    Enable Moving Sliding Carousel on Storefront
                  </h4>
                  <p className="text-xs text-[var(--text-dim)]">
                    Turn the sliding ribbon on or off across all category pages.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMarqueeEnabled(!marqueeEnabled)}
                  className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer border ${
                    marqueeEnabled 
                      ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-lg shadow-green-500/10' 
                      : 'bg-red-500/10 border-red-500/40 text-red-400'
                  }`}
                >
                  {marqueeEnabled ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-green-400" />
                      <span>🟢 Active & Moving</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-red-400" />
                      <span>🔴 Hidden (Turned Off)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CARD 2: Live Animated Carousel Preview */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-widest flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Live Storefront Sliding Carousel Preview
                </span>
                <span className="text-[10px] font-mono text-[var(--text-dim)]">
                  Theme: {marqueeTheme.toUpperCase()} • Speed: {marqueeSpeed.toUpperCase()} • {marqueeEnabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>

              {/* Interactive Mini-Marquee Visual */}
              <div 
                className="w-full overflow-hidden py-4 px-2 rounded-xl border relative select-none transition-colors duration-300"
                style={{
                  backgroundColor: marqueeBgColor,
                  borderTopColor: marqueeBorderColor,
                  borderBottomColor: marqueeBorderColor,
                  borderColor: marqueeBorderColor
                }}
              >
                {!marqueeEnabled && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-20 flex items-center justify-center">
                    <span className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs px-3 py-1.5 rounded font-mono font-bold uppercase tracking-wider">
                      Sliding Carousel is Currently Disabled (Turned Off)
                    </span>
                  </div>
                )}

                <div 
                  className="filter-marquee-track flex items-center"
                  style={{
                    animationName: marqueeDirection === 'right' ? 'filter-marquee-reverse' : 'filter-marquee',
                    animationDuration: marqueeSpeed === 'slow' ? '45s' : marqueeSpeed === 'fast' ? '14s' : '28s'
                  }}
                >
                  {[...marqueeTags, ...marqueeTags, ...marqueeTags, ...marqueeTags].map((tag, i) => {
                    let previewBadge;
                    if (marqueeBadgeStyle === 'minimal') {
                      previewBadge = (
                        <span className="flex items-center gap-2">
                          <span style={{ color: marqueeAccentColor }}>•</span>
                          <span>{tag}</span>
                        </span>
                      );
                    } else if (marqueeBadgeStyle === 'pills') {
                      previewBadge = (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: `1px solid ${marqueeBorderColor}`,
                            color: marqueeTextColor
                          }}
                        >
                          {tag}
                        </span>
                      );
                    } else if (marqueeBadgeStyle === 'outline') {
                      previewBadge = (
                        <span 
                          className="px-3 py-1 border text-xs font-mono font-bold uppercase tracking-wider"
                          style={{
                            borderColor: marqueeBorderColor,
                            color: marqueeTextColor
                          }}
                        >
                          {tag}
                        </span>
                      );
                    } else {
                      previewBadge = `[ ${tag} ]`;
                    }

                    return (
                      <span
                        key={i}
                        className="px-6 py-1 font-display text-lg md:text-xl font-bold uppercase tracking-widest shrink-0 transition-colors"
                        style={{ color: marqueeTextColor }}
                      >
                        {previewBadge}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CARD 3: Theme Presets & Color Customizer */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[var(--accent)]" />
                  <h4 className="font-display text-lg font-bold text-[var(--text)] uppercase">Color Themes & Styling</h4>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">1-Click Curated Streetwear Themes</span>
              </div>

              {/* Theme Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'midnight', label: 'Midnight Stealth', bg: '#08080a', text: '#8f9099', accent: '#00f2fe', border: 'rgba(255,255,255,0.08)', desc: 'Dark graphite with cyan hover glow' },
                  { id: 'crimson', label: 'Neon Crimson', bg: '#0e0406', text: '#ff4d6d', accent: '#ff0055', border: 'rgba(255,77,109,0.25)', desc: 'Bold crimson energy with electric red glow' },
                  { id: 'cyberpunk', label: 'Cyberpunk Violet', bg: '#090514', text: '#c084fc', accent: '#38bdf8', border: 'rgba(192,132,252,0.2)', desc: 'Deep cosmic violet with neon cyan' },
                  { id: 'gold', label: 'Liquid Gold', bg: '#0d0b06', text: '#f59e0b', accent: '#fbbf24', border: 'rgba(245,158,11,0.25)', desc: 'Warm amber gold luxury streetwear' },
                  { id: 'mono', label: 'High-Contrast Mono', bg: '#000000', text: '#ffffff', accent: '#aaaaaa', border: 'rgba(255,255,255,0.2)', desc: 'Pure black & white minimalist typography' },
                  { id: 'custom', label: 'Custom Palette', bg: marqueeBgColor, text: marqueeTextColor, accent: marqueeAccentColor, border: marqueeBorderColor, desc: 'Pick your own custom colors with live preview' }
                ].map(t => {
                  const isSelected = marqueeTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectThemePreset(t.id)}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30' 
                          : 'border-[var(--line)] bg-[var(--bg-alt)] hover:border-[var(--text-dim)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-[var(--text)]">{t.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />}
                      </div>

                      {/* Color Preview Swatches */}
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.bg }} title="Background" />
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.text }} title="Text" />
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.accent }} title="Accent / Glow" />
                      </div>

                      <span className="text-[10px] text-[var(--text-dim)]">{t.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Pickers & Hex Inputs */}
              <div className="pt-4 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Background Color</label>
                  <div className="flex items-center gap-2 bg-[var(--bg-alt)] border border-[var(--line)] p-2 rounded-xl">
                    <input 
                      type="color" 
                      value={marqueeBgColor.startsWith('#') ? marqueeBgColor : '#08080a'} 
                      onChange={e => {
                        setMarqueeBgColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      className="w-7 h-7 rounded border border-[var(--line)] bg-transparent cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={marqueeBgColor} 
                      onChange={e => {
                        setMarqueeBgColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      className="w-full bg-transparent text-xs font-mono outline-none text-[var(--text)]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Text Color</label>
                  <div className="flex items-center gap-2 bg-[var(--bg-alt)] border border-[var(--line)] p-2 rounded-xl">
                    <input 
                      type="color" 
                      value={marqueeTextColor.startsWith('#') ? marqueeTextColor : '#8f9099'} 
                      onChange={e => {
                        setMarqueeTextColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      className="w-7 h-7 rounded border border-[var(--line)] bg-transparent cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={marqueeTextColor} 
                      onChange={e => {
                        setMarqueeTextColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      className="w-full bg-transparent text-xs font-mono outline-none text-[var(--text)]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Hover / Glow Accent</label>
                  <div className="flex items-center gap-2 bg-[var(--bg-alt)] border border-[var(--line)] p-2 rounded-xl">
                    <input 
                      type="color" 
                      value={marqueeAccentColor.startsWith('#') ? marqueeAccentColor : '#00f2fe'} 
                      onChange={e => {
                        setMarqueeAccentColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      className="w-7 h-7 rounded border border-[var(--line)] bg-transparent cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={marqueeAccentColor} 
                      onChange={e => {
                        setMarqueeAccentColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      className="w-full bg-transparent text-xs font-mono outline-none text-[var(--text)]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Border Color</label>
                  <div className="flex items-center gap-2 bg-[var(--bg-alt)] border border-[var(--line)] p-2 rounded-xl">
                    <input 
                      type="text" 
                      value={marqueeBorderColor} 
                      onChange={e => {
                        setMarqueeBorderColor(e.target.value);
                        setMarqueeTheme('custom');
                      }} 
                      placeholder="rgba(255,255,255,0.08)"
                      className="w-full bg-transparent text-xs font-mono outline-none text-[var(--text)]" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Motion & Badge Typography Style */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--accent)]" />
                <h4 className="font-display text-lg font-bold text-[var(--text)] uppercase">Motion Speed & Badge Style</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Speed Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Animation Speed</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['slow', 'normal', 'fast'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMarqueeSpeed(s)}
                        className={`p-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          marqueeSpeed === s 
                            ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' 
                            : 'bg-[var(--bg-alt)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]'
                        }`}
                      >
                        {s} ({s === 'slow' ? '45s' : s === 'normal' ? '28s' : '14s'})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direction Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Scroll Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMarqueeDirection('left')}
                      className={`p-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        marqueeDirection === 'left' 
                          ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' 
                          : 'bg-[var(--bg-alt)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]'
                      }`}
                    >
                      ← Left (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarqueeDirection('right')}
                      className={`p-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        marqueeDirection === 'right' 
                          ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' 
                          : 'bg-[var(--bg-alt)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]'
                      }`}
                    >
                      Right (Reverse) →
                    </button>
                  </div>
                </div>

                {/* Badge Style Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Badge Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'brackets', label: '[ TAG ]' },
                      { id: 'minimal', label: '• TAG •' },
                      { id: 'pills', label: '( TAG ) Pill' },
                      { id: 'outline', label: 'Box Outline' }
                    ].map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setMarqueeBadgeStyle(b.id as any)}
                        className={`p-2 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          marqueeBadgeStyle === b.id 
                            ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' 
                            : 'bg-[var(--bg-alt)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 5: Words / Tags Manager */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-[var(--text)] uppercase flex items-center gap-2">
                    <Type className="w-5 h-5 text-[var(--accent)]" /> Carousel Words & Tags ({marqueeTags.length})
                  </h4>
                  <p className="text-xs text-[var(--text-dim)]">Add, remove, or customize the phrases that continuously slide.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetMarqueeTags}
                  className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] border border-[var(--line)] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Reset to Streetwear Default
                </button>
              </div>

              {/* Active Tags Chips */}
              <div className="flex flex-wrap gap-2 p-4 bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl min-h-[80px] items-center">
                {marqueeTags.length === 0 ? (
                  <p className="text-xs text-[var(--text-dim)]">No tags in carousel. Add words below or click reset.</p>
                ) : (
                  marqueeTags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="group flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--line)] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-[var(--text)] transition-all hover:border-red-400/50 shadow-xs"
                    >
                      <span>[ {tag} ]</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMarqueeTag(index)}
                        className="text-[var(--text-dim)] hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Tag Input Form */}
              <form onSubmit={handleAddMarqueeTag} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMarqueeTag} 
                  onChange={e => setNewMarqueeTag(e.target.value)} 
                  placeholder="Type new word e.g. OVERSIZED, ACID WASH, 450 GSM..." 
                  className="flex-1 bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-xs font-mono uppercase text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                />
                <button 
                  type="submit" 
                  className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Word
                </button>
              </form>

              {/* Quick Add Suggestions */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">
                  Quick-Add Streetwear Tag Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "OVERSIZED", "BAGGY", "SLIM", "DISTRESSED", "WASHED", "RAW",
                    "HEAVYWEIGHT", "BOXY", "CROPPED", "VINTAGE FIT", "ACID WASH",
                    "DROP SHOULDER", "LIMITED RUN", "BIO WASHED", "450 GSM", "SMALL BATCH"
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleQuickAddTag(suggestion)}
                      disabled={marqueeTags.includes(suggestion)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-all cursor-pointer ${
                        marqueeTags.includes(suggestion)
                          ? 'opacity-40 border-transparent bg-white/5 text-[var(--text-dim)] cursor-default'
                          : 'border-[var(--line)] bg-[var(--bg-alt)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                      }`}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Tab 4: Categories Grid Navigation ═══════════════════════ */}
        {activeTab === 'grid' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Editorial Categories Accordions</h3>
                <p className="text-xs text-[var(--text-dim)]">Configure the expanding full-bleed strips.</p>
              </div>
              <button onClick={handleSaveGrid} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Grid Block
              </button>
            </div>

            <div className="space-y-4">
              {gridCategories.map((cat, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 relative space-y-4">
                  <button onClick={() => setGridCategories(gridCategories.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Category Title</label>
                      <input type="text" value={cat.title} onChange={e => {
                        const n = [...gridCategories];
                        n[idx].title = e.target.value;
                        setGridCategories(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Tag label</label>
                      <input type="text" value={cat.tag} onChange={e => {
                        const n = [...gridCategories];
                        n[idx].tag = e.target.value;
                        setGridCategories(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Path Link</label>
                      <input type="text" value={cat.link} onChange={e => {
                        const n = [...gridCategories];
                        n[idx].link = e.target.value;
                        setGridCategories(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Background Image URL</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={cat.bgImage} onChange={e => {
                          const n = [...gridCategories];
                          n[idx].bgImage = e.target.value;
                          setGridCategories(n);
                        }} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2 text-xs" />
                        <MediaUploader onUploadSuccess={url => {
                          const n = [...gridCategories];
                          n[idx].bgImage = url;
                          setGridCategories(n);
                        }} label="Upload" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setGridCategories([...gridCategories, { title: 'New Category', tag: 'Explore', bgImage: '', link: '/category/t-shirts' }])} className="w-full border border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] p-4 text-xs uppercase tracking-wider font-bold">+ Add Category Panel</button>
            </div>
          </div>
        )}

        {/* ══ Tab 5: Promo Offers ══════════════════════════════════════ */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Promotional Campaign Offers</h3>
                <p className="text-xs text-[var(--text-dim)]">Configure the full-bleed horizontal banners with timers.</p>
              </div>
              <button onClick={handleSaveOffers} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Offers
              </button>
            </div>

            <div className="space-y-4">
              {offers.map((offer, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 relative space-y-4">
                  <button onClick={() => setOffers(offers.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Offer Title</label>
                      <input type="text" value={offer.title} onChange={e => {
                        const n = [...offers];
                        n[idx].title = e.target.value;
                        setOffers(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Subtitle / Campaign</label>
                      <input type="text" value={offer.subtitle} onChange={e => {
                        const n = [...offers];
                        n[idx].subtitle = e.target.value;
                        setOffers(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Discount Tag (e.g. 20% OFF)</label>
                      <input type="text" value={offer.discount} onChange={e => {
                        const n = [...offers];
                        n[idx].discount = e.target.value;
                        setOffers(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Route Path Link</label>
                      <div className="flex gap-2">
                        <select 
                          value=""
                          className="bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] w-1/3 outline-none"
                          onChange={e => {
                            if(e.target.value) {
                              const n = [...offers];
                              n[idx].link = e.target.value;
                              setOffers(n);
                            }
                          }}
                        >
                          <option value="">Quick Select...</option>
                          <option value="/">Home Page</option>
                          <option value="/collections">All Collections</option>
                          {dbCategories.map(c => (
                            <option key={c.id} value={`/category/${c.slug}`}>Category: {c.name}</option>
                          ))}
                        </select>
                        <input type="text" value={offer.link} onChange={e => {
                          const n = [...offers];
                          n[idx].link = e.target.value;
                          setOffers(n);
                        }} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs outline-none" placeholder="Or type a custom link..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">End Time (Optional)</label>
                      <input type="datetime-local" value={offer.endTime || ''} onChange={e => {
                        const n = [...offers];
                        n[idx].endTime = e.target.value;
                        setOffers(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Promo Image</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={offer.bgImage} onChange={e => {
                          const n = [...offers];
                          n[idx].bgImage = e.target.value;
                          setOffers(n);
                        }} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2 text-xs" />
                        <MediaUploader onUploadSuccess={url => {
                          const n = [...offers];
                          n[idx].bgImage = url;
                          setOffers(n);
                        }} label="Upload" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setOffers([...offers, { title: 'Flash Sale', subtitle: 'Limited Time Drop', discount: '20% OFF', bgImage: '', link: '/category/jeans', accent: 'var(--accent)' }])} className="w-full border border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] p-4 text-xs uppercase tracking-wider font-bold">+ Add Offer Banner</button>
            </div>
          </div>
        )}

        {/* ══ Tab 6: Footer Navigation Config ══════════════════════════ */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Footer Columns Layout</h3>
                <p className="text-xs text-[var(--text-dim)]">Create up to 4 lists of footer navigation anchors.</p>
              </div>
              <button onClick={handleSaveFooter} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Footer Columns
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {footerCols.map((col, colIdx) => (
                <div key={colIdx} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--line)] pb-3">
                    <input type="text" value={col.title} onChange={e => {
                      const n = [...footerCols];
                      n[colIdx].title = e.target.value;
                      setFooterCols(n);
                    }} className="bg-transparent text-sm font-bold uppercase tracking-wider text-[var(--text)] outline-none border-b border-transparent focus:border-[var(--accent)]" />
                    <button onClick={() => setFooterCols(footerCols.filter((_, i) => i !== colIdx))} className="text-[var(--text-dim)] hover:text-red-400"><Trash2 className="w-4.5 h-4.5" /></button>
                  </div>

                  <div className="space-y-3">
                    {col.links.map((link, linkIdx) => (
                      <div key={linkIdx} className="bg-[var(--bg)] border border-[var(--line)] p-3 space-y-2 relative group">
                        <input type="text" value={link.label} onChange={e => {
                          const n = [...footerCols];
                          n[colIdx].links[linkIdx].label = e.target.value;
                          setFooterCols(n);
                        }} className="w-full bg-transparent text-xs text-[var(--text)] font-semibold outline-none" placeholder="Label" />
                        <input type="text" value={link.url} onChange={e => {
                          const n = [...footerCols];
                          n[colIdx].links[linkIdx].url = e.target.value;
                          setFooterCols(n);
                        }} className="w-full bg-transparent text-[10px] text-[var(--text-dim)] font-mono outline-none" placeholder="URL Link" />
                        
                        <button onClick={() => {
                          const n = [...footerCols];
                          n[colIdx].links = n[colIdx].links.filter((_, idx) => idx !== linkIdx);
                          setFooterCols(n);
                        }} className="absolute right-2 top-2 text-[var(--text-dim)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => {
                    const n = [...footerCols];
                    n[colIdx].links.push({ label: 'New Link', url: '/' });
                    setFooterCols(n);
                  }} className="w-full border border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] p-2 text-[10px] uppercase tracking-wider font-bold">+ Add Link</button>
                </div>
              ))}

              {footerCols.length < 4 && (
                <button onClick={() => setFooterCols([...footerCols, { title: 'NEW COLUMN', links: [] }])} className="border-2 border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] p-8 text-center uppercase tracking-wider font-bold min-h-[200px] flex flex-col items-center justify-center gap-2">
                  <Plus className="w-6 h-6" /> Add Column
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ Tab 7: Custom Print Lab ═══════════════════════════════════ */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Custom Print Blank Tees</h3>
                <p className="text-xs text-[var(--text-dim)]">Add available colors, hex values, and high-quality blank t-shirt mockup images.</p>
              </div>
              <button onClick={handleSavePrintColors} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Lab Options
              </button>
            </div>

            <div className="space-y-4">
              {printColors.map((color, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 relative space-y-4">
                  <button onClick={() => setPrintColors(printColors.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Color Name</label>
                      <input type="text" value={color.name} onChange={e => {
                        const n = [...printColors];
                        n[idx].name = e.target.value;
                        setPrintColors(n);
                      }} className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs" placeholder="e.g. Ink Black" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Color Hex Code</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={color.hex} onChange={e => {
                          const n = [...printColors];
                          n[idx].hex = e.target.value;
                          setPrintColors(n);
                        }} className="w-8 h-8 bg-transparent border-0 cursor-pointer shrink-0" />
                        <input type="text" value={color.hex} onChange={e => {
                          const n = [...printColors];
                          n[idx].hex = e.target.value;
                          setPrintColors(n);
                        }} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2 text-xs font-mono" placeholder="#000000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Mockup Image URL</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={color.image} onChange={e => {
                          const n = [...printColors];
                          n[idx].image = e.target.value;
                          setPrintColors(n);
                        }} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-2 text-xs" />
                        <MediaUploader onUploadSuccess={url => {
                          const n = [...printColors];
                          n[idx].image = url;
                          setPrintColors(n);
                        }} label="Upload" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setPrintColors([...printColors, { name: 'New Color', hex: '#ffffff', image: '' }])} className="w-full border border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] p-4 text-xs uppercase tracking-wider font-bold">+ Add Color Option</button>
            </div>
          </div>
        )}

        {/* ══ Tab 8: Dynamic Theme Colors ══════════════════════════════ */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Store Theme Customizer</h3>
                <p className="text-xs text-[var(--text-dim)]">Customize CSS variables dynamically to change the storefront aesthetic without code errors.</p>
              </div>
              <button onClick={handleSaveTheme} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Theme Colors
              </button>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
              
              {/* Theme Preset */}
              <div className="space-y-2 border-b border-[var(--line)] pb-6">
                <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Theme Preset (Global Aesthetic)</label>
                <select 
                  value={themePreset} 
                  onChange={e => {
                    const preset = e.target.value;
                    setThemePreset(preset);
                    if (preset === 'ink') {
                      setThemeAccent('#C9A227'); setThemeBg('#0B0B0D'); setThemeBgAlt('#131316'); setThemeBgCard('#17171B'); setThemeText('#EDEAE8'); setThemeTextDim('#8E8B85'); setThemeLine('rgba(237,234,232,0.12)');
                    } else if (preset === 'bone') {
                      setThemeAccent('#1B3A5C'); setThemeBg('#EDEAE8'); setThemeBgAlt('#E2DED6'); setThemeBgCard('#F5F3EF'); setThemeText('#15140F'); setThemeTextDim('#6B675F'); setThemeLine('rgba(21,20,15,0.14)');
                    } else if (preset === 'current') {
                      setThemeAccent('#C9A227'); setThemeBg('#0F2032'); setThemeBgAlt('#152A40'); setThemeBgCard('#182E46'); setThemeText('#EAEFF4'); setThemeTextDim('#8FA3B5'); setThemeLine('rgba(234,239,244,0.14)');
                    } else if (preset === 'bubble') {
                      setThemeAccent('#FF9EBB'); setThemeBg('#FAEDF0'); setThemeBgAlt('#F4D9E1'); setThemeBgCard('#FFFFFF'); setThemeText('#4A4A4A'); setThemeTextDim('#888888'); setThemeLine('rgba(255,158,187,0.3)');
                    } else if (preset === 'y2k-grid') {
                      setThemeAccent('#6EA4E2'); setThemeBg('#F5F5F0'); setThemeBgAlt('#FFFFFF'); setThemeBgCard('#FFFFFF'); setThemeText('#050505'); setThemeTextDim('#555555'); setThemeLine('#D1D1D1');
                    }
                  }}
                  className="w-full md:w-1/2 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="ink">Ink (Dark Luxury)</option>
                  <option value="bone">Bone (Light Luxury)</option>
                  <option value="current">Current (Deep Blue)</option>
                  <option value="bubble">Bubble (Pink Y2K)</option>
                  <option value="y2k-grid">Y2K Grid (Brutalist Graffiti)</option>
                </select>
                <p className="text-[10px] text-[var(--text-dim)] mt-2">Selecting a preset changes the core aesthetic of the storefront.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Accent Color (Branding)</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={themeAccent} onChange={e => setThemeAccent(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer shrink-0" />
                    <input type="text" value={themeAccent} onChange={e => setThemeAccent(e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none" />
                  </div>
                </div>

                {/* Primary Text Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Primary Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={themeText} onChange={e => setThemeText(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer shrink-0" />
                    <input type="text" value={themeText} onChange={e => setThemeText(e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none" />
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Primary Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={themeBg} onChange={e => setThemeBg(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer shrink-0" />
                    <input type="text" value={themeBg} onChange={e => setThemeBg(e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none" />
                  </div>
                </div>

                {/* Text Dim Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Dimmed Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={themeTextDim} onChange={e => setThemeTextDim(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer shrink-0" />
                    <input type="text" value={themeTextDim} onChange={e => setThemeTextDim(e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none" />
                  </div>
                </div>

                {/* Alt Background Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Secondary Background Color (Alt)</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={themeBgAlt} onChange={e => setThemeBgAlt(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer shrink-0" />
                    <input type="text" value={themeBgAlt} onChange={e => setThemeBgAlt(e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none" />
                  </div>
                </div>

                {/* Border/Line Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Border / Grid-Line Color</label>
                  <input type="text" value={themeLine} onChange={e => setThemeLine(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--line)] p-3.5 text-xs font-mono text-[var(--text)] outline-none" placeholder="e.g. rgba(255,255,255,0.1) or #222" />
                </div>

                {/* Card Background Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Card Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={themeBgCard} onChange={e => setThemeBgCard(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer shrink-0" />
                    <input type="text" value={themeBgCard} onChange={e => setThemeBgCard(e.target.value)} className="flex-1 bg-[var(--bg)] border border-[var(--line)] p-3 text-xs font-mono text-[var(--text)] outline-none" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ══ Tab 9: New Drops ═════════════════════════════════════════ */}
        {activeTab === 'newdrops' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[var(--line)] pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">New Drops Carousel</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] mt-1">Select exactly 8 products to feature. If left empty, the 8 newest products are auto-selected.</p>
                </div>
                <button onClick={handleSaveNewDrops} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-5 py-2 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1 shrink-0">
                  <Save className="w-3.5 h-3.5" /> Save Section
                </button>
              </div>
              
              <div className="space-y-3">
                {newDrops.map((slug, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-[var(--bg)] border border-[var(--line)] p-3">
                    <div className="font-mono text-[9px] text-[var(--text-dim)] uppercase tracking-widest w-12 shrink-0">SLOT 0{idx + 1}</div>
                    <select 
                      value={slug} 
                      onChange={e => {
                        const newArr = [...newDrops];
                        newArr[idx] = e.target.value;
                        setNewDrops(newArr);
                      }} 
                      className="flex-1 bg-transparent border-none text-xs font-bold text-[var(--text)] outline-none cursor-pointer"
                    >
                      <option value="">-- Auto-select from latest --</option>
                      {dbProducts.map(p => (
                        <option key={p.slug} value={p.slug}>{p.title} (₹{p.base_price})</option>
                      ))}
                    </select>
                    <button onClick={() => setNewDrops(newDrops.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">Remove</button>
                  </div>
                ))}
                
                {newDrops.length < 8 && (
                  <button 
                    onClick={() => setNewDrops([...newDrops, ''])} 
                    className="w-full border border-dashed border-[var(--line)] py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors"
                  >
                    + Assign Manual Product ({8 - newDrops.length} slots remain)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ Tab Bestsellers ═════════════════════════════════════════ */}
        {activeTab === 'bestsellers' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[var(--line)] pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Bestsellers Carousel</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] mt-1">Select up to 16 products to feature as Bestsellers. If left empty, latest products are featured.</p>
                </div>
                <button onClick={handleSaveBestsellers} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-5 py-2 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1 shrink-0">
                  <Save className="w-3.5 h-3.5" /> Save Section
                </button>
              </div>
              
              <div className="space-y-3">
                {bestsellers.map((slug, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-[var(--bg)] border border-[var(--line)] p-3">
                    <div className="font-mono text-[9px] text-[var(--text-dim)] uppercase tracking-widest w-12 shrink-0">SLOT 0{idx + 1}</div>
                    <select 
                      value={slug} 
                      onChange={e => {
                        const newArr = [...bestsellers];
                        newArr[idx] = e.target.value;
                        setBestsellers(newArr);
                      }} 
                      className="flex-1 bg-transparent border-none text-xs font-bold text-[var(--text)] outline-none cursor-pointer"
                    >
                      <option value="">-- Select Product --</option>
                      {dbProducts.map(p => (
                        <option key={p.slug} value={p.slug}>{p.title} (₹{p.base_price})</option>
                      ))}
                    </select>
                    <button onClick={() => setBestsellers(bestsellers.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">Remove</button>
                  </div>
                ))}
                
                {bestsellers.length < 16 && (
                  <button 
                    onClick={() => setBestsellers([...bestsellers, ''])} 
                    className="w-full border border-dashed border-[var(--line)] py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors"
                  >
                    + Assign Manual Product ({16 - bestsellers.length} slots remain)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ Tab 10: Reels / TikToks ═══════════════════════════════════ */}
        {activeTab === 'reels' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[var(--line)] pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">Shoppable Reels & TikToks</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] mt-1">Manage vertical videos shown on the storefront homepage.</p>
                </div>
                <button onClick={handleSaveReels} disabled={savingTab} className="bg-[var(--accent)] text-[var(--bg)] font-bold px-5 py-2 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1 shrink-0">
                  <Save className="w-3.5 h-3.5" /> Save Section
                </button>
              </div>
              
              <div className="space-y-6">
                {reels.map((reel, idx) => (
                  <div key={reel.id || idx} className="bg-[var(--bg)] border border-[var(--line)] p-4 flex flex-col md:flex-row gap-6 relative">
                    <button onClick={() => setReels(reels.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">Remove Reel</button>
                    
                    <div className="w-full md:w-32 aspect-[9/16] bg-[var(--bg-alt)] border border-[var(--line)] overflow-hidden shrink-0 relative">
                      {reel.videoUrl ? (
                        <video src={reel.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-[var(--text-dim)] uppercase text-center p-2">No Video</div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5">Reel Title</label>
                        <input type="text" value={reel.title || ''} onChange={e => {
                          const n = [...reels]; n[idx].title = e.target.value; setReels(n);
                        }} className="w-full bg-[var(--bg-card)] border border-[var(--line)] p-2 text-sm text-[var(--text)] outline-none" placeholder="e.g. Dyeing Process Vol 4" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5">Video URL (.mp4 / vertical)</label>
                        <div className="flex flex-col gap-2">
                          <input type="text" value={reel.videoUrl || ''} onChange={e => {
                            const n = [...reels]; n[idx].videoUrl = e.target.value; setReels(n);
                          }} className="w-full bg-[var(--bg-card)] border border-[var(--line)] p-2 text-sm font-mono text-[var(--text)] outline-none" placeholder="https://..." />
                          <MediaUploader 
                            label="Upload Reel Video"
                            onUploadSuccess={(url) => {
                              const n = [...reels]; n[idx].videoUrl = url; setReels(n);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5">Linked Product Catalog (Shoppable Link)</label>
                        <select value={reel.productSlug || ''} onChange={e => {
                          const n = [...reels]; n[idx].productSlug = e.target.value; setReels(n);
                        }} className="w-full bg-[var(--bg-card)] border border-[var(--line)] p-2 text-sm text-[var(--text)] outline-none">
                          <option value="">-- Select Product --</option>
                          {dbProducts.map(p => (
                            <option key={p.slug} value={p.slug}>{p.title} (₹{p.base_price})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => setReels([...reels, { id: `mock-${Date.now()}`, title: '', videoUrl: '', productSlug: '' }])} 
                  className="w-full border border-dashed border-[var(--line)] py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors"
                >
                  + Add New Reel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ Tab: Showcase Page & Product Curator ════════════════════ */}
        {activeTab === 'showcase' && (
          <div className="space-y-8">
            
            {/* Top Control Bar & Live Links */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">
                    Showcase Page & Product Curator
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[var(--accent)] text-[var(--bg)]">
                    Live Route: /showcase
                  </span>
                </div>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Manage hero 3D scroll reveal collage, custom page headlines, and explicitly choose & order which products appear on the Showcase page.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <a 
                  href="/showcase" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-white hover:border-white/40 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View /showcase
                </a>
                <button 
                  type="button" 
                  onClick={handleSaveShowcaseFull} 
                  disabled={savingTab} 
                  className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2.5 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5 shrink-0 shadow-lg"
                >
                  {savingTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Showcase Live
                </button>
              </div>
            </div>

            {/* Section 1: Showcase Display Mode & Headlines */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
                <LayoutTemplate className="w-4 h-4 text-[var(--accent)]" />
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text)]">
                  1. Showcase Mode & Editorial Branding
                </h4>
              </div>

              {/* Mode Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setShowcaseMode('custom')}
                  className={`p-4 border cursor-pointer transition-all ${showcaseMode === 'custom' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--text-dim)]'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="radio" 
                      name="showcase_mode" 
                      checked={showcaseMode === 'custom'} 
                      onChange={() => setShowcaseMode('custom')}
                      className="accent-[var(--accent)]"
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--text)]">
                      Curated Manual Selection (Recommended)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] pl-5">
                    Explicitly select which products appear, reorder them, and assign custom marketing badges (e.g. &quot;LIMITED STOCK&quot;, &quot;NEW&quot;, &quot;BESTSELLER&quot;).
                  </p>
                </div>

                <div 
                  onClick={() => setShowcaseMode('all')}
                  className={`p-4 border cursor-pointer transition-all ${showcaseMode === 'all' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--text-dim)]'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="radio" 
                      name="showcase_mode" 
                      checked={showcaseMode === 'all'} 
                      onChange={() => setShowcaseMode('all')}
                      className="accent-[var(--accent)]"
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--text)]">
                      All Active Products (Auto Catalog)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] pl-5">
                    Automatically display all active catalog products in chronological order of newest creation.
                  </p>
                </div>
              </div>

              {/* Editorial Texts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">
                    Eyebrow / Category Tag
                  </label>
                  <input 
                    type="text" 
                    value={showcaseEyebrow} 
                    onChange={e => setShowcaseEyebrow(e.target.value)}
                    placeholder="e.g. VANGUARD SERIES or EDITORIAL 2026"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">
                    Main Headline Title
                  </label>
                  <input 
                    type="text" 
                    value={showcaseHeadline} 
                    onChange={e => setShowcaseHeadline(e.target.value)}
                    placeholder="e.g. FEATURED PIECES"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)] font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">
                    Showcase Subtitle / Editorial Lede
                  </label>
                  <textarea 
                    rows={2}
                    value={showcaseSubtitle} 
                    onChange={e => setShowcaseSubtitle(e.target.value)}
                    placeholder="e.g. EXPLORE THE LATEST DROPS FROM OUR VANGUARD COLLECTION. ENGINEERED FOR THE NEW ERA."
                    className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">
                    Bottom CTA Button Text
                  </label>
                  <input 
                    type="text" 
                    value={showcaseCtaText} 
                    onChange={e => setShowcaseCtaText(e.target.value)}
                    placeholder="e.g. VIEW ALL COLLECTIONS"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">
                    Bottom CTA Destination Link
                  </label>
                  <input 
                    type="text" 
                    value={showcaseCtaLink} 
                    onChange={e => setShowcaseCtaLink(e.target.value)}
                    placeholder="e.g. /collections or /category/all"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Which Products to List on Showcase */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[var(--accent)]" />
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text)]">
                    2. Showcase Products List & Order ({showcaseSelectedProducts.length} Items Configured)
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handleResetShowcaseProducts}
                    className="px-3 py-1.5 border border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-white hover:border-white/30"
                  >
                    Reset (Top 8 Catalog)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowcaseSelectedProducts([])}
                    className="px-3 py-1.5 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Quick Add & Filter Bar */}
              <div className="bg-[var(--bg)] border border-[var(--line)] p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input 
                      type="text" 
                      value={showcaseProductSearch} 
                      onChange={e => setShowcaseProductSearch(e.target.value)}
                      placeholder="Search catalog products by name or slug to add..."
                      className="w-full bg-[var(--bg-card)] border border-[var(--line)] pl-9 pr-3 py-2 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                      value={showcaseCategoryFilter}
                      onChange={e => setShowcaseCategoryFilter(e.target.value)}
                      className="bg-[var(--bg-card)] border border-[var(--line)] px-3 py-2 text-xs text-[var(--text)] font-mono outline-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {dbCategories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filtered Catalog Picker Dropdown */}
                {(() => {
                  const filtered = dbProducts.filter(p => {
                    const matchesSearch = !showcaseProductSearch || 
                      p.title?.toLowerCase().includes(showcaseProductSearch.toLowerCase()) ||
                      p.slug?.toLowerCase().includes(showcaseProductSearch.toLowerCase());
                    const matchesCat = showcaseCategoryFilter === 'all' || 
                      p.categories?.slug === showcaseCategoryFilter ||
                      p.categories?.name?.toLowerCase().includes(showcaseCategoryFilter.toLowerCase());
                    return matchesSearch && matchesCat;
                  });

                  return (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                          Click any product below to instantly add to Showcase:
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">
                          {filtered.length} products available
                        </span>
                      </div>

                      <div className="max-h-56 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pr-1">
                        {filtered.slice(0, 16).map(p => {
                          const isAlreadyAdded = showcaseSelectedProducts.some(sp => sp.slug === p.slug);
                          const thumb = (p.images && p.images[0]) || p.overlay_mask_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop';
                          
                          return (
                            <button
                              key={p.slug}
                              type="button"
                              onClick={() => handleAddShowcaseProduct(p.slug, 'NEW')}
                              disabled={isAlreadyAdded}
                              className={`flex items-center gap-2 p-2 border text-left transition-all ${
                                isAlreadyAdded 
                                  ? 'opacity-40 border-[var(--line)] bg-[var(--bg-card)] cursor-not-allowed' 
                                  : 'border-[var(--line)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer'
                              }`}
                            >
                              <img src={thumb} alt={p.title} className="w-10 h-10 object-cover shrink-0 bg-neutral-900 border border-[var(--line)]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-[var(--text)] truncate">{p.title}</p>
                                <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] font-mono mt-0.5">
                                  <span>₹{Number(p.base_price || p.price || 0).toLocaleString('en-IN')}</span>
                                  {isAlreadyAdded ? (
                                    <span className="text-[var(--accent)] font-bold">Added</span>
                                  ) : (
                                    <span className="text-[var(--text-dim)] group-hover:text-white">+ Add</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* 1-Click Category Batch Helpers */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--line)]">
                        <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mr-1">
                          Quick Add Category:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddAllCategoryToShowcase('polo')}
                          className="px-2.5 py-1 text-[10px] font-mono border border-[var(--line)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-white hover:border-white/30"
                        >
                          + All Polo Shirts
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddAllCategoryToShowcase('tee')}
                          className="px-2.5 py-1 text-[10px] font-mono border border-[var(--line)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-white hover:border-white/30"
                        >
                          + All T-Shirts
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddAllCategoryToShowcase('jean')}
                          className="px-2.5 py-1 text-[10px] font-mono border border-[var(--line)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-white hover:border-white/30"
                        >
                          + All Jeans
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddAllCategoryToShowcase('all')}
                          className="px-2.5 py-1 text-[10px] font-mono border border-[var(--line)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-white hover:border-white/30"
                        >
                          + Add Entire Catalog
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Active Selected Products List & Ordering */}
              <div>
                <h5 className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider mb-3">
                  Current Showcase Products Order ({showcaseSelectedProducts.length} Items):
                </h5>

                {showcaseSelectedProducts.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[var(--line)] bg-[var(--bg)] space-y-2">
                    <Package className="w-8 h-8 mx-auto text-[var(--text-dim)]" />
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
                      No Products Selected For Showcase
                    </p>
                    <p className="text-[11px] text-[var(--text-dim)] max-w-md mx-auto">
                      Click the &quot;Reset (Top 8 Catalog)&quot; button or search products above to add them to the Showcase grid.
                    </p>
                    <button 
                      type="button"
                      onClick={handleResetShowcaseProducts}
                      className="mt-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg)] text-xs font-bold uppercase tracking-wider"
                    >
                      Populate with 8 Catalog Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {showcaseSelectedProducts.map((item, index) => {
                      const prod = dbProducts.find(p => p.slug === item.slug);
                      const thumb = (prod?.images && prod.images[0]) || prod?.overlay_mask_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop';
                      const title = prod?.title || item.slug;
                      const price = prod?.base_price ?? prod?.price ?? 0;
                      const category = prod?.categories?.name || 'Streetwear';

                      return (
                        <div 
                          key={`${item.slug}-${index}`}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[var(--bg)] border border-[var(--line)] hover:border-white/20 transition-all"
                        >
                          {/* Left: Position & Thumbnail & Info */}
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <span className="font-mono text-xs font-bold text-[var(--text-dim)] w-7 shrink-0 text-center">
                              0{index + 1}
                            </span>
                            
                            <img 
                              src={thumb} 
                              alt={title} 
                              className="w-12 h-12 object-cover bg-neutral-900 border border-[var(--line)] shrink-0 rounded-none" 
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h6 className="text-xs font-bold text-[var(--text)] uppercase tracking-wide truncate">
                                  {title}
                                </h6>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text-dim)] uppercase shrink-0">
                                  {category}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[var(--text-dim)]">
                                <span>₹{Number(price).toLocaleString('en-IN')}</span>
                                <span className="text-[10px] text-neutral-500 truncate font-mono">slug: {item.slug}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Badge Customizer & Reorder Buttons */}
                          <div className="flex items-center gap-2 shrink-0 pl-10 md:pl-0">
                            {/* Badge Selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                                Badge:
                              </span>
                              <select
                                value={item.badge || 'NEW'}
                                onChange={e => handleUpdateShowcaseBadge(index, e.target.value)}
                                className="bg-[var(--bg-card)] border border-[var(--line)] px-2 py-1 text-[10px] font-mono text-[var(--text)] outline-none"
                              >
                                <option value="NEW">NEW</option>
                                <option value="LIMITED STOCK">LIMITED STOCK</option>
                                <option value="BESTSELLER">BESTSELLER</option>
                                <option value="FEATURED">FEATURED</option>
                                <option value="ICONIC DROP">ICONIC DROP</option>
                                <option value="ARCHIVE">ARCHIVE</option>
                                <option value="CUSTOM">Custom Text...</option>
                              </select>

                              {item.badge && !['NEW', 'LIMITED STOCK', 'BESTSELLER', 'FEATURED', 'ICONIC DROP', 'ARCHIVE'].includes(item.badge) && (
                                <input 
                                  type="text" 
                                  value={item.badge} 
                                  onChange={e => handleUpdateShowcaseBadge(index, e.target.value)}
                                  placeholder="Badge text"
                                  className="w-24 bg-[var(--bg-card)] border border-[var(--line)] px-2 py-1 text-[10px] font-mono text-[var(--text)] outline-none"
                                />
                              )}
                            </div>

                            {/* Move Up Button */}
                            <button
                              type="button"
                              onClick={() => handleMoveShowcaseProductUp(index)}
                              disabled={index === 0}
                              title="Move Up"
                              className={`p-1.5 border border-[var(--line)] text-xs transition-colors ${
                                index === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:text-white text-[var(--text-dim)]'
                              }`}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down Button */}
                            <button
                              type="button"
                              onClick={() => handleMoveShowcaseProductDown(index)}
                              disabled={index === showcaseSelectedProducts.length - 1}
                              title="Move Down"
                              className={`p-1.5 border border-[var(--line)] text-xs transition-colors ${
                                index === showcaseSelectedProducts.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:text-white text-[var(--text-dim)]'
                              }`}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveShowcaseProduct(index)}
                              title="Remove from showcase"
                              className="p-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: 3D Reveal Collage Hero Banners (4 Quadrants) */}
            <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--line)] pb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                  <div>
                    <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text)]">
                      3. Hero 3D Scroll Reveal Collage Media (4 Quadrants - Images & Videos)
                    </h4>
                    <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                      Configure the 4 expanding collage images/videos displayed on the <strong>/showcase</strong> page during 3D scroll reveal.
                      If left blank, the system uses the 4 newest products from your catalog.
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowcaseImages(['', '', '', ''])} 
                  className="px-4 py-2 border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-white shrink-0"
                >
                  Reset Quadrants to Catalog
                </button>
              </div>

              {/* 4 Quadrants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { index: 0, label: 'Quadrant 1: Top-Left Media', desc: 'Expands towards top-left on scroll' },
                  { index: 1, label: 'Quadrant 2: Top-Right Media', desc: 'Expands towards top-right on scroll' },
                  { index: 2, label: 'Quadrant 3: Bottom-Left Media', desc: 'Expands towards bottom-left on scroll' },
                  { index: 3, label: 'Quadrant 4: Bottom-Right Media', desc: 'Expands towards bottom-right on scroll' },
                ].map(({ index, label, desc }) => {
                  const currentUrl = showcaseImages[index] || '';
                  const fallbackProduct = dbProducts[index];
                  const fallbackUrl = (fallbackProduct?.images && fallbackProduct.images[0]) || fallbackProduct?.overlay_mask_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop';
                  const activeDisplayUrl = currentUrl || fallbackUrl;

                  return (
                    <div key={index} className="bg-[var(--bg)] border border-[var(--line)] p-5 space-y-4 rounded-none">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-xs uppercase tracking-wider text-[var(--text)]">{label}</h5>
                          <p className="text-[10px] text-[var(--text-dim)] mt-0.5">{desc}</p>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text-dim)] uppercase">
                          Slot 0{index + 1}
                        </span>
                      </div>

                      {/* Image/Video Preview */}
                      <div className="w-full aspect-[4/5] bg-[var(--bg-alt)] border border-[var(--line)] relative overflow-hidden group">
                        {isVideoUrl(activeDisplayUrl) ? (
                          <video 
                            src={activeDisplayUrl} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                          />
                        ) : (
                          <img 
                            src={activeDisplayUrl} 
                            alt={label} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="text-white text-xs font-mono tracking-widest uppercase bg-black/80 px-3 py-1.5 border border-white/20">
                            {currentUrl ? 'Custom Media Active' : `Default: ${fallbackProduct?.title || 'Catalog Item'}`}
                          </span>
                        </div>
                      </div>

                      {/* Input & Uploader Controls */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">Media (Image/Video) URL</label>
                          <input 
                            type="text" 
                            value={currentUrl} 
                            onChange={e => updateShowcaseImage(index, e.target.value)} 
                            placeholder="Paste image/video URL (https://...)" 
                            className="w-full bg-[var(--bg-card)] border border-[var(--line)] p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)]" 
                          />
                        </div>

                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <MediaUploader 
                              label="Upload Image/Video" 
                              onUploadSuccess={(url) => updateShowcaseImage(index, url)} 
                            />
                          </div>
                          {currentUrl && (
                            <button 
                              type="button" 
                              onClick={() => updateShowcaseImage(index, '')} 
                              className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-red-500/20 hover:bg-red-500/10" 
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--line)] flex justify-between items-center">
              <div className="text-xs text-[var(--text-dim)]">
                Ready to publish changes to the live <strong>/showcase</strong> page?
              </div>
              <button 
                type="button" 
                onClick={handleSaveShowcaseFull} 
                disabled={savingTab} 
                className="bg-[var(--accent)] text-[var(--bg)] font-bold px-8 py-3 text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-2 shadow-xl"
              >
                {savingTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Showcase Settings
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
