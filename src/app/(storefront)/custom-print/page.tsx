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
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Camera, 
  Check, 
  Layers, 
  Plus, 
  Trash2, 
  Sliders, 
  Palette, 
  Wand2, 
  SunMedium, 
  Play, 
  Pause, 
  X, 
  Compass, 
  Construction,
  Tag,
  Eye,
  SlidersHorizontal
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

/* ── Streetwear Stock Graphics ─────────────────────────────────────────── */
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
      <div className="w-full h-full min-h-[380px] lg:min-h-[580px] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-xs uppercase tracking-widest gap-3">
        <RefreshCcw className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <span>Initializing 3D Clothes Designer Engine...</span>
      </div>
    )
  }
);

export default function CustomPrintStudio() {
  const [activeTab, setActiveTab] = useState<'color' | 'graphics' | 'typography' | 'lighting'>('color');
  const [cameraView, setCameraView] = useState<'front' | 'back' | 'angle-left' | 'angle-right' | 'side-left' | 'side-right'>('front');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [envPreset, setEnvPreset] = useState<'city' | 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse'>('city');

  const [colors, setColors] = useState<ColorPreset[]>(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState<ColorPreset>(DEFAULT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [customLabel, setCustomLabel] = useState('INKWAVE // STUDIO SPEC');

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

  const [typographyEnabled, setTypographyEnabled] = useState(true);
  const [customText, setCustomText] = useState('INKWAVE TOKYO');
  const [customSubtext, setCustomSubtext] = useState('EDITION 01 // 2026');
  const [selectedFont, setSelectedFont] = useState(STREETWEAR_FONTS[0].family);
  const [fontSize, setFontSize] = useState(72);
  const [selectedTextColor, setSelectedTextColor] = useState(INK_COLORS[0].hex);
  const [isCurvedText, setIsCurvedText] = useState(false);
  const [isOutlineText, setIsOutlineText] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(4);
  const [typographyX, setTypographyX] = useState(0);
  const [typographyY, setTypographyY] = useState(25);
  const [typographyScale, setTypographyScale] = useState(42);
  const [typographyRotate, setTypographyRotate] = useState(0);
  const [typographyTexture, setTypographyTexture] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isPrintLabEnabled, setIsPrintLabEnabled] = useState<boolean>(true);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(true);

  const { addItem, setCartDrawerOpen } = useCartStore();
  const supabase = createClient();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const activeGraphic = graphics.find(g => g.id === selectedLayerId) || graphics[0];

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
          setIsPrintLabEnabled(settingsRes.data.json_content.print_lab_enabled !== false);
        }
      } catch (err) {
        console.error('Failed to load print lab configuration:', err);
      } finally {
        setIsConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Update typography texture dynamically on font/text changes
  useEffect(() => {
    let isMounted = true;
    if (!typographyEnabled || !customText.trim()) {
      setTypographyTexture(null);
      return;
    }

    generateTextDecal({
      text: customText,
      subtext: customSubtext,
      fontFamily: selectedFont,
      fontSize: fontSize,
      color: selectedTextColor,
      letterSpacing: letterSpacing,
      isCurved: isCurvedText,
      isOutline: isOutlineText
    }).then((dataUri) => {
      if (isMounted) {
        setTypographyTexture(dataUri);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    typographyEnabled, 
    customText, 
    customSubtext, 
    selectedFont, 
    fontSize, 
    selectedTextColor, 
    letterSpacing, 
    isCurvedText, 
    isOutlineText
  ]);

  // Handle Layer Texture Processing with finish and background remover
  const updateGraphicProcessing = async (layer: GraphicLayer) => {
    let outputUrl = layer.url;

    if (layer.removeBg && outputUrl.startsWith('data:image')) {
      outputUrl = await removeImageBackground(outputUrl, layer.bgTolerance || 35);
    }

    if (layer.finish && layer.finish !== 'matte') {
      outputUrl = await applyPrintFinishTexture(outputUrl, layer.finish);
    }

    setGraphics(prev => prev.map(g => g.id === layer.id ? { ...g, processedUrl: outputUrl } : g));
  };

  // Upload custom graphic artwork
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, SVG)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newLayer: GraphicLayer = {
        id: `layer-${Date.now()}`,
        name: file.name.slice(0, 16),
        url: base64,
        processedUrl: base64,
        side: cameraView === 'back' ? 'back' : 'front',
        x: 0,
        y: 38,
        scale: 45,
        rotate: 0,
        finish: 'matte',
        removeBg: false,
        bgTolerance: 35
      };

      setGraphics(prev => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      setActiveTab('graphics');
      toast.success('Custom artwork attached to 3D model!');
    };
    reader.readAsDataURL(file);
  };

  // Add stock print artwork
  const handleAddStockPrint = (print: typeof STOCK_PRINTS[0]) => {
    const newLayer: GraphicLayer = {
      id: `layer-${Date.now()}`,
      name: print.name,
      url: print.url,
      processedUrl: print.url,
      side: cameraView === 'back' ? 'back' : 'front',
      x: 0,
      y: 38,
      scale: 45,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    };
    setGraphics(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveTab('graphics');
    toast.success(`Attached "${print.name}" to garment`);
  };

  // Remove graphic layer
  const handleRemoveLayer = (id: string) => {
    setGraphics(prev => prev.filter(g => g.id !== id));
    if (selectedLayerId === id) {
      const remaining = graphics.filter(g => g.id !== id);
      if (remaining.length > 0) {
        setSelectedLayerId(remaining[0].id);
      }
    }
  };

  // Update specific graphic layer attribute
  const updateActiveLayer = (updates: Partial<GraphicLayer>) => {
    if (!activeGraphic) return;
    const updated = { ...activeGraphic, ...updates };
    setGraphics(prev => prev.map(g => g.id === updated.id ? updated : g));

    if ('finish' in updates || 'removeBg' in updates || 'bgTolerance' in updates) {
      updateGraphicProcessing(updated);
    }
  };

  // Snap placement presets
  const applyPlacementPreset = (preset: typeof PLACEMENT_PRESETS[0]) => {
    if (!activeGraphic) return;
    updateActiveLayer({
      x: preset.x,
      y: preset.y,
      scale: preset.scale,
      side: preset.side,
      rotate: 0
    });
    setCameraView(preset.side);
    toast.info(`Snapped to ${preset.name}`);
  };

  // High-res Snapshot capture
  const handleCaptureLookbook = () => {
    setIsSnapping(true);
    setTimeout(() => {
      const canvas = canvasContainerRef.current?.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `inkwave-bespoke-${selectedColor.name.toLowerCase().replace(/\s+/g, '-')}-lookbook.png`;
        link.href = image;
        link.click();
        toast.success('3D Lookbook snapshot downloaded!');
      } else {
        toast.error('Unable to capture snapshot');
      }
      setIsSnapping(false);
    }, 400);
  };

  // Add to Bag action
  const handleAddToBag = () => {
    if (graphics.length === 0 && !typographyEnabled) {
      toast.error('Please add at least one graphic or typography decal to your piece.');
      return;
    }

    setAdding(true);

    const canvas = canvasContainerRef.current?.querySelector('canvas');
    const snapshotUrl = canvas ? canvas.toDataURL('image/png') : selectedColor.image;

    const printItem = {
      id: `custom-print-${Date.now()}`,
      name: `Bespoke Streetwear Tee (${selectedColor.name})`,
      slug: 'custom-print',
      price: 2499,
      images: [snapshotUrl, selectedColor.image],
      selected_size: selectedSize,
      quantity: 1,
      is_custom_print: true,
      custom_print_metadata: {
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        size: selectedSize,
        customLabel: customLabel,
        cameraAngle: cameraView,
        envLighting: envPreset,
        graphics: graphics.map(g => ({
          id: g.id,
          name: g.name,
          side: g.side,
          scale: g.scale,
          rotate: g.rotate,
          x: g.x,
          y: g.y,
          finish: g.finish,
          url: g.url
        })),
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
    toast.success('3D Custom Piece added to your bag!');
    setCartDrawerOpen(true);
    setAdding(false);
  };

  if (!isConfigLoading && !isPrintLabEnabled) {
    return (
      <main className="pt-28 lg:pt-36 pb-32 min-h-screen bg-black flex items-center justify-center px-4 text-white">
        <div className="max-w-2xl w-full mx-auto text-center space-y-8 p-8 sm:p-12 rounded-3xl border border-[#222] bg-[#09090b] shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs uppercase tracking-widest">
            <Construction className="w-4 h-4 animate-bounce" />
            <span>3D Studio Notice // Upgrade in Progress</span>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl uppercase font-black tracking-tight text-white">
              3D Customizer <br />
              <span className="text-white/60">Under Upgrade</span>
            </h1>
            <p className="text-sm font-mono text-neutral-400 max-w-lg mx-auto leading-relaxed">
              We are enhancing our 3D real-time garment simulation engine. Please check back shortly or explore our ready-to-wear drops.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider hover:opacity-90 transition-all">
              Explore New Drops &rarr;
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-32 min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── 3D VIEWPORT CONTAINER (7 Cols) ─── */}
        <div className="w-full lg:col-span-7 lg:sticky lg:top-28 flex flex-col z-20">
          <div 
            ref={canvasContainerRef}
            className="w-full h-[460px] sm:h-[540px] lg:h-[640px] bg-[#09090b] rounded-3xl border border-[var(--line)] overflow-hidden relative shadow-2xl flex items-center justify-center select-none"
          >
            {/* Realtime 3D Canvas */}
            <CustomPrintCanvas
              color={selectedColor.hex}
              wireframe={wireframeMode}
              autoRotate={autoRotate}
              envPreset={envPreset}
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

            {/* ─── Top Snap Bar: Multi-Angle Snap & Snapshot ─── */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
              
              {/* Camera Snap Views */}
              <div className="flex bg-black/80 backdrop-blur-md border border-white/10 p-1 rounded-xl pointer-events-auto shadow-lg overflow-x-auto max-w-[calc(100%-80px)]">
                <button
                  onClick={() => setCameraView('front')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all shrink-0 ${cameraView === 'front' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setCameraView('back')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all shrink-0 ${cameraView === 'back' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Back
                </button>
                <button
                  onClick={() => setCameraView('angle-left')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all shrink-0 ${cameraView === 'angle-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  3/4 L
                </button>
                <button
                  onClick={() => setCameraView('angle-right')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all shrink-0 ${cameraView === 'angle-right' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  3/4 R
                </button>
                <button
                  onClick={() => setCameraView('side-left')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all shrink-0 ${cameraView === 'side-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Profile
                </button>
              </div>

              {/* Utility Action Buttons */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                {/* 360 Auto-Spin */}
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  title={autoRotate ? 'Pause 360 Auto-Rotation' : 'Start 360 Auto-Rotation'}
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all ${autoRotate ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-black/80 text-white border-white/10 hover:border-white/30'}`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                {/* Wireframe Mesh Mode */}
                <button
                  onClick={() => setWireframeMode(!wireframeMode)}
                  title={wireframeMode ? 'Disable Wireframe Shader' : 'Enable Wireframe 3D Matrix'}
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all ${wireframeMode ? 'bg-purple-600 text-white border-purple-400' : 'bg-black/80 text-white border-white/10 hover:border-white/30'}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Snap Lookbook */}
                <button
                  onClick={handleCaptureLookbook}
                  disabled={isSnapping}
                  title="Download High-Res 3D Render"
                  className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 hover:border-[var(--accent)] text-white text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Camera className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="hidden sm:inline">{isSnapping ? 'Rendering...' : 'Lookbook'}</span>
                </button>
              </div>
            </div>

            {/* Quick Floating Swatches Overlay on 3D Model */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 border border-white/10 rounded-2xl shadow-xl">
              {colors.slice(0, 5).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${selectedColor.hex === c.hex ? 'border-[var(--accent)] scale-125 shadow' : 'border-white/20 hover:scale-110'}`}
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
              <span>HD HDR</span>
            </div>
          </div>

          {/* Quick Placement Presets Toolbar */}
          {activeGraphic && (
            <div className="mt-4 p-3 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] shrink-0 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--accent)]" /> Quick Placement:
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
                INKWAVE 3D STUDIO
              </span>
              <span className="text-xs font-mono text-[var(--text-dim)]">• 220GSM BOXY FIT</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl uppercase font-bold tracking-tight mb-2">
              Bespoke Clothes Designer
            </h1>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed font-mono">
              Real-time WebGL studio. Customize blanks with multi-layer decals, AI background removal, and viral streetwear typography.
            </p>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── 🎛️ STUDIO PILL DOCK TABS ─────────────────────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl">
            <button
              onClick={() => setActiveTab('color')}
              className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'color' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Garment</span>
            </button>
            <button
              onClick={() => setActiveTab('graphics')}
              className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'graphics' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Artwork ({graphics.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'typography' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Typo</span>
            </button>
            <button
              onClick={() => setActiveTab('lighting')}
              className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'lighting' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <SunMedium className="w-3.5 h-3.5" />
              <span>HDR Light</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── TAB 1: 🎨 GARMENT BLANK & SIZE SELECTOR ───────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'color' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-4 shadow-lg animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--accent)]" />
                  <span>Garment Color</span>
                </label>
                <span className="text-[11px] font-mono text-[var(--accent)] font-bold uppercase">
                  {selectedColor.name}
                </span>
              </div>

              {/* Color Swatches */}
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

              {/* Size Selector */}
              <div className="pt-2 border-t border-[var(--line)]">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] block mb-2">
                  Fit & Sizing (Unisex Boxy Cut)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 text-xs font-mono uppercase rounded-xl border transition-all cursor-pointer ${selectedSize === sz ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── TAB 2: 🖼️ MULTI-LAYER GRAPHICS & DECAL STUDIO ─────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'graphics' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Layer Selection Chips */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> Active Decal Layers
                  </span>
                  <label className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-black text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:opacity-90 transition-all">
                    <Plus className="w-3 h-3" />
                    <span>Upload PNG</span>
                    <input 
                      type="file" 
                      accept="image/png,image/jpeg,image/webp,image/svg+xml" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {graphics.map((layer, idx) => (
                    <div 
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${selectedLayerId === layer.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                    >
                      <span className="text-[10px] opacity-60">#{idx + 1}</span>
                      <span>{layer.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase">{layer.side}</span>
                      {graphics.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveLayer(layer.id); }}
                          className="hover:text-red-400 p-0.5"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Decal Fine Tuning Controls */}
              {activeGraphic && (
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-4 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" /> Adjusting: {activeGraphic.name}
                    </span>
                    
                    {/* Front / Back Side Toggle */}
                    <div className="flex bg-[var(--bg)] p-0.5 rounded-lg border border-[var(--line)]">
                      <button
                        onClick={() => { updateActiveLayer({ side: 'front' }); setCameraView('front'); }}
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${activeGraphic.side === 'front' ? 'bg-[var(--accent)] text-black font-bold' : 'text-[var(--text-dim)]'}`}
                      >
                        Front
                      </button>
                      <button
                        onClick={() => { updateActiveLayer({ side: 'back' }); setCameraView('back'); }}
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${activeGraphic.side === 'back' ? 'bg-[var(--accent)] text-black font-bold' : 'text-[var(--text-dim)]'}`}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  {/* Scale Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                      <span>Scale / Dimension</span>
                      <span>{activeGraphic.scale}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="90" 
                      value={activeGraphic.scale} 
                      onChange={e => updateActiveLayer({ scale: Number(e.target.value) })} 
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>

                  {/* Y-Position Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                      <span>Vertical Placement (Y-Axis)</span>
                      <span>{activeGraphic.y}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="65" 
                      value={activeGraphic.y} 
                      onChange={e => updateActiveLayer({ y: Number(e.target.value) })} 
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>

                  {/* X-Position Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                      <span>Horizontal Placement (X-Axis)</span>
                      <span>{activeGraphic.x}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="-40" 
                      max="40" 
                      value={activeGraphic.x} 
                      onChange={e => updateActiveLayer({ x: Number(e.target.value) })} 
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                      <span>Rotation Angle</span>
                      <span>{activeGraphic.rotate}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={activeGraphic.rotate} 
                      onChange={e => updateActiveLayer({ rotate: Number(e.target.value) })} 
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>

                  {/* AI Background Removal Chroma Key */}
                  <div className="pt-2 border-t border-[var(--line)]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono uppercase text-[var(--text)] flex items-center gap-1.5 cursor-pointer">
                        <Wand2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>AI Remove White/Black Background</span>
                      </label>
                      <input 
                        type="checkbox"
                        checked={activeGraphic.removeBg || false}
                        onChange={(e) => updateActiveLayer({ removeBg: e.target.checked })}
                        className="accent-[var(--accent)] w-4 h-4 cursor-pointer"
                      />
                    </div>
                    {activeGraphic.removeBg && (
                      <div className="bg-[var(--bg)] p-2 rounded-xl border border-[var(--line)]">
                        <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono mb-1">
                          <span>Chroma Tolerance</span>
                          <span>{activeGraphic.bgTolerance || 35}</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="90" 
                          value={activeGraphic.bgTolerance || 35} 
                          onChange={e => updateActiveLayer({ bgTolerance: Number(e.target.value) })} 
                          className="w-full accent-[var(--accent)]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Print Finish Shader */}
                  <div className="pt-2 border-t border-[var(--line)]">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                      Bespoke Print Texture Finish
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['matte', 'puff', 'vintage', 'chrome'] as PrintFinish[]).map((fin) => (
                        <button
                          key={fin}
                          onClick={() => updateActiveLayer({ finish: fin })}
                          className={`py-1.5 text-[10px] font-mono uppercase rounded-lg border transition-all cursor-pointer ${activeGraphic.finish === fin ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                        >
                          {fin}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Streetwear Artworks Library */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-dim)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Stock Streetwear Decals
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {STOCK_PRINTS.map((print) => (
                    <button
                      key={print.name}
                      onClick={() => handleAddStockPrint(print)}
                      className="p-2.5 rounded-xl border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--bg)] flex items-center gap-2.5 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center p-1 shrink-0 group-hover:border-[var(--accent)]">
                        <img src={print.url} alt={print.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-mono font-bold text-[var(--text)] truncate">{print.name}</div>
                        <div className="text-[9px] font-mono text-[var(--text-dim)] truncate">{print.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── TAB 3: ✍️ STREETWEAR TYPOGRAPHY GENERATOR ────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'typography' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-4 shadow-lg animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                  <Type className="w-4 h-4 text-[var(--accent)]" />
                  <span>Front Chest Typography</span>
                </label>
                <button
                  onClick={() => setTypographyEnabled(!typographyEnabled)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer ${typographyEnabled ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)]'}`}
                >
                  {typographyEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {typographyEnabled && (
                <div className="space-y-3.5">
                  {/* Headline Text */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1">
                      Headline Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. INKWAVE 2026"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:border-[var(--accent)] outline-none uppercase"
                    />
                  </div>

                  {/* Subtitle Text */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1">
                      Secondary Sub-Label
                    </label>
                    <input
                      type="text"
                      value={customSubtext}
                      onChange={(e) => setCustomSubtext(e.target.value)}
                      placeholder="e.g. STUDIO DROP // RUN 01"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:border-[var(--accent)] outline-none uppercase"
                    />
                  </div>

                  {/* Font Selection */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                      Curated Streetwear Font
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {STREETWEAR_FONTS.map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setSelectedFont(f.family)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${selectedFont === f.family ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                        >
                          <div className="text-xs font-bold truncate" style={{ fontFamily: f.family }}>{f.name}</div>
                          <div className="text-[9px] font-mono opacity-60 truncate">{f.viral ? 'Trending / Viral' : 'Streetwear Essential'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Typography Font Size */}
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
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${selectedTextColor === c.hex ? 'border-[var(--accent)] scale-110' : 'border-white/10'}`}
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
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${isCurvedText ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                    >
                      {isCurvedText ? '✓ Arched Curve' : 'Arch / Curve'}
                    </button>

                    <button
                      onClick={() => setIsOutlineText(!isOutlineText)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${isOutlineText ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                    >
                      {isOutlineText ? '✓ Hollow Outline' : 'Outline Stroke'}
                    </button>
                  </div>

                  {/* Typography Front Y-Position */}
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

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── TAB 4: 💡 HDR LIGHTING & ENVIRONMENT ──────────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'lighting' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-3.5 shadow-lg animate-in fade-in duration-200">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-[var(--accent)]" />
                <span>HDR Studio Lighting Simulation</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'city', label: 'Tokyo City', icon: '🏙️' },
                  { id: 'studio', label: 'Photo Studio', icon: '💡' },
                  { id: 'sunset', label: 'Golden Hour', icon: '🌅' },
                  { id: 'dawn', label: 'Morning Mist', icon: '🌄' },
                  { id: 'night', label: 'Neon Cyber', icon: '🌙' },
                  { id: 'warehouse', label: 'Industrial', icon: '🏭' },
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setEnvPreset(env.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${envPreset === env.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                  >
                    <div className="text-lg mb-1">{env.icon}</div>
                    <div className="text-[10px] font-mono uppercase">{env.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Woven Neck Label input */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)]">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5 flex items-center gap-1.5">
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
