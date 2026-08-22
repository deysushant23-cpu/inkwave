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

      if (finish === 'puff') {
        // Puff print: slight embossed drop shadow + thick border
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 7;
        ctx.drawImage(img, 0, 0);
        ctx.shadowColor = 'transparent';
        ctx.drawImage(img, 0, 0);
      } else if (finish === 'vintage') {
        // Vintage screenprint: subtle crackle erosion
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 0) {
              const noise = Math.sin(x * 0.15) * Math.cos(y * 0.12);
              if (noise > 0.65 || Math.random() < 0.08) {
                data[index + 3] = 0;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (finish === 'chrome') {
        // Chrome liquid metal
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'source-atop';
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#94a3b8');
        grad.addColorStop(0.5, '#f8fafc');
        grad.addColorStop(0.7, '#64748b');
        grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64Image);
  });
}
