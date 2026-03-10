import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BANNER_DISMISS_KEY = "facesmash-sdk-banner-dismissed";

const AnnouncementBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISS_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-[60] overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-emerald-600/90 via-teal-500/90 to-emerald-600/90 border-b border-emerald-400/20">
            {/* Animated shimmer */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.08)_50%,transparent_75%)] animate-shimmer bg-[length:250%_100%]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2 sm:gap-3 text-sm">
              <Package className="size-4 text-white/80 shrink-0 hidden sm:block" />
              <span className="text-white/90 text-center">
                                <strong className="text-white font-semibold">@facesmash/sdk v2.0.0</strong>
                                {" "}is now live on npm — Add face login to your app in minutes
              </span>
              <a
                href="https://docs.facesmash.app/docs/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
              >
                View Docs →
              </a>
              <button
                onClick={dismiss}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                aria-label="Dismiss announcement"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
