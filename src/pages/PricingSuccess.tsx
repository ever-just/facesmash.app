import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const PricingSuccess = () => {
  return (
    <div className="bg-[#07080A] text-white min-h-screen selection:bg-emerald-500/30">
      <SEOHead
        path="/pricing/success"
        title="Welcome to Pro!"
        description="Your FaceSmash Pro subscription is now active."
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
          <Link to="/pricing">
            <Button variant="ghost" className="text-white/50 hover:text-white text-sm h-9 px-3 gap-2">
              <ArrowLeft className="size-4" />
              Pricing
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-28 sm:pt-40 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="size-20 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="size-10 text-teal-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-6">
              <Sparkles className="size-3.5" />
              Pro Plan Active
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Welcome to Pro!
            </h1>

            <p className="text-white/40 text-lg mb-3">
              Your 14-day free trial has started. You now have access to
              50,000 authentications/month, unlimited apps, and the full
              analytics dashboard.
            </p>

            <p className="text-white/25 text-sm mb-10">
              You&apos;ll receive a confirmation email from Stripe with your receipt and subscription details.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a href="https://developers.facesmash.app" target="_blank" rel="noopener noreferrer">
              <Button className="h-11 px-6 rounded-full font-medium bg-teal-500 hover:bg-teal-400 text-black">
                Go to Dev Portal
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </a>
            <Link to="/dashboard">
              <Button variant="ghost" className="h-11 px-6 rounded-full text-white/50 hover:text-white hover:bg-white/5">
                Open Dashboard
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PricingSuccess;
