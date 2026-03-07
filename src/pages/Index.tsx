import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Scan,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Check,
} from "lucide-react";
import { useRef } from "react";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* face-mesh landmark coordinates (normalised 0-100) */
  const landmarks = [
    [50,8],[30,20],[70,20],[18,35],[82,35],[50,38],[35,45],[65,45],
    [28,55],[72,55],[50,58],[38,68],[62,68],[50,72],[35,80],[65,80],
    [50,88],[42,92],[58,92],[22,45],[78,45],[50,50],[44,55],[56,55],
  ];

  return (
    <div className="bg-[#07080A] text-white selection:bg-emerald-500/30 selection:text-white">

      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* ══════════════════════════ NAV ══════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <Scan className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-semibold tracking-tight">FaceSmash</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white/50 hover:text-white text-sm h-9 px-4">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button className="h-9 px-5 text-sm font-medium bg-white text-black hover:bg-white/90 rounded-full">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* ambient light — warm teal, not generic purple/cyan */}
        <div className="absolute top-[-20%] left-[15%] w-[700px] h-[700px] rounded-full bg-emerald-500/[0.07] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-teal-400/[0.05] blur-[140px]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl">
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

          <div className="flex items-center gap-4 mt-10">
            <Link to="/register">
              <Button className="h-12 px-8 text-base font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-full group shadow-xl shadow-emerald-500/20">
                Create your FaceSmash
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="h-12 px-6 text-base text-white/50 hover:text-white hover:bg-white/5 rounded-full">
                Try it now
              </Button>
            </Link>
          </div>

          {/* device icons strip */}
          <div className="mt-14 flex items-center gap-6 text-white/20">
            <Smartphone className="size-5" />
            <Tablet className="size-5" />
            <Monitor className="size-5" />
            <Globe className="size-5" />
            <span className="text-xs tracking-widest uppercase text-white/30 ml-2">Works everywhere</span>
          </div>
        </motion.div>
      </section>

      {/* ══════════════ "THE PROBLEM" — editorial layout ══════════════ */}
      <section className="relative py-32 px-6">
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
      <section className="relative py-24 px-6 overflow-hidden">
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
      <section className="relative py-32 px-6">
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
                icon: "🍎",
                limits: "iOS/macOS only • Unlocks device, not websites • Tied to one Apple device",
                fs: ["Works in any browser on any device", "Signs you into websites directly", "Cross-platform by design"],
              },
              {
                name: "Windows Hello",
                icon: "🪟",
                limits: "Windows only • Requires IR camera hardware • No mobile support",
                fs: ["Uses any standard webcam", "Works on phone + laptop + tablet", "No special hardware needed"],
              },
              {
                name: "Samsung Face Recognition",
                icon: "📱",
                limits: "Samsung Galaxy only • Device unlock only • Less secure (2D)",
                fs: ["128-dimensional vector mapping", "Not just unlock — full website auth", "Works on competitor devices too"],
              },
              {
                name: "Passwords / 2FA",
                icon: "🔑",
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
                  <span className="text-2xl">{comp.icon}</span>
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
      <section className="relative py-32 px-6 overflow-hidden">
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
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-32">
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
      <section className="relative py-20 px-6 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-12">
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
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-white">{val}</div>
              <div className="text-xs text-white/25 mt-1 uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="relative py-40 px-6 flex items-center justify-center overflow-hidden">
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
          <Link to="/register">
            <Button className="h-14 px-10 text-lg font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-full group shadow-2xl shadow-emerald-500/20">
              Get started — it's free
              <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-emerald-500 flex items-center justify-center">
              <Scan className="size-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-medium">FaceSmash</span>
          </div>
          <p className="text-white/20 text-xs">© 2026 EVERJUST COMPANY</p>
          <div className="flex gap-6 text-xs text-white/20">
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <a href="#" className="hover:text-white/50 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;