import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, XCircle } from "lucide-react";

const PricingCancel = () => {
  return (
    <div className="bg-[#07080A] text-white min-h-screen selection:bg-emerald-500/30">
      <SEOHead
        path="/pricing/cancel"
        title="Payment Cancelled"
        description="Your FaceSmash Pro checkout was cancelled."
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
            <div className="size-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-8">
              <XCircle className="size-10 text-white/30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Payment cancelled
            </h1>

            <p className="text-white/40 text-lg mb-3">
              No worries — you weren&apos;t charged. You can start a subscription
              anytime from the pricing page.
            </p>

            <p className="text-white/25 text-sm mb-10">
              Have questions? Email us at{" "}
              <a href="mailto:facesmash@everjust.com" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                facesmash@everjust.com
              </a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/pricing">
              <Button className="h-11 px-6 rounded-full font-medium bg-emerald-500 hover:bg-emerald-400 text-black">
                Back to Pricing
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="h-11 px-6 rounded-full text-white/50 hover:text-white hover:bg-white/5">
                Home
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PricingCancel;
