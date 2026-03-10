import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { getUserProfileByName } from "@/services/userProfileService";
import FaceScanGallery from "@/components/FaceScanGallery";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ProfileCard from "@/components/dashboard/ProfileCard";
import EnhancedSecurityCard from "@/components/dashboard/EnhancedSecurityCard";
import ActivityGraph from "@/components/dashboard/ActivityGraph";
import UserSettings from "@/components/dashboard/UserSettings";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useUserSettings } from "@/hooks/useUserSettings";
import { testStorageSetup } from "@/utils/storageTest";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const settings = useUserSettings();

  useEffect(() => {
    const name = localStorage.getItem('currentUserName');
    if (!name) {
      navigate('/login');
      return;
    }
    setUserName(name);
    
    // Hydrate from localStorage cache instantly for faster paint
    const cachedProfile = localStorage.getItem(`facesmash_profile_${name}`);
    if (cachedProfile) {
      try {
        setUserProfile(JSON.parse(cachedProfile));
      } catch { /* ignore corrupt cache */ }
    }
    
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfileByName(name);
        setUserProfile(profile);
        // Cache profile for instant next load
        if (profile) {
          try {
            localStorage.setItem(`facesmash_profile_${name}`, JSON.stringify(profile));
          } catch { /* localStorage full — non-critical */ }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Keep cached profile if available, don't crash
      }
    };
    fetchUserProfile();
    
    // Test storage setup for debugging
    testStorageSetup();
  }, [navigate]);

  // Auto-lock after inactivity
  useEffect(() => {
    if (!settings.autoLockMinutes || settings.autoLockMinutes <= 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem('currentUserName');
        navigate('/login');
      }, settings.autoLockMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [settings.autoLockMinutes, navigate]);

  if (!userName) {
    return (
      <div className="min-h-screen bg-[#07080A] text-white flex items-center justify-center">
        <Loader2 className="size-6 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] text-white">
      <SEOHead title="Dashboard" description="Your FaceSmash dashboard." path="/dashboard" noindex={true} />
      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* ambient light */}
      <div className="fixed top-[-15%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.02] blur-[120px] pointer-events-none" />

      <DashboardHeader userName={userName} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <ErrorBoundary>
        <WelcomeSection userName={userName} />

        {/* Dev Portal CTA */}
        <a
          href="https://developers.facesmash.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 mb-4 px-5 py-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] transition-colors group"
        >
          <div>
            <p className="text-sm font-medium text-white/80">Developer Portal</p>
            <p className="text-xs text-white/30 mt-0.5">Manage API keys, view usage analytics, and integrate FaceSmash into your app.</p>
          </div>
          <ExternalLink className="size-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors shrink-0" />
        </a>

        {/* Profile + Security — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ProfileCard userName={userName} userProfile={userProfile} />
          <EnhancedSecurityCard userName={userName} />
        </div>

        {/* Activity */}
        {settings.showActivityHistory && (
          <div className="mb-4">
            <ActivityGraph 
              userEmail={userName} 
              userCreatedAt={userProfile?.created_at}
            />
          </div>
        )}

        {/* Face Scan Gallery */}
        <div className="mb-4">
          <FaceScanGallery userEmail={userName} />
        </div>

        {/* Settings */}
        <div className="mb-4">
          <UserSettings userName={userName} />
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Dashboard;
