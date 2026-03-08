import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Scan,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Check,
  Github,
  BookOpen,
  KeyRound,
  Lock,
  Zap,
  Brain,
  Fingerprint,
  Terminal,
  Shield,
  Eye,
  ChevronDown,
  ExternalLink,
  Package,
  Code2,
  Cpu,
  ScanFace,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useRef, useState } from "react";
import StatusIndicator from "@/components/StatusIndicator";

/* ─── Brand SVG logos ─── */
const AppleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const MicrosoftLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
  </svg>
);

const SamsungLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5.9 7.1C4.1 7.1 2.5 8.2 2.5 10c0 1.3.7 2.1 2.2 2.7l1 .4c.9.3 1.3.7 1.3 1.3 0 .7-.6 1.2-1.5 1.2-1 0-1.7-.5-2.1-1.3l-1.6.9C2.5 16.5 3.8 17 5.5 17c2 0 3.5-1.1 3.5-3 0-1.4-.8-2.3-2.4-2.9l-1-.4c-.8-.3-1.1-.6-1.1-1.1 0-.6.5-1 1.3-1 .7 0 1.3.3 1.7.9l1.5-1C8.3 7.5 7.2 7.1 5.9 7.1zM24 15.5V7.3h-2v6.1l-3.5-6.1h-1.8v8.2h2V9.6l3.5 5.9H24zm-14.8-2c0 2.1 1.4 3.5 3.5 3.5.8 0 1.5-.2 2.1-.5v-2.3c-.5.5-1.1.8-1.8.8-1.2 0-1.9-.9-1.9-2.2V12c0-1.3.7-2.2 1.9-2.2.7 0 1.3.3 1.8.8V8.3c-.6-.3-1.3-.5-2.1-.5-2.1 0-3.5 1.4-3.5 3.5v.2z"/>
  </svg>
);

/* ─── FAQ accordion item ─── */
const FAQItem = ({ q, a, i }: { q: string; a: string; i: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      className="border-t border-white/[0.06]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-base sm:text-lg font-medium text-white/80 group-hover:text-white transition-colors pr-4">{q}</span>
        <ChevronDown className={`size-5 text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60 pb-6" : "max-h-0"}`}>
        <p className="text-sm sm:text-base text-white/35 leading-relaxed">{a}</p>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [devDropdown, setDevDropdown] = useState(false);

  /* face-mesh landmark coordinates (normalised 0-100) */
  const landmarks = [
    [50,8],[30,20],[70,20],[18,35],[82,35],[50,38],[35,45],[65,45],
    [28,55],[72,55],[50,58],[38,68],[62,68],[50,72],[35,80],[65,80],
    [50,88],[42,92],[58,92],[22,45],[78,45],[50,50],[44,55],[56,55],
  ];

  return (
    <div className="bg-[#07080A] text-white selection:bg-emerald-500/30 selection:text-white">
      <SEOHead path="/" />

      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* ══════════════════════════ NAV ══════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <img src="/facesmash-logo.png" alt="FaceSmash" className="size-8 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow" />
            <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight">FaceSmash</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-1">
            <Link to="/login" className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all">
              Sign in
            </Link>
            <Link to="/register" className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all">
              Register
            </Link>

            {/* Developers dropdown */}
            <div className="relative" onMouseEnter={() => setDevDropdown(true)} onMouseLeave={() => setDevDropdown(false)}>
              <button className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all">
                Developers
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${devDropdown ? "rotate-180" : ""}`} />
              </button>
              {devDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-white/[0.08] bg-[#0D0F12]/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-2 z-50">
                  <a href="https://docs.facesmash.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                    <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="size-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Documentation</p>
                      <p className="text-[11px] text-white/25">Guides, SDK reference, API docs</p>
                    </div>
                  </a>
                  <a href="https://www.npmjs.com/package/@facesmash/sdk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                    <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Package className="size-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">SDK on npm</p>
                      <p className="text-[11px] text-white/25">@facesmash/sdk — React & vanilla JS</p>
                    </div>
                  </a>
                  <a href="https://docs.facesmash.app/docs/quickstart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                    <div className="size-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <Zap className="size-4 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Quickstart</p>
                      <p className="text-[11px] text-white/25">Ship face login in 5 minutes</p>
                    </div>
                  </a>
                  <div className="border-t border-white/[0.04] mt-1 pt-1">
                    <a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                      <div className="size-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <Github className="size-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">GitHub</p>
                        <p className="text-[11px] text-white/25">Source code, issues, contributions</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-2">
            <a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/70 transition-colors p-2">
              <Github className="size-5" />
            </a>
            <Link to="/register">
              <Button className="h-9 px-5 text-sm font-medium bg-white text-black hover:bg-white/90 rounded-full">
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white/50 hover:text-white transition-colors p-2">
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/[0.04] bg-[#07080A]/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-white/20 px-3 pt-2 pb-1">Product</p>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-white/50 hover:text-white transition-colors">
                <Scan className="size-4" /> Sign in with face
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-white/50 hover:text-white transition-colors">
                <ScanFace className="size-4" /> Register your face
              </Link>

              <p className="text-[10px] uppercase tracking-wider text-white/20 px-3 pt-4 pb-1">Developers</p>
              <a href="https://docs.facesmash.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-white/50 hover:text-white transition-colors">
                <BookOpen className="size-4" /> Documentation
                <ExternalLink className="size-3 ml-auto text-white/15" />
              </a>
              <a href="https://www.npmjs.com/package/@facesmash/sdk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-white/50 hover:text-white transition-colors">
                <Package className="size-4" /> SDK on npm
                <ExternalLink className="size-3 ml-auto text-white/15" />
              </a>
              <a href="https://docs.facesmash.app/docs/quickstart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-white/50 hover:text-white transition-colors">
                <Zap className="size-4" /> Quickstart guide
                <ExternalLink className="size-3 ml-auto text-white/15" />
              </a>
              <a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-white/50 hover:text-white transition-colors">
                <Github className="size-4" /> GitHub
                <ExternalLink className="size-3 ml-auto text-white/15" />
              </a>

              <div className="pt-4 px-3">
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full h-11 text-sm font-medium bg-white text-black hover:bg-white/90 rounded-full">
                    Get started — it's free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* ambient light — warm teal, not generic purple/cyan */}
        <div className="absolute top-[-20%] left-[15%] w-[700px] h-[700px] rounded-full bg-emerald-500/[0.07] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-teal-400/[0.05] blur-[140px]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl">
          {/* big face visualisation */}
          <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] mb-12">
            {/* outer orbit ring */}
            <div className="absolute inset-[-30px] rounded-full border border-dashed border-white/[0.06]" />
            {/* orbiting dots */}
            {[0,1,2].map(i => (
              <div key={i} className="absolute inset-[-30px] flex items-center justify-center">
                <div className="size-2 rounded-full bg-emerald-400 animate-orbit" style={{ "--orbit-r": "calc(50% + 15px)", "--orbit-t": `${10 + i * 4}s`, animationDelay: `${i * -3}s` } as React.CSSProperties} />
              </div>
            ))}
            {/* face circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] overflow-hidden">
              {/* scan line */}
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent animate-scan-down shadow-[0_0_20px_4px_rgba(52,211,153,0.3)]" />
              {/* mesh SVG */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <defs>
                  <radialGradient id="meshFade" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* triangle mesh connecting landmarks */}
                {landmarks.map(([x, y], i) => (
                  landmarks.slice(i + 1).filter((_, j) => {
                    const dx = landmarks[i + 1 + j][0] - x;
                    const dy = landmarks[i + 1 + j][1] - y;
                    return Math.sqrt(dx*dx + dy*dy) < 28;
                  }).map(([x2, y2], j) => (
                    <motion.line
                      key={`l-${i}-${j}`}
                      x1={x} y1={y} x2={x2} y2={y2}
                      stroke="url(#meshFade)"
                      strokeWidth="0.3"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: i * 0.04 }}
                    />
                  ))
                ))}
                {/* landmark dots */}
                {landmarks.map(([cx, cy], i) => (
                  <motion.circle
                    key={`p-${i}`} cx={cx} cy={cy} r="1"
                    className="fill-emerald-400"
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4], r: 1 }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.08 }}
                  />
                ))}
              </svg>
            </div>
            {/* corner brackets */}
            {["-top-3 -left-3 border-t border-l", "-top-3 -right-3 border-t border-r", "-bottom-3 -left-3 border-b border-l", "-bottom-3 -right-3 border-b border-r"].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 ${cls} border-emerald-500/40`} />
            ))}
          </div>

          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight max-w-3xl">
            Sign in to anything.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              With your face.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/40 max-w-xl leading-relaxed">
            One face, every device, every browser. FaceSmash replaces passwords with a glance — 
            on your phone, your laptop, anywhere you sign in.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-10 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 text-base font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-full group shadow-xl shadow-emerald-500/20">
                Create your FaceSmash
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto h-12 px-6 text-base text-white/50 hover:text-white hover:bg-white/5 rounded-full">
                Try it now
              </Button>
            </Link>
          </div>

          {/* device icons strip */}
          <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/20">
            <Smartphone className="size-5" />
            <Tablet className="size-5" />
            <Monitor className="size-5" />
            <Globe className="size-5" />
            <span className="text-xs tracking-widest uppercase text-white/30">Works everywhere</span>
          </div>
        </motion.div>
      </section>

      {/* ══════════════ PROMO VIDEO ══════════════ */}
      <section className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] shadow-2xl shadow-emerald-500/[0.04]"
          >
            <video
              src="/landing-promo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center text-white/15 text-xs mt-4 tracking-wider"
          >
            See how FaceSmash works — from problem to solution
          </motion.p>
        </div>
      </section>

      {/* ══════════════ "THE PROBLEM" — editorial layout ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >The problem</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug max-w-3xl"
          >
            Face ID is great.<br />
            <span className="text-white/30">But it only unlocks your phone.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="mt-10 grid md:grid-cols-2 gap-x-20 gap-y-8 text-white/40 text-lg leading-relaxed max-w-4xl"
          >
            <p>
              Apple Face ID, Windows Hello, Samsung Face Recognition — they all work <em className="text-white/60 not-italic">within their own ecosystem</em>. 
              Switch from iPhone to a work laptop? You're back to typing passwords.
            </p>
            <p>
              FaceSmash lives in your browser. It doesn't care if you're on iOS, Android, Windows, Mac, or Linux. 
              Visit a site, glance at your camera, <em className="text-white/60 not-italic">you're in</em>. 
              Same face, every device, zero friction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ CROSS-PLATFORM VISUAL ══════════════ */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative">
            {/* three "screens" side by side, slightly overlapping */}
            <div className="flex items-end justify-center gap-6 md:gap-10">
              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
                className="relative w-[140px] md:w-[180px] shrink-0"
              >
                <div className="aspect-[9/16] rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-[#07080A] p-3 flex flex-col">
                  <div className="w-12 h-1 rounded-full bg-white/10 mx-auto mb-4" />
                  <div className="flex-1 rounded-xl border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                    <div className="size-14 rounded-full border border-emerald-500/40 flex items-center justify-center">
                      <Scan className="size-6 text-emerald-400/60" />
                    </div>
                    <div className="absolute left-0 right-0 h-[1px] bg-emerald-400/50 animate-scan-down" />
                  </div>
                  <p className="text-[10px] text-white/30 text-center mt-3">iPhone · Safari</p>
                </div>
              </motion.div>

              {/* Laptop — bigger, center */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                className="relative w-[260px] md:w-[400px] shrink-0"
              >
                <div className="aspect-[16/10] rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-[#07080A] p-4 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="size-2 rounded-full bg-white/10" />
                    <div className="size-2 rounded-full bg-white/10" />
                    <div className="size-2 rounded-full bg-white/10" />
                    <div className="flex-1 h-5 rounded bg-white/[0.03] ml-3 flex items-center px-2">
                      <span className="text-[9px] text-white/20">yoursite.com/login</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-lg border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="size-16 md:size-20 rounded-full border border-emerald-500/40 flex items-center justify-center mx-auto">
                        <Scan className="size-7 md:size-9 text-emerald-400/60" />
                      </div>
                      <p className="text-[10px] md:text-xs text-emerald-400/80 mt-3">Looking for your face...</p>
                    </div>
                    <div className="absolute left-0 right-0 h-[1px] bg-emerald-400/50 animate-scan-down" style={{ animationDelay: "-1s" }} />
                  </div>
                  <p className="text-[10px] text-white/30 text-center mt-3">MacBook · Chrome</p>
                </div>
                {/* stand */}
                <div className="w-24 h-2 bg-white/[0.03] rounded-b-lg mx-auto" />
              </motion.div>

              {/* Tablet */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="relative w-[160px] md:w-[220px] shrink-0"
              >
                <div className="aspect-[3/4] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-[#07080A] p-3 flex flex-col">
                  <div className="w-8 h-1 rounded-full bg-white/10 mx-auto mb-3" />
                  <div className="flex-1 rounded-xl border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="size-12 rounded-full border border-emerald-500/40 flex items-center justify-center mx-auto">
                        <Check className="size-6 text-emerald-400" />
                      </div>
                      <p className="text-[9px] text-emerald-400/80 mt-2">Signed in</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 text-center mt-3">iPad · Firefox</p>
                </div>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="text-center text-white/30 text-sm mt-10"
            >
              Same face. Same account. Any device, any browser, any OS.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ COMPETITOR COMPARISON — editorial, not a table ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >How we compare</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug max-w-3xl mb-16"
          >
            Not another device lock.{" "}
            <span className="text-white/30">A universal sign-in.</span>
          </motion.h2>

          {/* comparison rows — asymmetric editorial layout, not a grid of cards */}
          <div className="space-y-0">
            {[
              {
                name: "Apple Face ID",
                icon: <AppleLogo className="size-6 text-white/50" />,
                limits: "iOS/macOS only • Unlocks device, not websites • Tied to one Apple device",
                fs: ["Works in any browser on any device", "Signs you into websites directly", "Cross-platform by design"],
              },
              {
                name: "Windows Hello",
                icon: <MicrosoftLogo className="size-6 text-white/50" />,
                limits: "Windows only • Requires IR camera hardware • No mobile support",
                fs: ["Uses any standard webcam", "Works on phone + laptop + tablet", "No special hardware needed"],
              },
              {
                name: "Samsung Face Recognition",
                icon: <SamsungLogo className="size-6 text-white/50" />,
                limits: "Samsung Galaxy only • Device unlock only • Less secure (2D)",
                fs: ["128-dimensional vector mapping", "Not just unlock — full website auth", "Works on competitor devices too"],
              },
              {
                name: "Passwords / 2FA",
                icon: <KeyRound className="size-6 text-white/50" />,
                limits: "Forgettable • Phishable • Reused across sites • SMS can be intercepted",
                fs: ["Nothing to remember or type", "Can't be phished or intercepted", "Unique biometric — can't be reused"],
              },
            ].map((comp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid md:grid-cols-[240px_1fr_1fr] gap-6 md:gap-10 py-10 border-t border-white/[0.04] items-start"
              >
                {/* competitor name */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center">{comp.icon}</span>
                  <span className="text-white/60 font-medium">{comp.name}</span>
                </div>
                {/* their limits */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/20 mb-3">Limitations</p>
                  <p className="text-white/30 text-sm leading-relaxed">{comp.limits}</p>
                </div>
                {/* facesmash advantage */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-emerald-400/50 mb-3">FaceSmash</p>
                  <ul className="space-y-2">
                    {comp.fs.map((line, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/60">
                        <Check className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS — horizontal timeline, not cards ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >How it works</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug max-w-3xl mb-20"
          >
            Three seconds.{" "}
            <span className="text-white/30">That's it.</span>
          </motion.h2>

          {/* horizontal line connecting steps */}
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {[
                { n: "01", title: "Visit any site", desc: "Navigate to a site that uses FaceSmash. Click 'Sign in with FaceSmash' — works in Chrome, Safari, Firefox, Edge, on any OS." },
                { n: "02", title: "Glance at camera", desc: "Your browser camera activates. Our AI maps 128 vectors from your face in real-time. No photos are stored — just an encrypted math signature." },
                { n: "03", title: "You're in", desc: "Match confirmed in under 2 seconds. You're authenticated. Works the same on your phone at a coffee shop or your desktop at home." },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="size-16 rounded-full border border-white/[0.08] flex items-center justify-center bg-white/[0.02]">
                      <span className="text-2xl font-bold text-emerald-400/70">{step.n}</span>
                    </div>
                    <div className="hidden md:block flex-1 h-[1px] bg-white/[0.04]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-white/35 leading-relaxed text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES — staggered alternating layout ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-20 sm:space-y-32">
          {[
            {
              label: "Security",
              title: "Your face becomes a 128-point encrypted signature",
              desc: "We never store photos. Your face is converted into a 128-dimensional mathematical vector, encrypted with AES-256, and matched locally in your browser. Even we can't reverse-engineer your face from the data.",
              align: "left" as const,
            },
            {
              label: "Speed",
              title: "Faster than typing your email",
              desc: "Face detection, vector extraction, and matching all happen in under 2 seconds. No waiting for SMS codes. No hunting for password managers. Just look and go.",
              align: "right" as const,
            },
            {
              label: "Privacy",
              title: "Browser-native. Nothing leaves your device unencrypted.",
              desc: "All processing happens in your browser using on-device AI models. Your biometric data is never sent to a server in raw form. You own your face data — we just verify the math.",
              align: "left" as const,
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`max-w-2xl ${feat.align === "right" ? "ml-auto text-right" : ""}`}
            >
              <p className="text-emerald-400/60 uppercase tracking-[0.2em] text-xs mb-4">{feat.label}</p>
              <h3 className="text-2xl md:text-4xl font-bold leading-snug mb-5">{feat.title}</h3>
              <p className="text-white/35 text-lg leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ QUICK SPEC STRIP ══════════════ */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 sm:gap-12">
          {[
            ["99.97%", "Recognition accuracy"],
            ["<2s", "Authentication time"],
            ["128D", "Face vector dimensions"],
            ["0", "Passwords to remember"],
            ["∞", "Devices supported"],
          ].map(([val, label], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">{val}</div>
              <div className="text-[10px] sm:text-xs text-white/25 mt-1 uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ DEVELOPER EXPERIENCE — code preview ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[140px] -translate-y-1/2" />
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >Developer experience</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug max-w-3xl mb-6"
          >
            Ship face login{" "}
            <span className="text-white/30">in 5 lines of code.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-white/40 text-lg leading-relaxed max-w-2xl mb-12"
          >
            Drop-in React components or a vanilla JS client. Works with Next.js, Vite, Remix, Svelte, Vue — 
            any framework that runs in a browser.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Code block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="size-3 rounded-full bg-[#ff5f56]" />
                <div className="size-3 rounded-full bg-[#ffbd2e]" />
                <div className="size-3 rounded-full bg-[#27c93f]" />
                <span className="ml-3 text-xs text-white/25 font-mono">App.tsx</span>
              </div>
              <pre className="p-5 text-sm font-mono overflow-x-auto leading-[1.8]">
                <code>
                  <span className="text-purple-400">import</span>
                  <span className="text-white/50">{" { "}</span>
                  <span className="text-emerald-400">FaceSmashProvider</span>
                  <span className="text-white/50">{", "}</span>
                  <span className="text-emerald-400">FaceLogin</span>
                  <span className="text-white/50">{" }"}</span>{"\n"}
                  <span className="text-purple-400">  from</span>
                  <span className="text-amber-400">{" '@facesmash/sdk/react'"}</span>
                  <span className="text-white/30">;</span>{"\n\n"}
                  <span className="text-white/50">{"<"}</span>
                  <span className="text-blue-400">FaceSmashProvider</span>{"\n"}
                  <span className="text-white/30">{"  config={{ "}</span>
                  <span className="text-white/50">{"apiUrl: "}</span>
                  <span className="text-amber-400">{"'https://api.facesmash.app'"}</span>
                  <span className="text-white/30">{" }}>"}</span>{"\n"}
                  <span className="text-white/50">{"  <"}</span>
                  <span className="text-emerald-400">FaceLogin</span>{"\n"}
                  <span className="text-white/30">{"    onResult={(r) =>"}</span>{"\n"}
                  <span className="text-white/30">{"      r.success && "}</span>
                  <span className="text-white/50">{"redirect("}</span>
                  <span className="text-amber-400">{"'/dashboard'"}</span>
                  <span className="text-white/50">{")"}</span>{"\n"}
                  <span className="text-white/30">{"    }"}</span>{"\n"}
                  <span className="text-white/50">{"  />"}</span>{"\n"}
                  <span className="text-white/50">{"</"}</span>
                  <span className="text-blue-400">FaceSmashProvider</span>
                  <span className="text-white/50">{">"}</span>
                </code>
              </pre>
            </motion.div>

            {/* Feature bullets */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex flex-col justify-center gap-6"
            >
              {[
                { icon: <Package className="size-5 text-emerald-400" />, title: "npm install @facesmash/sdk", desc: "One package, two entry points: core client and React bindings." },
                { icon: <Code2 className="size-5 text-emerald-400" />, title: "TypeScript-first", desc: "Every function, interface, and event fully typed with exported definitions." },
                { icon: <Cpu className="size-5 text-emerald-400" />, title: "5 neural networks, auto-loaded", desc: "SSD MobileNet, FaceLandmark68, FaceRecognition — cached after first load." },
                { icon: <Shield className="size-5 text-emerald-400" />, title: "Client-side processing", desc: "All face detection and matching runs in-browser. Nothing raw hits your server." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80 font-mono">{item.title}</p>
                    <p className="text-sm text-white/35 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}

              {/* npm install */}
              <div className="flex items-center gap-3 mt-2 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Terminal className="size-4 text-emerald-400 shrink-0" />
                <code className="text-sm text-white/50 font-mono">npm install @facesmash/sdk</code>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ ARCHITECTURE — how data flows ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >Architecture</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug max-w-3xl mb-16"
          >
            Your browser does the heavy lifting.{" "}
            <span className="text-white/30">The server just stores math.</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Client side */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Globe className="size-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">Browser (Client-Side)</p>
                  <p className="text-xs text-white/30">~12.5 MB models, cached by browser</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "TensorFlow.js (WebGL-accelerated)",
                  "SSD MobileNet v1 — face detection",
                  "TinyFaceDetector — fallback detector",
                  "FaceLandmark68Net — 68-point mapping",
                  "FaceRecognitionNet — 128D descriptor extraction",
                  "Quality analysis & adaptive matching",
                  "Multi-template comparison engine",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/40">
                    <div className="size-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Server side */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Lock className="size-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-semibold">Server (PocketBase API)</p>
                  <p className="text-xs text-white/30">Self-hostable Go binary</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "user_profiles — name, email, face_embedding[128]",
                  "face_templates — descriptor, quality, timestamp",
                  "face_scans — audit log for every scan event",
                  "sign_in_logs — login history with similarity scores",
                  "AES-256 encryption for stored embeddings",
                  "No raw images ever stored or transmitted",
                  "REST API with real-time subscriptions",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/40">
                    <div className="size-1.5 rounded-full bg-teal-400/60 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* data flow arrow */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8 text-xs sm:text-sm text-white/25"
          >
            <span>128-D numeric vectors only</span>
            <ArrowRight className="size-3.5 shrink-0 hidden sm:block" />
            <span className="sm:hidden">→</span>
            <span>REST API (HTTPS)</span>
            <ArrowRight className="size-3.5 shrink-0 hidden sm:block" />
            <span className="sm:hidden">→</span>
            <span>Encrypted at rest</span>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ OPEN SOURCE + SDK ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8">Open source</p>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-6">
                Built in the open.{" "}
                <span className="text-white/30">Fork it, extend it, self-host it.</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed mb-8">
                FaceSmash is open source on GitHub. Inspect every line of code. Run your own instance. 
                The SDK is published on npm with full TypeScript support.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                  <Github className="size-4" />
                  View on GitHub
                </a>
                <a href="https://www.npmjs.com/package/@facesmash/sdk" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                  <Package className="size-4" />
                  @facesmash/sdk on npm
                </a>
                <a href="https://docs.facesmash.app" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                  <BookOpen className="size-4" />
                  Read the docs
                </a>
              </div>
            </motion.div>

            {/* SDK features grid */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <ScanFace className="size-5 text-emerald-400" />, label: "Face Detection", desc: "Dual-model: SSD MobileNet + TinyFace" },
                  { icon: <Fingerprint className="size-5 text-emerald-400" />, label: "128D Vectors", desc: "Compact face descriptors, not photos" },
                  { icon: <Brain className="size-5 text-emerald-400" />, label: "Adaptive AI", desc: "Multi-template learning improves over time" },
                  { icon: <Eye className="size-5 text-emerald-400" />, label: "Liveness Detection", desc: "Anti-spoofing checks built in" },
                  { icon: <Zap className="size-5 text-emerald-400" />, label: "< 2s Auth", desc: "Detect → extract → match in under 2 seconds" },
                  { icon: <Lock className="size-5 text-emerald-400" />, label: "AES-256", desc: "Face embeddings encrypted at rest" },
                ].map((f, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                      {f.icon}
                    </div>
                    <p className="text-sm font-medium mb-1">{f.label}</p>
                    <p className="text-xs text-white/30">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ TRUST / TECH STRIP ══════════════ */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-white/20 uppercase tracking-[0.25em] text-xs mb-10"
          >Built with</motion.p>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-white/20"
          >
            {[
              "TensorFlow.js", "WebGL", "PocketBase", "React", "TypeScript", "Vite", "AES-256", "TailwindCSS",
            ].map((tech, i) => (
              <span key={i} className="text-sm font-medium tracking-wider">{tech}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >FAQ</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug mb-16"
          >
            Common questions.
          </motion.h2>

          <div className="space-y-0">
            {[
              {
                q: "Is my face photo stored on a server?",
                a: "No. FaceSmash never stores photos. Your face is converted into a 128-dimensional mathematical vector (an array of 128 numbers) locally in your browser. Only this compact numeric signature is transmitted — it's impossible to reconstruct a face image from it.",
              },
              {
                q: "What happens if someone holds up a photo of me?",
                a: "FaceSmash includes built-in liveness detection that analyzes eye aspect ratios, head pose variation, and face quality metrics to detect spoofing attempts. Photo and video replay attacks are blocked before matching even begins.",
              },
              {
                q: "Which browsers and devices are supported?",
                a: "Any modern browser with WebGL support: Chrome 80+, Firefox 78+, Safari 14+, and Edge 80+. Works on desktops, laptops, tablets, and phones — iOS, Android, Windows, Mac, and Linux.",
              },
              {
                q: "How accurate is it?",
                a: "99.97% recognition accuracy using 128-dimensional face descriptor matching with adaptive thresholds. The system uses multi-template learning — accuracy improves with every login as it builds a richer model of each user's face under different conditions.",
              },
              {
                q: "Can I self-host FaceSmash?",
                a: "Yes. The SDK works with any PocketBase instance. Clone the repo, run your own PocketBase server, and point the SDK at your API URL. The entire stack is open source.",
              },
              {
                q: "Is it free?",
                a: "Yes. FaceSmash is free to use and open source. The SDK is published on npm, the app is live at facesmash.app, and the source code is on GitHub.",
              },
            ].map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ ECOSYSTEM — bridge between properties ══════════════ */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/20 uppercase tracking-[0.25em] text-xs mb-8"
          >Explore the ecosystem</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold leading-snug max-w-3xl mb-6"
          >
            One platform.{" "}
            <span className="text-white/30">Multiple entry points.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-white/40 text-lg leading-relaxed max-w-2xl mb-14"
          >
            Whether you're a user signing in with your face, a developer integrating the SDK, 
            or exploring the API — there's a dedicated experience for you.
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FaceSmash App */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/[0.10] transition-all"
            >
              <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <ScanFace className="size-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">FaceSmash App</h3>
              <p className="text-sm text-white/30 leading-relaxed mb-5">Sign in or register your face. The main product experience — works on any device.</p>
              <Link to="/register" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors group-hover:gap-2">
                Get started <ArrowRight className="size-3.5 transition-all" />
              </Link>
            </motion.div>

            {/* Documentation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/[0.10] transition-all"
            >
              <div className="size-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
                <BookOpen className="size-5 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-white/30 leading-relaxed mb-5">Guides, API reference, security architecture. Everything you need to understand FaceSmash.</p>
              <a href="https://docs.facesmash.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors group-hover:gap-2">
                Read the docs <ExternalLink className="size-3.5 transition-all" />
              </a>
            </motion.div>

            {/* SDK */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/[0.10] transition-all"
            >
              <div className="size-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5">
                <Package className="size-5 text-teal-400" />
              </div>
              <h3 className="font-semibold mb-2">SDK on npm</h3>
              <p className="text-sm text-white/30 leading-relaxed mb-5">@facesmash/sdk — React components, hooks, and a vanilla JS client. TypeScript-first.</p>
              <a href="https://www.npmjs.com/package/@facesmash/sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors group-hover:gap-2">
                View on npm <ExternalLink className="size-3.5 transition-all" />
              </a>
            </motion.div>

            {/* GitHub */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/[0.10] transition-all"
            >
              <div className="size-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                <Github className="size-5 text-white/50" />
              </div>
              <h3 className="font-semibold mb-2">Open Source</h3>
              <p className="text-sm text-white/30 leading-relaxed mb-5">Fork it, extend it, self-host it. Every line of code is public and auditable on GitHub.</p>
              <a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/70 transition-colors group-hover:gap-2">
                View source <ExternalLink className="size-3.5 transition-all" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="relative py-24 sm:py-40 px-4 sm:px-6 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10 text-center max-w-2xl"
        >
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Stop typing passwords.
          </h2>
          <p className="text-white/35 text-lg mb-10">
            Set up FaceSmash in 60 seconds. Use it everywhere, on every device, forever free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="h-14 px-10 text-lg font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-full group shadow-2xl shadow-emerald-500/20">
                Get started — it's free
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="https://docs.facesmash.app/docs/quickstart" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="h-14 px-8 text-lg text-white/50 hover:text-white hover:bg-white/5 rounded-full">
                <BookOpen className="mr-2 size-5" />
                Read the docs
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-center gap-3 mt-8 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] mx-auto w-fit">
            <Terminal className="size-4 text-emerald-400 shrink-0" />
            <code className="text-sm text-white/50 font-mono">npm install @facesmash/sdk</code>
          </div>
        </motion.div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/[0.06] pt-16 pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* top section — logo + columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <img src="/facesmash-logo.png" alt="FaceSmash" className="size-9 rounded-xl shadow-lg shadow-emerald-500/10" />
                <span className="text-lg font-semibold tracking-tight">FaceSmash</span>
              </Link>
              <p className="text-sm text-white/30 leading-relaxed max-w-xs mb-6">
                Passwordless facial recognition authentication for any app. 
                One face, every device, every browser.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <Github className="size-4" />
                </a>
                <a href="https://www.npmjs.com/package/@facesmash/sdk" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <Package className="size-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">Product</p>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-sm text-white/30 hover:text-white/60 transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="text-sm text-white/30 hover:text-white/60 transition-colors">Sign In</Link></li>
                <li><a href="https://facesmash.app" className="text-sm text-white/30 hover:text-white/60 transition-colors">Live Demo</a></li>
                <li><Link to="/register" className="text-sm text-white/30 hover:text-white/60 transition-colors">Register Face</Link></li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">Developers</p>
              <ul className="space-y-3">
                <li><a href="https://docs.facesmash.app" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">Documentation</a></li>
                <li><a href="https://docs.facesmash.app/docs/quickstart" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">Quickstart</a></li>
                <li><a href="https://docs.facesmash.app/docs/sdk" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">SDK Reference</a></li>
                <li><a href="https://docs.facesmash.app/docs/api-reference" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">API Reference</a></li>
                <li><a href="https://www.npmjs.com/package/@facesmash/sdk" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">npm Package <ExternalLink className="size-3" /></a></li>
                <li><a href="https://github.com/ever-just/facesmash.app" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">GitHub <ExternalLink className="size-3" /></a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">Company</p>
              <ul className="space-y-3">
                <li><a href="https://everjust.co" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">EVERJUST</a></li>
                <li><Link to="/privacy" className="text-sm text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-white/30 hover:text-white/60 transition-colors">Terms of Service</Link></li>
                <li><a href="https://docs.facesmash.app/docs/security" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">Security</a></li>
                <li><Link to="/status" className="text-sm text-white/30 hover:text-white/60 transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>

          {/* status indicator */}
          <div className="mb-8">
            <StatusIndicator />
          </div>

          {/* bottom bar */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">© 2026 EVERJUST COMPANY. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-white/20">
              <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
              <Link to="/status" className="hover:text-white/50 transition-colors">Status</Link>
              <a href="https://docs.facesmash.app/docs/security" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;