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
  Sparkle,
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
  Lock,
  Unlock,
  Copy,
  Sliders,
  FileText
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  generateTextDecal, 
  applyPrintFinishTexture, 
  processImageWithAI,
  enhanceImageWithAIUpscale,
  loadCustomFontFile,
  GraphicLayer,
  PrintFinish, 
  FabricWashStyle,
  PLACEMENT_PRESETS, 
  STREETWEAR_FONTS, 
  StreetwearFont,
  FontCategory,
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

  const [basePrice, setBasePrice] = useState<number>(600);
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
  const [selectedStickerCat, setSelectedStickerCat] = useState<StickerCategory | 'all'>('all');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isUpscalingAI, setIsUpscalingAI] = useState(false);

  // Streetwear Typography Studio
  const [typographyEnabled, setTypographyEnabled] = useState(false);
  const [customText, setCustomText] = useState('INKWAVE');
  const [customSubtext, setCustomSubtext] = useState('TOKYO // 2026');
  const [selectedFont, setSelectedFont] = useState(STREETWEAR_FONTS[0].family);
  const [selectedFontCat, setSelectedFontCat] = useState<string>('all');
  const [customFonts, setCustomFonts] = useState<typeof STREETWEAR_FONTS>([]);
  const [selectedTextColor, setSelectedTextColor] = useState(INK_COLORS[0].hex);
  const [textStretchX, setTextStretchX] = useState(100);
  const [isCurvedText, setIsCurvedText] = useState(false);
  const [textCurveRadius, setTextCurveRadius] = useState(260);
  const [isOutlineText, setIsOutlineText] = useState(false);
  const [textOutlineWidth, setTextOutlineWidth] = useState(4);
  const [textOutlineColor, setTextOutlineColor] = useState('#000000');
  const [isTextGradient, setIsTextGradient] = useState(false);
  const [textGradientColor, setTextGradientColor] = useState('#a855f7');
  const [textShadow, setTextShadow] = useState(false);
  const [textTargetSide, setTextTargetSide] = useState<'front' | 'back' | 'sleeve-left' | 'sleeve-right'>('front');
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
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  const allAvailableFonts = [...customFonts, ...STREETWEAR_FONTS];

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
      stretchX: textStretchX,
      isCurved: isCurvedText,
      curveRadius: textCurveRadius,
      isOutline: isOutlineText,
      outlineWidth: textOutlineWidth,
      outlineColor: textOutlineColor,
      isGradient: isTextGradient,
      gradientColor: textGradientColor,
      shadow: textShadow,
      shadowColor: '#000000'
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
    textStretchX,
    isCurvedText, 
    textCurveRadius,
    isOutlineText, 
    textOutlineWidth,
    textOutlineColor,
    isTextGradient,
    textGradientColor,
    textShadow
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

    // Full garment freedom: collar, chest, ribs, belly, hem, bicep, wrist
    const newX = Math.max(-55, Math.min(55, Math.round(activeGraphic.x + xDelta)));
    const newY = Math.max(4, Math.min(84, Math.round(activeGraphic.y + yDelta)));

    updateActiveLayer({ x: newX, y: newY });
  };

  // Precision Nudge Controller for Mobile / Thumb Navigation
  const handleNudgePosition = (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
    if (!activeGraphic) return;
    if (direction === 'center') {
      updateActiveLayer({ x: 0, y: 38 });
      toast.info('Centered artwork');
      return;
    }
    const step = 4;
    let newX = activeGraphic.x;
    let newY = activeGraphic.y;
    if (direction === 'up') newY = Math.max(4, activeGraphic.y - step);
    if (direction === 'down') newY = Math.min(84, activeGraphic.y + step);
    if (direction === 'left') newX = Math.max(-55, activeGraphic.x - step);
    if (direction === 'right') newX = Math.min(55, activeGraphic.x + step);
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
    toast.info('AI is auto-cleaning background & optimizing resolution...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      
      // Auto-clean background with AI
      const { cleanUrl, hasRemovedBg } = await processImageWithAI(rawBase64);
      const targetSide = cameraView === 'back' ? 'back' : cameraView === 'sleeve-left' ? 'sleeve-left' : cameraView === 'sleeve-right' ? 'sleeve-right' : 'front';

      const newLayer: GraphicLayer = {
        id: `layer-${Date.now()}`,
        name: file.name.slice(0, 16),
        url: rawBase64,
        processedUrl: cleanUrl,
        rawUrl: rawBase64,
        side: targetSide,
        x: 0,
        y: 38,
        scale: 48,
        rotate: 0,
        finish: 'matte',
        removeBg: hasRemovedBg,
        bgTolerance: 35,
        isUpscaled: false
      };

      setGraphics(prev => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      setCameraView(targetSide);
      setInteractionMode('move');
      setIsProcessingAI(false);

      if (hasRemovedBg) {
        toast.success(`✨ AI cleaned background & placed on ${targetSide.toUpperCase()}!`);
      } else {
        toast.success(`Artwork placed on ${targetSide.toUpperCase()}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI HD Upscaler / 300 DPI Resolution Booster
  const handleAIUpscale = async () => {
    if (!activeGraphic) return;
    setIsUpscalingAI(true);
    toast.info('✨ AI is upscaling resolution to 4X Ultra HD (300 DPI)...');
    try {
      const sourceImage = activeGraphic.processedUrl || activeGraphic.url;
      const { enhancedUrl, scaleFactor } = await enhanceImageWithAIUpscale(sourceImage);
      updateActiveLayer({ processedUrl: enhancedUrl, isUpscaled: true });
      toast.success(`✨ ${scaleFactor}X HD Print Quality (300 DPI) Ready! No blurriness.`);
    } catch (err) {
      console.error('AI Upscale error:', err);
      toast.error('Could not upscale image.');
    } finally {
      setIsUpscalingAI(false);
    }
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

  // Custom Font File Upload (.ttf, .otf, .woff, .woff2)
  const handleFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const customFont = await loadCustomFontFile(file);
      setCustomFonts(prev => [customFont, ...prev.filter(f => f.family !== customFont.family)]);
      setSelectedFont(customFont.family);
      setSelectedFontCat('custom');
      toast.success(`✨ Custom font "${customFont.name}" loaded into studio!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load font file.');
    }
  };

  // Convert Styled Typography into an independent Graphic Layer
  const handleAddTypographyAsGraphic = async () => {
    if (!customText.trim()) {
      toast.error('Please enter text first.');
      return;
    }
    toast.info('Generating typography graphic decal...');
    const dataUri = await generateTextDecal({
      text: customText,
      subtext: customSubtext,
      fontFamily: selectedFont,
      fontSize: 72,
      color: selectedTextColor,
      letterSpacing: 4,
      stretchX: textStretchX,
      isCurved: isCurvedText,
      curveRadius: textCurveRadius,
      isOutline: isOutlineText,
      outlineWidth: textOutlineWidth,
      outlineColor: textOutlineColor,
      isGradient: isTextGradient,
      gradientColor: textGradientColor,
      shadow: textShadow,
      shadowColor: '#000000'
    });

    const newLayer: GraphicLayer = {
      id: `layer-text-${Date.now()}`,
      name: customText.slice(0, 14),
      url: dataUri,
      processedUrl: dataUri,
      rawUrl: dataUri,
      side: textTargetSide,
      x: 0,
      y: 36,
      scale: 52,
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

    setGraphics(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setCameraView(textTargetSide);
    setInteractionMode('move');
    toast.success(`✨ Added "${customText}" as graphic layer on ${textTargetSide.toUpperCase()}!`);
  };

  // Duplicate Graphic Layer
  const handleDuplicateLayer = () => {
    if (!activeGraphic) return;
    const duplicated: GraphicLayer = {
      ...activeGraphic,
      id: `layer-${Date.now()}`,
      name: `${activeGraphic.name} (Copy)`,
      x: Math.min(50, activeGraphic.x + 4),
      y: Math.min(80, activeGraphic.y + 4)
    };
    setGraphics(prev => [...prev, duplicated]);
    setSelectedLayerId(duplicated.id);
    toast.success(`Duplicated layer "${activeGraphic.name}"`);
  };

  // Reset Layer Transform (1:1 standard)
  const handleResetLayerTransform = () => {
    if (!activeGraphic) return;
    updateActiveLayer({
      scaleX: 100,
      scaleY: 100,
      aspectRatioLocked: true,
      flipX: false,
      flipY: false,
      rotate: 0,
      opacity: 100
    });
    toast.info('Transform reset to standard (1:1)');
  };

  // Layer Stretch Helper
  const handleLayerStretch = (dim: 'width' | 'height', delta: number) => {
    if (!activeGraphic) return;
    if (activeGraphic.aspectRatioLocked) {
      const newScale = Math.max(15, Math.min(95, activeGraphic.scale + delta));
      updateActiveLayer({ scale: newScale });
    } else {
      if (dim === 'width') {
        const curX = activeGraphic.scaleX ?? 100;
        const nextX = Math.max(40, Math.min(220, curX + delta));
        updateActiveLayer({ scaleX: nextX });
      } else {
        const curY = activeGraphic.scaleY ?? 100;
        const nextY = Math.max(40, Math.min(220, curY + delta));
        updateActiveLayer({ scaleY: nextY });
      }
    }
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
      scaleX: 100,
      scaleY: 100,
      aspectRatioLocked: true,
      flipX: false,
      flipY: false,
      opacity: 100,
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
      price: basePrice || 600,
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
          rawUrl: g.url // Pristine original high-resolution user upload for Surat factory printing
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
        })),
        typography: typographyEnabled && customText.trim() ? {
          text: customText,
          subtext: customSubtext,
          font: selectedFont,
          textColor: selectedTextColor,
          stretchX: textStretchX,
          isCurved: isCurvedText,
          curveRadius: textCurveRadius,
          isOutline: isOutlineText,
          isGradient: isTextGradient,
          gradientColor: textGradientColor,
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
            <div className="absolute top-3 inset-x-3 z-10 flex justify-between items-center gap-1.5 pointer-events-none">
              
              {/* Front / Back / L-Sleeve / R-Sleeve View Buttons */}
              <div className="flex bg-black/90 backdrop-blur-md border border-white/10 p-1 rounded-2xl pointer-events-auto shadow-lg items-center gap-0.5 overflow-hidden">
                <button
                  onClick={() => setCameraView('front')}
                  className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'front' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setCameraView('back')}
                  className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'back' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  Back
                </button>
                <button
                  onClick={() => setCameraView('sleeve-left')}
                  className={`px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'sleeve-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  L-Sleeve
                </button>
                <button
                  onClick={() => setCameraView('sleeve-right')}
                  className={`px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'sleeve-right' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  R-Sleeve
                </button>
                <button
                  onClick={() => setCameraView('angle-left')}
                  className={`hidden sm:block px-2.5 py-1.5 text-xs font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${cameraView === 'angle-left' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  3/4
                </button>
              </div>

              {/* Lookbook & Auto-Spin Action */}
              <div className="flex items-center gap-1 pointer-events-auto shrink-0">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  title="Auto 360 Spin"
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${autoRotate ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-black/85 text-white border-white/10'}`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleGenerateLookbook}
                  disabled={isSnapping}
                  className="px-2.5 sm:px-3 py-1.5 bg-black/85 backdrop-blur-md border border-white/10 hover:border-[var(--accent)] text-white text-[11px] sm:text-xs font-mono uppercase tracking-wider rounded-2xl transition-all flex items-center gap-1 cursor-pointer shadow-lg"
                >
                  <Camera className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="hidden sm:inline">{isSnapping ? 'Rendering...' : 'Lookbook'}</span>
                </button>
              </div>
            </div>

            {/* ─── Center-Bottom Interactive Mode Switcher ─── */}
            <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
              
              {/* Mode Toggle Pill: Move Artwork vs Orbit 3D */}
              <div className="flex bg-black/85 backdrop-blur-md border border-white/15 p-1 rounded-2xl pointer-events-auto shadow-xl">
                <button
                  onClick={() => setInteractionMode('move')}
                  className={`px-3 py-1.5 text-[11px] sm:text-xs font-mono uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${interactionMode === 'move' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
                <button
                  onClick={() => setInteractionMode('rotate')}
                  className={`px-3 py-1.5 text-[11px] sm:text-xs font-mono uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${interactionMode === 'rotate' ? 'bg-[var(--accent)] text-black font-bold shadow' : 'text-white/80 hover:text-white'}`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Spin 3D</span>
                </button>
              </div>

              {/* Gesture Helper Badge */}
              <div className="hidden xs:flex bg-black/80 backdrop-blur-md px-2.5 py-1.5 border border-white/10 rounded-2xl text-[10px] font-mono tracking-wider text-[var(--accent)] uppercase pointer-events-none items-center gap-1">
                {interactionMode === 'move' ? '👆 Touch & drag on shirt' : '🔄 Drag to spin in 3D'}
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
                ₹{basePrice || 600} FLAT RATE
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold tracking-tight">
              Design Your T-Shirt
            </h1>
            <p className="text-xs text-[var(--text-dim)] font-mono">
              Bespoke 240GSM French Terry cotton t-shirt with custom artwork across Chest, Back, and Sleeves. ₹{basePrice || 600} with all prints & free shipping included!
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
          {/* ─── STEP 2: 🖼️ ARTWORK & TYPOGRAPHY STUDIO ────────────────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'art' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Big AI Upload Dropzone */}
              <label className="p-5 rounded-3xl bg-[var(--bg-card)] border-2 border-dashed border-[var(--accent)]/40 hover:border-[var(--accent)] flex flex-col items-center text-center gap-2.5 cursor-pointer transition-all group shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-[var(--text)] uppercase flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Upload Image / Logo (JPG, PNG, WebP)
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">
                    AI automatically strips background, enhances resolution, and centers on t-shirt
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

              {/* Active Graphic Card with AI HD Upscale & Placement Controller */}
              {activeGraphic && (
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-3.5 shadow-md">
                  {/* Top Preview & Actions */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center p-1 shrink-0 relative">
                        <img src={activeGraphic.processedUrl || activeGraphic.url} alt="Preview" className="w-full h-full object-contain" />
                        {activeGraphic.isUpscaled && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5" title="4X HD Ready">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-mono font-bold text-[var(--text)] truncate">{activeGraphic.name}</div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] font-mono text-[var(--accent)] font-semibold uppercase">
                            Side: {activeGraphic.side === 'sleeve-left' ? 'L-Sleeve' : activeGraphic.side === 'sleeve-right' ? 'R-Sleeve' : activeGraphic.side}
                          </span>
                          {activeGraphic.isUpscaled ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ✨ 300 DPI HD
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-[var(--text-dim)]">
                              • Standard Res
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI & Layer Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Duplicate Button */}
                      <button
                        onClick={handleDuplicateLayer}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-dim)] hover:text-white border border-white/10 cursor-pointer transition-all"
                        title="Duplicate Graphic Layer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* AI HD Upscale Button */}
                      <button
                        onClick={handleAIUpscale}
                        disabled={isUpscalingAI || activeGraphic.isUpscaled}
                        className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          activeGraphic.isUpscaled 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 cursor-default' 
                            : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
                        }`}
                        title="Enhance & Upscale to 4X (300 DPI print quality)"
                      >
                        <Zap className="w-3 h-3" />
                        <span>{isUpscalingAI ? 'Upscaling...' : activeGraphic.isUpscaled ? 'HD Ready' : 'AI Upscale'}</span>
                      </button>

                      {/* AI Clean Background */}
                      <button
                        onClick={handleReRunAIClean}
                        disabled={isProcessingAI}
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[10px] font-mono text-[var(--accent)] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="AI Background Cleaner"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>{isProcessingAI ? 'Cleaning...' : 'Clean'}</span>
                      </button>

                      {graphics.length > 1 && (
                        <button
                          onClick={() => handleRemoveLayer(activeGraphic.id)}
                          className="p-1.5 text-[var(--text-dim)] hover:text-red-400 cursor-pointer"
                          title="Remove Layer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Side Switcher */}
                  <div className="pt-2 border-t border-[var(--line)] space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[var(--text-dim)]">
                      <span className="font-bold">Target Placement Side:</span>
                      <span className="text-[var(--accent)]">Auto-rotates 3D view</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'front', label: 'Front' },
                        { id: 'back', label: 'Back' },
                        { id: 'sleeve-left', label: 'L-Sleeve' },
                        { id: 'sleeve-right', label: 'R-Sleeve' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            updateActiveLayer({ side: s.id as any });
                            setCameraView(s.id as any);
                          }}
                          className={`py-2 text-[10px] font-mono uppercase rounded-xl border transition-all cursor-pointer text-center font-bold ${
                            activeGraphic.side === s.id
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-black shadow-xs'
                              : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Transform & Mirror Pill Row */}
                  <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ flipX: !activeGraphic.flipX })}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${activeGraphic.flipX ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                        title="Mirror Horizontally (Flip X)"
                      >
                        <FlipHorizontal className="w-3 h-3" />
                        <span>Flip X</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ flipY: !activeGraphic.flipY })}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${activeGraphic.flipY ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                        title="Mirror Vertically (Flip Y)"
                      >
                        <FlipVertical className="w-3 h-3" />
                        <span>Flip Y</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ aspectRatioLocked: !activeGraphic.aspectRatioLocked })}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${activeGraphic.aspectRatioLocked ? 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)]' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'}`}
                        title="Toggle Aspect Ratio Lock for Freeform Stretch"
                      >
                        {activeGraphic.aspectRatioLocked ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3 text-amber-400" />}
                        <span>{activeGraphic.aspectRatioLocked ? 'Locked' : 'Stretchable'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('size')}
                      className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Full Transform & Stretch Studio &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Streetwear & Sleeve Decals Library */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Streetwear & Sleeve Graphics ({filteredStickers.length})
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

                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
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

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* ─── 🔤 STREETWEAR TYPOGRAPHY STUDIO (35+ FONTS + UPLOADER) ────── */}
              {/* ════════════════════════════════════════════════════════════════ */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-3.5 shadow-md">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-[var(--accent)]" /> Streetwear Typography Lab
                    </span>
                    <p className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">
                      35+ Streetwear Fonts • Arc Curvature • Neon Gradients • Font File Uploader
                    </p>
                  </div>
                  <button
                    onClick={() => setTypographyEnabled(!typographyEnabled)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono uppercase transition-all cursor-pointer ${typographyEnabled ? 'bg-[var(--accent)] text-black font-bold' : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--text-dim)]'}`}
                  >
                    {typographyEnabled ? '✓ Enabled' : '+ Open Lab'}
                  </button>
                </div>

                {typographyEnabled && (
                  <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                    
                    {/* Text Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-[var(--text-dim)] font-bold">
                          Main Slogan / Headline:
                        </label>
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="e.g. INKWAVE"
                          className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] uppercase outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-[var(--text-dim)] font-bold">
                          Subtext / Year / City:
                        </label>
                        <input
                          type="text"
                          value={customSubtext}
                          onChange={(e) => setCustomSubtext(e.target.value)}
                          placeholder="e.g. TOKYO // 2026"
                          className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] uppercase outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    {/* Font Category Filter Tabs + Custom Upload Action */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase text-[var(--text-dim)] font-bold">
                          Streetwear Font Packs:
                        </label>
                        <label className="text-[10px] font-mono text-[var(--accent)] font-bold uppercase hover:underline cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>Upload .TTF/.OTF Font</span>
                          <input 
                            ref={fontFileInputRef}
                            type="file" 
                            accept=".ttf,.otf,.woff,.woff2" 
                            onChange={handleFontFileUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {[
                          { id: 'all', label: `All (${allAvailableFonts.length})` },
                          { id: 'gothic', label: '⚡ Gothic & Metal' },
                          { id: 'graffiti', label: '🎨 Graffiti' },
                          { id: 'tokyo', label: '🎌 Tokyo Y2K' },
                          { id: 'luxury', label: '💎 Luxury Serif' },
                          { id: 'varsity', label: '🏈 Varsity' },
                          { id: 'bubble', label: '🫧 Acid Glitch' },
                          { id: 'script', label: '✍️ Signature' },
                          ...(customFonts.length > 0 ? [{ id: 'custom', label: `📁 Custom (${customFonts.length})` }] : [])
                        ].map(fc => (
                          <button
                            key={fc.id}
                            type="button"
                            onClick={() => setSelectedFontCat(fc.id)}
                            className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg border shrink-0 transition-all cursor-pointer ${
                              selectedFontCat === fc.id 
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-black font-bold' 
                                : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:text-[var(--text)]'
                            }`}
                          >
                            {fc.label}
                          </button>
                        ))}
                      </div>

                      {/* Visual Categorized Font Picker Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {allAvailableFonts
                          .filter(f => selectedFontCat === 'all' || f.category === selectedFontCat)
                          .map(f => (
                            <button
                              key={f.name}
                              type="button"
                              onClick={() => setSelectedFont(f.family)}
                              className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[58px] ${
                                selectedFont === f.family 
                                  ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-sm' 
                                  : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] hover:border-white/20'
                              }`}
                            >
                              <div className="flex justify-between items-center gap-1">
                                <span className="text-[10px] font-mono font-bold truncate">{f.name}</span>
                                <span className="text-[8px] font-mono opacity-50 uppercase">{f.category}</span>
                              </div>
                              <div 
                                className="text-sm truncate mt-1 text-[var(--text)]" 
                                style={{ fontFamily: f.family }}
                              >
                                {customText || 'INKWAVE'}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Color Palette & Neon Gradient */}
                    <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase text-[var(--text-dim)] font-bold">
                          Ink Color & Gradient:
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsTextGradient(!isTextGradient)}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono uppercase cursor-pointer transition-all ${
                            isTextGradient ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'
                          }`}
                        >
                          {isTextGradient ? '✓ Neon Gradient Active' : '+ Neon Gradient'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {INK_COLORS.map(c => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedTextColor(c.hex)}
                            className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
                              selectedTextColor === c.hex ? 'border-[var(--accent)] scale-110 shadow' : 'border-white/10 hover:border-white/40'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {selectedTextColor === c.hex && (
                              <Check className={`w-3 h-3 ${c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#d4c5b9' ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Horizontal Typography Stretch Slider (50% to 200%) */}
                    <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[var(--text-dim)] font-bold uppercase">Horizontal Kerning & Stretch:</span>
                        <span className="text-[var(--accent)] font-bold">{textStretchX}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTextStretchX(prev => Math.max(50, prev - 10))}
                          className="w-7 h-7 rounded-lg bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={textStretchX}
                          onChange={(e) => setTextStretchX(Number(e.target.value))}
                          className="flex-1 accent-[var(--accent)] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setTextStretchX(prev => Math.min(200, prev + 10))}
                          className="w-7 h-7 rounded-lg bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Arc Curvature, Stroke Outline, and Shadow Effects */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() => setIsCurvedText(!isCurvedText)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-mono uppercase cursor-pointer transition-all text-center ${
                          isCurvedText ? 'bg-[var(--accent)] text-black font-bold shadow-xs' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'
                        }`}
                      >
                        {isCurvedText ? '✓ Arc Curve Active' : 'Arc Curve Text'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsOutlineText(!isOutlineText)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-mono uppercase cursor-pointer transition-all text-center ${
                          isOutlineText ? 'bg-[var(--accent)] text-black font-bold shadow-xs' : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)]'
                        }`}
                      >
                        {isOutlineText ? '✓ Stroke Outline Active' : 'Stroke Outline'}
                      </button>
                    </div>

                    {/* Target Surface + Convert to Graphic Layer */}
                    <div className="pt-2 border-t border-[var(--line)] space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-dim)] uppercase">
                        <span className="font-bold">Add Typography to Surface:</span>
                        <div className="flex gap-1">
                          {(['front', 'back', 'sleeve-left', 'sleeve-right'] as const).map(side => (
                            <button
                              key={side}
                              type="button"
                              onClick={() => setTextTargetSide(side)}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase cursor-pointer ${
                                textTargetSide === side ? 'bg-[var(--accent)] text-black' : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--text-dim)]'
                              }`}
                            >
                              {side === 'sleeve-left' ? 'L-Sleeve' : side === 'sleeve-right' ? 'R-Sleeve' : side}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddTypographyAsGraphic}
                        className="w-full bg-[var(--accent)] text-black hover:opacity-90 font-mono font-bold text-xs uppercase py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>➕ Add Styled Text As Graphic Layer on {textTargetSide.toUpperCase()}</span>
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
                <span>Next: Placement & Stretch Studio &rarr;</span>
              </button>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* ─── STEP 3: 📐 PHOTOSHOP TRANSFORM & STRETCH STUDIO ───────────── */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'size' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--line)] space-y-4 animate-in fade-in duration-200 shadow-lg">
              
              {/* Active Layer Inspector Header */}
              <div className="flex justify-between items-center pb-2 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-black border border-white/10 flex items-center justify-center overflow-hidden p-0.5">
                    <img src={activeGraphic?.processedUrl || activeGraphic?.url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-[var(--text)] uppercase truncate">
                      {activeGraphic?.name || 'Graphic Layer'}
                    </div>
                    <div className="text-[9px] font-mono text-[var(--accent)] uppercase">
                      Surface: {activeGraphic?.side || 'front'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleDuplicateLayer}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text)] border border-white/10 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="Duplicate active layer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLayerTransform}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-dim)] hover:text-white border border-white/10 cursor-pointer transition-all"
                    title="Reset all transforms to 1:1 standard"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

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

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* ─── PHOTOSHOP NON-UNIFORM STRETCH & TRANSFORM CONTROLS ──────── */}
              {/* ════════════════════════════════════════════════════════════════ */}
              <div className="pt-2 border-t border-[var(--line)] space-y-3 bg-[var(--bg)] p-3.5 rounded-2xl border">
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[var(--accent)]" /> Photoshop Transform & Stretch
                  </span>
                  <button
                    type="button"
                    onClick={() => updateActiveLayer({ aspectRatioLocked: !activeGraphic?.aspectRatioLocked })}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                      activeGraphic?.aspectRatioLocked 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    }`}
                  >
                    {activeGraphic?.aspectRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{activeGraphic?.aspectRatioLocked ? 'Lock Ratio' : 'Free Stretch'}</span>
                  </button>
                </div>

                {/* Horizontal Stretch (scaleX) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[var(--text-dim)] font-bold uppercase">Horizontal Width Stretch (X):</span>
                    <span className="text-[var(--accent)] font-bold">{activeGraphic?.scaleX ?? 100}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLayerStretch('width', -5)}
                      className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer transition-colors"
                      title="Shrink width 5%"
                    >
                      -5%
                    </button>
                    <input 
                      type="range" 
                      min="40" 
                      max="220" 
                      value={activeGraphic?.scaleX ?? 100} 
                      onChange={e => updateActiveLayer({ scaleX: Number(e.target.value) })} 
                      className="flex-1 accent-[var(--accent)] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleLayerStretch('width', 5)}
                      className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer transition-colors"
                      title="Expand width 5%"
                    >
                      +5%
                    </button>
                  </div>
                </div>

                {/* Vertical Stretch (scaleY) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[var(--text-dim)] font-bold uppercase">Vertical Height Stretch (Y):</span>
                    <span className="text-[var(--accent)] font-bold">{activeGraphic?.scaleY ?? 100}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLayerStretch('height', -5)}
                      className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer transition-colors"
                      title="Shrink height 5%"
                    >
                      -5%
                    </button>
                    <input 
                      type="range" 
                      min="40" 
                      max="220" 
                      value={activeGraphic?.scaleY ?? 100} 
                      onChange={e => updateActiveLayer({ scaleY: Number(e.target.value) })} 
                      className="flex-1 accent-[var(--accent)] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleLayerStretch('height', 5)}
                      className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text)] flex items-center justify-center cursor-pointer transition-colors"
                      title="Expand height 5%"
                    >
                      +5%
                    </button>
                  </div>
                </div>

                {/* Quick Aspect & Distortion Pills */}
                <div className="flex gap-1.5 flex-wrap items-center pt-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-dim)] mr-1">Aspect Presets:</span>
                  {[
                    { label: '1:1 Standard', sx: 100, sy: 100 },
                    { label: 'Wide (140% X)', sx: 140, sy: 100 },
                    { label: 'Tall (140% Y)', sx: 100, sy: 140 },
                    { label: 'Pancake (180/70)', sx: 180, sy: 70 },
                    { label: 'Tower (70/180)', sx: 70, sy: 180 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateActiveLayer({ scaleX: preset.sx, scaleY: preset.sy, aspectRatioLocked: false })}
                      className="px-2 py-1 rounded-lg text-[9px] font-mono font-bold uppercase border border-[var(--line)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Flip Mirror Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--line)]/50">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-dim)] font-bold">Mirroring:</span>
                  <button
                    type="button"
                    onClick={() => updateActiveLayer({ flipX: !activeGraphic?.flipX })}
                    className={`flex-1 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeGraphic?.flipX 
                        ? 'bg-[var(--accent)] text-black border-[var(--accent)] shadow' 
                        : 'bg-[var(--bg-card)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip X (Mirror)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveLayer({ flipY: !activeGraphic?.flipY })}
                    className={`flex-1 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeGraphic?.flipY 
                        ? 'bg-[var(--accent)] text-black border-[var(--accent)] shadow' 
                        : 'bg-[var(--bg-card)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'
                    }`}
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    <span>Flip Y</span>
                  </button>
                </div>

              </div>

              {/* Overall Scaling Presets */}
              <div className="pt-2 border-t border-[var(--line)] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[var(--accent)]" /> Overall Proportional Size
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

              {/* Quick Sizing & Position D-Pad Controller */}
              <div className="pt-2 border-t border-[var(--line)] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[var(--accent)]" /> Precision Placement & Nudge
                  </label>
                  <span className="text-[10px] font-mono text-[var(--accent)] font-bold">
                    X: {activeGraphic?.x || 0}%, Y: {activeGraphic?.y || 38}%
                  </span>
                </div>

                {/* Mobile-Friendly Precision D-Pad */}
                <div className="bg-[var(--bg)] p-3 rounded-2xl border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleNudgePosition('up')}
                    className="w-10 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--text)] flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                    title="Nudge Up"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleNudgePosition('left')}
                      className="w-10 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--text)] flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                      title="Nudge Left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgePosition('center')}
                      className="px-3 h-9 rounded-xl bg-[var(--accent)] text-black font-mono font-bold text-xs uppercase flex items-center justify-center cursor-pointer active:scale-95 shadow"
                      title="Center on Chest"
                    >
                      Center 🎯
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgePosition('right')}
                      className="w-10 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--text)] flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                      title="Nudge Right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNudgePosition('down')}
                    className="w-10 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--text)] flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                    title="Nudge Down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="pt-2 border-t border-[var(--line)] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-[var(--accent)]" /> Artwork Rotation
                  </label>
                  <button
                    type="button"
                    onClick={() => updateActiveLayer({ rotate: 0 })}
                    className="text-[10px] font-mono text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Reset (0°)
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={activeGraphic?.rotate || 0} 
                    onChange={e => updateActiveLayer({ rotate: Number(e.target.value) })} 
                    className="flex-1 accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[var(--text)] w-10 text-right">
                    {activeGraphic?.rotate || 0}°
                  </span>
                </div>
              </div>

              {/* Direct Drag Instruction Card */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-white/10 flex items-center gap-3 shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                  <Hand className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <p className="text-[11px] font-mono text-[var(--text-dim)] leading-relaxed">
                  Touch & drag directly on the 3D t-shirt to place your artwork anywhere across the front, back, or sleeves!
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
              <span>Purchase Bespoke Custom Tee • ₹{basePrice || 600}</span>
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
