
import { lazy, Suspense, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import FaceRouteWrapper from "@/components/FaceRouteWrapper";
import { CookieManager } from "react-cookie-manager";
import { applyConsentToSentry } from "@/utils/consentManager";
import type { CookieCategories } from "react-cookie-manager";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Status = lazy(() => import("./pages/Status"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PricingSuccess = lazy(() => import("./pages/PricingSuccess"));
const PricingCancel = lazy(() => import("./pages/PricingCancel"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10 * 60 * 1000, // 10 minutes — longer cache for less refetching
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
      refetchOnWindowFocus: false, // Don't refetch on tab switch
    },
  },
});

// Minimal loading fallback — matches app background
const PageFallback = () => (
  <div className="min-h-screen bg-[#07080A]" />
);

const App = () => {
  const handleAccept = useCallback(() => {
    applyConsentToSentry(true);
  }, []);

  const handleDecline = useCallback(() => {
    applyConsentToSentry(false);
  }, []);

  const handleManage = useCallback((prefs?: CookieCategories) => {
    // Only update consent when preferences are actually saved (prefs defined).
    // When prefs is undefined, the user just opened the manage UI — don't change anything.
    if (prefs) {
      applyConsentToSentry(prefs.Analytics ?? false);
    }
  }, []);

  return (
    <CookieManager
      translations={{
        title: "Cookie Preferences",
        message:
          "FaceSmash uses essential cookies for authentication and sessions. " +
          "We also use Sentry for error tracking and performance monitoring (analytics). " +
          "Your biometric data is never stored as cookies and never leaves your browser in raw form.",
        buttonText: "Accept All",
        declineButtonText: "Reject All",
        manageButtonText: "Manage Cookies",
        privacyPolicyText: "Privacy Policy",
      }}
      showManageButton
      enableFloatingButton
      displayType="popup"
      theme="dark"
      privacyPolicyUrl="/privacy"
      disableGeolocation
      onAccept={handleAccept}
      onDecline={handleDecline}
      onManage={handleManage}
    >
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnnouncementBanner />
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/register" element={<FaceRouteWrapper><Register /></FaceRouteWrapper>} />
                    <Route path="/login" element={<FaceRouteWrapper><Login /></FaceRouteWrapper>} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/pricing/success" element={<PricingSuccess />} />
                    <Route path="/pricing/cancel" element={<PricingCancel />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </CookieManager>
  );
};

export default App;
