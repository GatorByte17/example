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
