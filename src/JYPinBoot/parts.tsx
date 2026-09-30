import { interpolate, useCurrentFrame } from "remotion";
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
// It has no motion of its own: JYPinBoot.tsx drives it through props so all
// the timing lives in one place.
export const Mascot: React.FC<{
  expression: React.ReactNode;
  faceOpacity?: number;
  faceX?: number; // px, shifts the whole face (the "looking" cue)
  faceTilt?: number; // degrees
  y?: number; // px, whole-mascot vertical offset (float / hops)
  dotX?: number; // px, dot's horizontal look offset
  dotScaleX?: number;
  dotScaleY?: number;
}> = ({
  expression,
  faceOpacity = 1,
  faceX = 0,
  faceTilt = 0,
  y = 0,
  dotX = 0,
  dotScaleX = 1,
  dotScaleY = 1,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 56,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.kaomoji,
          fontSize: 76,
          color: COLORS.fg,
          whiteSpace: "pre",
          opacity: faceOpacity,
          transform: `translate(${faceX}px, ${(1 - faceOpacity) * 8}px) rotate(${faceTilt}deg)`,
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
          transform: `translateX(${dotX}px) scale(${dotScaleX}, ${dotScaleY})`,
          transformOrigin: "50% 100%",
          boxShadow: `0 0 80px ${COLORS.accent}33`,
        }}
      />
    </div>
  );
};
