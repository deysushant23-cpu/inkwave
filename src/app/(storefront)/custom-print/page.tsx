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
  RotateCcw,
  Download, 
  Flame, 
  Eye,
  Hand,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Scan,
  Zap,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Sliders,
  FileText,
  Undo2,
  Redo2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  generateTextDecal, 
  processImageWithAI,
  enhanceImageWithAIUpscale,
  loadCustomFontFile,
  GraphicLayer,
  PrintSurface,
  SURFACE_BOUNDARIES,
  autoFitLayer,
  PrintFinish, 
  PLACEMENT_PRESETS, 
  STREETWEAR_FONTS, 
  StreetwearFont,
  INK_COLORS,
  STREETWEAR_STICKERS,
  StreetwearSticker,
  DESIGN_RECIPES,
  DesignRecipe,
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

const SURFACES: { id: PrintSurface; label: string; shortLabel: string; icon: string }[] = [
  { id: 'front', label: 'Front Chest', shortLabel: 'FRONT', icon: '🎯' },
  { id: 'back', label: 'Back', shortLabel: 'BACK', icon: '🔥' },
  { id: 'sleeve-left', label: 'Left Sleeve', shortLabel: 'L-SLEEVE', icon: '🦾' },
  { id: 'sleeve-right', label: 'Right Sleeve', shortLabel: 'R-SLEEVE', icon: '🦾' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Dynamic import for R3F Canvas
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
  // Navigation & Surface State
  const [activeSurface, setActiveSurface] = useState<PrintSurface>('front');
  const [activeTab, setActiveTab] = useState<'garment' | 'art' | 'layers' | 'presets'>('art');
  const [interactionMode, setInteractionMode] = useState<'move' | 'rotate'>('move');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showPrecision, setShowPrecision] = useState<boolean>(false);

  // Garment Configuration (Strictly 240 GSM Cotton Terry)
  const [basePrice, setBasePrice] = useState<number>(600);
  const [colors, setColors] = useState<ColorPreset[]>(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState<ColorPreset>(DEFAULT_COLORS[1]); // Ink Black default
  const [selectedSize, setSelectedSize] = useState<string>('L');

  // Dynamic Stickers and Presets
  const [stickers, setStickers] = useState<StreetwearSticker[]>(STREETWEAR_STICKERS);
  const [recipes, setRecipes] = useState<DesignRecipe[]>(DESIGN_RECIPES);
  const [selectedStickerCat, setSelectedStickerCat] = useState<StickerCategory | 'all'>('all');

  // Multi-Surface Graphic Layer Stack
  const [graphics, setGraphics] = useState<GraphicLayer[]>([
    {
      id: 'layer-1',
      name: 'Cyber Star',
      url: STREETWEAR_STICKERS[3].url,
      processedUrl: STREETWEAR_STICKERS[3].url,
      rawUrl: STREETWEAR_STICKERS[3].url,
      side: 'front',
      layerType: 'vector',
      x: 0,
      y: 38,
      scale: 46,
      scaleX: 100,
      scaleY: 100,
      aspectRatioLocked: true,
      flipX: false,
      flipY: false,
      opacity: 100,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-1');

  // Undo / Redo History Stack
  const [history, setHistory] = useState<GraphicLayer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Text Modal / Studio State
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textInput, setTextInput] = useState('INKWAVE');
  const [subtextInput, setSubtextInput] = useState('TOKYO // 2026');
  const [textFont, setTextFont] = useState(STREETWEAR_FONTS[0].family);
  const [textColor, setTextColor] = useState(INK_COLORS[0].hex);
  const [textStretch, setTextStretch] = useState(100);
  const [textCurved, setTextCurved] = useState(false);
  const [textCurveRadius, setTextCurveRadius] = useState(260);
  const [textOutline, setTextOutline] = useState(false);
  const [textOutlineColor, setTextOutlineColor] = useState('#000000');
  const [customFonts, setCustomFonts] = useState<StreetwearFont[]>([]);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  // Processing & Lookbook States
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isUpscalingAI, setIsUpscalingAI] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [lookbookModalOpen, setLookbookModalOpen] = useState(false);
  const [lookbookSnapshots, setLookbookSnapshots] = useState<{ front?: string; back?: string; sleeveLeft?: string; sleeveRight?: string }>({});

  const [isPrintLabEnabled, setIsPrintLabEnabled] = useState<boolean>(true);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(true);

  const { addItem, setCartDrawerOpen } = useCartStore();
  const supabase = createClient();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  const allAvailableFonts = [...customFonts, ...STREETWEAR_FONTS];

  // Currently selected layer & current surface layers
  const currentSurfaceLayers = graphics.filter(g => g.side === activeSurface);
  const activeGraphic = graphics.find(g => g.id === selectedLayerId) || currentSurfaceLayers[0] || null;

  // Record history when layers change
  const pushHistoryState = (newLayers: GraphicLayer[]) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newLayers];
    });
    setHistoryIndex(prev => prev + 1);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const previousState = history[newIdx];
      setHistoryIndex(newIdx);
      setGraphics(previousState);
      toast.info('Undo applied');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const nextState = history[newIdx];
      setHistoryIndex(newIdx);
      setGraphics(nextState);
      toast.info('Redo applied');
    }
  };

  // Surface Switcher (Rotates 3D camera and sets active surface)
  const handleSelectSurface = (surface: PrintSurface) => {
    setActiveSurface(surface);
    setAutoRotate(false);
    // If active layer is not on this surface, select the first layer on this surface
    const firstLayerOnSurface = graphics.find(g => g.side === surface);
    if (firstLayerOnSurface) {
      setSelectedLayerId(firstLayerOnSurface.id);
    }
  };

  // Update active layer properties
  const updateActiveLayer = (updates: Partial<GraphicLayer>) => {
    if (!activeGraphic) return;
    const updated = graphics.map(g => (g.id === activeGraphic.id ? { ...g, ...updates } : g));
    setGraphics(updated);
  };

  const commitLayerChange = (updates: Partial<GraphicLayer>) => {
    if (!activeGraphic) return;
    const updated = graphics.map(g => (g.id === activeGraphic.id ? { ...g, ...updates } : g));
    setGraphics(updated);
    pushHistoryState(updated);
  };

  // Initialize and load database CMS configuration
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
          setBasePrice(Number(configRes.data.json_content.price) || 600);
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
            if (matched) setSelectedColor(matched);
          }
          if (dd.size) setSelectedSize(dd.size);
          if (dd.graphics && Array.isArray(dd.graphics) && dd.graphics.length > 0) {
            const parsedGraphics: GraphicLayer[] = dd.graphics.map((g: any, idx: number) => ({
              id: g.id || `layer-${idx + 1}`,
              name: g.name || 'Graphic Decal',
              url: g.url || '',
              processedUrl: g.processedUrl || g.url || '',
              rawUrl: g.url || '',
              side: (g.side as PrintSurface) || 'front',
              scale: typeof g.scale === 'number' ? g.scale : 46,
              scaleX: typeof g.scaleX === 'number' ? g.scaleX : 100,
              scaleY: typeof g.scaleY === 'number' ? g.scaleY : 100,
              aspectRatioLocked: g.aspectRatioLocked !== false,
              flipX: !!g.flipX,
              flipY: !!g.flipY,
              opacity: typeof g.opacity === 'number' ? g.opacity : 100,
              x: typeof g.x === 'number' ? g.x : 0,
              y: typeof g.y === 'number' ? g.y : 38,
              rotate: g.rotate || 0,
              finish: g.finish || 'matte',
              removeBg: g.removeBg || false,
              bgTolerance: g.bgTolerance || 35
            }));
            setGraphics(parsedGraphics);
            pushHistoryState(parsedGraphics);
            if (parsedGraphics[0]?.id) setSelectedLayerId(parsedGraphics[0].id);
          }
        } else {
          pushHistoryState(graphics);
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

  // Direct On-Garment Drag Handler (Precise 4-Surface Dragging)
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

    const bounds = SURFACE_BOUNDARIES[activeGraphic.side] || SURFACE_BOUNDARIES.front;
    const newX = Math.max(bounds.minX, Math.min(bounds.maxX, Math.round(activeGraphic.x + xDelta)));
    const newY = Math.max(bounds.minY, Math.min(bounds.maxY, Math.round(activeGraphic.y + yDelta)));

    updateActiveLayer({ x: newX, y: newY });
  };

  // Precision Nudge Controller
  const handleNudgePosition = (direction: 'up' | 'down' | 'left' | 'right' | 'center', step = 4) => {
    if (!activeGraphic) return;
    if (direction === 'center') {
      commitLayerChange({ x: 0, y: 38 });
      toast.info('Centered artwork');
      return;
    }
    const bounds = SURFACE_BOUNDARIES[activeGraphic.side] || SURFACE_BOUNDARIES.front;
    let newX = activeGraphic.x;
    let newY = activeGraphic.y;
    if (direction === 'up') newY = Math.max(bounds.minY, activeGraphic.y - step);
    if (direction === 'down') newY = Math.min(bounds.maxY, activeGraphic.y + step);
    if (direction === 'left') newX = Math.max(bounds.minX, activeGraphic.x - step);
    if (direction === 'right') newX = Math.min(bounds.maxX, activeGraphic.x + step);
    commitLayerChange({ x: newX, y: newY });
  };

  // File Upload with Automatic Validation & Clean Transparency
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image (PNG, JPG, WebP)');
      return;
    }

    setIsProcessingAI(true);
    toast.info('Analyzing image & optimizing resolution...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      
      // Auto-clean background if applicable
      const { cleanUrl, hasRemovedBg } = await processImageWithAI(rawBase64);
      const bounds = SURFACE_BOUNDARIES[activeSurface];

      const newLayer: GraphicLayer = {
        id: `layer-${Date.now()}`,
        name: file.name.slice(0, 16),
        url: rawBase64,
        processedUrl: cleanUrl,
        rawUrl: rawBase64,
        side: activeSurface,
        layerType: 'image',
        x: 0,
        y: 38,
        scale: bounds.defaultScale,
        scaleX: 100,
        scaleY: 100,
        aspectRatioLocked: true,
        flipX: false,
        flipY: false,
        opacity: 100,
        rotate: 0,
        finish: 'matte',
        removeBg: hasRemovedBg,
        bgTolerance: 35,
        isUpscaled: false
      };

      const updated = [...graphics, newLayer];
      setGraphics(updated);
      pushHistoryState(updated);
      setSelectedLayerId(newLayer.id);
      setInteractionMode('move');
      setIsProcessingAI(false);

      toast.success(`Artwork added to ${SURFACES.find(s => s.id === activeSurface)?.label || activeSurface}!`);
    };
    reader.readAsDataURL(file);
  };

  // Add Vector Graphic from Library
  const handleAddVectorSticker = (sticker: StreetwearSticker) => {
    const bounds = SURFACE_BOUNDARIES[activeSurface];
    const newLayer: GraphicLayer = {
      id: `layer-${Date.now()}`,
      name: sticker.name,
      url: sticker.url,
      processedUrl: sticker.url,
      rawUrl: sticker.url,
      side: activeSurface,
      layerType: 'vector',
      x: 0,
      y: 38,
      scale: bounds.defaultScale,
      scaleX: 100,
      scaleY: 100,
      aspectRatioLocked: true,
      flipX: false,
      flipY: false,
      opacity: 100,
      rotate: 0,
      finish: 'matte',
      removeBg: false,
      bgTolerance: 35
    };

    const updated = [...graphics, newLayer];
    setGraphics(updated);
    pushHistoryState(updated);
    setSelectedLayerId(newLayer.id);
    toast.success(`Added ${sticker.name} to ${SURFACES.find(s => s.id === activeSurface)?.label}!`);
  };

  // Generate and Add Text Decal Layer
  const handleCreateTextLayer = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsGeneratingText(true);
    try {
      const dataUri = await generateTextDecal({
        text: textInput,
        subtext: subtextInput,
        fontFamily: textFont,
        fontSize: 72,
        color: textColor,
        letterSpacing: 4,
        stretchX: textStretch,
        isCurved: textCurved,
        curveRadius: textCurveRadius,
        isOutline: textOutline,
        outlineWidth: 4,
        outlineColor: textOutlineColor,
        shadow: false
      });

      const bounds = SURFACE_BOUNDARIES[activeSurface];
      const newLayer: GraphicLayer = {
        id: `layer-text-${Date.now()}`,
        name: `"${textInput.slice(0, 12)}"`,
        url: dataUri,
        processedUrl: dataUri,
        rawUrl: dataUri,
        side: activeSurface,
        layerType: 'text',
        textOptions: {
          text: textInput,
          subtext: subtextInput,
          fontFamily: textFont,
          color: textColor,
          isCurved: textCurved,
          isOutline: textOutline
        },
        x: 0,
        y: 38,
        scale: bounds.defaultScale,
        scaleX: 100,
        scaleY: 100,
        aspectRatioLocked: true,
        flipX: false,
        flipY: false,
        opacity: 100,
        rotate: 0,
        finish: 'matte',
        removeBg: false,
        bgTolerance: 35
      };

      const updated = [...graphics, newLayer];
      setGraphics(updated);
      pushHistoryState(updated);
      setSelectedLayerId(newLayer.id);
      setTextModalOpen(false);
      toast.success(`Added text decal to ${SURFACES.find(s => s.id === activeSurface)?.label}!`);
    } catch (err) {
      console.error('Error generating text decal:', err);
      toast.error('Could not create text decal');
    } finally {
      setIsGeneratingText(false);
    }
  };

  // AI HD Upscaler / 300 DPI Booster
  const handleAIUpscale = async () => {
    if (!activeGraphic) return;
    setIsUpscalingAI(true);
    toast.info('✨ Upscaling artwork to 300 DPI print resolution...');
    try {
      const sourceImage = activeGraphic.processedUrl || activeGraphic.url;
      const { enhancedUrl, scaleFactor } = await enhanceImageWithAIUpscale(sourceImage);
      commitLayerChange({ processedUrl: enhancedUrl, isUpscaled: true });
      toast.success(`✨ ${scaleFactor}X HD Print Quality (300 DPI) Ready!`);
    } catch (err) {
      console.error('AI Upscale error:', err);
      toast.error('Could not upscale image.');
    } finally {
      setIsUpscalingAI(false);
    }
  };

  // Duplicate active layer
  const handleDuplicateLayer = () => {
    if (!activeGraphic) return;
    const duplicated: GraphicLayer = {
      ...activeGraphic,
      id: `layer-${Date.now()}`,
      name: `${activeGraphic.name} (Copy)`,
      x: activeGraphic.x + 4,
      y: activeGraphic.y + 4
    };
    const updated = [...graphics, duplicated];
    setGraphics(updated);
    pushHistoryState(updated);
    setSelectedLayerId(duplicated.id);
    toast.success('Layer duplicated');
  };

  // Delete active layer
  const handleDeleteLayer = (idToDelete?: string) => {
    const targetId = idToDelete || activeGraphic?.id;
    if (!targetId) return;
    const updated = graphics.filter(g => g.id !== targetId);
    setGraphics(updated);
    pushHistoryState(updated);
    const nextLayer = updated.find(g => g.side === activeSurface) || updated[0] || null;
    setSelectedLayerId(nextLayer?.id || '');
    toast.info('Layer removed');
  };

  // Auto-fit active layer within printable boundaries
  const handleAutoFit = () => {
    if (!activeGraphic) return;
    const fitted = autoFitLayer(activeGraphic, activeGraphic.side);
    commitLayerChange(fitted);
    toast.success('Artwork auto-fitted to safe print area');
  };

  // 1-Tap Streetwear Design Recipe (Instant Preset)
  const handleApplyRecipe = (recipe: DesignRecipe) => {
    // 1. Set Garment color
    const matchedColor = colors.find(c => c.hex.toLowerCase() === recipe.tshirtHex.toLowerCase());
    if (matchedColor) setSelectedColor(matchedColor);

    // 2. Add preset sticker on target side
    const newLayer: GraphicLayer = {
      id: `recipe-layer-${Date.now()}`,
      name: recipe.name,
      url: recipe.sticker.url,
      processedUrl: recipe.sticker.url,
      rawUrl: recipe.sticker.url,
      side: recipe.stickerPlacement.side,
      layerType: 'vector',
      x: recipe.stickerPlacement.x,
      y: recipe.stickerPlacement.y,
      scale: recipe.stickerPlacement.scale,
      scaleX: recipe.stickerPlacement.scaleX ?? 100,
      scaleY: recipe.stickerPlacement.scaleY ?? 100,
      aspectRatioLocked: true,
      flipX: false,
      flipY: false,
      opacity: 100,
      rotate: 0,
      finish: recipe.finish || 'matte',
      removeBg: false,
      bgTolerance: 35
    };

    const updated = [newLayer];
    setGraphics(updated);
    pushHistoryState(updated);
    setSelectedLayerId(newLayer.id);
    handleSelectSurface(recipe.stickerPlacement.side);
    toast.success(`Applied "${recipe.name}" Preset!`);
  };

  // Multi-Angle Lookbook Generator
  const handleGenerateLookbook = async () => {
    setIsSnapping(true);
    toast.info('Capturing 4-angle studio lookbook...');

    handleSelectSurface('front');
    await new Promise(r => setTimeout(r, 400));
    const canvas1 = canvasContainerRef.current?.querySelector('canvas');
    const frontSnap = canvas1 ? canvas1.toDataURL('image/png') : '';

    handleSelectSurface('back');
    await new Promise(r => setTimeout(r, 400));
    const canvas2 = canvasContainerRef.current?.querySelector('canvas');
    const backSnap = canvas2 ? canvas2.toDataURL('image/png') : '';

    handleSelectSurface('sleeve-left');
    await new Promise(r => setTimeout(r, 400));
    const canvas3 = canvasContainerRef.current?.querySelector('canvas');
    const sleeveLSnap = canvas3 ? canvas3.toDataURL('image/png') : '';

    handleSelectSurface('sleeve-right');
    await new Promise(r => setTimeout(r, 400));
    const canvas4 = canvasContainerRef.current?.querySelector('canvas');
    const sleeveRSnap = canvas4 ? canvas4.toDataURL('image/png') : '';

    setLookbookSnapshots({ front: frontSnap, back: backSnap, sleeveLeft: sleeveLSnap, sleeveRight: sleeveRSnap });
    setIsSnapping(false);
    setLookbookModalOpen(true);
    handleSelectSurface('front');
  };

  // Add to Bag action (Preserves 100% custom_print_metadata & ₹600 pricing)
  const handleAddToBag = () => {
    if (graphics.length === 0) {
      toast.error('Please add at least one graphic or text decal to your shirt.');
      return;
    }

    setAdding(true);

    const canvas = canvasContainerRef.current?.querySelector('canvas');
    const snapshotUrl = canvas ? canvas.toDataURL('image/png') : selectedColor.image;

    const printItem = {
      id: `custom-print-${Date.now()}`,
      name: `Bespoke 240 GSM Tee (${selectedColor.name})`,
      slug: 'custom-print',
      price: basePrice || 600,
      images: [snapshotUrl, selectedColor.image],
      selected_size: selectedSize,
      quantity: 1,
      is_custom_print: true,
      custom_print_metadata: {
        garment: '240 GSM Cotton Terry',
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        size: selectedSize,
        graphics: graphics.map(g => ({
          name: g.name,
          side: g.side,
          layerType: g.layerType || 'image',
          scale: g.scale,
          scaleX: g.scaleX ?? 100,
          scaleY: g.scaleY ?? 100,
          aspectRatioLocked: g.aspectRatioLocked !== false,
          flipX: !!g.flipX,
          flipY: !!g.flipY,
          opacity: g.opacity ?? 100,
          x: g.x,
          y: g.y,
          rotate: g.rotate || 0,
          finish: g.finish || 'matte',
          url: g.processedUrl || g.url,
          processedUrl: g.processedUrl || g.url,
          rawUrl: g.url
        })),
        graphic_layers: graphics.map(g => ({
          name: g.name,
          side: g.side,
          scale: g.scale,
          scaleX: g.scaleX ?? 100,
          scaleY: g.scaleY ?? 100,
          aspectRatioLocked: g.aspectRatioLocked !== false,
          flipX: !!g.flipX,
          flipY: !!g.flipY,
          opacity: g.opacity ?? 100,
          x: g.x,
          y: g.y,
          rotate: g.rotate || 0,
          finish: g.finish || 'matte',
          url: g.processedUrl || g.url,
          processedUrl: g.processedUrl || g.url,
          rawUrl: g.url
        }))
      }
    };

    addItem(printItem as any);
    toast.success('Added custom 240 GSM tee to your bag!');
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
    <main className="pt-24 pb-32 min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Top Header Strip with Breadcrumb & Specs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-bold">
              <span>INKWAVE 3D LAB</span>
              <span>/</span>
              <span>₹{basePrice} FLAT RATE</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              Custom Streetwear Studio
            </h1>
          </div>

          {/* Garment Spec Badge (Strictly 240 GSM Cotton Terry) */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <div className="text-left">
              <div className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                240 GSM COTTON TERRY
              </div>
              <div className="text-[9px] font-mono text-neutral-400">
                Heavyweight Drop-Shoulder Blank Included
              </div>
            </div>
          </div>
        </div>

        {/* Studio Layout: 3D Viewport (Left/Center) + Customization Controls (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ══════════════════════════════════════════════════════════════════
              1. 3D VIEWPORT CONTAINER (7 Cols on Desktop)
          ══════════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:col-span-7 lg:sticky lg:top-28 flex flex-col space-y-4">
            
            <div 
              ref={canvasContainerRef}
              className="w-full h-[420px] sm:h-[500px] lg:h-[580px] bg-[#09090b] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center select-none"
            >
              {/* Realtime 3D Canvas */}
              <CustomPrintCanvas
                color={selectedColor.hex}
                autoRotate={autoRotate}
                enableOrbit={interactionMode === 'rotate'}
                onDragDecal={handleDirectDragDecal}
                graphics={graphics}
                activeView={activeSurface}
              />

              {/* Surface Switcher Overlay (Top Center) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 shadow-xl">
                {SURFACES.map((surf) => {
                  const isActive = activeSurface === surf.id;
                  const count = graphics.filter(g => g.side === surf.id).length;
                  return (
                    <button
                      key={surf.id}
                      onClick={() => handleSelectSurface(surf.id)}
                      className={`px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[var(--accent)] text-white shadow-md'
                          : 'text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{surf.shortLabel}</span>
                      {count > 0 && (
                        <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black ${
                          isActive ? 'bg-black/40 text-white' : 'bg-white/20 text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Viewport Action Floating Controls (Top Left & Top Right) */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() => setInteractionMode(m => m === 'move' ? 'rotate' : 'move')}
                  className={`p-2.5 rounded-xl backdrop-blur-md border text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 transition-all shadow-lg ${
                    interactionMode === 'rotate'
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-black/70 text-neutral-300 border-white/10 hover:border-white/30'
                  }`}
                  title={interactionMode === 'rotate' ? 'Orbit 3D enabled' : 'Drag Artwork enabled'}
                >
                  {interactionMode === 'rotate' ? <Eye className="w-4 h-4" /> : <Hand className="w-4 h-4" />}
                  <span className="hidden sm:inline">{interactionMode === 'rotate' ? '3D Orbit' : 'Artwork Drag'}</span>
                </button>

                <button
                  onClick={() => setAutoRotate(r => !r)}
                  className={`p-2.5 rounded-xl backdrop-blur-md border text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 transition-all shadow-lg ${
                    autoRotate
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-black/70 text-neutral-300 border-white/10 hover:border-white/30'
                  }`}
                  title="Toggle 360 Spin"
                >
                  {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="hidden sm:inline">{autoRotate ? 'Stop Spin' : '360° Spin'}</span>
                </button>
              </div>

              {/* Undo / Redo & Snapshot (Top Right) */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGenerateLookbook}
                  disabled={isSnapping}
                  className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider"
                  title="Lookbook Snapshots"
                >
                  <Camera className="w-4 h-4 text-[var(--accent)]" />
                  <span className="hidden sm:inline">Lookbook</span>
                </button>
              </div>

              {/* Bottom Surface Indicator Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl text-[11px] font-mono text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span>Editing Surface: <strong className="text-white uppercase">{SURFACES.find(s => s.id === activeSurface)?.label}</strong></span>
                </div>
                <div>
                  <span>Color: <strong className="text-white">{selectedColor.name}</strong></span>
                  <span className="mx-2 text-neutral-600">|</span>
                  <span>Size: <strong className="text-white">{selectedSize}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick 4-Surface Thumbnail Bar */}
            <div className="grid grid-cols-4 gap-2">
              {SURFACES.map((surf) => {
                const isActive = activeSurface === surf.id;
                const layersOnSide = graphics.filter(g => g.side === surf.id);
                return (
                  <button
                    key={surf.id}
                    onClick={() => handleSelectSurface(surf.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isActive 
                        ? 'bg-white/10 border-[var(--accent)] text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase">{surf.shortLabel}</span>
                      <span className="text-sm">{surf.icon}</span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 mt-1">
                      {layersOnSide.length === 0 ? 'No artwork' : `${layersOnSide.length} layer${layersOnSide.length > 1 ? 's' : ''}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              2. CUSTOMIZATION WORKSPACE CONTROLS (5 Cols on Desktop)
          ══════════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:col-span-5 flex flex-col space-y-6">
            
            {/* Tab Switcher: ARTWORK | GARMENT | LAYERS | PRESETS */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab('art')}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'art'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Artwork</span>
              </button>
              <button
                onClick={() => setActiveTab('garment')}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'garment'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Garment</span>
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                  activeTab === 'layers'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Layers ({graphics.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
            </div>

            {/* ─── TAB 1: ARTWORK CREATION & ACTIVE LAYER CONTROLS ─── */}
            {activeTab === 'art' && (
              <div className="space-y-6">
                
                {/* 3 Primary Action Buttons: Upload Image / Add Text / Vector Library */}
                <div className="grid grid-cols-3 gap-2.5">
                  <label className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group transition-all">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-[var(--accent)] text-white transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Upload</span>
                    <span className="text-[9px] font-mono text-neutral-400">PNG / JPG</span>
                  </label>

                  <button
                    onClick={() => setTextModalOpen(true)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 flex flex-col items-center justify-center text-center gap-2 group transition-all"
                  >
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-[var(--accent)] text-white transition-all">
                      <Type className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Add Text</span>
                    <span className="text-[9px] font-mono text-neutral-400">35+ Fonts</span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('vector-library-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 flex flex-col items-center justify-center text-center gap-2 group transition-all"
                  >
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-[var(--accent)] text-white transition-all">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Graphics</span>
                    <span className="text-[9px] font-mono text-neutral-400">Stickers</span>
                  </button>
                </div>

                {/* Selected Active Layer Controls (Progressive Disclosure) */}
                {activeGraphic ? (
                  <div className="p-5 rounded-3xl bg-[#09090b] border border-white/15 space-y-5">
                    
                    {/* Layer Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-1">
                          <img src={activeGraphic.processedUrl || activeGraphic.url} alt={activeGraphic.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>{activeGraphic.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[9px] font-bold">
                              {SURFACES.find(s => s.id === activeGraphic.side)?.shortLabel}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                            Position: X:{activeGraphic.x} Y:{activeGraphic.y} | Scale: {activeGraphic.scale}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleDuplicateLayer}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
                          title="Duplicate Layer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLayer()}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Beginner Quick Adjustments (Scale & Rotation Sliders) */}
                    <div className="space-y-4">
                      {/* Scale Slider */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-1.5">
                          <span>Size / Scale</span>
                          <span className="font-bold text-white">{activeGraphic.scale}%</span>
                        </div>
                        <input 
                          type="range" 
                          min={15} 
                          max={85} 
                          value={activeGraphic.scale} 
                          onChange={(e) => updateActiveLayer({ scale: Number(e.target.value) })}
                          onMouseUp={() => pushHistoryState(graphics)}
                          onTouchEnd={() => pushHistoryState(graphics)}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      {/* Rotation Slider */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-1.5">
                          <span>Rotation</span>
                          <span className="font-bold text-white">{activeGraphic.rotate}°</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min={-180} 
                            max={180} 
                            value={activeGraphic.rotate} 
                            onChange={(e) => updateActiveLayer({ rotate: Number(e.target.value) })}
                            onMouseUp={() => pushHistoryState(graphics)}
                            onTouchEnd={() => pushHistoryState(graphics)}
                            className="flex-1 accent-[var(--accent)] cursor-pointer"
                          />
                          <button
                            onClick={() => commitLayerChange({ rotate: (activeGraphic.rotate + 90) % 360 })}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-neutral-300"
                            title="Rotate 90 deg"
                          >
                            +90°
                          </button>
                        </div>
                      </div>

                      {/* Quick Alignment Actions: Center / Auto-fit / Flips */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        <button
                          onClick={() => handleNudgePosition('center')}
                          className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Center</span>
                        </button>
                        <button
                          onClick={handleAutoFit}
                          className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Scan className="w-3.5 h-3.5" />
                          <span>Auto-Fit</span>
                        </button>
                        <button
                          onClick={() => commitLayerChange({ flipX: !activeGraphic.flipX })}
                          className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                            activeGraphic.flipX ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <FlipHorizontal className="w-3.5 h-3.5" />
                          <span>Flip H</span>
                        </button>
                        <button
                          onClick={() => commitLayerChange({ flipY: !activeGraphic.flipY })}
                          className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                            activeGraphic.flipY ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <FlipVertical className="w-3.5 h-3.5" />
                          <span>Flip V</span>
                        </button>
                      </div>
                    </div>

                    {/* Advanced Precision Toggle */}
                    <div className="border-t border-white/10 pt-3">
                      <button
                        onClick={() => setShowPrecision(p => !p)}
                        className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Precision & Print Finish Settings</span>
                        </span>
                        {showPrecision ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showPrecision && (
                        <div className="pt-4 space-y-4">
                          {/* Nudge Directional Pad */}
                          <div>
                            <div className="text-[11px] font-mono text-neutral-400 mb-2 uppercase">Precision Nudge Pad</div>
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleNudgePosition('left', 2)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs">
                                &larr; -2
                              </button>
                              <div className="flex flex-col gap-2">
                                <button onClick={() => handleNudgePosition('up', 2)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs">
                                  &uarr; -2
                                </button>
                                <button onClick={() => handleNudgePosition('down', 2)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs">
                                  &darr; +2
                                </button>
                              </div>
                              <button onClick={() => handleNudgePosition('right', 2)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs">
                                &rarr; +2
                              </button>
                            </div>
                          </div>

                          {/* Print Finish Selector */}
                          <div>
                            <div className="text-[11px] font-mono text-neutral-400 mb-2 uppercase">Print Finish Style</div>
                            <div className="grid grid-cols-4 gap-2">
                              {(['matte', 'puff', 'vintage', 'chrome'] as PrintFinish[]).map((finish) => (
                                <button
                                  key={finish}
                                  onClick={() => commitLayerChange({ finish })}
                                  className={`py-2 rounded-xl text-[11px] font-mono uppercase font-bold border transition-all ${
                                    activeGraphic.finish === finish 
                                      ? 'bg-white text-black border-white' 
                                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  {finish}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI 300 DPI Resolution Booster */}
                          <div className="pt-2">
                            <button
                              onClick={handleAIUpscale}
                              disabled={isUpscalingAI || activeGraphic.isUpscaled}
                              className={`w-full py-2.5 rounded-2xl border text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
                                activeGraphic.isUpscaled
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                              }`}
                            >
                              <Wand2 className="w-4 h-4 text-[var(--accent)]" />
                              <span>{activeGraphic.isUpscaled ? '✓ 300 DPI HD Print Quality Applied' : 'Boost to 300 DPI (AI Ultra-HD)'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-[#09090b] border border-white/10 text-center space-y-3">
                    <p className="font-mono text-xs text-neutral-400">
                      No artwork on <strong className="text-white uppercase">{SURFACES.find(s => s.id === activeSurface)?.label}</strong>.
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Upload an image, add custom text, or select a vector sticker below to start designing.
                    </p>
                  </div>
                )}

                {/* Curated Vector Graphic Library Section */}
                <div id="vector-library-section" className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Streetwear Stickers</span>
                    <span className="text-[10px] font-mono text-[var(--accent)]">1-Tap Add</span>
                  </div>

                  {/* Sticker Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {(['all', 'sleeve', 'y2k', 'gothic', 'tokyo', 'minimal', 'skulls'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedStickerCat(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold whitespace-nowrap transition-all ${
                          selectedStickerCat === cat
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Sticker Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                    {filteredStickers.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => handleAddVectorSticker(sticker)}
                        className="aspect-square rounded-2xl bg-black/40 border border-white/10 hover:border-[var(--accent)] hover:bg-white/10 p-2 flex flex-col items-center justify-center transition-all group"
                        title={sticker.name}
                      >
                        <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ─── TAB 2: GARMENT OPTIONS (COLOR & SIZE) ─── */}
            {activeTab === 'garment' && (
              <div className="space-y-6">
                
                {/* Product Specification Info Box */}
                <div className="p-5 rounded-3xl bg-[#09090b] border border-white/15 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--accent)]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Garment Specification</span>
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    240 GSM Luxury Cotton Terry
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                    Heavyweight drop-shoulder streetwear silhouette crafted from 100% super-combed cotton terry. Pre-shrunk, durable ribbed collar, and ultra-dense fabric structure.
                  </p>
                </div>

                {/* Color Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Select Blank Color</span>
                    <span className="text-xs font-mono text-neutral-400 font-bold">{selectedColor.name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map((c) => {
                      const isSelected = selectedColor.hex.toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                            isSelected
                              ? 'bg-white/10 border-[var(--accent)] shadow-lg'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <span 
                            className="w-8 h-8 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && (
                              <Check className={`w-4 h-4 ${c.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'}`} />
                            )}
                          </span>
                          <span className="text-[10px] font-mono uppercase font-bold text-neutral-300 line-clamp-1">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Select Size</span>
                    <span className="text-xs font-mono text-neutral-400">Streetwear Boxy Fit</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {SIZES.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 rounded-2xl font-mono text-sm font-bold uppercase transition-all ${
                            isSelected
                              ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30'
                              : 'bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ─── TAB 3: ACTIVE LAYERS MANAGEMENT ─── */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">All Custom Layers ({graphics.length})</span>
                  <button 
                    onClick={() => setActiveTab('art')}
                    className="text-[10px] font-mono text-[var(--accent)] uppercase font-bold"
                  >
                    + Add More Artwork
                  </button>
                </div>

                {graphics.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#09090b] border border-white/10 text-center text-neutral-400 font-mono text-xs">
                    No active layers yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {graphics.map((layer) => {
                      const isSelected = selectedLayerId === layer.id;
                      return (
                        <div
                          key={layer.id}
                          onClick={() => {
                            setSelectedLayerId(layer.id);
                            handleSelectSurface(layer.side);
                          }}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white/10 border-[var(--accent)]'
                              : 'bg-[#09090b] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-1">
                              <img src={layer.processedUrl || layer.url} alt={layer.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <div className="text-xs font-mono font-bold text-white uppercase">{layer.name}</div>
                              <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">{SURFACES.find(s => s.id === layer.side)?.shortLabel}</span>
                                <span>Scale: {layer.scale}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLayer(layer.id);
                              }}
                              className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 4: 1-TAP STREETWEAR PRESETS ─── */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase font-bold tracking-wider text-white">Instant Design Recipes</span>
                  <span className="text-[10px] font-mono text-neutral-400">1-Tap Apply</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="p-4 rounded-3xl bg-[#09090b] border border-white/10 hover:border-white/30 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{recipe.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[9px] font-mono font-bold">
                            {recipe.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-1">{recipe.description}</p>
                      </div>

                      <button
                        onClick={() => handleApplyRecipe(recipe)}
                        className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                3. CHECKOUT SUMMARY & ADD TO BAG (Persistent)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="p-6 rounded-3xl bg-[#09090b] border border-white/15 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Total Price</div>
                  <div className="font-display text-3xl font-black text-white">₹{basePrice}</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                    <Truck className="w-3 h-3" /> Free Express Delivery
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToBag}
                disabled={adding || graphics.length === 0}
                className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-red-600 active:scale-[0.98] text-white font-mono text-sm uppercase tracking-wider font-black transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add Custom Tee to Bag — ₹{basePrice}</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-400">
                <span>✓ 240 GSM Luxury Terry</span>
                <span>•</span>
                <span>✓ All 4 Print Surfaces Free</span>
                <span>•</span>
                <span>✓ 7-Day Exchange</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. ADD TEXT MODAL (35+ Streetwear Fonts, Curved Text, Outlines)
      ══════════════════════════════════════════════════════════════════════ */}
      {textModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#09090b] border border-white/20 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-bold">Typography Studio</span>
                <h3 className="font-display text-2xl font-bold uppercase text-white">Add Streetwear Text</h3>
              </div>
              <button onClick={() => setTextModalOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Main Text Input */}
              <div>
                <label className="block font-mono text-xs uppercase text-neutral-300 mb-1.5 font-bold">Primary Text</label>
                <input 
                  type="text" 
                  value={textInput} 
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. INKWAVE"
                  className="w-full px-4 py-3 rounded-2xl bg-black border border-white/15 text-white font-mono text-sm focus:border-[var(--accent)] outline-none"
                />
              </div>

              {/* Subtext Input */}
              <div>
                <label className="block font-mono text-xs uppercase text-neutral-300 mb-1.5 font-bold">Subtext (Optional)</label>
                <input 
                  type="text" 
                  value={subtextInput} 
                  onChange={(e) => setSubtextInput(e.target.value)}
                  placeholder="e.g. TOKYO // 2026"
                  className="w-full px-4 py-3 rounded-2xl bg-black border border-white/15 text-white font-mono text-sm focus:border-[var(--accent)] outline-none"
                />
              </div>

              {/* Font Selector */}
              <div>
                <label className="block font-mono text-xs uppercase text-neutral-300 mb-1.5 font-bold">Select Streetwear Font</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {allAvailableFonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setTextFont(font.family)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        textFont === font.family 
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm font-bold line-clamp-1" style={{ fontFamily: font.family }}>{font.name}</div>
                      <div className="text-[9px] font-mono opacity-60 uppercase mt-0.5">{font.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ink Color Selector */}
              <div>
                <label className="block font-mono text-xs uppercase text-neutral-300 mb-1.5 font-bold">Ink Color</label>
                <div className="flex flex-wrap gap-2">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setTextColor(c.hex)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        textColor === c.hex ? 'scale-125 border-[var(--accent)]' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Curved Arc Text Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-xs uppercase text-neutral-300">Curved Arc Text</span>
                <input 
                  type="checkbox" 
                  checked={textCurved} 
                  onChange={(e) => setTextCurved(e.target.checked)} 
                  className="w-4 h-4 accent-[var(--accent)]"
                />
              </div>

              {/* Outline Stroke Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-neutral-300">Outline Stroke</span>
                <input 
                  type="checkbox" 
                  checked={textOutline} 
                  onChange={(e) => setTextOutline(e.target.checked)} 
                  className="w-4 h-4 accent-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setTextModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-mono text-xs uppercase text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTextLayer}
                disabled={isGeneratingText || !textInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-red-600 font-mono text-xs uppercase font-bold text-white transition-all disabled:opacity-50"
              >
                {isGeneratingText ? 'Rendering...' : 'Add to Shirt'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          5. LOOKBOOK 4-ANGLE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {lookbookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#09090b] border border-white/20 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-bold">Studio Lookbook</span>
                <h3 className="font-display text-2xl font-bold uppercase text-white">4-Angle Custom Preview</h3>
              </div>
              <button onClick={() => setLookbookModalOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-2 text-center">
                <div className="aspect-square bg-black rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                  {lookbookSnapshots.front ? <img src={lookbookSnapshots.front} alt="Front" className="w-full h-full object-contain" /> : <div className="text-neutral-500 font-mono text-xs">Capturing...</div>}
                </div>
                <span className="text-[11px] font-mono uppercase font-bold text-neutral-400">Front View</span>
              </div>

              <div className="space-y-2 text-center">
                <div className="aspect-square bg-black rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                  {lookbookSnapshots.back ? <img src={lookbookSnapshots.back} alt="Back" className="w-full h-full object-contain" /> : <div className="text-neutral-500 font-mono text-xs">Capturing...</div>}
                </div>
                <span className="text-[11px] font-mono uppercase font-bold text-neutral-400">Back View</span>
              </div>

              <div className="space-y-2 text-center">
                <div className="aspect-square bg-black rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                  {lookbookSnapshots.sleeveLeft ? <img src={lookbookSnapshots.sleeveLeft} alt="Left Sleeve" className="w-full h-full object-contain" /> : <div className="text-neutral-500 font-mono text-xs">Capturing...</div>}
                </div>
                <span className="text-[11px] font-mono uppercase font-bold text-neutral-400">L-Sleeve</span>
              </div>

              <div className="space-y-2 text-center">
                <div className="aspect-square bg-black rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                  {lookbookSnapshots.sleeveRight ? <img src={lookbookSnapshots.sleeveRight} alt="Right Sleeve" className="w-full h-full object-contain" /> : <div className="text-neutral-500 font-mono text-xs">Capturing...</div>}
                </div>
                <span className="text-[11px] font-mono uppercase font-bold text-neutral-400">R-Sleeve</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setLookbookModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-mono text-xs uppercase font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
