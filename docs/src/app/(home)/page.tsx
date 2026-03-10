import Link from 'next/link';
import {
  BookOpen,
  Package,
  Plug,
  BookText,
  ShieldCheck,
  Zap,
  ArrowRight,
  ScanFace,
  Globe,
  Brain,
  Lock,
  Fingerprint,
  Terminal,
  Github,
  ExternalLink,
} from 'lucide-react';

const sections = [
  {
    href: '/docs',
    icon: BookOpen,
    title: 'Introduction',
    desc: 'Architecture overview, how it works, browser support, and the full documentation map.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    href: '/docs/quickstart',
    icon: Zap,
    title: 'Quickstart',
    desc: 'Install the SDK and ship your first face login in under 5 minutes.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    href: '/docs/sdk',
    icon: Package,
    title: 'JavaScript SDK',
    desc: 'Drop-in React components, vanilla JS client, hooks, events, and low-level utilities.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    href: '/docs/api-reference',
    icon: Plug,
    title: 'API Reference',
    desc: 'Hono REST API — authentication, face endpoints, users, and webhooks.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    href: '/docs/guides',
    icon: BookText,
    title: 'Guides',
    desc: 'React integration, custom UI, improving accuracy — step-by-step tutorials.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    href: '/docs/security',
    icon: ShieldCheck,
    title: 'Security & Privacy',
    desc: 'How biometric data is processed, stored, encrypted, and never leaves the browser raw.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
];

const stats = [
  { val: '99.97%', label: 'Accuracy' },
  { val: '<2s', label: 'Auth time' },
  { val: '128D', label: 'Face vectors' },
  { val: '0', label: 'Passwords' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-fd-border">
        {/* gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.06] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/facesmash-logo.png"
              alt="FaceSmash"
              className="size-14 rounded-2xl shadow-lg"
            />
            <span className="text-2xl font-bold tracking-tight">FaceSmash</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
            Developer{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-fd-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Add passwordless facial recognition to any app. Browser-native AI handles detection,
            quality analysis, template matching, and verification — all client-side.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs/sdk"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-fd-border bg-fd-card text-sm font-medium hover:bg-fd-accent transition-colors"
            >
              <Package className="size-4" />
              SDK Reference
            </Link>
            <a
              href="https://github.com/ever-just/facesmash.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-fd-border bg-fd-card text-sm font-medium hover:bg-fd-accent transition-colors"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>

          {/* npm install */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-fd-card border border-fd-border text-sm font-mono text-fd-muted-foreground">
            <Terminal className="size-4 text-emerald-400" />
            npm install @facesmash/sdk
          </div>
        </div>
      </section>

      {/* ─── Stats strip ─── */}
      <section className="border-b border-fd-border py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">{s.val}</div>
              <div className="text-xs text-fd-muted-foreground mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Promo video ─── */}
      <section className="py-12 sm:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-fd-border shadow-xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block"
            >
              <source src="/landing-promo.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="text-center text-xs text-fd-muted-foreground mt-3 tracking-wider">
            See FaceSmash in action — from problem to solution
          </p>
        </div>
      </section>

      {/* ─── Section cards ─── */}
      <section className="py-12 sm:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3">
            Explore the docs
          </h2>
          <p className="text-fd-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Everything you need to integrate face authentication — from quickstart to production.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-border/80 hover:bg-fd-accent hover:shadow-md"
                >
                  <div className={`inline-flex items-center justify-center size-11 rounded-lg ${s.bg} ${s.border} border`}>
                    <Icon className={`size-5 ${s.color}`} />
                  </div>
                  <div>
                    <span className="font-semibold text-base group-hover:text-emerald-400 transition-colors">
                      {s.title}
                    </span>
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="inline size-3.5" />
                    </span>
                  </div>
                  <p className="text-sm text-fd-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Key highlights ─── */}
      <section className="py-12 sm:py-16 px-6 border-t border-fd-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ScanFace, title: 'Browser-Native', desc: 'No native SDKs or plugins. Works on any device with a camera.' },
              { icon: Lock, title: 'Privacy-First', desc: 'Face vectors extracted client-side. Raw images never leave the device.' },
              { icon: Brain, title: 'Adaptive AI', desc: 'Multi-template learning improves accuracy with every login.' },
              { icon: Globe, title: 'Cross-Platform', desc: 'Chrome, Safari, Firefox, Edge — iOS, Android, Windows, Mac, Linux.' },
            ].map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <Icon className="size-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-1">{h.title}</h3>
                  <p className="text-sm text-fd-muted-foreground leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Quick code preview ─── */}
      <section className="py-12 sm:py-16 px-6 border-t border-fd-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ship in 5 lines</h2>
          <p className="text-fd-muted-foreground mb-8">
            Drop-in React components or vanilla JS — your choice.
          </p>
          <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-fd-border bg-fd-secondary/50">
              <div className="size-3 rounded-full bg-[#ff5f56]" />
              <div className="size-3 rounded-full bg-[#ffbd2e]" />
              <div className="size-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 text-xs text-fd-muted-foreground font-mono">App.tsx</span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed">
              <code>
                <span className="text-purple-400">import</span>
                <span className="text-fd-muted-foreground">{' { '}</span>
                <span className="text-emerald-400">FaceSmashProvider</span>
                <span className="text-fd-muted-foreground">{', '}</span>
                <span className="text-emerald-400">FaceLogin</span>
                <span className="text-fd-muted-foreground">{' }'}</span>
                {'\n'}
                <span className="text-purple-400">  from</span>
                <span className="text-amber-400">{" '@facesmash/sdk/react'"}</span>
                <span className="text-fd-muted-foreground">;</span>
                {'\n\n'}
                <span className="text-fd-muted-foreground">{'<'}</span>
                <span className="text-blue-400">FaceSmashProvider</span>
                <span className="text-fd-muted-foreground">{' config={{ apiUrl: '}</span>
                <span className="text-amber-400">{"'https://api.facesmash.app'"}</span>
                <span className="text-fd-muted-foreground">{' }}>'}</span>
                {'\n'}
                <span className="text-fd-muted-foreground">{'  <'}</span>
                <span className="text-emerald-400">FaceLogin</span>
                <span className="text-fd-muted-foreground">{' onResult={(r) => r.success && redirect('}</span>
                <span className="text-amber-400">{"'/dashboard'"}</span>
                <span className="text-fd-muted-foreground">{')} />'}</span>
                {'\n'}
                <span className="text-fd-muted-foreground">{'</'}</span>
                <span className="text-blue-400">FaceSmashProvider</span>
                <span className="text-fd-muted-foreground">{'>'}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ─── Links ─── */}
      <section className="py-12 sm:py-16 px-6 border-t border-fd-border">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href="https://facesmash.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
          >
            <Fingerprint className="size-4" />
            facesmash.app
            <ExternalLink className="size-3" />
          </a>
          <span className="text-fd-border">|</span>
          <a
            href="https://www.npmjs.com/package/@facesmash/sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
          >
            <Package className="size-4" />
            @facesmash/sdk
            <ExternalLink className="size-3" />
          </a>
          <span className="text-fd-border">|</span>
          <a
            href="https://github.com/ever-just/facesmash.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
          >
            <Github className="size-4" />
            GitHub
            <ExternalLink className="size-3" />
          </a>
        </div>
        <p className="text-xs text-fd-muted-foreground text-center mt-6">
          Built by{' '}
          <a href="https://everjust.co" className="font-medium underline underline-offset-4 hover:text-fd-foreground transition-colors" target="_blank" rel="noopener noreferrer">
            EVERJUST
          </a>
          <span className="ml-3 text-[10px] opacity-40 font-mono">v2.0.0</span>
        </p>
      </section>
    </div>
  );
}
