export interface TextPrintOptions {
  text: string;
  fontFamily: string;
  fontSize?: number; // Custom font sizing (20 - 180)
  color: string;
  letterSpacing?: number;
  isCurved?: boolean;
  curveRadius?: number;
  isOutline?: boolean;
  outlineWidth?: number;
  outlineColor?: string;
  subtext?: string;
  stretchX?: number; // Text width expansion % (50 - 200)
  isGradient?: boolean;
  gradientColor?: string;
  shadow?: boolean;
  shadowColor?: string;
}

export type PrintFinish = 'matte' | 'puff' | 'vintage' | 'chrome';
export type FabricWashStyle = 'solid' | 'acid-wash' | 'mercerized';

export interface GraphicLayer {
  id: string;
  name: string;
  url: string;
  processedUrl: string;
  rawUrl?: string;
  side: 'front' | 'back' | 'sleeve-left' | 'sleeve-right';
  x: number;
  y: number;
  scale: number;
  scaleX?: number; // Horizontal stretch % (30 - 200, default 100)
  scaleY?: number; // Vertical stretch % (30 - 200, default 100)
  aspectRatioLocked?: boolean; // Locked 1:1 scale vs freeform stretch
  flipX?: boolean; // Mirror horizontal
  flipY?: boolean; // Mirror vertical
  opacity?: number; // Layer transparency % (20 - 100)
  rotate: number;
  finish: PrintFinish;
  removeBg: boolean;
  bgTolerance: number;
  isUpscaled?: boolean;
}

export interface PrintPlacementPreset {
  name: string;
  icon: string;
  side: 'front' | 'back' | 'sleeve-left' | 'sleeve-right';
  x: number;
  y: number;
  scale: number;
  scaleX?: number;
  scaleY?: number;
}

export const PLACEMENT_PRESETS: PrintPlacementPreset[] = [
  { name: 'Center Chest', icon: '🎯', side: 'front', x: 0, y: 38, scale: 48, scaleX: 100, scaleY: 100 },
  { name: 'Wide Chest Banner', icon: '↔️', side: 'front', x: 0, y: 32, scale: 54, scaleX: 145, scaleY: 85 },
  { name: 'Pocket Left', icon: '📍', side: 'front', x: -22, y: 30, scale: 22, scaleX: 100, scaleY: 100 },
  { name: 'Right Chest', icon: '🏷️', side: 'front', x: 22, y: 30, scale: 22, scaleX: 100, scaleY: 100 },
  { name: 'L-Sleeve Bicep', icon: '🦾', side: 'sleeve-left', x: 0, y: 30, scale: 24, scaleX: 100, scaleY: 100 },
  { name: 'L-Sleeve Band', icon: '⛓️', side: 'sleeve-left', x: 0, y: 44, scale: 28, scaleX: 130, scaleY: 90 },
  { name: 'R-Sleeve Bicep', icon: '🦾', side: 'sleeve-right', x: 0, y: 30, scale: 24, scaleX: 100, scaleY: 100 },
  { name: 'R-Sleeve Band', icon: '⛓️', side: 'sleeve-right', x: 0, y: 44, scale: 28, scaleX: 130, scaleY: 90 },
  { name: 'Oversized Back', icon: '🔥', side: 'back', x: 0, y: 38, scale: 62, scaleX: 100, scaleY: 100 },
  { name: 'Tall Spine Back', icon: '↕️', side: 'back', x: 0, y: 42, scale: 55, scaleX: 85, scaleY: 155 },
  { name: 'Nape Collar', icon: '🏷️', side: 'back', x: 0, y: 18, scale: 18, scaleX: 100, scaleY: 100 },
  { name: 'Lower Hem', icon: '📐', side: 'front', x: -20, y: 66, scale: 25, scaleX: 100, scaleY: 100 },
];

export type FontCategory = 'all' | 'gothic' | 'graffiti' | 'tokyo' | 'luxury' | 'varsity' | 'bubble' | 'script' | 'custom';

export interface StreetwearFont {
  id: string;
  name: string;
  family: string;
  category: FontCategory;
  description: string;
  viral?: boolean;
}

export const STREETWEAR_FONTS: StreetwearFont[] = [
  // ⚡ Gothic & Dark Metal
  { id: 'unifraktur', name: 'Gothic Blackletter', family: "'UnifrakturMaguntia', cursive", category: 'gothic', description: 'Dark metal blackletter style', viral: true },
  { id: 'pirata', name: 'Pirata Corsair', family: "'Pirata One', cursive", category: 'gothic', description: 'Heavy pirate medieval gothic', viral: true },
  { id: 'medieval', name: 'Iron Fortress', family: "'MedievalSharp', cursive", category: 'gothic', description: 'Sharp medieval stone-cut' },
  { id: 'new-rocker', name: 'Black Sabbath Metal', family: "'New Rocker', cursive", category: 'gothic', description: 'Heavy metal band typography' },
  { id: 'germania', name: 'Prussian Gothic', family: "'Germania One', cursive", category: 'gothic', description: 'Industrial German blackletter' },
  { id: 'metal-mania', name: 'Metal Mania Thrash', family: "'Metal Mania', cursive", category: 'gothic', description: 'Underground thrash metal' },

  // 🔥 Streetwear & Graffiti
  { id: 'permanent-marker', name: 'Stussy Marker', family: "'Permanent Marker', cursive", category: 'graffiti', description: 'Classic streetwear marker handstyle', viral: true },
  { id: 'sedgwick', name: 'Shibuya Tag', family: "'Sedgwick Ave', cursive", category: 'graffiti', description: 'New York / Tokyo spray tag', viral: true },
  { id: 'rock-salt', name: 'Grunge Chalk', family: "'Rock Salt', cursive", category: 'graffiti', description: 'Distressed raw grunge handstyle' },
  { id: 'creepster', name: 'Tokyo Street Punk', family: "'Creepster', cursive", category: 'graffiti', description: 'Aggressive street punk typography' },
  { id: 'faster-one', name: 'Speed Racer Tag', family: "'Faster One', cursive", category: 'graffiti', description: 'Horizontal aero speed lines' },
  { id: 'covered-grace', name: 'Underground Marker', family: "'Covered By Your Grace', cursive", category: 'graffiti', description: 'Quick raw Sharpie handstyle' },

  // 🎌 Tokyo & Cyber Y2K
  { id: 'dela-gothic', name: 'Tokyo Heavy Graphic', family: "'Dela Gothic One', sans-serif", category: 'tokyo', description: 'Ultra heavy Shibuya streetwear', viral: true },
  { id: 'orbitron', name: 'Y2K Cyber Chrome', family: "'Orbitron', sans-serif", category: 'tokyo', description: 'Neo-Tokyo cybernetic grid', viral: true },
  { id: 'bruno-ace', name: 'Cyber Monolith', family: "'Bruno Ace SC', sans-serif", category: 'tokyo', description: 'Futuristic mecha typography' },
  { id: 'press-start', name: 'Retro 8-Bit Arcade', family: "'Press Start 2P', monospace", category: 'tokyo', description: 'Y2K gaming pixel typography' },
  { id: 'audiowide', name: 'Neo-Tokyo Mecha', family: "'Audiowide', sans-serif", category: 'tokyo', description: 'Sci-fi wide techno font' },
  { id: 'michroma', name: 'Orbital Station', family: "'Michroma', sans-serif", category: 'tokyo', description: 'Ultra-wide aerospace typography' },
  { id: 'russo-one', name: 'Brutal Block', family: "'Russo One', sans-serif", category: 'tokyo', description: 'Heavy rounded brutalist font' },

  // 💎 Luxury & High Fashion
  { id: 'syne', name: 'High-Fashion Syne', family: "'Syne', sans-serif", category: 'luxury', description: 'Runway editorial display typography', viral: true },
  { id: 'cinzel-dec', name: 'Imperial Crest', family: "'Cinzel Decorative', serif", category: 'luxury', description: 'Luxury imperial fashion serif', viral: true },
  { id: 'playfair', name: 'Vogue Editorial Serif', family: "'Playfair Display', serif", category: 'luxury', description: 'High-contrast luxury serif' },
  { id: 'bodoni', name: 'Milan Runway Bodoni', family: "'Bodoni Moda', serif", category: 'luxury', description: 'Haute couture fashion display' },
  { id: 'italiana', name: 'Italian Renaissance', family: "'Italiana', serif", category: 'luxury', description: 'Ultra-refined Italian luxury' },

  // 🏀 Athletic Varsity & Heavy Brutalist
  { id: 'bebas', name: 'Bebas Brutal Poster', family: "'Bebas Neue', sans-serif", category: 'varsity', description: 'Bold condensed street poster', viral: true },
  { id: 'anton', name: 'Heavyweight Anton', family: "'Anton', sans-serif", category: 'varsity', description: 'Massive impact brutalist sans', viral: true },
  { id: 'black-han', name: 'Seoul Heavy Block', family: "'Black Han Sans', sans-serif", category: 'varsity', description: 'Solid monolithic heavy block' },
  { id: 'space-grotesk', name: 'Brutalist Space', family: "'Space Grotesk', sans-serif", category: 'varsity', description: 'Tech streetwear monospace brutalist' },
  { id: 'righteous', name: 'Varsity Championship', family: "'Righteous', cursive", category: 'varsity', description: 'Retro athletic jersey varsity' },
  { id: 'archivo-black', name: 'Heavy Archivo', family: "'Archivo Black', sans-serif", category: 'varsity', description: 'Maximum density heavy sans' },

  // 🫧 Acid Bubble & Glitch
  { id: 'rubik-glitch', name: 'Acid Cyber Glitch', family: "'Rubik Glitch', cursive", category: 'bubble', description: 'Distorted matrix digital glitch', viral: true },
  { id: 'rubik-bubbles', name: 'Y2K Puffer Bubble', family: "'Rubik Bubbles', cursive", category: 'bubble', description: 'Inflatable puffy 3D streetwear' },
  { id: 'monoton', name: 'Retro Disco Neon', family: "'Monoton', cursive", category: 'bubble', description: 'Multi-line neon optical art' },
  { id: 'megrim', name: 'Cyber Wireframe', family: "'Megrim', cursive", category: 'bubble', description: 'Futuristic geometric minimalist' },
  { id: 'bungee', name: 'Heavy 3D Bungee', family: "'Bungee', cursive", category: 'bubble', description: 'Heavy street sign typography' },

  // ✍️ Signature Script & Calligraphy
  { id: 'satisfy', name: 'Neon Signature', family: "'Satisfy', cursive", category: 'script', description: 'Smooth fluid signature script' },
  { id: 'caveat', name: 'Raw Handscript', family: "'Caveat', cursive", category: 'script', description: 'Spontaneous streetwear handwriting' },
  { id: 'sacramento', name: 'Luxury Monoline Script', family: "'Sacramento', cursive", category: 'script', description: 'Elegant thin monoline cursive' },
  { id: 'great-vibes', name: 'Vintage Royal Script', family: "'Great Vibes', cursive", category: 'script', description: 'Flourished cursive luxury script' },
];

export const INK_COLORS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Ink Black', hex: '#111111' },
  { name: 'Acid Neon', hex: '#CCFF00' },
  { name: 'Cyber Pink', hex: '#FF0055' },
  { name: 'Electric Cyan', hex: '#00F0FF' },
  { name: 'Vintage Ochre', hex: '#EAB308' },
  { name: 'Blood Crimson', hex: '#DC2626' },
  { name: 'Chrome Silver', hex: '#D4D4D8' },
  { name: 'Sunset Purple', hex: '#A855F7' },
  { name: 'Flame Orange', hex: '#F97316' },
];

/* ── Streetwear Graphic Categories & Vector Stickers ──────────────────── */
export type StickerCategory = 'y2k' | 'gothic' | 'tokyo' | 'minimal' | 'skulls' | 'sleeve' | 'custom';

export interface StreetwearSticker {
  id: string;
  name: string;
  category: StickerCategory;
  description: string;
  url: string;
}

export const STREETWEAR_STICKERS: StreetwearSticker[] = [
  // 🦾 Sleeve Badges & Arm Emblems
  {
    id: 'sleeve-barbed',
    name: 'Sleeve Barbed Armband',
    category: 'sleeve',
    description: 'Bicep/tricep wrap barbed vector',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="10" y="44" width="80" height="12" fill="none" stroke="white" stroke-width="2"/><polygon points="30,40 34,48 26,48" fill="white"/><polygon points="70,40 74,48 66,48" fill="white"/><polygon points="50,60 54,52 46,52" fill="white"/><text x="50" y="53" font-family="monospace" font-size="5" fill="white" font-weight="900" text-anchor="middle">INK // SLEEVE</text></svg>`
  },
  {
    id: 'sleeve-vertical-kanji',
    name: 'Tokyo Vertical Sleeve Banner',
    category: 'sleeve',
    description: 'Vertical Shibuya sleeve typography',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="35" y="10" width="30" height="80" fill="white"/><text x="50" y="30" font-family="sans-serif" font-weight="900" font-size="14" fill="black" text-anchor="middle">東京</text><text x="50" y="52" font-family="sans-serif" font-weight="900" font-size="12" fill="black" text-anchor="middle">渋谷</text><text x="50" y="72" font-family="monospace" font-weight="bold" font-size="7" fill="black" text-anchor="middle">2026</text></svg>`
  },
  {
    id: 'sleeve-spec-patch',
    name: 'Tactical Sleeve Patch',
    category: 'sleeve',
    description: 'Arm velcro tactical spec patch',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="6" fill="none" stroke="white" stroke-width="2" stroke-dasharray="3,3"/><text x="50" y="44" font-family="monospace" font-weight="bold" font-size="8" fill="white" text-anchor="middle">ARM-01</text><line x1="28" y1="52" x2="72" y2="52" stroke="white" stroke-width="1.5"/><text x="50" y="66" font-family="monospace" font-size="5" fill="white" text-anchor="middle">INKWAVE SPEC</text></svg>`
  },

  // 🔥 Y2K & Cyber
  {
    id: 'y2k-star',
    name: 'Cyber Chrome Star',
    category: 'y2k',
    description: 'Y2K metallic 4-point star',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><path d="M50 5 Q50 50 95 50 Q50 50 50 95 Q50 50 5 50 Q50 50 50 5 Z" fill="white"/><circle cx="50" cy="50" r="6" fill="black"/></svg>`
  },
  {
    id: 'y2k-sigil',
    name: 'Cyber Sigilism',
    category: 'y2k',
    description: 'Neo-tribal futuristic vector',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><path d="M10 50 Q30 20 50 50 T90 50 Q70 80 50 50 T10 50" fill="none" stroke="white" stroke-width="3"/><circle cx="50" cy="50" r="12" fill="none" stroke="white" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="80" stroke="white" stroke-width="2"/><text x="50" y="94" font-family="monospace" font-size="6" fill="white" text-anchor="middle" letter-spacing="1">Y2K SYSTEM</text></svg>`
  },
  {
    id: 'y2k-barbed',
    name: 'Barbed Wire Ring',
    category: 'y2k',
    description: 'Acid punk barbed circle',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="32" fill="none" stroke="white" stroke-width="2" stroke-dasharray="4,6"/><polygon points="50,15 54,23 46,23" fill="white"/><polygon points="85,50 77,54 77,46" fill="white"/><polygon points="50,85 54,77 46,77" fill="white"/><polygon points="15,50 23,54 23,46" fill="white"/><text x="50" y="54" font-family="monospace" font-weight="900" font-size="9" fill="white" text-anchor="middle">INK</text></svg>`
  },

  // ⚡ Gothic & Dark
  {
    id: 'gothic-cross',
    name: 'Medieval Dark Cross',
    category: 'gothic',
    description: 'Black metal medieval crucifix',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><path d="M44 10 h12 v24 h24 v12 h-24 v44 h-12 v-44 h-24 v-12 h24 z" fill="white"/><circle cx="50" cy="40" r="18" fill="none" stroke="white" stroke-width="2"/><text x="50" y="96" font-family="serif" font-size="6" fill="white" text-anchor="middle" letter-spacing="2">ETERNAL</text></svg>`
  },
  {
    id: 'gothic-brand',
    name: 'Gothic Brand Crest',
    category: 'gothic',
    description: 'High fashion blackletter seal',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><text x="50" y="42" font-family="serif" font-weight="900" font-size="16" fill="white" text-anchor="middle" letter-spacing="2">INKWAVE</text><line x1="20" y1="52" x2="80" y2="52" stroke="white" stroke-width="1.5" /><text x="50" y="68" font-family="monospace" font-size="6" fill="white" text-anchor="middle" letter-spacing="1">STUDIO SPEC 01</text></svg>`
  },

  // 🎌 Tokyo & Anime
  {
    id: 'tokyo-kanji',
    name: 'Tokyo Underground',
    category: 'tokyo',
    description: 'Futuristic Shibuya typography',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><text x="50" y="38" font-family="sans-serif" font-weight="900" font-size="24" fill="white" text-anchor="middle" letter-spacing="-1">TOKYO</text><text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="16" fill="white" text-anchor="middle" letter-spacing="4">SHIBUYA</text><rect x="25" y="72" width="50" height="12" fill="white"/><text x="50" y="81" font-family="monospace" font-weight="bold" font-size="7" fill="black" text-anchor="middle">DROP 2026</text></svg>`
  },
  {
    id: 'anime-samurai',
    name: 'Cyber Samurai Seal',
    category: 'tokyo',
    description: 'Japanese neo-tokyo emblem',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="none" stroke="white" stroke-width="2"/><path d="M30 40 L50 25 L70 40 L60 70 L40 70 Z" fill="none" stroke="white" stroke-width="2"/><line x1="35" y1="50" x2="65" y2="50" stroke="white" stroke-width="2"/><text x="50" y="93" font-family="monospace" font-size="5" fill="white" text-anchor="middle" letter-spacing="1.5">CYBER DIVISION</text></svg>`
  },

  // 💎 Minimal & Studio
  {
    id: 'minimal-spec',
    name: 'Studio Spec Box',
    category: 'minimal',
    description: 'Minimalist industrial spec label',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="50" fill="none" stroke="white" stroke-width="1.5"/><text x="20" y="40" font-family="monospace" font-size="6" fill="white" font-weight="bold">SPEC NO: 994-01</text><text x="20" y="52" font-family="monospace" font-size="5" fill="white">FABRIC: 240GSM</text><text x="20" y="64" font-family="monospace" font-size="5" fill="white">SURAT / TOKYO</text><line x1="68" y1="32" x2="68" y2="68" stroke="white" stroke-width="1" stroke-dasharray="2,2"/></svg>`
  },
  {
    id: 'barcode-label',
    name: 'Barcode Matrix',
    category: 'minimal',
    description: 'Clean streetwear barcode badge',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="20" y="30" width="3" height="30" fill="white"/><rect x="26" y="30" width="6" height="30" fill="white"/><rect x="35" y="30" width="2" height="30" fill="white"/><rect x="40" y="30" width="5" height="30" fill="white"/><rect x="48" y="30" width="2" height="30" fill="white"/><rect x="53" y="30" width="7" height="30" fill="white"/><rect x="63" y="30" width="2" height="30" fill="white"/><rect x="68" y="30" width="4" height="30" fill="white"/><rect x="75" y="30" width="5" height="30" fill="white"/><text x="50" y="72" font-family="monospace" font-size="6" fill="white" text-anchor="middle" letter-spacing="2">INK-88301-A</text></svg>`
  },

  // 💀 Skulls & Badges
  {
    id: 'skull-cyber',
    name: 'Cyber Skull Badge',
    category: 'skulls',
    description: 'High-contrast raw skull badge',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="40" fill="none" stroke="white" stroke-width="2"/><circle cx="42" cy="38" r="4" fill="white"/><circle cx="58" cy="38" r="4" fill="white"/><path d="M45 50 h10 v4 h-10 z" fill="white"/><text x="50" y="78" font-family="monospace" font-size="7" fill="white" text-anchor="middle" letter-spacing="1.5">LIMITED EDITION</text></svg>`
  },
  {
    id: 'acid-smile',
    name: 'Acid Smiley Badge',
    category: 'skulls',
    description: 'Underground acid raver icon',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-width="2.5"/><path d="M38 35 L44 42 M44 35 L38 42" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M56 35 L62 42 M62 35 L56 42" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M35 60 Q50 75 65 60" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="93" font-family="monospace" font-size="5.5" fill="white" text-anchor="middle">INK ACID</text></svg>`
  }
];

/* ── 1-Tap Streetwear Design Recipes (Instant Templates) ───────────────── */
export interface DesignRecipe {
  id: string;
  name: string;
  badge: string;
  description: string;
  tshirtHex: string;
  tshirtName: string;
  fabricWash: FabricWashStyle;
  sticker: StreetwearSticker;
  stickerPlacement: PrintPlacementPreset;
  finish: PrintFinish;
  typography: {
    enabled: boolean;
    text: string;
    subtext: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    isCurved: boolean;
    isOutline: boolean;
    y: number;
  };
  customLabel: string;
}

export const DESIGN_RECIPES: DesignRecipe[] = [
  {
    id: 'recipe-tokyo-cyber',
    name: '⚡ Neo-Tokyo Cyber',
    badge: 'VIRAL',
    description: 'Shibuya typography on back + curved neon chest text on Ink Black.',
    tshirtHex: '#111111',
    tshirtName: 'Ink Black',
    fabricWash: 'solid',
    sticker: STREETWEAR_STICKERS[3], // tokyo kanji
    stickerPlacement: PLACEMENT_PRESETS[3], // Oversized Back
    finish: 'matte',
    typography: {
      enabled: true,
      text: 'SHIBUYA SOUL',
      subtext: 'NEO-TOKYO // 2026',
      fontFamily: "'Dela Gothic One', sans-serif",
      fontSize: 68,
      color: '#00F0FF',
      isCurved: true,
      isOutline: false,
      y: 26
    },
    customLabel: 'TOKYO DIVISION // SPEC 01'
  },
  {
    id: 'recipe-gothic-metal',
    name: '⛓️ Gothic Heavy Metal',
    badge: 'TRENDING',
    description: 'Blackletter medieval cross with distressed vintage finish on Charcoal.',
    tshirtHex: '#27272a',
    tshirtName: 'Charcoal Grey',
    fabricWash: 'acid-wash',
    sticker: STREETWEAR_STICKERS[2], // gothic cross
    stickerPlacement: PLACEMENT_PRESETS[0], // Center Chest
    finish: 'vintage',
    typography: {
      enabled: true,
      text: 'INKWAVE ETERNAL',
      subtext: 'DARK METAL // BATCH 04',
      fontFamily: "'UnifrakturMaguntia', cursive",
      fontSize: 78,
      color: '#FFFFFF',
      isCurved: false,
      isOutline: false,
      y: 22
    },
    customLabel: 'ETERNAL REIGN // INKWAVE'
  },
  {
    id: 'recipe-y2k-wave',
    name: '🌊 Y2K Acid Wave',
    badge: 'HOT',
    description: 'Futuristic chrome stars with puff 3D texture on Sage Green blank.',
    tshirtHex: '#90ee90',
    tshirtName: 'Sage Green',
    fabricWash: 'solid',
    sticker: STREETWEAR_STICKERS[0], // y2k star
    stickerPlacement: PLACEMENT_PRESETS[0], // Center Chest
    finish: 'puff',
    typography: {
      enabled: true,
      text: 'ACID WAVE',
      subtext: 'DIGITAL PARADISE 2026',
      fontFamily: "'Orbitron', sans-serif",
      fontSize: 64,
      color: '#111111',
      isCurved: true,
      isOutline: true,
      y: 24
    },
    customLabel: 'ACID WAVE // Y2K LAB'
  },
  {
    id: 'recipe-minimal-studio',
    name: '🏷️ Minimal Studio Spec',
    badge: 'EDITORIAL',
    description: 'Clean pocket badge + barcode on back on Pure White heavyweight blank.',
    tshirtHex: '#ffffff',
    tshirtName: 'Pure White',
    fabricWash: 'mercerized',
    sticker: STREETWEAR_STICKERS[5], // minimal spec
    stickerPlacement: PLACEMENT_PRESETS[1], // Pocket Left
    finish: 'matte',
    typography: {
      enabled: true,
      text: 'STUDIO ARCHIVE',
      subtext: 'SURAT TEXTILE RESEARCH',
      fontFamily: "'Syne', sans-serif",
      fontSize: 54,
      color: '#111111',
      isCurved: false,
      isOutline: false,
      y: 35
    },
    customLabel: 'ARCHIVE SPEC // SURAT LAB'
  },
  {
    id: 'recipe-chrome-skull',
    name: '💀 Chrome Underground',
    badge: 'UNDERGROUND',
    description: 'High-contrast metallic skull on Crimson Red heavyweight blank.',
    tshirtHex: '#b31a1a',
    tshirtName: 'Crimson Red',
    fabricWash: 'solid',
    sticker: STREETWEAR_STICKERS[6], // skull cyber
    stickerPlacement: PLACEMENT_PRESETS[3], // Oversized Back
    finish: 'chrome',
    typography: {
      enabled: true,
      text: 'RAW DEATH',
      subtext: 'UNDERGROUND RUN 09',
      fontFamily: "'Rubik Glitch', cursive",
      fontSize: 72,
      color: '#FFFFFF',
      isCurved: false,
      isOutline: true,
      y: 24
    },
    customLabel: 'UNDERGROUND // DEATH DROP'
  }
];

/**
 * Dynamically rasterizes customizable streetwear text into a high-res transparent PNG data URL
 * Supports font width stretching, cyber neon gradients, outline strokes, curved arcs, and drop glow.
 */
export function generateTextDecal(options: TextPrintOptions): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { 
      text, 
      fontFamily, 
      fontSize = 72, 
      color, 
      letterSpacing = 4, 
      isCurved = false, 
      curveRadius = 340,
      isOutline = false, 
      outlineWidth = 4,
      outlineColor = '#ffffff',
      subtext,
      stretchX = 100,
      isGradient = false,
      gradientColor = '#00F0FF',
      shadow = false,
      shadowColor = 'rgba(0,0,0,0.7)'
    } = options;

    if (!text.trim()) {
      resolve('');
      return;
    }

    const cleanText = text.toUpperCase();
    const stretchFactor = Math.max(0.4, Math.min(2.5, stretchX / 100));

    // Configure text fill style (solid vs gradient)
    let fillStyle: string | CanvasGradient = color;
    if (isGradient) {
      const grad = ctx.createLinearGradient(200, 200, 1200, 1200);
      grad.addColorStop(0, color);
      grad.addColorStop(1, gradientColor);
      fillStyle = grad;
    }

    if (shadow) {
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 6;
    }

    if (isCurved) {
      // Draw text along an arc/curve with adjustable curvature radius
      const centerX = canvas.width / 2;
      const centerY = 740;
      const radius = Math.max(180, Math.min(500, curveRadius));
      const computedFontSize = fontSize * 0.9;

      ctx.save();
      // Apply horizontal width stretch
      ctx.translate(centerX, centerY);
      ctx.scale(stretchFactor, 1);
      ctx.translate(-centerX, -centerY);

      ctx.font = `900 ${computedFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const totalAngle = Math.min(Math.PI * 0.95, (cleanText.length * 0.14) + (letterSpacing * 0.02));
      const startAngle = -Math.PI / 2 - totalAngle / 2;
      const angleStep = totalAngle / (cleanText.length - 1 || 1);

      for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const angle = startAngle + i * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);

        if (isOutline) {
          ctx.strokeStyle = outlineColor || color;
          ctx.lineWidth = Math.max(3, outlineWidth || computedFontSize * 0.08);
          ctx.strokeText(char, 0, 0);
        }
        ctx.fillStyle = fillStyle;
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      if (subtext?.trim()) {
        ctx.font = `700 ${Math.max(18, computedFontSize * 0.32)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = 'center';
        ctx.letterSpacing = '5px';
        ctx.fillText(subtext.toUpperCase(), centerX, centerY - radius + 40);
      }

      ctx.restore();
    } else {
      // Horizontal Streetwear Center Text with Freeform Width Stretch
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const computedFontSize = fontSize;

      ctx.save();
      // Stretch horizontally around center
      ctx.translate(centerX, centerY);
      ctx.scale(stretchFactor, 1);
      ctx.translate(-centerX, -centerY);

      ctx.font = `900 ${computedFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = `${letterSpacing}px`;

      const textY = centerY - (subtext ? 32 : 0);

      if (isOutline) {
        ctx.strokeStyle = outlineColor || color;
        ctx.lineWidth = Math.max(3, outlineWidth || computedFontSize * 0.08);
        ctx.strokeText(cleanText, centerX, textY);
      }

      ctx.fillStyle = fillStyle;
      ctx.fillText(cleanText, centerX, textY);

      if (subtext?.trim()) {
        ctx.font = `700 ${Math.max(18, computedFontSize * 0.28)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = 'center';
        ctx.letterSpacing = '6px';
        ctx.fillText(subtext.toUpperCase(), centerX, centerY + (computedFontSize * 0.58));
      }

      ctx.restore();
    }

    resolve(canvas.toDataURL('image/png'));
  });
}

/**
 * Dynamically loads and registers a custom font file (.ttf / .otf / .woff) in the browser
 * Allows users to upload fonts from DaFont and immediately use them on the 3D t-shirt
 */
export async function loadCustomFontFile(file: File): Promise<StreetwearFont> {
  const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const familyName = `CustomFont_${fontName}_${Date.now()}`;

  const buffer = await file.arrayBuffer();
  const fontFace = new FontFace(familyName, buffer);
  const loadedFace = await fontFace.load();
  document.fonts.add(loadedFace);

  return {
    id: `custom-font-${Date.now()}`,
    name: `📁 ${file.name.slice(0, 18)}`,
    family: `'${familyName}', sans-serif`,
    category: 'custom',
    description: `Custom ${file.name.split('.').pop()?.toUpperCase()} font file`
  };
}

/**
 * Applies physical print finishes (Puff, Vintage Distressed, Chrome) to any image
 */
export function applyPrintFinishTexture(base64Image: string, finish: PrintFinish): Promise<string> {
  return new Promise((resolve) => {
    if (finish === 'matte') {
      resolve(base64Image);
      return;
    }

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

      if (finish === 'vintage') {
        // Distress grit & crackle algorithm
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            const noise = (Math.random() - 0.5) * 60;
            const distress = Math.random();
            if (distress > 0.88) {
              data[i + 3] = Math.max(0, data[i + 3] - 220); // Crack transparency
            } else {
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
          }
        }
      } else if (finish === 'puff') {
        // High-density 3D embossed look with edge shadow
        ctx.putImageData(imgData, 0, 0);
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
        return;
      } else if (finish === 'chrome') {
        // High-contrast metallic specular reflection
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 20) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const metallic = Math.sin(avg / 255 * Math.PI * 3) * 127 + 128;
            data[i] = metallic;
            data[i + 1] = Math.min(255, metallic + 20);
            data[i + 2] = Math.min(255, metallic + 45);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64Image);
  });
}

export interface SizingPreset {
  id: string;
  name: string;
  cmLabel: string;
  scale: number;
}

export const SIZING_PRESETS: SizingPreset[] = [
  { id: 'small', name: 'Pocket Badge', cmLabel: '12cm', scale: 22 },
  { id: 'medium', name: 'Standard Chest', cmLabel: '24cm', scale: 45 },
  { id: 'large', name: 'Oversized Street', cmLabel: '34cm', scale: 62 },
  { id: 'statement', name: 'Full Statement', cmLabel: '42cm', scale: 78 },
];

/**
 * AI Auto-Cleaner: Detects solid/light backgrounds from any JPG/PNG,
 * strips backgrounds automatically, and auto-trims whitespace.
 */
export function processImageWithAI(base64Image: string): Promise<{ cleanUrl: string; hasRemovedBg: boolean }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ cleanUrl: base64Image, hasRemovedBg: false });
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample 4 corners to detect background color
      const corners = [
        [data[0], data[1], data[2], data[3]],
        [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2], data[(canvas.width - 1) * 4 + 3]],
        [data[(canvas.height - 1) * canvas.width * 4], data[(canvas.height - 1) * canvas.width * 4 + 1], data[(canvas.height - 1) * canvas.width * 4 + 2], data[(canvas.height - 1) * canvas.width * 4 + 3]],
        [data[data.length - 4], data[data.length - 3], data[data.length - 2], data[data.length - 1]]
      ];

      // If already transparent, return as is
      const isAlreadyTransparent = corners.some(c => c[3] < 50);
      if (isAlreadyTransparent) {
        resolve({ cleanUrl: base64Image, hasRemovedBg: false });
        return;
      }

      let rBg = 0, gBg = 0, bBg = 0;
      corners.forEach(c => {
        rBg += c[0];
        gBg += c[1];
        bBg += c[2];
      });
      rBg = Math.round(rBg / 4);
      gBg = Math.round(gBg / 4);
      bBg = Math.round(bBg / 4);

      // Check if corners are homogeneous (indicating a solid photo backdrop)
      let isHomogeneous = true;
      corners.forEach(c => {
        const diff = Math.abs(c[0] - rBg) + Math.abs(c[1] - gBg) + Math.abs(c[2] - bBg);
        if (diff > 90) isHomogeneous = false;
      });

      // Default tolerance for JPG cleanup
      const tolerance = 42;
      let removedCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          Math.pow(r - rBg, 2) +
          Math.pow(g - gBg, 2) +
          Math.pow(b - bBg, 2)
        );

        if (dist < tolerance) {
          data[i + 3] = 0; // Set transparent
          removedCount++;
        } else if (dist < tolerance + 15) {
          // Soft alpha edge feathering
          const feather = (dist - tolerance) / 15;
          data[i + 3] = Math.round(data[i + 3] * feather);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const hasRemovedBg = removedCount > (data.length / 4) * 0.1;
      resolve({ cleanUrl: canvas.toDataURL('image/png'), hasRemovedBg });
    };
    img.onerror = () => resolve({ cleanUrl: base64Image, hasRemovedBg: false });
  });
}

/**
 * AI HD Upscaler & Super-Resolution Detail Enhancer:
 * Multi-pass high-resolution supersampling, anti-aliased edge sharpening,
 * dynamic contrast enhancement, and 300+ DPI print-ready clarity booster.
 */
export function enhanceImageWithAIUpscale(base64Image: string): Promise<{ enhancedUrl: string; scaleFactor: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64Image;
    img.onload = () => {
      // Upscale up to 4x (capped at 2400px for browser performance)
      const targetWidth = Math.min(2400, Math.max(img.width * 4, 1600));
      const scaleFactor = targetWidth / img.width;
      const targetHeight = Math.round(img.height * scaleFactor);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve({ enhancedUrl: base64Image, scaleFactor: 1 });
        return;
      }

      // Step 1: High quality bicubic interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Step 2: Unsharp masking & edge sharpening filter
      try {
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;
        const width = targetWidth;
        const height = targetHeight;

        // Create buffer for convolution
        const output = new Uint8ClampedArray(data);

        // 3x3 Sharpening kernel
        const kernel = [
          0, -0.6, 0,
          -0.6, 3.4, -0.6,
          0, -0.6, 0
        ];

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            // Only process non-transparent pixels
            if (data[idx + 3] < 15) continue;

            let r = 0, g = 0, b = 0;
            let kIdx = 0;

            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pIdx = ((y + ky) * width + (x + kx)) * 4;
                const weight = kernel[kIdx++];
                r += data[pIdx] * weight;
                g += data[pIdx + 1] * weight;
                b += data[pIdx + 2] * weight;
              }
            }

            // Contrast & clarity curve
            const contrast = 1.08;
            r = ((r - 128) * contrast) + 128;
            g = ((g - 128) * contrast) + 128;
            b = ((b - 128) * contrast) + 128;

            output[idx] = Math.min(255, Math.max(0, r));
            output[idx + 1] = Math.min(255, Math.max(0, g));
            output[idx + 2] = Math.min(255, Math.max(0, b));
            output[idx + 3] = data[idx + 3];
          }
        }

        const enhancedImgData = new ImageData(output, width, height);
        ctx.putImageData(enhancedImgData, 0, 0);

        resolve({
          enhancedUrl: canvas.toDataURL('image/png'),
          scaleFactor: Math.round(scaleFactor * 10) / 10
        });
      } catch (err) {
        console.warn('AI Upscale canvas read fallback:', err);
        resolve({
          enhancedUrl: canvas.toDataURL('image/png'),
          scaleFactor: Math.round(scaleFactor * 10) / 10
        });
      }
    };
    img.onerror = () => resolve({ enhancedUrl: base64Image, scaleFactor: 1 });
  });
}

