import { useEffect, useState } from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONTS, FONT_FACES, KAOMOJI_GLYPHS, SIZE } from "./theme";

// Holds rendering until the bundled fonts are loaded, so no frame is ever
// captured with a fallback font.
export const useFontsReady = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    Promise.all(
      FONT_FACES.map((face) =>
        document.fonts.load(face, `JYPin.exe ${KAOMOJI_GLYPHS}`),
      ),
    )
      .then(() => document.fonts.ready)
      .finally(() => continueRender(handle));
  }, [handle]);
};

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
        gap: 72,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.kaomoji,
          fontSize: SIZE.face,
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
          width: SIZE.dot,
          height: SIZE.dot,
          borderRadius: "50%",
          backgroundColor: COLORS.accent,
          transform: `translateX(${dotX}px) scale(${dotScaleX}, ${dotScaleY})`,
          transformOrigin: "50% 100%",
          boxShadow: `0 0 120px ${COLORS.accent}40`,
        }}
      />
    </div>
  );
};
