import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UserSettings from "@/components/dashboard/UserSettings";
import ErrorBoundary from "@/components/ErrorBoundary";

const Settings = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('currentUserName');
    if (!name) {
      navigate('/login');
      return;
    }
    setUserName(name);
  }, [navigate]);

  if (!userName) {
    return (
      <div className="min-h-screen bg-[#07080A] text-white flex items-center justify-center">
        <Loader2 className="size-6 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] text-white">
      <SEOHead title="Settings" description="Your FaceSmash settings." path="/settings" noindex={true} />
      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* ambient light */}
      <div className="fixed top-[-15%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.02] blur-[120px] pointer-events-none" />

      <DashboardHeader userName={userName} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <ErrorBoundary>
          <div className="mb-8">
            <p className="text-white/20 uppercase tracking-[0.2em] text-xs mb-3">Settings</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Preferences
            </h1>
            <p className="text-white/30 mt-2 text-sm">Manage your account settings and preferences.</p>
          </div>

          <UserSettings userName={userName} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Settings;
