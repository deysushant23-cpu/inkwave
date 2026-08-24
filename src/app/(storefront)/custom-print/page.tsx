'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Upload, 
  ShoppingBag, 
  RotateCcw, 
  AlertTriangle, 
  RefreshCcw, 
  Lock, 
  Unlock, 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Camera, 
  Check, 
  Compass, 
  Layers, 
  Tag,
  Plus,
  Trash2,
  Sliders,
  Flame,
  Palette,
  Wand2,
  Bell,
  ArrowRight,
  Construction,
  ShieldAlert
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  generateTextDecal, 
  applyPrintFinishTexture, 
  GraphicLayer,
  PrintFinish, 
  PLACEMENT_PRESETS, 
  STREETWEAR_FONTS, 
  INK_COLORS 
} from '@/lib/customPrintHelpers';

interface ColorPreset {
  name: string;
  hex: string;
  image: string;
}

const DEFAULT_COLORS: ColorPreset[] = [
  { name: 'Pure White', hex: '#ffffff', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Ink Black', hex: '#111111', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Charcoal Grey', hex: '#27272a', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Sand Beige', hex: '#d4c5b9', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Crimson Red', hex: '#b31a1a', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Washed Navy', hex: '#1e293b', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Light Pink', hex: '#ffc0cb', image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Sage Green', hex: '#90ee90', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1000&auto=format&fit=crop' }
];

/* ── Streetwear SVG Print Presets ───────────────────────────────────────── */
const STOCK_PRINTS = [
  {
    name: 'Gothic Brand',
    description: 'Minimalist editorial label',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><text x="50" y="45" font-family="serif" font-weight="900" font-size="16" fill="white" text-anchor="middle" letter-spacing="2">INKWAVE</text><line x1="20" y1="55" x2="80" y2="55" stroke="white" stroke-width="1.5" /><text x="50" y="70" font-family="monospace" font-size="6" fill="white" text-anchor="middle" letter-spacing="1">STUDIO LAB</text></svg>`
  },
  {
    name: 'Cyber Skull',
    description: 'High-contrast graphic badge',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="40" fill="none" stroke="white" stroke-width="2"/><circle cx="42" cy="38" r="4" fill="white"/><circle cx="58" cy="38" r="4" fill="white"/><path d="M45 50 h10 v4 h-10 z" fill="white"/><text x="50" y="78" font-family="monospace" font-size="7" fill="white" text-anchor="middle" letter-spacing="1.5">LIMITED EDITION</text></svg>`
  },
  {
    name: 'Tokyo Typo',
    description: 'Retro futuristic typography',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><text x="50" y="40" font-family="sans-serif" font-weight="900" font-size="26" fill="white" text-anchor="middle" letter-spacing="-1">TOKYO</text><text x="50" y="65" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle" letter-spacing="4">SOUL</text><text x="50" y="80" font-family="monospace" font-size="5" fill="white" text-anchor="middle" opacity="0.6">SMALL BATCH RUN 04</text></svg>`
  },
  {
    name: 'Aesthetic Wave',
    description: 'Clean geometry wave lineart',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="1.5"/><path d="M25 50 Q37.5 35 50 50 T75 50" fill="none" stroke="white" stroke-width="2"/><text x="50" y="92" font-family="monospace" font-size="6" fill="white" text-anchor="middle" letter-spacing="1">AUTHENTIC STREETWEAR</text></svg>`
  }
];

// Canvas-based chroma key background remover
const removeImageBackground = (base64Image: string, tolerance: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Image);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const corners = [
        [data[0], data[1], data[2]],
        [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]],
        [data[data.length - canvas.width * 4], data[data.length - canvas.width * 4 + 1], data[data.length - canvas.width * 4 + 2]],
        [data[data.length - 4], data[data.length - 3], data[data.length - 2]]
      ];

      let rBg = 0, gBg = 0, bBg = 0;
      corners.forEach(c => {
        rBg += c[0];
        gBg += c[1];
        bBg += c[2];
      });
      rBg = Math.round(rBg / 4);
      gBg = Math.round(gBg / 4);
      bBg = Math.round(bBg / 4);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        const dist = Math.sqrt(
          Math.pow(r - rBg, 2) +
          Math.pow(g - gBg, 2) +
          Math.pow(b - bBg, 2)
        );

        if (dist < tolerance) {
          data[i+3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64Image);
  });
};

// Import R3F Canvas dynamically with SSR disabled
const CustomPrintCanvas = dynamic(
  () => import('@/components/storefront/CustomPrintCanvas'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full min-h-[350px] lg:min-h-[520px] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-xs uppercase tracking-widest gap-2">
        <RefreshCcw className="w-5 h-5 animate-spin" /> Loading 3D WebGL Studio...
      </div>
    )
  }
);

export default function CustomPrintStudio() {
  const [activeTab, setActiveTab] = useState<'graphics' | 'typography'>('graphics');
  const [cameraView, setCameraView] = useState<'front' | 'back'>('front');

  // Garment Base Color & Size Config (Prominently Accessible Everywhere)
  const [colors, setColors] = useState<ColorPreset[]>(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState<ColorPreset>(DEFAULT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [customLabel, setCustomLabel] = useState('DESIGNED BY SUSHANT');

  // ─── 1. MULTI-GRAPHIC LAYERS STATE (Both Sides Supported) ─────────────────
  const [graphics, setGraphics] = useState<GraphicLayer[]>([
    {
      id: 'layer-1',
      name: 'Gothic Brand',
      url: STOCK_PRINTS[0].url,
      processedUrl: STOCK_PRINTS[0].url,
      side: 'front',
      x: 0,
      y: 38,
      scale: 48,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-1');

  // ─── 2. TYPOGRAPHY STATE (Front-Only as required) ─────────────────────────
  const [typographyEnabled, setTypographyEnabled] = useState(true);
  const [customText, setCustomText] = useState('INKWAVE TOKYO');
  const [customSubtext, setCustomSubtext] = useState('EDITION 01 // 2026');
  const [selectedFont, setSelectedFont] = useState(STREETWEAR_FONTS[0].family);
  const [fontSize, setFontSize] = useState(72); // Custom Sizing Control
  const [selectedTextColor, setSelectedTextColor] = useState(INK_COLORS[0].hex);
  const [isCurvedText, setIsCurvedText] = useState(false);
  const [isOutlineText, setIsOutlineText] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(4);
  const [typographyX, setTypographyX] = useState(0);
  const [typographyY, setTypographyY] = useState(25);
  const [typographyScale, setTypographyScale] = useState(42);
  const [typographyRotate, setTypographyRotate] = useState(0);
  const [typographyTexture, setTypographyTexture] = useState<string | null>(null);

  // States
  const [adding, setAdding] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isPrintLabEnabled, setIsPrintLabEnabled] = useState<boolean>(true);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(true);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  const { addItem, setCartDrawerOpen } = useCartStore();
  const supabase = createClient();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const activeGraphic = graphics.find(g => g.id === selectedLayerId) || graphics[0];

  // Fetch color presets & store settings from DB
  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, settingsRes] = await Promise.all([
          (supabase.from('cms_sections') as any)
            .select('json_content')
            .eq('section_key', 'custom_print_config')
            .single(),
          (supabase.from('cms_sections') as any)
            .select('json_content')
            .eq('section_key', 'store_settings')
            .single()
        ]);

        if (configRes.data?.json_content?.colors && configRes.data.json_content.colors.length > 0) {
          setColors(configRes.data.json_content.colors);
          setSelectedColor(configRes.data.json_content.colors[0]);
        }

        if (settingsRes.data?.json_content) {
          if (settingsRes.data.json_content.print_lab_enabled === false) {
            setIsPrintLabEnabled(false);
          } else {
            setIsPrintLabEnabled(true);
          }
        }
      } catch (err) {
        console.error('Failed to load print lab configuration:', err);
      } finally {
        setIsConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsNotifying(true);
    setTimeout(() => {
      toast.success("You're on the VIP list! We'll notify you the moment 3D Print Lab reopens.");
      setNotifyEmail('');
      setIsNotifying(false);
    }, 600);
  };

  // Update Typography Decal
  useEffect(() => {
    if (!typographyEnabled || !customText.trim()) {
      setTypographyTexture(null);
      return;
    }

    generateTextDecal({
      text: customText,
      fontFamily: selectedFont,
      fontSize,
      color: selectedTextColor,
      letterSpacing,
      isCurved: isCurvedText,
      isOutline: isOutlineText,
      subtext: customSubtext
    }).then((dataUrl) => {
      setTypographyTexture(dataUrl);
    });
  }, [typographyEnabled, customText, customSubtext, selectedFont, fontSize, selectedTextColor, isCurvedText, isOutlineText, letterSpacing]);

  // Re-process active graphic textures
  const updateGraphicProperty = async (id: string, updates: Partial<GraphicLayer>) => {
    setGraphics(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, ...updates };
    }));

    if (updates.url || updates.finish || updates.removeBg !== undefined || updates.bgTolerance !== undefined) {
      const target = graphics.find(g => g.id === id);
      if (!target) return;

      const merged = { ...target, ...updates };
      let current = merged.url;

      if (merged.removeBg) {
        current = await removeImageBackground(merged.url, merged.bgTolerance);
      }
      const processed = await applyPrintFinishTexture(current, merged.finish);

      setGraphics(prev => prev.map(item => item.id === id ? { ...item, processedUrl: processed } : item));
    }
  };

  // Add a new graphic layer
  const handleAddNewGraphic = (stockIndex = 1) => {
    const stock = STOCK_PRINTS[stockIndex % STOCK_PRINTS.length];
    const newId = `layer-${Date.now()}`;
    const newLayer: GraphicLayer = {
      id: newId,
      name: `Graphic #${graphics.length + 1} (${cameraView === 'back' ? 'Back' : 'Front'})`,
      url: stock.url,
      processedUrl: stock.url,
      side: cameraView,
      x: 0,
      y: 38,
      scale: 45,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    };

    setGraphics(prev => [...prev, newLayer]);
    setSelectedLayerId(newId);
    toast.success(`Added ${newLayer.name} to the 3D canvas!`);
  };

  // Delete a graphic layer
  const handleDeleteGraphic = (id: string) => {
    if (graphics.length <= 1) {
      setGraphics([]);
      setSelectedLayerId('');
      toast.info('All graphic layers removed.');
      return;
    }

    const remaining = graphics.filter(g => g.id !== id);
    setGraphics(remaining);
    if (selectedLayerId === id) {
      setSelectedLayerId(remaining[0].id);
    }
    toast.success('Graphic layer deleted.');
  };

  // Upload Custom File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (activeGraphic) {
        updateGraphicProperty(activeGraphic.id, {
          name: file.name.substring(0, 16),
          url: dataUrl,
          processedUrl: dataUrl,
          removeBg: false
        });
        toast.success(`Loaded "${file.name}" into active layer.`);
      } else {
        const newId = `layer-${Date.now()}`;
        const newLayer: GraphicLayer = {
          id: newId,
          name: file.name.substring(0, 16),
          url: dataUrl,
          processedUrl: dataUrl,
          side: cameraView,
          x: 0,
          y: 38,
          scale: 48,
          rotate: 0,
          finish: 'matte',
          removeBg: false,
          bgTolerance: 35
        };
        setGraphics([newLayer]);
        setSelectedLayerId(newId);
        toast.success(`Uploaded "${file.name}" as custom artwork!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply Placement Preset
  const applyPlacementPreset = (preset: typeof PLACEMENT_PRESETS[0]) => {
    if (!activeGraphic) return;
    updateGraphicProperty(activeGraphic.id, {
      side: preset.side,
      x: preset.x,
      y: preset.y,
      scale: preset.scale,
      rotate: 0
    });
    setCameraView(preset.side);
    toast.success(`Preset applied: ${preset.name}`);
  };

  // Lookbook Snapshot
  const handleCaptureLookbook = () => {
    setIsSnapping(true);
    try {
      const canvas = canvasContainerRef.current?.querySelector('canvas');
      if (!canvas) {
        toast.error('3D Canvas not ready.');
        setIsSnapping(false);
        return;
      }

      const poster = document.createElement('canvas');
      poster.width = 1200;
      poster.height = 1400;
      const ctx = poster.getContext('2d');
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, poster.width, poster.height);

      // Gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 40; x < poster.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, poster.height);
        ctx.stroke();
      }
      for (let y = 40; y < poster.height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(poster.width, y);
        ctx.stroke();
      }

      // Draw 3D Model
      ctx.drawImage(canvas, 100, 100, 1000, 1000);

      // Header Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = "900 36px 'Anton', sans-serif";
      ctx.fillText('INKWAVE // 3D BESPOKE LAB', 60, 80);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = "700 16px 'JetBrains Mono', monospace";
      ctx.fillText(`LOOKBOOK SPEC • ${selectedColor.name.toUpperCase()} / SIZE ${selectedSize}`, 60, 1150);

      ctx.fillStyle = '#CCFF00';
      ctx.font = "700 14px 'JetBrains Mono', monospace";
      ctx.fillText(`LAYERS: ${graphics.length} GRAPHICS • FRONT TYPOGRAPHY: ${typographyEnabled ? 'ACTIVE' : 'OFF'}`, 60, 1180);

      if (customLabel.trim()) {
        ctx.fillStyle = '#ffffff';
        ctx.font = "700 14px 'JetBrains Mono', monospace";
        ctx.fillText(`WOVEN TAG: [ ${customLabel.toUpperCase()} ]`, 60, 1210);
      }

      const link = document.createElement('a');
      link.download = `inkwave-custom-lookbook-${Date.now()}.png`;
      link.href = poster.toDataURL('image/png');
      link.click();

      toast.success('4K Lookbook Snapshot downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Could not capture lookbook snapshot.');
    }
    setIsSnapping(false);
  };

  // Add To Bag
  const handleAddToBag = () => {
    if (graphics.length === 0 && !typographyEnabled) {
      toast.error('Please add at least one graphic or enable typography.');
      return;
    }

    setAdding(true);

    const printItem = {
      id: `custom-print-${Date.now()}`,
      product_id: 'custom-tee-print',
      variant_id: 'custom-print',
      title: `Bespoke 3D Custom Tee (${selectedColor.name})`,
      sku: `CUSTOM-PRINT-${selectedColor.name.substring(0,3).toUpperCase()}-${selectedSize}`,
      size: selectedSize,
      color: selectedColor.name,
      price: 2499,
      quantity: 1,
      image_url: selectedColor.image,
      custom_print_metadata: {
        color: selectedColor.name,
        color_hex: selectedColor.hex,
        size: selectedSize,
        custom_label: customLabel,
        // Multi-graphic layer specs
        graphic_layers: graphics.map(g => ({
          name: g.name,
          side: g.side,
          scale: g.scale,
          rotate: g.rotate,
          x: g.x,
          y: g.y,
          finish: g.finish,
          url: g.url
        })),
        // Front-Only Typography Specs
        typography: typographyEnabled && customText.trim() ? {
          text: customText,
          subtext: customSubtext,
          font: selectedFont,
          fontSize,
          textColor: selectedTextColor,
          isCurved: isCurvedText,
          isOutline: isOutlineText,
          x: typographyX,
          y: typographyY,
          scale: typographyScale,
          rotate: typographyRotate
        } : null
      }
    };

    addItem(printItem as any);
    toast.success('Bespoke Custom Tee added to your bag!');
    setCartDrawerOpen(true);
    setAdding(false);
  };

  // ─── 🚧 UNDER CONSTRUCTION / MAINTENANCE SCREEN ───────────────────────────
  if (!isConfigLoading && !isPrintLabEnabled) {
    return (
      <main className="pt-28 lg:pt-36 pb-32 min-h-screen bg-[var(--bg)] flex items-center justify-center px-4" style={{ color: 'var(--text)' }}>
        <div className="max-w-2xl w-full mx-auto text-center space-y-8 p-8 sm:p-12 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-2xl relative overflow-hidden">
          
          {/* Ambient Cyber Grid Background Effect */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs uppercase tracking-widest">
            <Construction className="w-4 h-4 animate-bounce" />
            <span>System Notice // 3D Lab Under Upgrade</span>
          </div>

          {/* Title & Copy */}
          <div className="space-y-4 relative z-10">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase font-bold tracking-tight">
              3D Print Lab <br />
              <span className="text-[var(--accent)] font-serif italic">Under Upgrade</span>
            </h1>
            <p className="text-sm sm:text-base font-mono text-[var(--text-dim)] max-w-lg mx-auto leading-relaxed">
              We are currently upgrading our 3D garment simulation machinery, multi-layer graphics engine, and viral typography matrix. The studio will reopen shortly.
            </p>
          </div>

          {/* Dev Status Specs Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left font-mono text-[11px] relative z-10">
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)]">
              <span className="text-[var(--text-dim)] uppercase block text-[9px]">Pipeline</span>
              <span className="font-bold text-[var(--accent)]">3D R3F Engine v2</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)]">
              <span className="text-[var(--text-dim)] uppercase block text-[9px]">Dye Blank</span>
              <span className="font-bold text-[var(--text)]">220 GSM Boxy Fit</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)]">
              <span className="text-[var(--text-dim)] uppercase block text-[9px]">Status</span>
              <span className="font-bold text-amber-400">Under Construction</span>
            </div>
          </div>

          {/* Early Access / Notify Form */}
          <form onSubmit={handleNotifyMe} className="max-w-md mx-auto relative z-10 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Enter email for relaunch VIP alert..."
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={isNotifying}
                className="px-5 py-3 rounded-xl bg-[var(--accent)] text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isNotifying ? 'Subscribing...' : 'Notify Me'}</span>
              </button>
            </div>
          </form>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link 
              href="/showcase" 
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)] hover:underline"
            >
              <span>Explore In-Stock Drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[var(--text-dim)]">•</span>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              <span>Return to Storefront</span>
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 lg:pt-32 pb-24 min-h-screen bg-[var(--bg)]" style={{ color: 'var(--text)' }}>
      <div className="max-w-[1360px] mx-auto px-4 md:px-6 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── 3D PREVIEW CANVAS CONTAINER (7 Cols) ─── */}
        <div className="w-full lg:col-span-7 sticky top-[70px] lg:relative lg:top-0 z-20 bg-[var(--bg)] pb-2 lg:pb-0">
          <div 
            ref={canvasContainerRef}
            className="w-full relative aspect-square sm:aspect-[4/5] lg:aspect-[3/4] border border-[var(--line)] bg-[var(--bg-card)] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
          >
            <CustomPrintCanvas 
              colorHex={selectedColor.hex} 
              graphics={graphics}
              typographyTexture={typographyEnabled ? typographyTexture : null}
              typographyOptions={{
                x: typographyX,
                y: typographyY,
                scale: typographyScale,
                rotate: typographyRotate
              }}
              activeView={cameraView}
            />

            {/* Top Bar: Front / Back Camera Flip & Snapshot */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
              <div className="flex bg-black/80 backdrop-blur-md border border-white/10 p-1 rounded-xl pointer-events-auto shadow-lg">
                <button
                  onClick={() => setCameraView('front')}
                  className={`px-3.5 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all ${cameraView === 'front' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Front View
                </button>
                <button
                  onClick={() => setCameraView('back')}
                  className={`px-3.5 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all ${cameraView === 'back' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Back View
                </button>
              </div>

              <button
                onClick={handleCaptureLookbook}
                disabled={isSnapping}
                className="px-3.5 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 hover:border-[var(--accent)] text-white text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 pointer-events-auto cursor-pointer shadow-lg"
              >
                <Camera className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{isSnapping ? 'Rendering...' : 'Snap Lookbook'}</span>
              </button>
            </div>

            {/* Quick Floating Swatches Overlay on 3D Model */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 border border-white/10 rounded-2xl shadow-xl">
              {colors.slice(0, 5).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border transition-all ${selectedColor.hex === c.hex ? 'border-[var(--accent)] scale-125 shadow' : 'border-white/20 hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                  title={`Dye Shirt: ${c.name}`}
                />
              ))}
            </div>

            {/* Layer Counter & Stats */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-xl text-[10px] font-mono tracking-wider text-white uppercase pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>{selectedColor.name}</span>
              <span>•</span>
              <span>{graphics.length} Graphics</span>
              <span>•</span>
              <span>Front Text: <strong className={typographyEnabled ? 'text-[var(--accent)]' : 'text-zinc-500'}>{typographyEnabled ? 'ON' : 'OFF'}</strong></span>
            </div>
          </div>

          {/* Quick Placement Presets Toolbar */}
          {activeGraphic && (
            <div className="mt-4 p-3 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] shrink-0 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--accent)]" /> Alignment Presets:
              </span>
              <div className="flex gap-1.5 shrink-0">
                {PLACEMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPlacementPreset(preset)}
                    className="px-2.5 py-1 bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-[10px] font-mono text-[var(--text)] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── OPTIONS & CONTROLS SCROLLING CONTENT (5 Cols) ─── */}
        <div className="w-full lg:col-span-5 flex flex-col space-y-6 z-10 relative bg-[var(--bg)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20">
                INKWAVE 3D LAB
              </span>
              <span className="text-xs font-mono text-[var(--text-dim)]">• 220GSM BOXY FIT</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl uppercase font-bold tracking-tight mb-2">
              Bespoke Streetwear Studio
            </h1>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed font-mono">
              Pick your garment color, add multiple front & back graphics, and design with viral streetwear typography.
            </p>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── 🎨 ALWAYS-VISIBLE GARMENT COLOR & SIZE SELECTOR ───────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/30 space-y-3.5 shadow-lg">
            
            {/* Color Swatches Header */}
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--accent)]" />
                <span>1. Select T-Shirt Color</span>
              </label>
              <span className="text-[11px] font-mono text-[var(--accent)] font-bold uppercase">
                {selectedColor.name}
              </span>
            </div>

            {/* Official Inkwave Blank T-Shirt Color Swatches */}
            <div className="flex flex-wrap gap-2.5 items-center">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer ${selectedColor.hex === c.hex ? 'border-[var(--accent)] scale-110 shadow-lg ring-2 ring-[var(--accent)]/20' : 'border-white/10 hover:border-white/40'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor.hex === c.hex && (
                    <Check className={`w-4 h-4 ${c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#d4c5b9' || c.hex.toLowerCase() === '#90ee90' || c.hex.toLowerCase() === '#ffc0cb' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Size Selector Strip */}
            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)]">Size (Boxy Drop Shoulder):</span>
              <div className="flex gap-1.5">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-9 h-8 rounded-lg text-[11px] font-mono font-bold border transition-all ${selectedSize === sz ? 'bg-[var(--accent)] text-black border-[var(--accent)] shadow' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text)] hover:border-white/20'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Design Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl">
            <button
              onClick={() => setActiveTab('graphics')}
              className={`py-2.5 px-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeTab === 'graphics' ? 'bg-[var(--accent)] text-black shadow-md' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Graphics ({graphics.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`py-2.5 px-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeTab === 'typography' ? 'bg-[var(--accent)] text-black shadow-md' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <Type className="w-4 h-4" />
              <span>Front Typography</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── 1. MULTI-GRAPHIC LAYERS TAB (Both Front & Back) ───────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'graphics' && (
            <div className="space-y-6">
              
              {/* Graphic Layer Manager */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-dim)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> 2. Graphic Layers (Front & Back)
                  </label>
                  
                  {/* Add Graphic Layer Button */}
                  <button
                    onClick={() => handleAddNewGraphic(graphics.length)}
                    className="px-3 py-1 bg-[var(--accent)]/15 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-black border border-[var(--accent)]/30 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Graphic</span>
                  </button>
                </div>

                {/* Layer Cards List */}
                <div className="space-y-2">
                  {graphics.map((layer, index) => (
                    <div
                      key={layer.id}
                      onClick={() => {
                        setSelectedLayerId(layer.id);
                        setCameraView(layer.side);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${selectedLayerId === layer.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-md' : 'border-[var(--line)] bg-[var(--bg-card)] hover:border-white/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center p-1">
                          <img src={layer.url} alt={layer.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-[var(--text)]">{layer.name || `Graphic #${index + 1}`}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-[var(--text-dim)]">
                            <span className="uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--accent)]">
                              {layer.side} Side
                            </span>
                            <span>•</span>
                            <span className="uppercase">{layer.finish}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {/* Side Switch Button */}
                        <button
                          onClick={() => {
                            const newSide = layer.side === 'front' ? 'back' : 'front';
                            updateGraphicProperty(layer.id, { side: newSide });
                            setCameraView(newSide);
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-mono uppercase rounded-lg text-[var(--text-dim)] hover:text-white"
                          title="Switch Front/Back Side"
                        >
                          {layer.side === 'front' ? 'Move to Back' : 'Move to Front'}
                        </button>

                        {/* Delete Graphic Layer Button */}
                        <button
                          onClick={() => handleDeleteGraphic(layer.id)}
                          className="p-1.5 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all"
                          title="Delete Graphic Layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {graphics.length === 0 && (
                    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-dashed border-[var(--line)] text-center space-y-2">
                      <p className="text-xs font-mono text-[var(--text-dim)]">No graphics on the garment yet.</p>
                      <button
                        onClick={() => handleAddNewGraphic(0)}
                        className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-mono font-bold uppercase rounded-xl"
                      >
                        + Add First Graphic
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Graphic Controls */}
              {activeGraphic && (
                <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)]">
                  <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-dim)]">
                      Editing: {activeGraphic.name}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--accent)] uppercase font-bold">
                      [{activeGraphic.side.toUpperCase()} SIDE]
                    </span>
                  </div>

                  {/* Stock Graphic Options */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                      Choose Graphic Artwork
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {STOCK_PRINTS.map((sp) => (
                        <button
                          key={sp.name}
                          onClick={() => {
                            updateGraphicProperty(activeGraphic.id, {
                              name: sp.name,
                              url: sp.url,
                              processedUrl: sp.url,
                              removeBg: false
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${activeGraphic.url === sp.url ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--line)] bg-[var(--bg)] hover:border-white/20'}`}
                        >
                          <div className="font-mono text-[10px] font-bold uppercase text-[var(--text)]">{sp.name}</div>
                          <div className="text-[8px] font-mono text-[var(--text-dim)] mt-0.5">{sp.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Upload */}
                  <div className="relative border border-dashed border-[var(--line)] hover:border-[var(--accent)] transition-all p-4 rounded-xl text-center cursor-pointer bg-[var(--bg)]">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <Upload className="w-4 h-4 mx-auto mb-1.5 text-[var(--accent)]" />
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text)]">Upload Custom Artwork</p>
                    <p className="text-[8px] font-mono text-[var(--text-dim)] mt-0.5">PNG, JPG, SVG, WebP</p>
                  </div>

                  {/* Physical Print Finish */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                      Print Technique
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'matte', name: 'Matte Screenprint' },
                        { id: 'puff', name: '3D Puff Print' },
                        { id: 'vintage', name: 'Vintage Distressed' },
                        { id: 'chrome', name: 'Liquid Chrome' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => updateGraphicProperty(activeGraphic.id, { finish: f.id as PrintFinish })}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all ${activeGraphic.finish === f.id ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)]'}`}
                        >
                          <span className="text-[10px] font-mono uppercase">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Positioning Sliders */}
                  <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                        <span>Graphic Scale</span>
                        <span>{activeGraphic.scale}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="100" 
                        value={activeGraphic.scale} 
                        onChange={e => updateGraphicProperty(activeGraphic.id, { scale: Number(e.target.value) })} 
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                          <span>X-Axis</span>
                          <span>{activeGraphic.x}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="-45" 
                          max="45" 
                          value={activeGraphic.x} 
                          onChange={e => updateGraphicProperty(activeGraphic.id, { x: Number(e.target.value) })} 
                          className="w-full accent-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                          <span>Y-Axis</span>
                          <span>{activeGraphic.y}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="15" 
                          max="75" 
                          value={activeGraphic.y} 
                          onChange={e => updateGraphicProperty(activeGraphic.id, { y: Number(e.target.value) })} 
                          className="w-full accent-[var(--accent)]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                        <span>Rotation</span>
                        <span>{activeGraphic.rotate}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={activeGraphic.rotate} 
                        onChange={e => updateGraphicProperty(activeGraphic.id, { rotate: Number(e.target.value) })} 
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── 2. TYPOGRAPHY STUDIO TAB (Front-Only as required) ─────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'typography' && (
            <div className="space-y-5 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)]">
              
              {/* Toggle Typography Enabled */}
              <div className="flex justify-between items-center border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)]">Front Typography</span>
                </div>
                <button
                  onClick={() => {
                    setTypographyEnabled(!typographyEnabled);
                    setCameraView('front');
                  }}
                  className={`text-[10px] font-mono uppercase px-3 py-1 rounded-lg border transition-all ${typographyEnabled ? 'bg-[var(--accent)] text-black border-transparent font-bold' : 'text-zinc-500 border-zinc-700'}`}
                >
                  {typographyEnabled ? '✓ Active on Front' : 'Enable Front Text'}
                </button>
              </div>

              {typographyEnabled && (
                <div className="space-y-4">
                  {/* Primary Text Input */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1">
                      Primary Streetwear Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. INKWAVE TOKYO"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:border-[var(--accent)] outline-none uppercase"
                    />
                  </div>

                  {/* Subtext Label */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1">
                      Subtext Stamp (Optional)
                    </label>
                    <input
                      type="text"
                      value={customSubtext}
                      onChange={(e) => setCustomSubtext(e.target.value)}
                      placeholder="e.g. EDITION 01 // 2026"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:border-[var(--accent)] outline-none uppercase"
                    />
                  </div>

                  {/* ─── VIRAL STREETWEAR FONTS PICKER ─── */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" /> Viral & Streetwear Fonts
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {STREETWEAR_FONTS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setSelectedFont(font.family)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${selectedFont === font.family ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold shadow' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-white/20'}`}
                        >
                          <div className="text-[11px] truncate" style={{ fontFamily: font.family }}>{font.name}</div>
                          {font.viral && (
                            <div className="text-[8px] font-mono text-orange-400 mt-0.5 flex items-center gap-0.5">
                              ★ Viral Streetwear
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ─── TYPOGRAPHY SIZING SLIDER CONTROL ─── */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                      <span>Typography Font Size</span>
                      <span>{fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="32" 
                      max="140" 
                      value={fontSize} 
                      onChange={e => setFontSize(Number(e.target.value))} 
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>

                  {/* Ink Color Picker */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                      Ink Color
                    </label>
                    <div className="flex gap-2">
                      {INK_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedTextColor(c.hex)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${selectedTextColor === c.hex ? 'border-[var(--accent)] scale-110' : 'border-white/10'}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {selectedTextColor === c.hex && (
                            <Check className={`w-3.5 h-3.5 ${c.hex === '#FFFFFF' || c.hex === '#CCFF00' || c.hex === '#00F0FF' ? 'text-black' : 'text-white'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Arc Curve & Outline Modifiers */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setIsCurvedText(!isCurvedText)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all ${isCurvedText ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                    >
                      {isCurvedText ? '✓ Arched Curve' : 'Arch / Curve'}
                    </button>

                    <button
                      onClick={() => setIsOutlineText(!isOutlineText)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all ${isOutlineText ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                    >
                      {isOutlineText ? '✓ Hollow Outline' : 'Outline Stroke'}
                    </button>
                  </div>

                  {/* Typography Y-Position Slider */}
                  <div className="pt-2 border-t border-[var(--line)]">
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                      <span>Front Placement (Y-Axis)</span>
                      <span>{typographyY}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="65" 
                      value={typographyY} 
                      onChange={e => setTypographyY(Number(e.target.value))} 
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Custom Woven Neck Label input */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)]">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--accent)]" /> Custom Woven Neck / Hem Label
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. EDITION 01 // SUSHANT STUDIO"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:border-[var(--accent)] outline-none uppercase"
            />
          </div>

          {/* Action CTA & Checkout */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleAddToBag}
              disabled={adding || (graphics.length === 0 && !typographyEnabled)}
              className="w-full bg-[var(--accent)] text-black hover:opacity-90 py-4 rounded-2xl font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase Bespoke Custom Tee • ₹2,499</span>
            </button>

            <div className="flex gap-2.5 items-start bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-[var(--text-dim)] leading-relaxed">
                  Vector artwork & print coordinates are atomically packaged into the dispatch payload. Hand-finished on 220GSM cotton in Surat.
                </p>
              </div>
          </div>
        </div>

      </div>
    </main>
  );
}
