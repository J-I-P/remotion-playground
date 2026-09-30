import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cursor, Line, Mascot } from "./parts";

// ---------------------------------------------------------------------------
// TIMING — everything in frames (30fps, so 30 = 1 second).
// Each scene starts where the previous one ends. Change a duration and the
// rest of the video shifts automatically.
// ---------------------------------------------------------------------------
export const FPS = 30;

const DURATIONS = {
  execute: 60, // Scene 1: "> JYPin.exe" + cursor, then executes
  loading: 66, // Scene 2: loading bar → "✓ system ready"
  scan: 90, // Scene 3: "scanning..." → "⚠ CURIOSITY SIGNAL DETECTED"
  mascot: 120, // Scene 4: dot pops in, looks around, "?" appears
  initialized: 120, // Scene 5: confident face + "curiosity module initialized."
  ready: 105, // Scene 6: "> JYPin.exe / ready_" and hold
};

// Moments inside scenes (frames relative to the scene's own start).
const BEATS = {
  typeStart: 8, // Scene 1: start typing "JYPin.exe"
  typeFramesPerChar: 2,
  execute: 42, // Scene 1: "enter" pressed, line exits
  barStart: 10, // Scene 2: progress bar starts filling
  barFrames: 32, // Scene 2: how long the fill takes
  systemReady: 46, // Scene 2: "✓ system ready" appears
  signal: 44, // Scene 3: warning interrupts the scan
  lookLeft: 34, // Scene 4: glance left
  lookRight: 58, // Scene 4: glance right
  question: 82, // Scene 4: "?" appears
  moduleLine: 26, // Scene 5: "> curiosity module initialized." appears
};

const FADE = 10; // scene fade in/out length

const starts = (() => {
  let t = 0;
  const out = {} as Record<keyof typeof DURATIONS, number>;
  for (const key of Object.keys(DURATIONS) as (keyof typeof DURATIONS)[]) {
    out[key] = t;
    t += DURATIONS[key];
  }
  return out;
})();

export const TOTAL_FRAMES = Object.values(DURATIONS).reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------------------
// LOOK
// ---------------------------------------------------------------------------
export const COLORS = {
  bg: "#0B132B",
  bg2: "#1C2541",
  accent: "#FF6B00",
  fg: "#F4F5F6",
  muted: "rgba(244, 245, 246, 0.45)",
};

export const FONTS = {
  mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  sans: "Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
  kaomoji:
    "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', 'DejaVu Sans', sans-serif",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fade + small lift at the start and end of a scene.
const SceneFrame: React.FC<{
  duration: number;
  children: React.ReactNode;
  fadeOut?: boolean;
}> = ({ duration, children, fadeOut = true }) => {
  const frame = useCurrentFrame();
  const inT = interpolate(frame, [0, FADE], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outT = fadeOut
    ? interpolate(frame, [duration - FADE, duration], [1, 0], {
        ...clamp,
        easing: Easing.in(Easing.cubic),
      })
    : 1;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: Math.min(inT, outT),
        transform: `translateY(${(1 - inT) * 16 + (1 - outT) * -16}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// SCENES
// ---------------------------------------------------------------------------
const Execute: React.FC = () => {
  const frame = useCurrentFrame();
  const word = "JYPin.exe";
  const typed = Math.max(
    0,
    Math.floor((frame - BEATS.typeStart) / BEATS.typeFramesPerChar),
  );
  // "Enter": the prompt briefly turns orange, then the scene fades out.
  const executing = frame >= BEATS.execute;
  return (
    <div style={{ fontFamily: FONTS.mono, fontSize: 72, color: COLORS.fg }}>
      <span style={{ color: executing ? COLORS.accent : COLORS.muted }}>
        &gt;
      </span>{" "}
      {word.slice(0, typed)}{" "}
      {/* Blinks while idle, stays solid while typing. */}
      <Cursor size={72} blink={typed === 0 || typed >= word.length} />
    </div>
  );
};

const Loading: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [BEATS.barStart, BEATS.barStart + BEATS.barFrames],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );
  const blocks = 10;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 40,
      }}
    >
      <Line style={{ fontSize: 44, color: COLORS.muted }}>
        loading curiosity...
      </Line>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: blocks }).map((_, i) => {
            // Each block fades in as the progress passes it.
            const fill = interpolate(
              progress * blocks,
              [i, i + 1],
              [0, 1],
              clamp,
            );
            return (
              <div
                key={i}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 6,
                  backgroundColor: COLORS.bg2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: COLORS.fg,
                    opacity: fill,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 44,
            color: COLORS.fg,
            width: 120,
            textAlign: "right",
          }}
        >
          {Math.round(progress * 100)}%
        </div>
      </div>
      <Line
        delay={BEATS.systemReady}
        style={{ fontSize: 44, color: COLORS.fg }}
      >
        <span style={{ color: COLORS.accent }}>✓</span> system ready
      </Line>
    </div>
  );
};

const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dots = ".".repeat(Math.floor(frame / 8) % 4);
  const signal = frame >= BEATS.signal;
  const pop = spring({
    frame: frame - BEATS.signal,
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  // Slow sweep across a thin track — the "subtle motion" of scanning.
  const sweep = ((frame * 1.6) % 100) / 100;
  const scanDim = interpolate(
    frame,
    [BEATS.signal, BEATS.signal + 8],
    [1, 0.25],
    clamp,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 180,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          opacity: scanDim,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 44,
            color: COLORS.muted,
            width: 330,
          }}
        >
          scanning{dots}
        </div>
        <div
          style={{
            width: 520,
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.bg2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 120,
              left: `${sweep * 130 - 25}%`,
              background: `linear-gradient(90deg, transparent, ${COLORS.fg}cc, transparent)`,
              opacity: signal ? 0 : 1,
            }}
          />
        </div>
      </div>

      <div
        style={{
          opacity: signal ? pop : 0,
          transform: `scale(${0.94 + pop * 0.06})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 700,
            fontSize: 42,
            letterSpacing: 3,
            color: COLORS.accent,
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <svg width="42" height="38" viewBox="0 0 52 46">
            <path
              d="M26 3 L49 43 H3 Z"
              fill="none"
              stroke={COLORS.accent}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <rect x="24" y="16" width="4" height="14" rx="2" fill={COLORS.accent} />
            <circle cx="26" cy="36" r="2.5" fill={COLORS.accent} />
          </svg>
          CURIOSITY SIGNAL DETECTED
        </div>
        <div
          style={{
            height: 3,
            width: 520 * pop,
            backgroundColor: COLORS.accent,
            opacity: 0.5,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

// Scenes 4 + 5 share one mascot so it never jumps between scenes.
const MascotScenes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inInitialized = frame >= DURATIONS.mascot;
  const local5 = frame - DURATIONS.mascot;

  // Looking around (scene 4): glance left, glance right, settle.
  const ease = Easing.inOut(Easing.cubic);
  const look = interpolate(
    frame,
    [
      BEATS.lookLeft,
      BEATS.lookLeft + 8,
      BEATS.lookLeft + 18,
      BEATS.lookRight,
      BEATS.lookRight + 8,
      BEATS.lookRight + 18,
      BEATS.lookRight + 26,
    ],
    [0, -22, -22, -22, 22, 22, 0],
    { ...clamp, easing: ease },
  );

  // Scene 5: a small confident "bump" of the dot.
  const bump = spring({
    frame: local5,
    fps,
    config: { damping: 10, stiffness: 180 },
  });
  const dotScale = inInitialized
    ? 1 + 0.08 * Math.sin(Math.min(bump, 1) * Math.PI)
    : 1;

  const questionT = interpolate(
    frame,
    [BEATS.question, BEATS.question + 8],
    [0, 1],
    clamp,
  );
  const sparkle = 0.55 + 0.45 * Math.sin((local5 / fps) * Math.PI * 2);

  const expression = inInitialized ? (
    <>
      ( •̀ ω •́ )
      <span style={{ color: COLORS.accent, opacity: sparkle }}>✧</span>
    </>
  ) : (
    <>
      (・_・
      <span style={{ opacity: questionT, color: COLORS.accent }}>?</span>)
    </>
  );

  return (
    <SceneFrame duration={DURATIONS.mascot + DURATIONS.initialized}>
      <div style={{ transform: "translateY(-80px)" }}>
        <Mascot expression={expression} eyesX={look} dotScale={dotScale} />
      </div>
      <Sequence from={DURATIONS.mascot} layout="none">
        <div
          style={{
            position: "absolute",
            bottom: 560,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Line
            delay={BEATS.moduleLine}
            style={{ fontSize: 40, color: COLORS.muted }}
          >
            <span style={{ color: COLORS.fg }}>&gt;</span> curiosity module
            initialized.
          </Line>
        </div>
      </Sequence>
    </SceneFrame>
  );
};

const Ready: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 24,
        fontFamily: FONTS.mono,
      }}
    >
      <Line style={{ fontSize: 72, color: COLORS.fg }}>
        <span style={{ color: COLORS.muted }}>&gt;</span> JYPin.exe
      </Line>
      <Line delay={10} style={{ fontSize: 44, color: COLORS.muted }}>
        ready_
      </Line>
      <Line delay={22} style={{ marginTop: 40 }}>
        <Cursor size={64} />
      </Line>
    </div>
  );
};

// ---------------------------------------------------------------------------
// COMPOSITION
// ---------------------------------------------------------------------------
export const JYPinBoot: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        backgroundImage: `radial-gradient(ellipse at 50% 45%, ${COLORS.bg2} 0%, ${COLORS.bg} 65%)`,
      }}
    >
      <Sequence from={starts.execute} durationInFrames={DURATIONS.execute}>
        <SceneFrame duration={DURATIONS.execute}>
          <Execute />
        </SceneFrame>
      </Sequence>

      <Sequence from={starts.loading} durationInFrames={DURATIONS.loading}>
        <SceneFrame duration={DURATIONS.loading}>
          <Loading />
        </SceneFrame>
      </Sequence>

      <Sequence from={starts.scan} durationInFrames={DURATIONS.scan}>
        <SceneFrame duration={DURATIONS.scan}>
          <Scan />
        </SceneFrame>
      </Sequence>

      <Sequence
        from={starts.mascot}
        durationInFrames={DURATIONS.mascot + DURATIONS.initialized}
      >
        <MascotScenes />
      </Sequence>

      <Sequence from={starts.ready} durationInFrames={DURATIONS.ready}>
        <SceneFrame duration={DURATIONS.ready} fadeOut={false}>
          <Ready />
        </SceneFrame>
      </Sequence>
    </AbsoluteFill>
  );
};
