import { useState, useEffect } from "react";
import { X, Cookie, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "facesmash-cookie-consent";

type ConsentChoice = "accepted" | "rejected" | "essential-only";

interface ConsentState {
  choice: ConsentChoice;
  timestamp: number;
}

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Show after a short delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (choice: ConsentChoice) => {
    const state: ConsentState = { choice, timestamp: Date.now() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6"
        >
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0D0F11]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Cookie className="size-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white">Cookie Preferences</h3>
                    <p className="text-xs text-white/30">Privacy is a priority at FaceSmash</p>
                  </div>
                </div>
                <button
                  onClick={() => saveConsent("essential-only")}
                  className="text-white/20 hover:text-white/50 transition-colors p-1"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                We use essential cookies for core functionality (authentication, sessions).
                We may also use analytics cookies to improve the experience.
                Your biometric data is <strong className="text-white/70">never</strong> stored as cookies
                and <strong className="text-white/70">never</strong> leaves your browser in raw form.
              </p>

              {/* Details toggle */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white/70">Essential Cookies</p>
                          <p className="text-xs text-white/40 mt-0.5">Required for authentication, session management, and user preferences. Cannot be disabled.</p>
                        </div>
                        <span className="ml-auto text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">Always On</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="size-4 text-white/30 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white/70">Analytics Cookies</p>
                          <p className="text-xs text-white/40 mt-0.5">Help us understand how visitors use FaceSmash. No personal data is collected.</p>
                        </div>
                        <span className="ml-auto text-[10px] font-medium text-white/40 bg-white/[0.05] px-2 py-0.5 rounded-full shrink-0">Optional</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => saveConsent("accepted")}
                  className="h-9 px-5 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-colors order-1 sm:order-2"
                >
                  Accept All
                </button>
                <button
                  onClick={() => saveConsent("essential-only")}
                  className="h-9 px-5 text-sm font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white/70 rounded-full transition-colors order-2 sm:order-1"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-9 px-4 text-sm text-white/40 hover:text-white/60 transition-colors order-3"
                >
                  {showDetails ? "Hide Details" : "Cookie Details"}
                </button>
                <a
                  href="/privacy"
                  className="h-9 px-4 text-sm text-white/30 hover:text-white/50 transition-colors flex items-center justify-center order-4"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
