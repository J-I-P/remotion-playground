import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./JYPinBoot";

// Block cursor. Blinks on a fixed rhythm (15 frames on / 15 off at 30fps).
export const Cursor: React.FC<{
  size?: number;
  color?: string;
  blink?: boolean;
}> = ({ size = 56, color = COLORS.accent, blink = true }) => {
  const frame = useCurrentFrame();
  const on = !blink || Math.floor(frame / 15) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: size * 0.55,
        height: size,
        backgroundColor: color,
        borderRadius: 3,
        opacity: on ? 1 : 0,
        verticalAlign: "middle",
      }}
    />
  );
};

// A line of text that fades + slides up into place, starting at `delay` frames.
export const Line: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// The mascot: an orange dot with a kaomoji expression floating above it.
// `eyesX` shifts the eyes inside the parentheses (the "looking around" trick).
export const Mascot: React.FC<{
  expression: React.ReactNode;
  eyesX?: number;
  dotScale?: number;
}> = ({ expression, eyesX = 0, dotScale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  // Tiny idle float, ~6px, slow.
  const bob = Math.sin((frame / fps) * Math.PI * 0.9) * 6;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 56,
        transform: `translateY(${bob}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.kaomoji,
          fontSize: 76,
          color: COLORS.fg,
          whiteSpace: "pre",
          opacity: interpolate(frame, [6, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [6, 20], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px) translateX(${eyesX}px)`,
        }}
      >
        {expression}
      </div>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: COLORS.accent,
          transform: `scale(${pop * dotScale})`,
          boxShadow: `0 0 80px ${COLORS.accent}33`,
        }}
      />
    </div>
  );
};
