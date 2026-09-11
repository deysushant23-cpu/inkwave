'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Upload, 
  ShoppingBag, 
  RefreshCcw, 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Camera, 
  Check, 
  Layers, 
  Plus, 
  Trash2, 
  Palette, 
  Wand2, 
  Play, 
  Pause, 
  X, 
  Compass, 
  Construction, 
  Tag, 
  Move, 
  RotateCw, 
  Download, 
  Flame, 
  Sparkle,
  Eye,
  Hand
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  generateTextDecal, 
  applyPrintFinishTexture, 
  processImageWithAI,
  GraphicLayer,
  PrintFinish, 
  FabricWashStyle,
  PLACEMENT_PRESETS, 
  STREETWEAR_FONTS, 
  INK_COLORS,
  STREETWEAR_STICKERS,
  StreetwearSticker,
  DESIGN_RECIPES,
  DesignRecipe,
  SIZING_PRESETS,
  SizingPreset,
  StickerCategory
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

// Import R3F Canvas dynamically with SSR disabled
const CustomPrintCanvas = dynamic(
  () => import('@/components/storefront/CustomPrintCanvas'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full min-h-[380px] lg:min-h-[580px] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-xs uppercase tracking-widest gap-3">
        <RefreshCcw className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <span>Loading 3D Customizer...</span>
      </div>
    )
  }
);

export default function CustomPrintStudio() {
  const [activeTab, setActiveTab] = useState<'garment' | 'art' | 'size' | 'recipes'>('garment');
  const [cameraView, setCameraView] = useState<'front' | 'back' | 'sleeve-left' | 'sleeve-right' | 'angle-left'>('front');
  const [interactionMode, setInteractionMode] = useState<'move' | 'rotate'>('move');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [fabricWash, setFabricWash] = useState<FabricWashStyle>('solid');

  const [basePrice, setBasePrice] = useState<number>(699);
  const [colors, setColors] = useState<ColorPreset[]>(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState<ColorPreset>(DEFAULT_COLORS[1]); // Ink Black default
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [customLabel, setCustomLabel] = useState('INKWAVE // STUDIO SPEC');

  // Dynamic stickers and recipes state from database
  const [stickers, setStickers] = useState<StreetwearSticker[]>(STREETWEAR_STICKERS);
  const [recipes, setRecipes] = useState<DesignRecipe[]>(DESIGN_RECIPES);

  // Multi-Design Graphic layers
  const [graphics, setGraphics] = useState<GraphicLayer[]>([
    {
      id: 'layer-1',
      name: 'Cyber Star',
      url: STREETWEAR_STICKERS[3].url,
      processedUrl: STREETWEAR_STICKERS[3].url,
      rawUrl: STREETWEAR_STICKERS[3].url,
      side: 'front',
      x: 0,
      y: 38,
      scale: 46,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-1');
  const [selectedStickerCat, setSelectedStickerCat] = useState<StickerCategory | 'all'>('all');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Typography
  const [typographyEnabled, setTypographyEnabled] = useState(false);
  const [customText, setCustomText] = useState('INKWAVE');
  const [customSubtext, setCustomSubtext] = useState('TOKYO // 2026');
  const [selectedFont, setSelectedFont] = useState(STREETWEAR_FONTS[0].family);
  const [selectedTextColor, setSelectedTextColor] = useState(INK_COLORS[0].hex);
  const [isCurvedText, setIsCurvedText] = useState(false);
  const [isOutlineText, setIsOutlineText] = useState(false);
  const [typographyY, setTypographyY] = useState(25);
  const [typographyScale, setTypographyScale] = useState(42);
  const [typographyTexture, setTypographyTexture] = useState<string | null>(null);

  // Lookbook
  const [adding, setAdding] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [lookbookModalOpen, setLookbookModalOpen] = useState(false);
  const [lookbookSnapshots, setLookbookSnapshots] = useState<{ front?: string; back?: string; sleeve?: string; angle?: string }>({});

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

        if (configRes.data?.json_content?.price) {
          setBasePrice(Number(configRes.data.json_content.price) || 699);
        }

        let loadedColors = DEFAULT_COLORS;
        if (configRes.data?.json_content?.colors && configRes.data.json_content.colors.length > 0) {
          loadedColors = configRes.data.json_content.colors;
          setColors(loadedColors);
        }

        if (configRes.data?.json_content?.stickers && Array.isArray(configRes.data.json_content.stickers) && configRes.data.json_content.stickers.length > 0) {
          setStickers(configRes.data.json_content.stickers);
        }

        if (configRes.data?.json_content?.recipes && Array.isArray(configRes.data.json_content.recipes) && configRes.data.json_content.recipes.length > 0) {
          setRecipes(configRes.data.json_content.recipes);
        }

        // Apply admin-configured default starting design
        if (configRes.data?.json_content?.default_design) {
          const dd = configRes.data.json_content.default_design;
          if (dd.colorHex) {
            const matched = loadedColors.find((c: any) => c.hex.toLowerCase() === dd.colorHex.toLowerCase());
            if (matched) {
              setSelectedColor(matched);
            } else {
              setSelectedColor({ name: dd.colorName || 'Custom Base', hex: dd.colorHex, image: '' });
            }
          }
          if (dd.size) setSelectedSize(dd.size);
          if (dd.fabricWash) setFabricWash(dd.fabricWash);
          if (dd.customLabel) setCustomLabel(dd.customLabel);
          if (dd.graphics && Array.isArray(dd.graphics) && dd.graphics.length > 0) {
            const parsedGraphics = dd.graphics.map((g: any, idx: number) => ({
              id: g.id || `layer-${idx + 1}`,
              name: g.name || 'Graphic Decal',
              url: g.url || '',
              processedUrl: g.processedUrl || g.url || '',
              rawUrl: g.url || '',
              side: g.side || 'front',
              scale: typeof g.scale === 'number' ? g.scale : 46,
              x: typeof g.x === 'number' ? g.x : 0,
              y: typeof g.y === 'number' ? g.y : 38,
              rotate: g.rotate || 0,
              finish: g.finish || 'matte',
              removeBg: g.removeBg || false,
              bgTolerance: g.bgTolerance || 35
            }));
            setGraphics(parsedGraphics);
            if (parsedGraphics[0]?.id) setSelectedLayerId(parsedGraphics[0].id);
            if (parsedGraphics[0]?.side) setCameraView(parsedGraphics[0].side);
          }
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

  // Update typography texture dynamically
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
      fontSize: 72,
      color: selectedTextColor,
      letterSpacing: 4,
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
    selectedTextColor, 
    isCurvedText, 
    isOutlineText
  ]);

  // Direct On-Garment Drag Handler (Unrestricted Slap-On Placement)
  const handleDirectDragDecal = (dx: number, dy: number) => {
    if (!activeGraphic) return;
    const factor = 0.22;
    let xDelta = dx * factor;
    let yDelta = dy * factor;

    if (activeGraphic.side === 'back' || activeGraphic.side === 'sleeve-left') {
      xDelta = -dx * factor;
    } else if (activeGraphic.side === 'sleeve-right') {
      xDelta = dx * factor;
    }

    // Full garment freedom: chest, shoulders, lower hem, ribs, and sleeves
    const newX = Math.max(-48, Math.min(48, activeGraphic.x + xDelta));
    const newY = Math.max(4, Math.min(80, activeGraphic.y + yDelta));

    updateActiveLayer({ x: newX, y: newY });
  };

  // AI Auto-Processing on Image Upload (Supports JPG, PNG, WebP)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image (JPG, PNG, WebP)');
      return;
    }

    setIsProcessingAI(true);
    toast.info('AI is auto-cleaning background & placing on shirt...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      
      // Auto-clean background with AI
      const { cleanUrl, hasRemovedBg } = await processImageWithAI(rawBase64);

      const newLayer: GraphicLayer = {
        id: `layer-${Date.now()}`,
        name: file.name.slice(0, 16),
        url: rawBase64,
        processedUrl: cleanUrl,
        rawUrl: rawBase64,
        side: cameraView === 'back' ? 'back' : cameraView === 'sleeve-left' ? 'sleeve-left' : cameraView === 'sleeve-right' ? 'sleeve-right' : 'front',
        x: 0,
        y: 38,
        scale: 48,
        rotate: 0,
        finish: 'matte',
        removeBg: hasRemovedBg,
        bgTolerance: 35
      };

      setGraphics(prev => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      setInteractionMode('move');
      setIsProcessingAI(false);

      if (hasRemovedBg) {
        toast.success('✨ AI stripped background & centered on shirt!');
      } else {
        toast.success('Artwork placed on t-shirt!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-run AI Auto-Clean on active graphic
  const handleReRunAIClean = async () => {
    if (!activeGraphic) return;
    setIsProcessingAI(true);
    toast.info('AI is cleaning edges and removing background...');
    const { cleanUrl, hasRemovedBg } = await processImageWithAI(activeGraphic.url);
    updateActiveLayer({ processedUrl: cleanUrl, removeBg: hasRemovedBg });
    setIsProcessingAI(false);
    toast.success('✨ AI Cleanup applied!');
  };

  // Add stock sticker artwork
  const handleAddSticker = (sticker: StreetwearSticker) => {
    const isSleeve = sticker.category === 'sleeve';
    const initialSide = isSleeve ? 'sleeve-left' : (cameraView === 'back' ? 'back' : cameraView === 'sleeve-left' ? 'sleeve-left' : cameraView === 'sleeve-right' ? 'sleeve-right' : 'front');

    const newLayer: GraphicLayer = {
      id: `layer-${Date.now()}`,
      name: sticker.name,
      url: sticker.url,
      processedUrl: sticker.url,
      rawUrl: sticker.url,
      side: initialSide,
      x: 0,
      y: isSleeve ? 34 : 38,
      scale: isSleeve ? 26 : 48,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    };
    setGraphics(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    if (isSleeve) setCameraView('sleeve-left');
    setInteractionMode('move');
    toast.success(`Added "${sticker.name}" to shirt. Drag to move it!`);
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

  // Update active layer
  const updateActiveLayer = (updates: Partial<GraphicLayer>) => {
    if (!activeGraphic) return;
    const updated = { ...activeGraphic, ...updates };
    setGraphics(prev => prev.map(g => g.id === updated.id ? updated : g));
  };

  // Apply sizing preset
  const handleApplySizing = (preset: SizingPreset) => {
    updateActiveLayer({ scale: preset.scale });
    toast.info(`Size set to ${preset.name} (${preset.cmLabel})`);
  };

  // Apply placement preset
  const handleApplyPlacement = (preset: typeof PLACEMENT_PRESETS[0]) => {
    updateActiveLayer({
      x: preset.x,
      y: preset.y,
      scale: preset.scale,
      side: preset.side,
      rotate: 0
    });
    setCameraView(preset.side);
    toast.info(`Moved to ${preset.name}`);
  };

  // 1-Tap Recipe / Template Application
  const handleApplyRecipe = (recipe: DesignRecipe) => {
    const matchedColor = colors.find(c => c.hex.toLowerCase() === recipe.tshirtHex.toLowerCase()) || {
      name: recipe.tshirtName,
      hex: recipe.tshirtHex,
      image: DEFAULT_COLORS[0].image
    };

    setSelectedColor(matchedColor);
    setFabricWash(recipe.fabricWash);
    setCustomLabel(recipe.customLabel);

    const newLayer: GraphicLayer = {
      id: `layer-${Date.now()}`,
      name: recipe.sticker.name,
      url: recipe.sticker.url,
      processedUrl: recipe.sticker.url,
      rawUrl: recipe.sticker.url,
      side: recipe.stickerPlacement.side,
      x: recipe.stickerPlacement.x,
      y: recipe.stickerPlacement.y,
      scale: recipe.stickerPlacement.scale,
      rotate: 0,
      finish: recipe.finish,
      removeBg: false,
      bgTolerance: 35
    };
    setGraphics([newLayer]);
    setSelectedLayerId(newLayer.id);

    setTypographyEnabled(recipe.typography.enabled);
    setCustomText(recipe.typography.text);
    setCustomSubtext(recipe.typography.subtext);
    setSelectedFont(recipe.typography.fontFamily);
    setSelectedTextColor(recipe.typography.color);
    setIsCurvedText(recipe.typography.isCurved);
    setIsOutlineText(recipe.typography.isOutline);
    setTypographyY(recipe.typography.y);

    setCameraView(recipe.stickerPlacement.side);
    setInteractionMode('move');
    toast.success(`Applied "${recipe.name}" Preset!`);
  };

  // Multi-Angle Lookbook Generator (Front, Back, Sleeve, 3/4)
  const handleGenerateLookbook = async () => {
    setIsSnapping(true);
    toast.info('Generating 4-angle lookbook...');

    setCameraView('front');
    await new Promise(r => setTimeout(r, 450));
    const canvas1 = canvasContainerRef.current?.querySelector('canvas');
    const frontSnap = canvas1 ? canvas1.toDataURL('image/png') : '';

    setCameraView('back');
    await new Promise(r => setTimeout(r, 450));
    const canvas2 = canvasContainerRef.current?.querySelector('canvas');
    const backSnap = canvas2 ? canvas2.toDataURL('image/png') : '';

    setCameraView('sleeve-left');
    await new Promise(r => setTimeout(r, 450));
    const canvasSleeve = canvasContainerRef.current?.querySelector('canvas');
    const sleeveSnap = canvasSleeve ? canvasSleeve.toDataURL('image/png') : '';

    setCameraView('angle-left');
    await new Promise(r => setTimeout(r, 450));
    const canvas3 = canvasContainerRef.current?.querySelector('canvas');
    const angleSnap = canvas3 ? canvas3.toDataURL('image/png') : '';

    setLookbookSnapshots({ front: frontSnap, back: backSnap, sleeve: sleeveSnap, angle: angleSnap });
    setIsSnapping(false);
    setLookbookModalOpen(true);
  };

  // Download snapshot
  const downloadSnapshot = (url: string, label: string) => {
    const link = document.createElement('a');
    link.download = `inkwave-custom-${selectedColor.name.toLowerCase()}-${label}.png`;
    link.href = url;
    link.click();
  };

  // Add to Bag action
  const handleAddToBag = () => {
    if (graphics.length === 0 && !typographyEnabled) {
      toast.error('Please add at least one graphic or text decal to your shirt.');
      return;
    }

    setAdding(true);

    const canvas = canvasContainerRef.current?.querySelector('canvas');
    const snapshotUrl = canvas ? canvas.toDataURL('image/png') : selectedColor.image;

    const printItem = {
      id: `custom-print-${Date.now()}`,
      name: `Bespoke Streetwear Tee (${selectedColor.name})`,
      slug: 'custom-print',
      price: basePrice || 699,
      images: [snapshotUrl, selectedColor.image],
      selected_size: selectedSize,
      quantity: 1,
      is_custom_print: true,
      custom_print_metadata: {
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        size: selectedSize,
        fabricWash: fabricWash,
        customLabel: customLabel,
        graphics: graphics.map(g => ({
          name: g.name,
          side: g.side,
          scale: g.scale,
          x: g.x,
          y: g.y,
          finish: g.finish || 'matte',
          url: g.processedUrl || g.url,
          processedUrl: g.processedUrl || g.url,
          rawUrl: g.url // Pristine original high-resolution user upload for Surat factory printing
        })),
        graphic_layers: graphics.map(g => ({
          name: g.name,
          side: g.side,
          scale: g.scale,
          x: g.x,
          y: g.y,
          finish: g.finish || 'matte',
          url: g.processedUrl || g.url,
          processedUrl: g.processedUrl || g.url,
          rawUrl: g.url
        })),
        typography: typographyEnabled && customText.trim() ? {
          text: customText,
          subtext: customSubtext,
          font: selectedFont,
          textColor: selectedTextColor,
          isCurved: isCurvedText,
          isOutline: isOutlineText,
          y: typographyY
        } : null
      }
    };

    addItem(printItem as any);
    toast.success('Added custom t-shirt to your bag!');
    setCartDrawerOpen(true);
    setAdding(false);
  };

  const filteredStickers = selectedStickerCat === 'all' 
    ? stickers 
    : stickers.filter(s => s.category === selectedStickerCat);

  if (!isConfigLoading && !isPrintLabEnabled) {
    return (
      <main className="pt-28 pb-32 min-h-screen bg-black flex items-center justify-center px-4 text-white">
        <div className="max-w-2xl w-full mx-auto text-center space-y-6 p-8 rounded-3xl border border-[#222] bg-[#09090b]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs uppercase">
            <Construction className="w-4 h-4 animate-bounce" />
            <span>3D Studio Notice // Upgrade in Progress</span>
          </div>
          <h1 className="font-display text-4xl uppercase font-black text-white">
            3D Customizer Under Upgrade
          </h1>
          <Link href="/" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-full text-xs uppercase">
            Explore Drops &rarr;
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-32 min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── 3D VIEWPORT CONTAINER (7 Cols) ─── */}
        <div className="w-full lg:col-span-7 lg:sticky lg:top-28 flex flex-col z-20 space-y-3">
          
          <div 
            ref={canvasContainerRef}
            className="w-full h-[450px] sm:h-[530px] lg:h-[630px] bg-[#09090b] rounded-3xl border border-[var(--line)] overflow-hidden relative shadow-2xl flex items-center justify-center select-none"
          >
            {/* Realtime 3D Canvas with Direct On-Mesh Dragging */}
            <CustomPrintCanvas
              color={selectedColor.hex}
              fabricWash={fabricWash}
              autoRotate={autoRotate}
              enableOrbit={interactionMode === 'rotate'}
              onDragDecal={handleDirectDragDecal}
              graphics={graphics}
              typographyTexture={typographyEnabled ? typographyTexture : null}
              typographyOptions={{
                x: 0,
                y: typographyY,
                scale: typographyScale,
                rotate: 0
              }}
              activeView={cameraView}
            />

            {/* ─── Top Bar: Camera Angles & Lookbook ─── */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
              
              {/* Front / Back / L-Sleeve / R-Sleeve / 3/4 View Buttons */}
              <div className="flex bg-black/85 backdrop-blur-md border border-white/10 p-1 rounded-2xl pointer-events-auto shadow-lg overflow-x-auto max-w-[310px] sm:max-w-none">
                <button
                  onClick={() => setCameraView('front')}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'front' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setCameraView('back')}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'back' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Back
                </button>
                <button
                  onClick={() => setCameraView('sleeve-left')}
                  className={`px-2.5 py-1.5 text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'sleeve-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  L-Sleeve
                </button>
                <button
                  onClick={() => setCameraView('sleeve-right')}
                  className={`px-2.5 py-1.5 text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'sleeve-right' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  R-Sleeve
                </button>
                <button
                  onClick={() => setCameraView('angle-left')}
                  className={`px-2.5 py-1.5 text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'angle-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  3/4
                </button>
              </div>

              {/* Lookbook & Auto-Spin Action */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  title="Auto 360 Spin"
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${autoRotate ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-black/80 text-white border-white/10'}`}
                >
                  {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleGenerateLookbook}
                  disabled={isSnapping}
                  className="px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-white/10 hover:border-[var(--accent)] text-white text-xs font-mono uppercase tracking-wider rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Camera className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{isSnapping ? 'Rendering...' : 'Lookbook'}</span>
                </button>
              </div>
            </div>

            {/* ─── Center-Bottom Interactive Mode Switcher & Gesture Tip ─── */}
            <div className="absolute bottom-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              
              {/* Mode Toggle Pill: Move Artwork vs Orbit 3D */}
              <div className="flex bg-black/85 backdrop-blur-md border border-white/15 p-1 rounded-2xl pointer-events-auto shadow-xl">
                <button
                  onClick={() => setInteractionMode('move')}
                  className={`px-3.5 py-1.5 text-xs font-mono uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${interactionMode === 'move' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Move Design</span>
                </button>
                <button
                  onClick={() => setInteractionMode('rotate')}
                  className={`px-3.5 py-1.5 text-xs font-mono uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${interactionMode === 'rotate' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Spin 3D</span>
                </button>
              </div>

              {/* Gesture Helper Badge */}
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-2xl text-[10px] font-mono tracking-wider text-[var(--accent)] uppercase pointer-events-none">
                {interactionMode === 'move' ? '👆 Touch & drag on shirt to place' : '🔄 Drag to rotate view in 3D'}
              </div>
            </div>

          </div>

          {/* ─── Multi-Design Layer Selector Chips ─── */}
          <div className="p-3 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> Active Graphic Layers ({graphics.length})
              </span>
              <label className="px-2.5 py-1 rounded-xl bg-[var(--accent)] text-black text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:opacity-90 transition-all">
                <Plus className="w-3 h-3" />
                <span>Add Graphic</span>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {graphics.map((layer, idx) => (
                <div 
                  key={layer.id}
                  onClick={() => {
                    setSelectedLayerId(layer.id);
                    setCameraView(layer.side);
                    setInteractionMode('move');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${selectedLayerId === layer.id ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold shadow' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                >
                  <span className="text-[10px] opacity-60">#{idx + 1}</span>
                  <div className="w-4 h-4 rounded bg-black flex items-center justify-center overflow-hidden border border-white/10">
                    <img src={layer.processedUrl || layer.url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span>{layer.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    layer.side === 'sleeve-left' || layer.side === 'sleeve-right' 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-white/10 text-[var(--text-dim)]'
                  }`}>
                    {layer.side === 'sleeve-left' ? 'L-Sleeve' : layer.side === 'sleeve-right' ? 'R-Sleeve' : layer.side}
                  </span>
                  {graphics.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveLayer(layer.id); }}
                      className="hover:text-red-400 p-0.5 ml-1"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ─── OPTIONS & SIMPLE CONTROLS CONTENT (5 Cols) ─── */}
        <div className="w-full lg:col-span-5 flex flex-col space-y-4 z-10 relative bg-[var(--bg)]">
          
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20 flex items-center gap-1">
                <Sparkle className="w-3 h-3" /> 3D CUSTOM STUDIO
              </span>
              <span className="text-xs font-mono text-[var(--text-dim)]">• 240GSM BOXY COTTON</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ₹{basePrice || 699} FLAT RATE
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold tracking-tight">
              Design Your T-Shirt
            </h1>
            <p className="text-xs text-[var(--text-dim)] font-mono">
              Bespoke 240GSM French Terry cotton t-shirt with custom artwork across Chest, Back, and Sleeves. ₹{basePrice || 699} with all prints & free shipping included!
            </p>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── 🎛️ SIMPLE STEP TABS ──────────────────────────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab('garment')}
              className={`py-2 px-1 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'garment' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <Palette className="w-4 h-4" />
              <span>1. Garment</span>
            </button>
            <button
              onClick={() => setActiveTab('art')}
              className={`py-2 px-1 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'art' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>2. Artwork</span>
            </button>
            <button
              onClick={() => setActiveTab('size')}
              className={`py-2 px-1 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'size' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <Move className="w-4 h-4" />
              <span>3. Placement</span>
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`py-2 px-1 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'recipes' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <Flame className="w-4 h-4" />
              <span>Presets</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── STEP 1: 👕 GARMENT BASE & SIZING (S to XXL) ───────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'garment' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-4 animate-in fade-in duration-200">
              
              {/* Color Picker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[var(--accent)]" /> Garment Color
                  </label>
                  <span className="text-xs font-mono text-[var(--accent)] font-bold uppercase">
                    {selectedColor.name}
                  </span>
                </div>

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
              </div>

              {/* T-Shirt Size Selector (S, M, L, XL, XXL) */}
              <div className="pt-2 border-t border-[var(--line)] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] block">
                    Garment Size (Unisex Oversized Fit)
                  </label>
                  <span className="text-xs font-mono text-[var(--accent)] font-bold">{selectedSize}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 text-xs font-mono uppercase rounded-xl border transition-all cursor-pointer ${selectedSize === sz ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Finish Style */}
              <div className="pt-2 border-t border-[var(--line)] space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] block">
                  Fabric Finish & Wash
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'solid', label: 'Solid Heavy', desc: '240GSM Cotton' },
                    { id: 'acid-wash', label: 'Acid Wash', desc: 'Vintage Mineral' },
                    { id: 'mercerized', label: 'Silky Sheen', desc: 'Mercerized Cotton' }
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setFabricWash(w.id as FabricWashStyle)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${fabricWash === w.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                    >
                      <div className="text-xs font-mono font-bold">{w.label}</div>
                      <div className="text-[9px] font-mono opacity-60">{w.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Woven Neck / Hem Label */}
              <div className="pt-2 border-t border-[var(--line)] space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[var(--accent)]" /> Custom Woven Neck Label (Included)
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. EDITION 01 // YOUR NAME"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:border-[var(--accent)] outline-none uppercase"
                />
              </div>

              {/* Next Step CTA */}
              <button
                type="button"
                onClick={() => setActiveTab('art')}
                className="w-full bg-[var(--bg)] border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black font-mono font-bold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Next: Add Artwork & Sleeves &rarr;</span>
              </button>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── STEP 2: 🖼️ ARTWORK & UPLOAD (WITH AI AUTO-CLEAN) ─────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'art' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Big AI Upload Dropzone */}
              <label className="p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-dashed border-[var(--accent)]/40 hover:border-[var(--accent)] flex flex-col items-center text-center gap-3 cursor-pointer transition-all group shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-[var(--text)] uppercase flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Upload Image / Logo (JPG, PNG, WebP)
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-dim)] mt-1">
                    AI automatically strips the background and centers it on your t-shirt
                  </p>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-black font-mono font-bold text-xs uppercase shadow">
                  Choose Photo / Graphic
                </span>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {/* Active Graphic Card with AI Clean Button */}
              {activeGraphic && (
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] flex items-center justify-between gap-3 shadow">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center p-1 shrink-0">
                      <img src={activeGraphic.processedUrl || activeGraphic.url} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-mono font-bold text-[var(--text)] truncate">{activeGraphic.name}</div>
                      <div className="text-[10px] font-mono text-[var(--accent)] capitalize">
                        {activeGraphic.side === 'sleeve-left' ? 'Left Sleeve' : activeGraphic.side === 'sleeve-right' ? 'Right Sleeve' : activeGraphic.side} View • Drag on 3D shirt to move
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleReRunAIClean}
                      disabled={isProcessingAI}
                      className="px-2.5 py-1.5 rounded-xl bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[10px] font-mono text-[var(--accent)] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="AI Background Cleaner"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>{isProcessingAI ? 'Cleaning...' : 'AI Clean'}</span>
                    </button>
                    {graphics.length > 1 && (
                      <button
                        onClick={() => handleRemoveLayer(activeGraphic.id)}
                        className="p-1.5 text-[var(--text-dim)] hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Streetwear & Sleeve Decals Library */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Free Streetwear & Sleeve Decals ({filteredStickers.length})
                  </span>
                </div>

                {/* Category Chips */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'sleeve', label: '🦾 Sleeves' },
                    { id: 'y2k', label: '🔥 Y2K' },
                    { id: 'gothic', label: '⚡ Gothic' },
                    { id: 'tokyo', label: '🎌 Tokyo' },
                    { id: 'minimal', label: '💎 Minimal' },
                    { id: 'skulls', label: '💀 Skulls' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedStickerCat(cat.id as any)}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg border shrink-0 transition-all cursor-pointer ${selectedStickerCat === cat.id ? 'border-[var(--accent)] bg-[var(--accent)] text-black font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {filteredStickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => handleAddSticker(sticker)}
                      className="p-2 rounded-xl border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--bg)] flex items-center gap-2 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center p-1 shrink-0 group-hover:border-[var(--accent)]">
                        <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-mono font-bold text-[var(--text)] truncate">{sticker.name}</div>
                        <div className="text-[9px] font-mono text-[var(--text-dim)] truncate">
                          {sticker.category === 'sleeve' ? '🦾 Sleeve Placement' : sticker.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Custom Streetwear Text */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-[var(--accent)]" /> Add Streetwear Text
                  </span>
                  <button
                    onClick={() => setTypographyEnabled(!typographyEnabled)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono uppercase transition-all cursor-pointer ${typographyEnabled ? 'bg-[var(--accent)] text-black font-bold' : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--text-dim)]'}`}
                  >
                    {typographyEnabled ? 'Enabled' : '+ Add Text'}
                  </button>
                </div>

                {typographyEnabled && (
                  <div className="space-y-2.5 pt-1">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. INKWAVE 2026"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] uppercase outline-none focus:border-[var(--accent)]"
                    />

                    <div className="grid grid-cols-2 gap-1.5">
                      {STREETWEAR_FONTS.slice(0, 4).map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setSelectedFont(f.family)}
                          className={`p-2 rounded-xl border text-left cursor-pointer ${selectedFont === f.family ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                        >
                          <div className="text-xs truncate" style={{ fontFamily: f.family }}>{f.name}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setIsCurvedText(!isCurvedText)}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-mono uppercase cursor-pointer ${isCurvedText ? 'bg-[var(--accent)] text-black font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                      >
                        {isCurvedText ? '✓ Curved' : 'Curve Text'}
                      </button>
                      <button
                        onClick={() => setIsOutlineText(!isOutlineText)}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-mono uppercase cursor-pointer ${isOutlineText ? 'bg-[var(--accent)] text-black font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'}`}
                      >
                        {isOutlineText ? '✓ Outline' : 'Outline'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Step CTA */}
              <button
                type="button"
                onClick={() => setActiveTab('size')}
                className="w-full bg-[var(--bg)] border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black font-mono font-bold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Next: Placement & Sizing &rarr;</span>
              </button>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── STEP 3: 📏 SIZE, SIDE & PLACEMENT ─────────────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'size' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-4 animate-in fade-in duration-200">
              
              {/* Front / Back / L-Sleeve / R-Sleeve Toggle */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)]">
                    Print Surface / Side
                  </label>
                  <span className="text-[10px] font-mono text-[var(--accent)] uppercase font-bold">
                    Target: {activeGraphic?.side || 'Front'}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
                  <button
                    onClick={() => { updateActiveLayer({ side: 'front' }); setCameraView('front'); }}
                    className={`py-2 text-xs font-mono uppercase rounded-lg cursor-pointer transition-all ${activeGraphic?.side === 'front' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => { updateActiveLayer({ side: 'back' }); setCameraView('back'); }}
                    className={`py-2 text-xs font-mono uppercase rounded-lg cursor-pointer transition-all ${activeGraphic?.side === 'back' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => { updateActiveLayer({ side: 'sleeve-left' }); setCameraView('sleeve-left'); }}
                    className={`py-2 text-xs font-mono uppercase rounded-lg cursor-pointer transition-all ${activeGraphic?.side === 'sleeve-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                  >
                    L-Sleeve
                  </button>
                  <button
                    onClick={() => { updateActiveLayer({ side: 'sleeve-right' }); setCameraView('sleeve-right'); }}
                    className={`py-2 text-xs font-mono uppercase rounded-lg cursor-pointer transition-all ${activeGraphic?.side === 'sleeve-right' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                  >
                    R-Sleeve
                  </button>
                </div>
              </div>

              {/* Quick 1-Tap Alignment Zones */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] block">
                  Quick Placement Presets
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {PLACEMENT_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleApplyPlacement(p)}
                      className={`py-2 px-1 text-[10px] font-mono uppercase border rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        activeGraphic?.side === p.side 
                          ? 'bg-[var(--bg)] border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)]' 
                          : 'bg-[var(--bg)] opacity-60 border-transparent hover:opacity-100'
                      }`}
                    >
                      <span className="text-sm">{p.icon}</span>
                      <span className="truncate max-w-full text-center">{p.name.replace('L-Sleeve ', 'L-').replace('R-Sleeve ', 'R-')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Sizing Presets */}
              <div className="pt-2 border-t border-[var(--line)] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[var(--accent)]" /> Artwork Size & Scaling
                  </label>
                  <span className="text-xs font-mono text-[var(--accent)] font-bold">
                    {activeGraphic?.scale || 45}% Scale
                  </span>
                </div>

                {/* 4 Preset Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SIZING_PRESETS.map((sz) => (
                    <button
                      key={sz.id}
                      onClick={() => handleApplySizing(sz)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${activeGraphic?.scale === sz.scale ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold shadow-xs' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                    >
                      <div className="text-[11px] font-mono font-bold">{sz.name}</div>
                      <div className="text-[9px] font-mono opacity-60">{sz.cmLabel} ({sz.scale}%)</div>
                    </button>
                  ))}
                </div>

                {/* Quick Sizing Pills */}
                <div className="flex gap-1.5 flex-wrap items-center pt-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-dim)] mr-1">Quick Sizes:</span>
                  {[
                    { label: 'Badge', scale: 22 },
                    { label: 'Chest', scale: 45 },
                    { label: 'Oversize', scale: 62 },
                    { label: 'Statement', scale: 78 }
                  ].map(pill => (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => updateActiveLayer({ scale: pill.scale })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        activeGraphic?.scale === pill.scale
                          ? 'bg-[var(--accent)] text-black'
                          : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'
                      }`}
                    >
                      {pill.label} ({pill.scale}%)
                    </button>
                  ))}
                </div>

                {/* Sizing Slider with Precision +/- Controls */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono">
                    <span>Smaller (15%)</span>
                    <span>Standard (45%)</span>
                    <span>Oversized (85%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ scale: Math.max(15, (activeGraphic?.scale || 45) - 5) })}
                      className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer transition-colors"
                      title="Decrease 5%"
                    >
                      -5%
                    </button>
                    <input 
                      type="range" 
                      min="15" 
                      max="85" 
                      value={activeGraphic?.scale || 45} 
                      onChange={e => updateActiveLayer({ scale: Number(e.target.value) })} 
                      className="flex-1 accent-[var(--accent)] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ scale: Math.min(85, (activeGraphic?.scale || 45) + 5) })}
                      className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer transition-colors"
                      title="Increase 5%"
                    >
                      +5%
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Drag Instruction Card */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-white/10 flex items-center gap-3 shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                  <Hand className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <p className="text-[11px] font-mono text-[var(--text-dim)] leading-relaxed">
                  Touch & drag directly on the 3D t-shirt on the left to freely move your artwork anywhere on the chest, back, or sleeves!
                </p>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── STEP 4: ⚡ 1-TAP STREETWEAR PRESETS ───────────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'recipes' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)] block px-1">
                1-Tap Complete Streetwear Outfits
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {recipes.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => handleApplyRecipe(rec)}
                    className="p-3.5 rounded-2xl border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--bg-card)] flex items-center gap-3 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div 
                      className="w-11 h-11 rounded-xl border border-white/20 flex items-center justify-center p-1 shrink-0"
                      style={{ backgroundColor: rec.tshirtHex }}
                    >
                      <img src={rec.sticker.url} alt={rec.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-mono font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{rec.name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-dim)] truncate mt-0.5">{rec.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── CHECKOUT & ADD TO BAG (STICKY BOTTOM BAR) ────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleAddToBag}
              disabled={adding || (graphics.length === 0 && !typographyEnabled)}
              className="w-full bg-[var(--accent)] text-black hover:opacity-90 py-4 rounded-2xl font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase Bespoke Custom Tee • ₹{basePrice || 699}</span>
            </button>

            <div className="flex gap-2.5 items-start bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-[var(--text-dim)] leading-relaxed">
                Atomic vector dispatch. Hand-printed on 240GSM cotton in Surat with luxury wash finish. Free Express Shipping & 100% Free Fit Exchanges included.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ─── 📸 3-ANGLE LOOKBOOK PRESENTATION MODAL ────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {lookbookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full bg-[#09090b] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                  3D STUDIO LOOKBOOK RENDER
                </span>
                <h3 className="font-display text-2xl font-bold uppercase text-white mt-1">
                  {selectedColor.name} Bespoke Streetwear Tee
                </h3>
              </div>
              <button 
                onClick={() => setLookbookModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Multi-Angle Snapshot Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Front Card */}
              <div className="bg-black/60 rounded-2xl border border-white/10 p-3 flex flex-col space-y-3">
                <div className="w-full aspect-[4/5] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                  {lookbookSnapshots.front ? (
                    <img src={lookbookSnapshots.front} alt="Front lookbook" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs font-mono text-white/40">Front Hero</div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white uppercase">Front Hero</span>
                  {lookbookSnapshots.front && (
                    <button 
                      onClick={() => downloadSnapshot(lookbookSnapshots.front!, 'front')}
                      className="p-1.5 bg-white/10 hover:bg-[var(--accent)] hover:text-black rounded-lg text-white transition-all cursor-pointer"
                      title="Download Front"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Back Card */}
              <div className="bg-black/60 rounded-2xl border border-white/10 p-3 flex flex-col space-y-3">
                <div className="w-full aspect-[4/5] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                  {lookbookSnapshots.back ? (
                    <img src={lookbookSnapshots.back} alt="Back lookbook" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs font-mono text-white/40">Back Hero</div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white uppercase">Back Graphic</span>
                  {lookbookSnapshots.back && (
                    <button 
                      onClick={() => downloadSnapshot(lookbookSnapshots.back!, 'back')}
                      className="p-1.5 bg-white/10 hover:bg-[var(--accent)] hover:text-black rounded-lg text-white transition-all cursor-pointer"
                      title="Download Back"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sleeve Card */}
              <div className="bg-black/60 rounded-2xl border border-white/10 p-3 flex flex-col space-y-3">
                <div className="w-full aspect-[4/5] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                  {lookbookSnapshots.sleeve ? (
                    <img src={lookbookSnapshots.sleeve} alt="Sleeve lookbook" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs font-mono text-white/40">Sleeve Detail</div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white uppercase">Sleeve Detail</span>
                  {lookbookSnapshots.sleeve && (
                    <button 
                      onClick={() => downloadSnapshot(lookbookSnapshots.sleeve!, 'sleeve')}
                      className="p-1.5 bg-white/10 hover:bg-[var(--accent)] hover:text-black rounded-lg text-white transition-all cursor-pointer"
                      title="Download Sleeve"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3/4 Angle Card */}
              <div className="bg-black/60 rounded-2xl border border-white/10 p-3 flex flex-col space-y-3">
                <div className="w-full aspect-[4/5] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                  {lookbookSnapshots.angle ? (
                    <img src={lookbookSnapshots.angle} alt="3/4 perspective lookbook" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs font-mono text-white/40">3/4 Dynamic Angle</div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white uppercase">3/4 Dynamic</span>
                  {lookbookSnapshots.angle && (
                    <button 
                      onClick={() => downloadSnapshot(lookbookSnapshots.angle!, '3quarter')}
                      className="p-1.5 bg-white/10 hover:bg-[var(--accent)] hover:text-black rounded-lg text-white transition-all cursor-pointer"
                      title="Download 3/4 View"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-white/10">
              <span className="text-xs font-mono text-[var(--text-dim)]">
                Rendered at 60FPS WebGL in Surat Lab Studio.
              </span>
              <button 
                onClick={() => setLookbookModalOpen(false)}
                className="px-6 py-2.5 bg-[var(--accent)] text-black font-mono font-bold text-xs uppercase rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Done & Return to Studio
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
