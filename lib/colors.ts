// Shared family-member / event color palette — warm, friendly, readable on white
export const MEMBER_COLORS = [
  "#ff6b57", // coral
  "#2aa8a0", // teal
  "#f5a623", // amber
  "#8b7bd8", // violet
  "#4fa3d9", // sky
  "#58b368", // green
  "#e86fa4", // pink
  "#5c7099", // slate
];

// Google Calendar event colorId (1–11) → actual hex palette
export const GOOGLE_EVENT_COLORS: Record<string, string> = {
  "1": "#7986cb",
  "2": "#33b679",
  "3": "#8e24aa",
  "4": "#e67c73",
  "5": "#f6bf26",
  "6": "#f4511e",
  "7": "#039be5",
  "8": "#616161",
  "9": "#3f51b5",
  "10": "#0b8043",
  "11": "#d50000",
};

// 15%-opacity tint of a hex color, for chip backgrounds
export function tint(hex: string, alpha = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const readableCache = new Map<string, string>();

// Same hue, darkened until it reads clearly (WCAG ≥ 4.5) on the chip's
// tint background. Light colors (Google's yellow, light blue, green)
// become deep versions of themselves instead of disappearing.
export function readableText(hex: string): string {
  const cached = readableCache.get(hex);
  if (cached) return cached;

  const { h, s, l } = hexToHsl(hex);
  // The chip background: tint(hex, 0.18) composited over the white card
  const bg = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) * 0.18 + 255 * 0.82
  ) as [number, number, number];

  let l2 = Math.min(l, 0.34);
  const s2 = l > 0.5 ? Math.min(1, s + 0.1) : s;
  let rgb = hslToRgb(h, s2, l2);
  while (contrast(rgb, bg) < 4.5 && l2 > 0.12) {
    l2 -= 0.02;
    rgb = hslToRgb(h, s2, l2);
  }

  const result = `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`;
  readableCache.set(hex, result);
  return result;
}
