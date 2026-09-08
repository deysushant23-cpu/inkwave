export interface TextPrintOptions {
  text: string;
  fontFamily: string;
  fontSize?: number; // Custom font sizing (30 - 150)
  color: string;
  letterSpacing: number;
  isCurved: boolean;
  curveRadius?: number;
  isOutline: boolean;
  subtext?: string;
}

export type PrintFinish = 'matte' | 'puff' | 'vintage' | 'chrome';
export type FabricWashStyle = 'solid' | 'acid-wash' | 'mercerized';

export interface GraphicLayer {
  id: string;
  name: string;
  url: string;
  processedUrl: string;
  side: 'front' | 'back';
  x: number;
  y: number;
  scale: number;
  rotate: number;
  finish: PrintFinish;
  removeBg: boolean;
  bgTolerance: number;
}

export interface PrintPlacementPreset {
  name: string;
  icon: string;
  side: 'front' | 'back';
  x: number;
  y: number;
  scale: number;
}

export const PLACEMENT_PRESETS: PrintPlacementPreset[] = [
  { name: 'Center Chest', icon: '🎯', side: 'front', x: 0, y: 38, scale: 48 },
  { name: 'Pocket Left', icon: '📍', side: 'front', x: -22, y: 30, scale: 22 },
  { name: 'Lower Hem', icon: '📐', side: 'front', x: -20, y: 62, scale: 25 },
  { name: 'Oversized Back', icon: '🔥', side: 'back', x: 0, y: 38, scale: 65 },
  { name: 'Nape Collar', icon: '🏷️', side: 'back', x: 0, y: 22, scale: 18 },
];

export const STREETWEAR_FONTS = [
  { id: 'gothic', name: 'Gothic Metal Blackletter', family: "'UnifrakturMaguntia', cursive", viral: true },
  { id: 'graffiti', name: 'Stussy Handstyle / Marker', family: "'Permanent Marker', cursive", viral: true },
  { id: 'dela', name: 'Tokyo Heavy Graphic', family: "'Dela Gothic One', sans-serif", viral: true },
  { id: 'orbitron', name: 'Y2K Cyber Chrome', family: "'Orbitron', sans-serif", viral: true },
  { id: 'glitch', name: 'Acid Cyber Glitch', family: "'Rubik Glitch', cursive", viral: true },
  { id: 'bebas', name: 'Bebas Street Poster', family: "'Bebas Neue', sans-serif", viral: true },
  { id: 'anton', name: 'Heavy Brutalist Anton', family: "'Anton', sans-serif", viral: false },
  { id: 'syne', name: 'High-Fashion Syne 900', family: "'Syne', sans-serif", viral: true },
  { id: 'bubble', name: 'Y2K Acid Bubble', family: "'Rubik Bubbles', cursive", viral: false },
  { id: 'cinzel', name: 'Cinzel Imperial Gothic', family: "'Cinzel Decorative', serif", viral: false },
  { id: 'mono', name: 'Cyber Monospace', family: "'JetBrains Mono', monospace", viral: false },
  { id: 'space', name: 'Space Grotesk Brutal', family: "'Space Grotesk', sans-serif", viral: false },
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
];

/* ── Streetwear Graphic Categories & Vector Stickers ──────────────────── */
export type StickerCategory = 'y2k' | 'gothic' | 'tokyo' | 'minimal' | 'skulls';

export interface StreetwearSticker {
  id: string;
  name: string;
  category: StickerCategory;
  description: string;
  url: string;
}

export const STREETWEAR_STICKERS: StreetwearSticker[] = [
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
 */
export function generateTextDecal(options: TextPrintOptions): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { text, fontFamily, fontSize = 72, color, letterSpacing, isCurved, isOutline, subtext } = options;
    if (!text.trim()) {
      resolve('');
      return;
    }

    const cleanText = text.toUpperCase();

    if (isCurved) {
      // Draw text along an arc/curve
      const centerX = canvas.width / 2;
      const centerY = 700;
      const radius = 340;
      const computedFontSize = fontSize * 0.9;

      ctx.font = `900 ${computedFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const totalAngle = Math.min(Math.PI * 0.85, (cleanText.length * 0.13) + (letterSpacing * 0.02));
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
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(3, computedFontSize * 0.08);
          ctx.strokeText(char, 0, 0);
        } else {
          ctx.fillStyle = color;
          ctx.fillText(char, 0, 0);
        }
        ctx.restore();
      }

      if (subtext?.trim()) {
        ctx.font = `700 ${Math.max(18, computedFontSize * 0.3)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.fillText(subtext.toUpperCase(), centerX, 630);
      }
    } else {
      // Horizontal Streetwear Center Text
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const computedFontSize = fontSize;

      ctx.font = `900 ${computedFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = `${letterSpacing}px`;

      if (isOutline) {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(4, computedFontSize * 0.08);
        ctx.strokeText(cleanText, centerX, centerY - (subtext ? 30 : 0));
      } else {
        ctx.fillStyle = color;
        ctx.fillText(cleanText, centerX, centerY - (subtext ? 30 : 0));
      }

      if (subtext?.trim()) {
        ctx.font = `700 ${Math.max(18, computedFontSize * 0.28)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.letterSpacing = '6px';
        ctx.fillText(subtext.toUpperCase(), centerX, centerY + (computedFontSize * 0.55));
      }
    }

    resolve(canvas.toDataURL('image/png'));
  });
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
