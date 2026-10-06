// Look of the boot sequence. Kept in its own file so parts.tsx and
// JYPinBoot.tsx can both use it without importing each other.

// Fonts are bundled from npm (@fontsource), so every machine renders the
// same glyphs — no dependence on what happens to be installed locally.
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-jp/400.css";

export const COLORS = {
  bg: "#0B132B",
  bg2: "#1C2541",
  accent: "#FF6B00",
  fg: "#F4F5F6",
  muted: "rgba(244, 245, 246, 0.5)",
};

export const FONTS = {
  mono: "'JetBrains Mono', monospace",
  sans: "Inter, sans-serif",
  kaomoji: "'Noto Sans JP', sans-serif",
};

// Type scale, sized for a 1080×1920 frame viewed on a phone.
export const SIZE = {
  hero: 112, // "> JYPin.exe"
  body: 64, // terminal lines
  small: 46, // long secondary lines (mono is wide)
  alert: 50, // "CURIOSITY SIGNAL DETECTED"
  face: 112, // kaomoji
  dot: 168, // mascot dot
};

// Optical centre: content sits a bit above the middle, clear of the
// caption / button overlay that Shorts, Reels and TikTok put at the bottom.
export const CENTER_OFFSET_Y = -140;

// Fonts that must be loaded before any frame is captured.
export const FONT_FACES = [
  `400 ${SIZE.body}px 'JetBrains Mono'`,
  `500 ${SIZE.body}px 'JetBrains Mono'`,
  `700 ${SIZE.alert}px Inter`,
  `400 ${SIZE.face}px 'Noto Sans JP'`,
];

// Characters the kaomoji use, so the right Noto Sans JP subsets get fetched.
export const KAOMOJI_GLYPHS = "(・_・?)( •̀ ω •́ )✧";
