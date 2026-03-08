import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  ArrowRight,
  Zap,
  Building2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For indie developers and side projects.",
    accent: "emerald",
    cta: "Get started free",
    ctaLink: "/register",
    external: false,
    popular: false,
    icon: <Zap className="size-5 text-emerald-400" />,
    features: [
      "1,000 authentications / month",
      "1 application",
      "Community support",
      "JavaScript SDK (React + vanilla)",
      "Client-side face detection",
      "128D vector matching",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "For startups and growing products.",
    accent: "teal",
    cta: "Start free trial",
    ctaLink: "https://developers.facesmash.app",
    external: true,
    popular: true,
    icon: <Sparkles className="size-5 text-teal-400" />,
    features: [
      "50,000 authentications / month",
      "Unlimited applications",
      "Priority email support",
      "Everything in Free, plus:",
      "API key management",
      "Webhooks & events",
      "Advanced analytics dashboard",
      "Custom branding",
      "Multi-template face learning",
      "99.9% uptime SLA",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams that need scale and compliance.",
    accent: "purple",
    cta: "Contact sales",
    ctaLink: "mailto:facesmash@everjust.com",
    external: true,
    popular: false,
    icon: <Building2 className="size-5 text-purple-400" />,
    features: [
      "Unlimited authentications",
      "Unlimited applications",
      "Dedicated support + SLA",
      "Everything in Pro, plus:",
      "Self-hosted deployment",
      "SSO / SAML integration",
      "Custom compliance (SOC 2, HIPAA)",
      "On-premise PocketBase",
      "Dedicated account manager",
      "Custom SLA & uptime guarantees",
    ],
  },
];

const accentMap: Record<string, { border: string; bg: string; text: string; badge: string; btn: string }> = {
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-black",
  },
  teal: {
    border: "border-teal-500/20",
    bg: "bg-teal-500/[0.06]",
    text: "text-teal-400",
    badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    btn: "bg-teal-500 hover:bg-teal-400 text-black",
  },
  purple: {
    border: "border-purple-500/20",
    bg: "bg-purple-500/[0.06]",
    text: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    btn: "bg-purple-500 hover:bg-purple-400 text-white",
  },
};

const Pricing = () => {
  return (
    <div className="bg-[#07080A] text-white min-h-screen selection:bg-emerald-500/30">
      <SEOHead
        path="/pricing"
        title="Pricing"
        description="Simple, transparent pricing for FaceSmash facial recognition authentication."
      />

      {/* film-grain */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <img src="/facesmash-logo.png" alt="FaceSmash" className="size-8 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow" />
            <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight">FaceSmash</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-white/50 hover:text-white text-sm h-9 px-3 gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-white/20 uppercase tracking-[0.25em] text-xs mb-4">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing.
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Tier cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {tiers.map((tier, i) => {
              const a = accentMap[tier.accent];
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border ${
                    tier.popular ? a.border + " " + a.bg : "border-white/[0.06] bg-white/[0.02]"
                  } p-6 sm:p-8 flex flex-col`}
                >
                  {tier.popular && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium border ${a.badge}`}>
                      Most popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`size-10 rounded-lg ${tier.popular ? a.bg : "bg-white/[0.04]"} border ${tier.popular ? a.border : "border-white/[0.06]"} flex items-center justify-center`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    {tier.period && <span className="text-white/30 text-sm ml-1">{tier.period}</span>}
                  </div>

                  <p className="text-sm text-white/40 mb-6">{tier.description}</p>

                  {tier.external ? (
                    <a href={tier.ctaLink} target="_blank" rel="noopener noreferrer" className="mb-6">
                      <Button className={`w-full h-11 rounded-full font-medium ${tier.popular ? a.btn : "bg-white/[0.06] hover:bg-white/[0.10] text-white"}`}>
                        {tier.cta}
                        {tier.external && <ExternalLink className="ml-2 size-3.5" />}
                      </Button>
                    </a>
                  ) : (
                    <Link to={tier.ctaLink} className="mb-6">
                      <Button className={`w-full h-11 rounded-full font-medium ${a.btn}`}>
                        {tier.cta}
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  )}

                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <Check className={`size-4 mt-0.5 shrink-0 ${a.text}`} />
                        <span className="text-white/50">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ / bottom info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-white/30 text-sm mb-6">
              All plans include the JavaScript SDK, client-side face detection, and 128D vector matching.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button className="h-11 px-6 rounded-full font-medium bg-emerald-500 hover:bg-emerald-400 text-black">
                  Try the Demo
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <a href="https://developers.facesmash.app" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="h-11 px-6 rounded-full text-white/50 hover:text-white hover:bg-white/5">
                  Dev Portal
                  <ExternalLink className="ml-2 size-3.5" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
