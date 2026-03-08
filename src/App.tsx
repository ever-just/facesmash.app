
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FaceAPIProvider } from "@/contexts/FaceAPIContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Status from "./pages/Status";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <FaceAPIProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GlobalLoadingScreen />
              <AnnouncementBanner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/status" element={<Status />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsentBanner />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </FaceAPIProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
