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

// 15%-opacity tint of a hex color, for chip backgrounds
export function tint(hex: string, alpha = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
