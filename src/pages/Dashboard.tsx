import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
    
    const fetchUserProfile = async () => {
      const profile = await getUserProfileByName(name);
      setUserProfile(profile);
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
        <WelcomeSection userName={userName} />

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
      </div>
    </div>
  );
};

export default Dashboard;
