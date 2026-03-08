import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Easing,
} from "remotion";
import {
  Scan,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Brain,
  Smartphone,
  Tablet,
  Monitor,
  BookOpen,
  Github,
  Lock,
  ScanFace,
  Fingerprint,
  Eye,
} from "lucide-react";

/* ─── design tokens (matches #07080A dark theme) ─── */
const BG = "#07080A";
const EMERALD = "#10b981";
const EMERALD_LIGHT = "#34d399";
const TEAL = "#2dd4bf";
const WHITE = "#ffffff";
const W70 = "rgba(255,255,255,0.7)";
const W40 = "rgba(255,255,255,0.4)";
const W30 = "rgba(255,255,255,0.3)";
const W25 = "rgba(255,255,255,0.25)";
const W20 = "rgba(255,255,255,0.2)";
const W08 = "rgba(255,255,255,0.08)";
const W06 = "rgba(255,255,255,0.06)";
const W04 = "rgba(255,255,255,0.04)";
const W02 = "rgba(255,255,255,0.02)";
const FONT = "Inter, system-ui, -apple-system, sans-serif";
const MONO = "'SF Mono', 'Fira Code', Menlo, monospace";

/* ─── face-mesh landmarks (normalised 0–1) ─── */
const LANDMARKS: [number, number][] = [
  [0.50,0.08],[0.30,0.20],[0.70,0.20],[0.18,0.35],[0.82,0.35],
  [0.50,0.38],[0.35,0.45],[0.65,0.45],[0.28,0.55],[0.72,0.55],
  [0.50,0.58],[0.38,0.68],[0.62,0.68],[0.50,0.72],[0.35,0.80],
  [0.65,0.80],[0.50,0.88],[0.42,0.92],[0.58,0.92],[0.22,0.45],
  [0.78,0.45],[0.50,0.50],[0.44,0.55],[0.56,0.55],
];
const EDGES: [number, number][] = [];
for (let i = 0; i < LANDMARKS.length; i++) {
  for (let j = i + 1; j < LANDMARKS.length; j++) {
    const dx = LANDMARKS[j][0] - LANDMARKS[i][0];
    const dy = LANDMARKS[j][1] - LANDMARKS[i][1];
    if (Math.sqrt(dx * dx + dy * dy) < 0.28) EDGES.push([i, j]);
  }
}

/* ─── shared helpers ─── */
const ease = Easing.out(Easing.cubic);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const clampR = { extrapolateRight: "clamp" as const };

const AmbientGlow: React.FC<{ size?: number; color?: string; x?: string; y?: string }> = ({
  size = 700, color = EMERALD, x = "50%", y = "50%",
}) => (
  <div style={{
    position: "absolute", width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
    top: y, left: x, transform: "translate(-50%,-50%)", pointerEvents: "none",
  }} />
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 1 — HERO  (recreates the real landing page)
   120 frames = 4 seconds
   ═══════════════════════════════════════════════════════════════ */
const SceneHero: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [100, 120], [1, 0], clamp);

  /* nav bar */
  const navOpacity = interpolate(f, [0, 12], [0, 1], clampR);

  /* face circle + mesh */
  const circleScale = spring({ frame: f, fps, from: 0.6, to: 1, config: { damping: 16 } });
  const circleOpacity = interpolate(f, [0, 20], [0, 1], clampR);
  const CIRCLE = 320;

  const scanLineY = interpolate(f, [8, 80], [0, CIRCLE], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  /* text */
  const h1Opacity = interpolate(f, [25, 45], [0, 1], clampR);
  const h1Y = interpolate(f, [25, 50], [40, 0], { ...clampR, easing: ease });
  const subOpacity = interpolate(f, [40, 60], [0, 1], clampR);
  const subY = interpolate(f, [40, 65], [25, 0], { ...clampR, easing: ease });

  /* CTA buttons */
  const ctaOpacity = interpolate(f, [55, 72], [0, 1], clampR);

  /* device strip */
  const devOpacity = interpolate(f, [68, 82], [0, 1], clampR);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <AmbientGlow x="35%" y="30%" />
      <AmbientGlow size={500} color={TEAL} x="70%" y="70%" />

      {/* ── NAV BAR (faithful to real app) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", borderBottom: `1px solid ${W04}`,
        backdropFilter: "blur(12px)", opacity: navOpacity,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${EMERALD}, ${TEAL})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 20px ${EMERALD}30`,
          }}>
            <ScanFace size={18} color={BG} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: WHITE, fontFamily: FONT }}>FaceSmash</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: W40, fontSize: 14, fontFamily: FONT }}>
            <BookOpen size={14} /> Docs
          </div>
          <Github size={18} color={W40} />
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>Sign in</span>
          <div style={{
            height: 36, padding: "0 20px", borderRadius: 50, backgroundColor: WHITE,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: BG, fontFamily: FONT }}>Get started</span>
          </div>
        </div>
      </div>

      {/* ── HERO CONTENT ── */}
      <div style={{
        position: "absolute", top: 64, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* face circle with mesh */}
        <div style={{
          width: CIRCLE, height: CIRCLE, borderRadius: "50%",
          border: `1px solid ${W08}`, position: "relative", overflow: "hidden",
          background: `linear-gradient(180deg, ${W04} 0%, transparent 100%)`,
          transform: `scale(${circleScale})`, opacity: circleOpacity,
          marginBottom: 40,
        }}>
          {/* scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: scanLineY, height: 2,
            background: `linear-gradient(90deg, transparent, ${EMERALD_LIGHT}cc, transparent)`,
            boxShadow: `0 0 24px 6px ${EMERALD}50`,
          }} />
          {/* mesh */}
          <svg width={CIRCLE} height={CIRCLE} viewBox="0 0 1 1" style={{ position: "absolute", inset: 0 }}>
            {EDGES.map(([a, b], idx) => {
              const prog = interpolate(f, [5 + idx * 0.4, 25 + idx * 0.4], [0, 1], clamp);
              return (
                <line key={`e${idx}`}
                  x1={LANDMARKS[a][0]} y1={LANDMARKS[a][1]}
                  x2={LANDMARKS[a][0] + (LANDMARKS[b][0] - LANDMARKS[a][0]) * prog}
                  y2={LANDMARKS[a][1] + (LANDMARKS[b][1] - LANDMARKS[a][1]) * prog}
                  stroke={EMERALD} strokeWidth="0.004" strokeOpacity={0.35}
                />
              );
            })}
            {LANDMARKS.map(([cx, cy], idx) => {
              const dOp = interpolate(f, [6 + idx * 1.5, 16 + idx * 1.5], [0, 1], clamp);
              const pulse = Math.sin((f + idx * 5) * 0.1) * 0.25 + 0.75;
              return <circle key={`d${idx}`} cx={cx} cy={cy} r={0.012} fill={EMERALD_LIGHT} opacity={dOp * pulse} />;
            })}
          </svg>
          {/* corner brackets */}
          {[
            { t: -12, l: -12, bt: true, bl: true },
            { t: -12, r: -12, bt: true, br: true },
            { b: -12, l: -12, bb: true, bl: true },
            { b: -12, r: -12, bb: true, br: true },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute", width: 20, height: 20,
              ...(c.t !== undefined ? { top: c.t } : {}),
              ...(c.b !== undefined ? { bottom: c.b } : {}),
              ...(c.l !== undefined ? { left: c.l } : {}),
              ...(c.r !== undefined ? { right: c.r } : {}),
              borderTop: c.bt ? `2px solid ${EMERALD}66` : "none",
              borderBottom: c.bb ? `2px solid ${EMERALD}66` : "none",
              borderLeft: c.bl ? `2px solid ${EMERALD}66` : "none",
              borderRight: c.br ? `2px solid ${EMERALD}66` : "none",
            }} />
          ))}
        </div>

        {/* headline */}
        <div style={{
          opacity: h1Opacity, transform: `translateY(${h1Y}px)`,
          fontSize: 64, fontWeight: 700, color: WHITE, fontFamily: FONT,
          letterSpacing: -2, lineHeight: 1.05, textAlign: "center", maxWidth: 900,
        }}>
          Sign in to anything.{" "}
          <span style={{
            background: `linear-gradient(90deg, ${EMERALD_LIGHT}, ${TEAL}, ${EMERALD_LIGHT})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>With your face.</span>
        </div>

        {/* subtitle */}
        <div style={{
          opacity: subOpacity, transform: `translateY(${subY}px)`,
          fontSize: 22, color: W40, fontFamily: FONT, textAlign: "center",
          maxWidth: 620, lineHeight: 1.6, marginTop: 20,
        }}>
          One face, every device, every browser. FaceSmash replaces passwords with a glance.
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 16, marginTop: 40, opacity: ctaOpacity }}>
          <div style={{
            height: 48, padding: "0 32px", borderRadius: 50,
            backgroundColor: EMERALD, display: "flex", alignItems: "center", gap: 8,
            boxShadow: `0 8px 30px ${EMERALD}30`,
          }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: BG, fontFamily: FONT }}>Create your FaceSmash</span>
            <ArrowRight size={16} color={BG} />
          </div>
          <div style={{
            height: 48, padding: "0 24px", borderRadius: 50,
            display: "flex", alignItems: "center",
          }}>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>Try it now</span>
          </div>
        </div>

        {/* device strip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 24, marginTop: 48, opacity: devOpacity,
        }}>
          <Smartphone size={18} color={W20} />
          <Tablet size={18} color={W20} />
          <Monitor size={18} color={W20} />
          <Globe size={18} color={W20} />
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase" as const, color: W30, fontFamily: FONT }}>
            Works everywhere
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 2 — FACE SCAN (recreates the FaceScanCard + webcam UI)
   130 frames
   ═══════════════════════════════════════════════════════════════ */
const SceneFaceScan: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = interpolate(f, [0, 18], [0, 1], clampR);
  const exit = interpolate(f, [110, 130], [1, 0], clamp);
  const opacity = Math.min(enter, exit);

  const CARD_W = 520;
  const CARD_H = 580;
  const CIRCLE_R = 180;

  const scanLineY = interpolate(f, [10, 85], [0, CIRCLE_R * 2], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  /* status text transition */
  const isAnalyzing = f > 70;
  const statusOpacity = interpolate(f, [70, 78], [0, 1], clamp);

  /* corner bracket animation */
  const bracketColor = isAnalyzing ? EMERALD : `${WHITE}80`;

  /* progress bar (fake confidence buildup) */
  const progressW = interpolate(f, [20, 85], [0, 92], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}>
      <AmbientGlow />

      {/* section label */}
      <div style={{
        position: "absolute", top: 80, left: 0, right: 0, textAlign: "center",
        opacity: interpolate(f, [0, 18], [0, 1], clampR),
      }}>
        <div style={{ fontSize: 13, color: W20, fontFamily: FONT, letterSpacing: 5, textTransform: "uppercase" as const }}>
          Step 2 — Face Login
        </div>
      </div>

      {/* card — mirrors the rounded-2xl border style from FaceScanCard */}
      <div style={{
        width: CARD_W, height: CARD_H, borderRadius: 24,
        border: `1px solid ${W06}`, background: W02,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", position: "relative", overflow: "hidden",
      }}>
        {/* webcam placeholder — dark circle */}
        <div style={{
          width: CIRCLE_R * 2, height: CIRCLE_R * 2, borderRadius: "50%",
          border: `4px solid ${isAnalyzing ? EMERALD + "60" : W08}`,
          position: "relative", overflow: "hidden",
          background: "rgba(0,0,0,0.6)",
          transition: "border-color 0.3s",
          boxShadow: isAnalyzing ? `0 0 40px ${EMERALD}20` : "none",
        }}>
          {/* scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: scanLineY, height: 2,
            background: `linear-gradient(90deg, transparent, ${EMERALD_LIGHT}bb, transparent)`,
            boxShadow: `0 0 20px 4px ${EMERALD}40`,
          }} />

          {/* mesh dots appearing */}
          <svg width={CIRCLE_R * 2} height={CIRCLE_R * 2} viewBox="0 0 1 1" style={{ position: "absolute", inset: 0 }}>
            {EDGES.map(([a, b], idx) => {
              const prog = interpolate(f, [12 + idx * 0.6, 35 + idx * 0.6], [0, 1], clamp);
              return (
                <line key={`e${idx}`}
                  x1={LANDMARKS[a][0]} y1={LANDMARKS[a][1]}
                  x2={LANDMARKS[a][0] + (LANDMARKS[b][0] - LANDMARKS[a][0]) * prog}
                  y2={LANDMARKS[a][1] + (LANDMARKS[b][1] - LANDMARKS[a][1]) * prog}
                  stroke={EMERALD} strokeWidth="0.005" strokeOpacity={0.25}
                />
              );
            })}
            {LANDMARKS.map(([cx, cy], idx) => {
              const dOp = interpolate(f, [10 + idx * 2, 22 + idx * 2], [0, 1], clamp);
              return <circle key={`d${idx}`} cx={cx} cy={cy} r={0.014} fill={EMERALD_LIGHT} opacity={dOp * 0.8} />;
            })}
          </svg>

          {/* corner brackets inside circle */}
          {[
            { top: 10, left: 10, bT: true, bL: true },
            { top: 10, right: 10, bT: true, bR: true },
            { bottom: 10, left: 10, bB: true, bL: true },
            { bottom: 10, right: 10, bB: true, bR: true },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute", width: 28, height: 28,
              ...(c.top !== undefined ? { top: c.top } : {}),
              ...(c.bottom !== undefined ? { bottom: c.bottom } : {}),
              ...(c.left !== undefined ? { left: c.left } : {}),
              ...(c.right !== undefined ? { right: c.right } : {}),
              borderTop: c.bT ? `3px solid ${bracketColor}` : "none",
              borderBottom: c.bB ? `3px solid ${bracketColor}` : "none",
              borderLeft: c.bL ? `3px solid ${bracketColor}` : "none",
              borderRight: c.bR ? `3px solid ${bracketColor}` : "none",
              borderRadius: c.bT && c.bL ? "8px 0 0 0" : c.bT && c.bR ? "0 8px 0 0" : c.bB && c.bL ? "0 0 0 8px" : "0 0 8px 0",
            }} />
          ))}
        </div>

        {/* status badge at top */}
        <div style={{
          position: "absolute", top: 20,
          background: "rgba(0,0,0,0.8)", padding: "6px 16px", borderRadius: 50,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {isAnalyzing ? (
            <Eye size={14} color={EMERALD_LIGHT} />
          ) : (
            <Scan size={14} color={W40} />
          )}
          <span style={{ fontSize: 13, color: isAnalyzing ? EMERALD_LIGHT : W40, fontFamily: FONT }}>
            {isAnalyzing ? "Analyzing..." : "Looking for your face..."}
          </span>
        </div>

        {/* quality bar */}
        <div style={{ marginTop: 30, width: "70%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: W30, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" as const }}>
              Quality
            </span>
            <span style={{ fontSize: 12, color: EMERALD_LIGHT, fontFamily: MONO, fontWeight: 600 }}>
              {Math.round(progressW)}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: W06 }}>
            <div style={{
              height: 4, borderRadius: 2, width: `${progressW}%`,
              background: `linear-gradient(90deg, ${EMERALD}, ${TEAL})`,
              boxShadow: `0 0 12px ${EMERALD}40`,
            }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 3 — LOGIN SUCCESS (recreates LoginSuccess.tsx)
   100 frames
   ═══════════════════════════════════════════════════════════════ */
const SceneLoginSuccess: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = interpolate(f, [0, 15], [0, 1], clampR);
  const exit = interpolate(f, [80, 100], [1, 0], clamp);
  const opacity = Math.min(enter, exit);

  const checkScale = spring({ frame: Math.max(0, f - 8), fps, from: 0, to: 1, config: { stiffness: 200, damping: 12 } });
  const textOpacity = interpolate(f, [20, 35], [0, 1], clampR);
  const textY = interpolate(f, [20, 40], [15, 0], { ...clampR, easing: ease });
  const badgeOpacity = interpolate(f, [30, 42], [0, 1], clampR);
  const btnOpacity = interpolate(f, [42, 55], [0, 1], clampR);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}>
      <AmbientGlow color={EMERALD} size={600} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* success circle — exact match to LoginSuccess.tsx */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <div style={{
            position: "absolute", width: 96, height: 96, borderRadius: "50%",
            background: `${EMERALD}15`, filter: "blur(24px)",
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          }} />
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            backgroundColor: EMERALD, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${checkScale})`,
            boxShadow: `0 12px 40px ${EMERALD}40`,
          }}>
            <Check size={40} color={BG} strokeWidth={3} />
          </div>
        </div>

        {/* text */}
        <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -1, marginBottom: 8 }}>
            You're in
          </div>
          <div style={{ fontSize: 22, color: W40, fontFamily: FONT }}>
            Welcome back, <span style={{ color: W70 }}>alex</span>
          </div>
        </div>

        {/* "Face verified" badge — matches the real component */}
        <div style={{
          opacity: badgeOpacity, marginTop: 16,
          display: "flex", alignItems: "center", gap: 8,
          background: `${EMERALD}15`, border: `1px solid ${EMERALD}30`,
          borderRadius: 50, padding: "6px 16px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: EMERALD_LIGHT }} />
          <span style={{ fontSize: 13, color: EMERALD_LIGHT, fontFamily: FONT }}>Face verified</span>
        </div>

        {/* CTA button — matches the real emerald pill */}
        <div style={{
          opacity: btnOpacity, marginTop: 40,
          height: 48, padding: "0 40px", borderRadius: 50,
          backgroundColor: EMERALD, display: "flex", alignItems: "center", gap: 8,
          boxShadow: `0 8px 30px ${EMERALD}30`,
        }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: BG, fontFamily: FONT }}>Continue to dashboard</span>
          <ArrowRight size={16} color={BG} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 4 — DASHBOARD (recreates ProfileCard + SecurityCard + ActivityGraph)
   120 frames
   ═══════════════════════════════════════════════════════════════ */
const SceneDashboard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = interpolate(f, [0, 18], [0, 1], clampR);
  const exit = interpolate(f, [100, 120], [1, 0], clamp);
  const opacity = Math.min(enter, exit);

  const CardStyle: React.CSSProperties = {
    borderRadius: 16, border: `1px solid ${W06}`, background: W02, padding: 24,
  };
  const LabelStyle: React.CSSProperties = {
    fontSize: 10, color: W20, fontFamily: FONT, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20,
  };
  const RowStyle: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
  };
  const RowLabel: React.CSSProperties = { fontSize: 14, color: W30, fontFamily: FONT };
  const RowValue: React.CSSProperties = { fontSize: 14, color: W70, fontFamily: FONT, fontWeight: 500 };

  const card1 = spring({ frame: Math.max(0, f - 5), fps, from: 0, to: 1, config: { damping: 16 } });
  const card2 = spring({ frame: Math.max(0, f - 15), fps, from: 0, to: 1, config: { damping: 16 } });
  const card3 = spring({ frame: Math.max(0, f - 25), fps, from: 0, to: 1, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <AmbientGlow x="30%" y="40%" size={500} />

      {/* header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 64,
        display: "flex", alignItems: "center", padding: "0 60px",
        borderBottom: `1px solid ${W04}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `linear-gradient(135deg, ${EMERALD}, ${TEAL})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ScanFace size={15} color={BG} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: WHITE, fontFamily: FONT }}>FaceSmash</span>
          <span style={{ fontSize: 13, color: W30, fontFamily: FONT, marginLeft: 8 }}>/ Dashboard</span>
        </div>
      </div>

      {/* dashboard grid */}
      <div style={{
        position: "absolute", top: 100, left: 60, right: 60, bottom: 40,
        display: "flex", gap: 24,
      }}>
        {/* left column — Profile + Security */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* PROFILE CARD (faithful to ProfileCard.tsx) */}
          <div style={{ ...CardStyle, opacity: card1, transform: `translateY(${(1 - card1) * 20}px)` }}>
            <div style={LabelStyle}>Profile</div>
            {[
              { label: "Name", value: "alex" },
              { label: "Email", value: "alex@facesmash.app" },
              { label: "Face profile", value: "Registered", accent: true },
              { label: "Created", value: "Mar 7, 2026" },
            ].map((row, i) => (
              <div key={i} style={RowStyle}>
                <span style={RowLabel}>{row.label}</span>
                {row.accent ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: EMERALD_LIGHT, fontFamily: FONT }}>
                    <Check size={14} color={EMERALD_LIGHT} /> {row.value}
                  </span>
                ) : (
                  <span style={RowValue}>{row.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* SECURITY CARD (faithful to EnhancedSecurityCard.tsx) */}
          <div style={{ ...CardStyle, opacity: card2, transform: `translateY(${(1 - card2) * 20}px)` }}>
            <div style={LabelStyle}>Security</div>
            {[
              { label: "Security score", value: "94/100", color: EMERALD_LIGHT },
              { label: "Auth method", value: "Face Recognition" },
              { label: "Success rate", value: "99%" },
              { label: "Last login", value: "Just now" },
              { label: "Face templates", value: "3" },
              { label: "Avg. confidence", value: "97%" },
            ].map((row, i) => (
              <div key={i} style={RowStyle}>
                <span style={RowLabel}>{row.label}</span>
                <span style={{ ...RowValue, color: row.color || W70 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right column — Activity */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ ...CardStyle, flex: 1, opacity: card3, transform: `translateY(${(1 - card3) * 20}px)` }}>
            <div style={LabelStyle}>Activity</div>

            {/* stat strip (matches ActivityGraph) */}
            <div style={{ display: "flex", gap: 40, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${W04}` }}>
              {[
                { val: "47", label: "Total logins" },
                { val: "12", label: "Streak" },
                { val: "8/wk", label: "Frequency" },
                { val: "2m ago", label: "Last login" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: WHITE, fontFamily: FONT }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: W25, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* recent sessions (matches ActivityGraph timeline) */}
            {[
              { time: "10:43 PM", date: "Mar 7", ago: "2m ago", latest: true },
              { time: "2:15 PM", date: "Mar 7", ago: "8h ago", latest: false },
              { time: "9:01 AM", date: "Mar 7", ago: "13h ago", latest: false },
              { time: "11:30 PM", date: "Mar 6", ago: "23h ago", latest: false },
              { time: "3:45 PM", date: "Mar 6", ago: "31h ago", latest: false },
            ].map((s, i) => {
              const rowDelay = 30 + i * 8;
              const rowOpacity = interpolate(f, [rowDelay, rowDelay + 12], [0, 1], clampR);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "12px 0",
                  borderBottom: i < 4 ? `1px solid ${W04}` : "none",
                  opacity: rowOpacity,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: s.latest ? EMERALD_LIGHT : "rgba(255,255,255,0.15)",
                  }} />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: FONT }}>Signed in</div>
                      <div style={{ fontSize: 12, color: W20, fontFamily: FONT }}>{s.date} · {s.time}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: W25, fontFamily: FONT }}>{s.ago}</span>
                      {s.latest && (
                        <span style={{
                          fontSize: 9, letterSpacing: 2, textTransform: "uppercase" as const,
                          color: `${EMERALD_LIGHT}aa`, background: `${EMERALD}15`,
                          padding: "3px 8px", borderRadius: 50, border: `1px solid ${EMERALD}30`,
                          fontFamily: FONT,
                        }}>Latest</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 5 — FEATURES (Lucide icons, no emoji)
   110 frames
   ═══════════════════════════════════════════════════════════════ */
const SceneFeatures: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = interpolate(f, [0, 18], [0, 1], clampR);
  const exit = interpolate(f, [90, 110], [1, 0], clamp);
  const opacity = Math.min(enter, exit);

  const features: { icon: React.ReactNode; label: string; desc: string }[] = [
    { icon: <Lock size={32} color={EMERALD_LIGHT} />, label: "Privacy-first", desc: "All ML runs client-side. Raw images never leave." },
    { icon: <Zap size={32} color={EMERALD_LIGHT} />, label: "< 2 seconds", desc: "Face detection to authenticated in a blink." },
    { icon: <Globe size={32} color={EMERALD_LIGHT} />, label: "Cross-platform", desc: "Chrome, Safari, Firefox, Edge — any OS." },
    { icon: <Brain size={32} color={EMERALD_LIGHT} />, label: "Adaptive AI", desc: "Multi-template learning improves each login." },
  ];

  const headOpacity = interpolate(f, [0, 18], [0, 1], clampR);
  const headY = interpolate(f, [0, 22], [30, 0], { ...clampR, easing: ease });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}>
      <AmbientGlow />

      <div style={{
        position: "absolute", top: 140, textAlign: "center",
        opacity: headOpacity, transform: `translateY(${headY}px)`,
      }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -1 }}>
          Why FaceSmash?
        </div>
      </div>

      <div style={{ display: "flex", gap: 28, marginTop: 80 }}>
        {features.map((feat, i) => {
          const delay = 12 + i * 10;
          const s = spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1, config: { damping: 15 } });
          const o = interpolate(f, [delay, delay + 12], [0, 1], clampR);
          return (
            <div key={i} style={{
              width: 360, padding: "44px 32px", borderRadius: 20,
              border: `1px solid ${W06}`, background: `linear-gradient(180deg, ${W04} 0%, transparent 100%)`,
              textAlign: "center", transform: `scale(${s})`, opacity: o,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px",
                background: `${EMERALD}15`, border: `1px solid ${EMERALD}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {feat.icon}
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: WHITE, fontFamily: FONT, marginBottom: 8 }}>
                {feat.label}
              </div>
              <div style={{ fontSize: 16, color: W40, fontFamily: FONT, lineHeight: 1.5 }}>
                {feat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 6 — CTA (closing screen)
   90 frames
   ═══════════════════════════════════════════════════════════════ */
const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame: f, fps, from: 0.85, to: 1, config: { damping: 14 } });
  const titleOpacity = interpolate(f, [0, 15], [0, 1], clampR);
  const urlOpacity = interpolate(f, [18, 35], [0, 1], clampR);
  const urlY = interpolate(f, [18, 38], [20, 0], { ...clampR, easing: ease });
  const npmOpacity = interpolate(f, [30, 45], [0, 1], clampR);
  const linksOpacity = interpolate(f, [42, 55], [0, 1], clampR);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      <AmbientGlow size={900} />

      {/* headline */}
      <div style={{
        textAlign: "center", transform: `scale(${titleScale})`, opacity: titleOpacity,
      }}>
        <div style={{
          fontSize: 76, fontWeight: 700, color: WHITE, fontFamily: FONT,
          letterSpacing: -3, lineHeight: 1.1,
        }}>
          Stop typing passwords.
        </div>
      </div>

      {/* URL */}
      <div style={{
        position: "absolute", top: "60%", opacity: urlOpacity, transform: `translateY(${urlY}px)`,
      }}>
        <div style={{
          fontSize: 36, fontWeight: 600, fontFamily: FONT,
          background: `linear-gradient(90deg, ${EMERALD_LIGHT}, ${TEAL})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          facesmash.app
        </div>
      </div>

      {/* npm install badge */}
      <div style={{
        position: "absolute", top: "70%", opacity: npmOpacity,
        display: "flex", alignItems: "center", gap: 12,
        background: W04, border: `1px solid ${W08}`, borderRadius: 12, padding: "12px 28px",
      }}>
        <Fingerprint size={18} color={EMERALD_LIGHT} />
        <span style={{ fontSize: 18, color: W40, fontFamily: MONO }}>
          npm install @facesmash/sdk
        </span>
      </div>

      {/* links row */}
      <div style={{
        position: "absolute", top: "82%", opacity: linksOpacity,
        display: "flex", alignItems: "center", gap: 32,
      }}>
        {[
          { icon: <BookOpen size={16} color={W30} />, text: "docs.facesmash.app" },
          { icon: <Github size={16} color={W30} />, text: "github.com/ever-just/facesmash.app" },
        ].map((link, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {link.icon}
            <span style={{ fontSize: 14, color: W30, fontFamily: FONT }}>{link.text}</span>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{
        position: "absolute", bottom: 30, fontSize: 12, color: W20, fontFamily: FONT,
        opacity: linksOpacity,
      }}>
        Built by EVERJUST COMPANY · 2026
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPOSITION — 6 scenes, 570 frames @ 30fps = 19s
   ═══════════════════════════════════════════════════════════════ */
export const FaceSmashPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={0} durationInFrames={120}>
        <SceneHero />
      </Sequence>
      <Sequence from={120} durationInFrames={130}>
        <SceneFaceScan />
      </Sequence>
      <Sequence from={250} durationInFrames={100}>
        <SceneLoginSuccess />
      </Sequence>
      <Sequence from={350} durationInFrames={120}>
        <SceneDashboard />
      </Sequence>
      <Sequence from={470} durationInFrames={110}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={580} durationInFrames={90}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
