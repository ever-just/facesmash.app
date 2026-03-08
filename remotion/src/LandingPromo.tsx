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
  Zap,
  Globe,
  Brain,
  Lock,
  ScanFace,
  Fingerprint,
  Eye,
  X,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  KeyRound,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";

/* ─── design tokens ─── */
const BG = "#07080A";
const EMERALD = "#10b981";
const EL = "#34d399"; // emerald-light
const TEAL = "#2dd4bf";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const WHITE = "#ffffff";
const W80 = "rgba(255,255,255,0.8)";
const W70 = "rgba(255,255,255,0.7)";
const W60 = "rgba(255,255,255,0.6)";
const W50 = "rgba(255,255,255,0.5)";
const W40 = "rgba(255,255,255,0.4)";
const W30 = "rgba(255,255,255,0.3)";
const W25 = "rgba(255,255,255,0.25)";
const W20 = "rgba(255,255,255,0.2)";
const W15 = "rgba(255,255,255,0.15)";
const W10 = "rgba(255,255,255,0.1)";
const W08 = "rgba(255,255,255,0.08)";
const W06 = "rgba(255,255,255,0.06)";
const W04 = "rgba(255,255,255,0.04)";
const W02 = "rgba(255,255,255,0.02)";
const FONT = "Inter, system-ui, -apple-system, sans-serif";
const MONO = "'SF Mono', 'Fira Code', Menlo, monospace";

/* ─── face-mesh landmarks ─── */
const LM: [number, number][] = [
  [0.50,0.08],[0.30,0.20],[0.70,0.20],[0.18,0.35],[0.82,0.35],
  [0.50,0.38],[0.35,0.45],[0.65,0.45],[0.28,0.55],[0.72,0.55],
  [0.50,0.58],[0.38,0.68],[0.62,0.68],[0.50,0.72],[0.35,0.80],
  [0.65,0.80],[0.50,0.88],[0.42,0.92],[0.58,0.92],[0.22,0.45],
  [0.78,0.45],[0.50,0.50],[0.44,0.55],[0.56,0.55],
];
const EDGES: [number, number][] = [];
for (let i = 0; i < LM.length; i++) {
  for (let j = i + 1; j < LM.length; j++) {
    const dx = LM[j][0] - LM[i][0], dy = LM[j][1] - LM[i][1];
    if (Math.sqrt(dx * dx + dy * dy) < 0.28) EDGES.push([i, j]);
  }
}

/* ─── helpers ─── */
const ease = Easing.out(Easing.cubic);
const CL = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const CR = { extrapolateRight: "clamp" as const };

const Glow: React.FC<{ size?: number; color?: string; x?: string; y?: string }> = ({
  size = 700, color = EMERALD, x = "50%", y = "50%",
}) => (
  <div style={{
    position: "absolute", width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
    top: y, left: x, transform: "translate(-50%,-50%)", pointerEvents: "none",
  }} />
);

/* ═══════════════════════════════════════════════════
   SCENE 1 — THE PROBLEM (passwords are broken)
   150 frames = 5 seconds
   ═══════════════════════════════════════════════════ */
const SceneProblem: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [130, 150], [1, 0], CL);

  const labelOp = interpolate(f, [0, 15], [0, 1], CR);
  const headOp = interpolate(f, [8, 28], [0, 1], CR);
  const headY = interpolate(f, [8, 32], [40, 0], { ...CR, easing: ease });

  const stats = [
    { icon: <ShieldAlert size={24} color={RED} />, val: "80%", desc: "of breaches involve stolen credentials", src: "Verizon DBIR 2025" },
    { icon: <DollarSign size={24} color={AMBER} />, val: "$4.88M", desc: "average cost of a data breach", src: "IBM 2024" },
    { icon: <AlertTriangle size={24} color={RED} />, val: "193B", desc: "credential-stuffing attacks per year", src: "Akamai 2024" },
    { icon: <KeyRound size={24} color={AMBER} />, val: "80%+", desc: "of users reuse passwords across sites", src: "DeepStrike 2026" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow color={RED} x="60%" y="40%" size={600} />

      {/* label */}
      <div style={{
        position: "absolute", top: 100, left: 120, opacity: labelOp,
        fontSize: 12, color: `${RED}99`, fontFamily: FONT, letterSpacing: 5, textTransform: "uppercase",
      }}>
        The problem
      </div>

      {/* headline */}
      <div style={{
        position: "absolute", top: 140, left: 120, maxWidth: 800,
        opacity: headOp, transform: `translateY(${headY}px)`,
      }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -2, lineHeight: 1.15 }}>
          Passwords are broken.
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: W30, fontFamily: FONT, letterSpacing: -2, lineHeight: 1.15, marginTop: 4 }}>
          The data proves it.
        </div>
      </div>

      {/* stat cards — 2x2 grid */}
      <div style={{
        position: "absolute", top: 340, left: 120, right: 120,
        display: "flex", flexWrap: "wrap", gap: 24,
      }}>
        {stats.map((s, i) => {
          const delay = 25 + i * 12;
          const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1, config: { damping: 16 } });
          const op = interpolate(f, [delay, delay + 14], [0, 1], CR);
          return (
            <div key={i} style={{
              width: "calc(50% - 12px)", padding: "28px 28px", borderRadius: 16,
              border: `1px solid ${W06}`, background: W02,
              transform: `scale(${sc})`, opacity: op,
              display: "flex", alignItems: "flex-start", gap: 20,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: i % 2 === 0 ? `${RED}15` : `${AMBER}15`,
                border: `1px solid ${i % 2 === 0 ? RED : AMBER}25`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -1 }}>{s.val}</div>
                <div style={{ fontSize: 15, color: W40, fontFamily: FONT, lineHeight: 1.4, marginTop: 4 }}>{s.desc}</div>
                <div style={{ fontSize: 11, color: W20, fontFamily: FONT, marginTop: 6 }}>{s.src}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* red X marks on password field mockup */}
      <div style={{
        position: "absolute", bottom: 80, left: 120, right: 120,
        display: "flex", justifyContent: "center",
        opacity: interpolate(f, [80, 95], [0, 1], CR),
      }}>
        <div style={{
          padding: "14px 24px", borderRadius: 12, border: `1px solid ${RED}30`,
          background: `${RED}08`, display: "flex", alignItems: "center", gap: 10,
        }}>
          <X size={16} color={RED} />
          <span style={{ fontSize: 15, color: `${RED}cc`, fontFamily: FONT }}>
            $65,000/year spent on password resets alone (250-person company)
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 2 — THE SOLUTION (introducing FaceSmash)
   130 frames
   ═══════════════════════════════════════════════════ */
const SceneSolution: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [110, 130], [1, 0], CL);
  const labelOp = interpolate(f, [0, 15], [0, 1], CR);
  const headOp = interpolate(f, [8, 28], [0, 1], CR);
  const headY = interpolate(f, [8, 32], [40, 0], { ...CR, easing: ease });
  const subOp = interpolate(f, [25, 42], [0, 1], CR);
  const subY = interpolate(f, [25, 48], [20, 0], { ...CR, easing: ease });

  /* logo pulse */
  const logoScale = spring({ frame: Math.max(0, f - 5), fps, from: 0.5, to: 1, config: { damping: 14 } });
  const logoGlow = interpolate(f, [10, 40], [20, 60], CR);

  /* pill badges */
  const pills = [
    "Any browser", "Any device", "Any OS", "Zero passwords", "< 2 seconds", "99.97% accurate",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow x="50%" y="45%" />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100%", textAlign: "center", padding: "0 120px",
      }}>
        {/* label */}
        <div style={{
          opacity: labelOp,
          fontSize: 12, color: `${EMERALD}99`, fontFamily: FONT, letterSpacing: 5,
          textTransform: "uppercase", marginBottom: 24,
        }}>
          The solution
        </div>

        {/* logo */}
        <div style={{
          width: 100, height: 100, borderRadius: 24,
          background: `linear-gradient(135deg, ${EMERALD}, ${TEAL})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 ${logoGlow}px ${EMERALD}40`,
          marginBottom: 32,
        }}>
          <ScanFace size={50} color={BG} strokeWidth={2} />
        </div>

        {/* headline */}
        <div style={{
          opacity: headOp, transform: `translateY(${headY}px)`,
          fontSize: 64, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -2, lineHeight: 1.1,
        }}>
          Meet{" "}
          <span style={{
            background: `linear-gradient(90deg, ${EL}, ${TEAL})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>FaceSmash</span>
        </div>

        {/* subtitle */}
        <div style={{
          opacity: subOp, transform: `translateY(${subY}px)`,
          fontSize: 24, color: W40, fontFamily: FONT, lineHeight: 1.6, maxWidth: 700, marginTop: 20,
        }}>
          Browser-native facial recognition that replaces passwords with a glance.
          One face. Every device. Every browser.
        </div>

        {/* pill badges */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 12, marginTop: 48, justifyContent: "center",
        }}>
          {pills.map((pill, i) => {
            const delay = 40 + i * 8;
            const op = interpolate(f, [delay, delay + 12], [0, 1], CR);
            const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0.8, to: 1, config: { damping: 14 } });
            return (
              <div key={i} style={{
                padding: "8px 20px", borderRadius: 50, opacity: op, transform: `scale(${sc})`,
                background: `${EMERALD}12`, border: `1px solid ${EMERALD}25`,
                fontSize: 14, color: EL, fontFamily: FONT,
              }}>
                {pill}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 3 — HOW IT WORKS (3-step flow)
   150 frames
   ═══════════════════════════════════════════════════ */
const SceneHowItWorks: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [130, 150], [1, 0], CL);
  const labelOp = interpolate(f, [0, 15], [0, 1], CR);
  const headOp = interpolate(f, [6, 26], [0, 1], CR);
  const headY = interpolate(f, [6, 30], [30, 0], { ...CR, easing: ease });

  const steps = [
    {
      n: "01", title: "Visit any site",
      desc: "Navigate to a site using FaceSmash. Click 'Sign in' — works in Chrome, Safari, Firefox, Edge.",
      icon: <Globe size={28} color={EL} />,
    },
    {
      n: "02", title: "Glance at camera",
      desc: "Your browser camera activates. AI maps 128 vectors in real-time. No photos stored — just encrypted math.",
      icon: <ScanFace size={28} color={EL} />,
    },
    {
      n: "03", title: "You're in",
      desc: "Match confirmed in under 2 seconds. Same face, same account, anywhere.",
      icon: <Check size={28} color={EL} />,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow x="50%" y="50%" />

      <div style={{ padding: "0 120px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* label */}
        <div style={{
          opacity: labelOp, fontSize: 12, color: `${EMERALD}99`, fontFamily: FONT,
          letterSpacing: 5, textTransform: "uppercase", marginBottom: 16,
        }}>How it works</div>

        {/* headline */}
        <div style={{
          opacity: headOp, transform: `translateY(${headY}px)`,
          fontSize: 52, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -2, lineHeight: 1.15,
          marginBottom: 60,
        }}>
          Three seconds.{" "}
          <span style={{ color: W30 }}>That's it.</span>
        </div>

        {/* steps row */}
        <div style={{ display: "flex", gap: 32 }}>
          {steps.map((step, i) => {
            const delay = 20 + i * 25;
            const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1, config: { damping: 15 } });
            const op = interpolate(f, [delay, delay + 16], [0, 1], CR);

            /* connecting line */
            const lineProgress = i < 2 ? interpolate(f, [delay + 20, delay + 40], [0, 1], CL) : 0;

            return (
              <div key={i} style={{ flex: 1, position: "relative", opacity: op, transform: `scale(${sc})` }}>
                {/* step number circle */}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  border: `1px solid ${W08}`, background: W02,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 24,
                }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: `${EMERALD}aa`, fontFamily: FONT }}>{step.n}</span>
                </div>

                {/* connecting line to next step */}
                {i < 2 && (
                  <div style={{
                    position: "absolute", top: 32, left: 80, right: -16,
                    height: 1, background: W06, overflow: "hidden",
                  }}>
                    <div style={{
                      height: 1, width: `${lineProgress * 100}%`,
                      background: `linear-gradient(90deg, ${EMERALD}60, ${EMERALD}20)`,
                    }} />
                  </div>
                )}

                {/* icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                  background: `${EMERALD}12`, border: `1px solid ${EMERALD}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step.icon}
                </div>

                <div style={{ fontSize: 22, fontWeight: 600, color: WHITE, fontFamily: FONT, marginBottom: 10 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 15, color: W40, fontFamily: FONT, lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 4 — FACE SCAN (live scan simulation)
   140 frames
   ═══════════════════════════════════════════════════ */
const SceneLiveScan: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = interpolate(f, [0, 16], [0, 1], CR);
  const exit = interpolate(f, [120, 140], [1, 0], CL);
  const opacity = Math.min(enter, exit);

  const CIRCLE = 340;
  const scanY = interpolate(f, [8, 90], [0, CIRCLE], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const isMatched = f > 95;
  const matchScale = isMatched ? spring({ frame: f - 95, fps, from: 0, to: 1, config: { damping: 12 } }) : 0;

  /* confidence counter */
  const confidence = interpolate(f, [20, 90], [0, 99.97], CL);

  /* vector readout */
  const vectorOp = interpolate(f, [30, 45], [0, 1], CR);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, display: "flex" }}>
      <Glow />

      {/* Left side — scan circle */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: CIRCLE, height: CIRCLE, borderRadius: "50%",
          border: `3px solid ${isMatched ? `${EMERALD}80` : W08}`,
          position: "relative", overflow: "hidden",
          background: "rgba(0,0,0,0.5)",
          boxShadow: isMatched ? `0 0 60px ${EMERALD}25` : "none",
        }}>
          {/* scan line */}
          {!isMatched && (
            <div style={{
              position: "absolute", left: 0, right: 0, top: scanY, height: 2,
              background: `linear-gradient(90deg, transparent, ${EL}cc, transparent)`,
              boxShadow: `0 0 20px 5px ${EMERALD}40`,
            }} />
          )}

          {/* mesh */}
          <svg width={CIRCLE} height={CIRCLE} viewBox="0 0 1 1" style={{ position: "absolute", inset: 0 }}>
            {EDGES.map(([a, b], idx) => {
              const prog = interpolate(f, [6 + idx * 0.5, 28 + idx * 0.5], [0, 1], CL);
              return (
                <line key={`e${idx}`}
                  x1={LM[a][0]} y1={LM[a][1]}
                  x2={LM[a][0] + (LM[b][0] - LM[a][0]) * prog}
                  y2={LM[a][1] + (LM[b][1] - LM[a][1]) * prog}
                  stroke={isMatched ? EL : EMERALD} strokeWidth="0.005"
                  strokeOpacity={isMatched ? 0.5 : 0.25}
                />
              );
            })}
            {LM.map(([cx, cy], idx) => {
              const dOp = interpolate(f, [8 + idx * 1.5, 18 + idx * 1.5], [0, 1], CL);
              const pulse = isMatched ? 1 : Math.sin((f + idx * 5) * 0.1) * 0.25 + 0.75;
              return (
                <circle key={`d${idx}`} cx={cx} cy={cy}
                  r={isMatched ? 0.016 : 0.012}
                  fill={isMatched ? EL : EMERALD}
                  opacity={dOp * pulse}
                />
              );
            })}
          </svg>

          {/* corner brackets */}
          {[
            { top: 16, left: 16, bT: true, bL: true },
            { top: 16, right: 16, bT: true, bR: true },
            { bottom: 16, left: 16, bB: true, bL: true },
            { bottom: 16, right: 16, bB: true, bR: true },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute", width: 32, height: 32,
              ...(c.top !== undefined ? { top: c.top } : {}),
              ...(c.bottom !== undefined ? { bottom: c.bottom } : {}),
              ...(c.left !== undefined ? { left: c.left } : {}),
              ...(c.right !== undefined ? { right: c.right } : {}),
              borderTop: c.bT ? `3px solid ${isMatched ? EL : W15}` : "none",
              borderBottom: c.bB ? `3px solid ${isMatched ? EL : W15}` : "none",
              borderLeft: c.bL ? `3px solid ${isMatched ? EL : W15}` : "none",
              borderRight: c.bR ? `3px solid ${isMatched ? EL : W15}` : "none",
            }} />
          ))}

          {/* success overlay */}
          {isMatched && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: `${EMERALD}10`,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: EMERALD, display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${matchScale})`,
                boxShadow: `0 0 40px ${EMERALD}50`,
              }}>
                <Check size={36} color={BG} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* status text under circle */}
        <div style={{
          marginTop: 24, display: "flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 50,
          background: isMatched ? `${EMERALD}15` : "rgba(0,0,0,0.5)",
          border: `1px solid ${isMatched ? `${EMERALD}30` : W08}`,
        }}>
          {isMatched ? (
            <>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: EL }} />
              <span style={{ fontSize: 14, color: EL, fontFamily: FONT }}>Face verified — 99.97%</span>
            </>
          ) : (
            <>
              <Eye size={14} color={W40} />
              <span style={{ fontSize: 14, color: W40, fontFamily: FONT }}>Scanning face...</span>
            </>
          )}
        </div>
      </div>

      {/* Right side — real-time readout */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 80px 0 40px",
      }}>
        {/* confidence meter */}
        <div style={{ marginBottom: 40, opacity: vectorOp }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: W30, fontFamily: FONT, letterSpacing: 3, textTransform: "uppercase" }}>
              Confidence
            </span>
            <span style={{ fontSize: 16, color: isMatched ? EL : WHITE, fontFamily: MONO, fontWeight: 700 }}>
              {confidence.toFixed(2)}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: W06 }}>
            <div style={{
              height: 6, borderRadius: 3, width: `${Math.min(confidence, 100)}%`,
              background: `linear-gradient(90deg, ${EMERALD}, ${TEAL})`,
              boxShadow: isMatched ? `0 0 16px ${EMERALD}50` : "none",
            }} />
          </div>
        </div>

        {/* 128D vector readout */}
        <div style={{
          opacity: vectorOp, padding: 20, borderRadius: 12,
          border: `1px solid ${W06}`, background: W02, marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, color: W20, fontFamily: FONT, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
            128-Dimensional Face Vector
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: `${EMERALD}99`, lineHeight: 1.8, wordBreak: "break-all" }}>
            [0.042, -0.138, 0.251, 0.087, -0.193, 0.412, -0.067, 0.324, 0.158, -0.276, 0.091, 0.445, -0.128, 0.367, 0.203, -0.054, 0.289, -0.176, 0.432, 0.115, -0.298, 0.064, 0.381, -0.147 ...]
          </div>
        </div>

        {/* metrics row */}
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { val: "128D", label: "Vector dims" },
            { val: "<2s", label: "Auth time" },
            { val: "AES-256", label: "Encryption" },
          ].map((m, i) => {
            const mOp = interpolate(f, [50 + i * 10, 62 + i * 10], [0, 1], CR);
            return (
              <div key={i} style={{ opacity: mOp }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: WHITE, fontFamily: FONT }}>{m.val}</div>
                <div style={{ fontSize: 11, color: W25, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 5 — SDK CODE SNIPPET
   120 frames
   ═══════════════════════════════════════════════════ */
const SceneSDK: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [100, 120], [1, 0], CL);
  const headOp = interpolate(f, [0, 18], [0, 1], CR);
  const headY = interpolate(f, [0, 22], [30, 0], { ...CR, easing: ease });

  const codeLines = [
    { text: "import { FaceSmashProvider, FaceLogin }", color: `${EMERALD}cc` },
    { text: "  from '@facesmash/sdk/react';", color: `${EMERALD}cc` },
    { text: "", color: W40 },
    { text: "<FaceSmashProvider", color: W70 },
    { text: "  config={{ apiUrl: 'https://api.facesmash.app' }}", color: W50 },
    { text: ">", color: W70 },
    { text: "  <FaceLogin", color: EL },
    { text: "    onResult={(r) =>", color: W50 },
    { text: "      r.success && redirect('/dashboard')", color: W50 },
    { text: "    }", color: W50 },
    { text: "  />", color: EL },
    { text: "</FaceSmashProvider>", color: W70 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow x="60%" y="50%" />

      <div style={{
        display: "flex", height: "100%", alignItems: "center", padding: "0 120px", gap: 80,
      }}>
        {/* Left — text */}
        <div style={{ flex: 1 }}>
          <div style={{
            opacity: headOp, transform: `translateY(${headY}px)`,
          }}>
            <div style={{ fontSize: 12, color: `${EMERALD}99`, fontFamily: FONT, letterSpacing: 5, textTransform: "uppercase", marginBottom: 16 }}>
              Developer experience
            </div>
            <div style={{ fontSize: 48, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -2, lineHeight: 1.15, marginBottom: 20 }}>
              Ship face login{"\n"}in 3 lines of code.
            </div>
            <div style={{ fontSize: 18, color: W40, fontFamily: FONT, lineHeight: 1.6 }}>
              Drop-in React components. Vanilla JS client. Works with any framework.
              Published on npm as <span style={{ color: EL, fontFamily: MONO }}>@facesmash/sdk</span>.
            </div>
          </div>

          {/* npm badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginTop: 32,
            padding: "10px 20px", borderRadius: 10,
            background: W04, border: `1px solid ${W08}`,
            opacity: interpolate(f, [35, 48], [0, 1], CR),
          }}>
            <Fingerprint size={16} color={EL} />
            <span style={{ fontSize: 15, color: W40, fontFamily: MONO }}>npm install @facesmash/sdk</span>
          </div>
        </div>

        {/* Right — code block */}
        <div style={{
          flex: 1, borderRadius: 16, border: `1px solid ${W08}`,
          background: "rgba(0,0,0,0.6)", padding: "24px 28px",
          fontFamily: MONO, fontSize: 15, lineHeight: 2,
        }}>
          {/* editor top bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#ff5f56" }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#ffbd2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#27c93f" }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: W20 }}>App.tsx</span>
          </div>

          {codeLines.map((line, i) => {
            const lineDelay = 15 + i * 4;
            const lineOp = interpolate(f, [lineDelay, lineDelay + 8], [0, 1], CR);
            return (
              <div key={i} style={{ opacity: lineOp, color: line.color, whiteSpace: "pre" }}>
                {line.text || "\u00A0"}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 6 — FEATURES GRID
   120 frames
   ═══════════════════════════════════════════════════ */
const SceneFeatures: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [100, 120], [1, 0], CL);

  const features: { icon: React.ReactNode; label: string; desc: string }[] = [
    { icon: <Lock size={28} color={EL} />, label: "Privacy-first", desc: "All ML runs client-side. Raw images never leave your device." },
    { icon: <Zap size={28} color={EL} />, label: "< 2 seconds", desc: "Face detection to authenticated — faster than typing your email." },
    { icon: <Globe size={28} color={EL} />, label: "Cross-platform", desc: "Chrome, Safari, Firefox, Edge. iOS, Android, Windows, Mac, Linux." },
    { icon: <Brain size={28} color={EL} />, label: "Adaptive AI", desc: "Multi-template learning — accuracy improves with every login." },
    { icon: <Fingerprint size={28} color={EL} />, label: "128D vectors", desc: "Your face becomes an encrypted mathematical signature, not a photo." },
    { icon: <ScanFace size={28} color={EL} />, label: "No hardware", desc: "Works with any standard webcam. No IR, no TrueDepth required." },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow />

      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "0 120px",
      }}>
        <div style={{
          fontSize: 48, fontWeight: 700, color: WHITE, fontFamily: FONT,
          letterSpacing: -1, marginBottom: 56, textAlign: "center",
          opacity: interpolate(f, [0, 18], [0, 1], CR),
          transform: `translateY(${interpolate(f, [0, 22], [25, 0], { ...CR, easing: ease })}px)`,
        }}>
          Built for developers.{" "}
          <span style={{ color: W30 }}>Loved by users.</span>
        </div>

        {/* 3x2 grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {features.map((feat, i) => {
            const delay = 12 + i * 8;
            const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1, config: { damping: 15 } });
            const op = interpolate(f, [delay, delay + 12], [0, 1], CR);
            return (
              <div key={i} style={{
                width: "calc(33.33% - 16px)", padding: "32px 28px", borderRadius: 16,
                border: `1px solid ${W06}`, background: `linear-gradient(180deg, ${W04} 0%, transparent 100%)`,
                transform: `scale(${sc})`, opacity: op,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                  background: `${EMERALD}12`, border: `1px solid ${EMERALD}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {feat.icon}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: WHITE, fontFamily: FONT, marginBottom: 6 }}>
                  {feat.label}
                </div>
                <div style={{ fontSize: 14, color: W40, fontFamily: FONT, lineHeight: 1.5 }}>
                  {feat.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 7 — CROSS-PLATFORM (device mockups)
   120 frames
   ═══════════════════════════════════════════════════ */
const SceneCrossPlatform: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(f, [100, 120], [1, 0], CL);

  const headOp = interpolate(f, [0, 18], [0, 1], CR);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow x="50%" y="55%" />

      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          opacity: headOp, textAlign: "center", marginBottom: 60,
        }}>
          <div style={{ fontSize: 12, color: `${EMERALD}99`, fontFamily: FONT, letterSpacing: 5, textTransform: "uppercase", marginBottom: 16 }}>
            Universal compatibility
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -1 }}>
            Same face. Any device.
          </div>
        </div>

        {/* Device mockups */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
          {/* Phone */}
          {(() => {
            const delay = 10;
            const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0.8, to: 1, config: { damping: 14 } });
            const op = interpolate(f, [delay, delay + 15], [0, 1], CR);
            return (
              <div style={{ opacity: op, transform: `scale(${sc})` }}>
                <div style={{
                  width: 160, height: 280, borderRadius: 20,
                  border: `1px solid ${W08}`, background: `linear-gradient(180deg, ${W04} 0%, ${BG} 100%)`,
                  padding: 12, display: "flex", flexDirection: "column",
                }}>
                  <div style={{ width: 48, height: 4, borderRadius: 2, background: W10, margin: "0 auto 12px" }} />
                  <div style={{
                    flex: 1, borderRadius: 12, border: `1px solid ${W06}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      border: `2px solid ${EMERALD}50`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Scan size={20} color={`${EMERALD}80`} />
                    </div>
                    <span style={{ fontSize: 9, color: `${EMERALD}80`, fontFamily: FONT, marginTop: 8 }}>Scanning...</span>
                  </div>
                  <div style={{ fontSize: 9, color: W30, textAlign: "center", marginTop: 8, fontFamily: FONT }}>
                    iPhone · Safari
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Laptop — center, larger */}
          {(() => {
            const delay = 25;
            const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0.8, to: 1, config: { damping: 14 } });
            const op = interpolate(f, [delay, delay + 15], [0, 1], CR);
            return (
              <div style={{ opacity: op, transform: `scale(${sc})` }}>
                <div style={{
                  width: 420, height: 270, borderRadius: 12,
                  border: `1px solid ${W08}`, background: `linear-gradient(180deg, ${W04} 0%, ${BG} 100%)`,
                  padding: 16, display: "flex", flexDirection: "column",
                }}>
                  {/* browser chrome */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: W10 }} />
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: W10 }} />
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: W10 }} />
                    <div style={{
                      flex: 1, height: 20, borderRadius: 4, background: W04, marginLeft: 10,
                      display: "flex", alignItems: "center", padding: "0 8px",
                    }}>
                      <span style={{ fontSize: 9, color: W20, fontFamily: FONT }}>yoursite.com/login</span>
                    </div>
                  </div>
                  <div style={{
                    flex: 1, borderRadius: 8, border: `1px solid ${W06}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      border: `2px solid ${EMERALD}50`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ScanFace size={28} color={`${EMERALD}80`} />
                    </div>
                    <span style={{ fontSize: 11, color: `${EMERALD}80`, fontFamily: FONT, marginTop: 10 }}>Looking for your face...</span>
                  </div>
                  <div style={{ fontSize: 9, color: W30, textAlign: "center", marginTop: 8, fontFamily: FONT }}>
                    MacBook · Chrome
                  </div>
                </div>
                <div style={{ width: 100, height: 6, background: W04, borderRadius: "0 0 4px 4px", margin: "0 auto" }} />
              </div>
            );
          })()}

          {/* Tablet */}
          {(() => {
            const delay = 40;
            const sc = spring({ frame: Math.max(0, f - delay), fps, from: 0.8, to: 1, config: { damping: 14 } });
            const op = interpolate(f, [delay, delay + 15], [0, 1], CR);
            return (
              <div style={{ opacity: op, transform: `scale(${sc})` }}>
                <div style={{
                  width: 200, height: 270, borderRadius: 16,
                  border: `1px solid ${W08}`, background: `linear-gradient(180deg, ${W04} 0%, ${BG} 100%)`,
                  padding: 12, display: "flex", flexDirection: "column",
                }}>
                  <div style={{ width: 32, height: 4, borderRadius: 2, background: W10, margin: "0 auto 10px" }} />
                  <div style={{
                    flex: 1, borderRadius: 12, border: `1px solid ${W06}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: EMERALD, display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 20px ${EMERALD}30`,
                    }}>
                      <Check size={22} color={BG} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 9, color: `${EMERALD}cc`, fontFamily: FONT, marginTop: 8 }}>Signed in</span>
                  </div>
                  <div style={{ fontSize: 9, color: W30, textAlign: "center", marginTop: 8, fontFamily: FONT }}>
                    iPad · Firefox
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div style={{
          marginTop: 40, fontSize: 15, color: W30, fontFamily: FONT,
          opacity: interpolate(f, [60, 75], [0, 1], CR),
        }}>
          Same face. Same account. Any device, any browser, any OS.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 8 — STATS STRIP + CTA (loops back clean)
   130 frames
   ═══════════════════════════════════════════════════ */
const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* stats */
  const statsOp = interpolate(f, [0, 18], [0, 1], CR);
  const statItems = [
    { val: "99.97%", label: "Recognition accuracy" },
    { val: "<2s", label: "Authentication time" },
    { val: "128D", label: "Face vector dimensions" },
    { val: "0", label: "Passwords to remember" },
    { val: "∞", label: "Devices supported" },
  ];

  /* CTA text */
  const ctaOp = interpolate(f, [30, 48], [0, 1], CR);
  const ctaScale = spring({ frame: Math.max(0, f - 28), fps, from: 0.9, to: 1, config: { damping: 14 } });
  const urlOp = interpolate(f, [45, 60], [0, 1], CR);
  const btnOp = interpolate(f, [55, 68], [0, 1], CR);

  /* fade-out to loop seamlessly into scene 1 */
  const exit = interpolate(f, [110, 130], [1, 0], CL);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exit }}>
      <Glow size={900} />

      {/* stats strip */}
      <div style={{
        position: "absolute", top: 100, left: 120, right: 120,
        display: "flex", justifyContent: "space-between", opacity: statsOp,
        borderBottom: `1px solid ${W04}`, paddingBottom: 40,
      }}>
        {statItems.map((s, i) => {
          const sOp = interpolate(f, [5 + i * 6, 15 + i * 6], [0, 1], CR);
          return (
            <div key={i} style={{ textAlign: "center", opacity: sOp }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: WHITE, fontFamily: FONT, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: W25, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{
        position: "absolute", top: 280, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          opacity: ctaOp, transform: `scale(${ctaScale})`,
          fontSize: 72, fontWeight: 700, color: WHITE, fontFamily: FONT,
          letterSpacing: -3, lineHeight: 1.1,
        }}>
          Stop typing passwords.
        </div>

        <div style={{
          opacity: urlOp, marginTop: 24, fontSize: 32, fontWeight: 600, fontFamily: FONT,
          background: `linear-gradient(90deg, ${EL}, ${TEAL})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          facesmash.app
        </div>

        {/* CTA button */}
        <div style={{
          opacity: btnOp, marginTop: 40,
          height: 56, padding: "0 40px", borderRadius: 50,
          background: EMERALD, display: "flex", alignItems: "center", gap: 10,
          boxShadow: `0 12px 40px ${EMERALD}30`,
        }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: BG, fontFamily: FONT }}>Get started — it's free</span>
          <ArrowRight size={18} color={BG} />
        </div>

        {/* npm */}
        <div style={{
          opacity: interpolate(f, [65, 78], [0, 1], CR), marginTop: 24,
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 20px", borderRadius: 10, background: W04, border: `1px solid ${W08}`,
        }}>
          <Fingerprint size={16} color={EL} />
          <span style={{ fontSize: 15, color: W40, fontFamily: MONO }}>npm install @facesmash/sdk</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN — 8 scenes, 960 frames @ 30fps = 32s, loops
   ═══════════════════════════════════════════════════ */
export const LandingPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={0} durationInFrames={150}>
        <SceneProblem />
      </Sequence>
      <Sequence from={150} durationInFrames={130}>
        <SceneSolution />
      </Sequence>
      <Sequence from={280} durationInFrames={150}>
        <SceneHowItWorks />
      </Sequence>
      <Sequence from={430} durationInFrames={140}>
        <SceneLiveScan />
      </Sequence>
      <Sequence from={570} durationInFrames={120}>
        <SceneSDK />
      </Sequence>
      <Sequence from={690} durationInFrames={120}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={810} durationInFrames={120}>
        <SceneCrossPlatform />
      </Sequence>
      <Sequence from={930} durationInFrames={130}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
