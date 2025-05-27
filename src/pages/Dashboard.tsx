
import { useState, useEffect } from "react";
import { Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserProfileByName } from "@/services/userProfileService";
import FaceScanGallery from "@/components/FaceScanGallery";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ProfileCard from "@/components/dashboard/ProfileCard";
import EnhancedSecurityCard from "@/components/dashboard/EnhancedSecurityCard";
import ActivityGraph from "@/components/dashboard/ActivityGraph";
import { testStorageSetup } from "@/utils/storageTest";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

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

  if (!userName) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Square className="h-16 w-16 text-white mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader userName={userName} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <WelcomeSection userName={userName} />

          {/* Mobile-first responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <ProfileCard userName={userName} userProfile={userProfile} />
            <EnhancedSecurityCard userName={userName} />
          </div>

          {/* Activity Graph - Full width on mobile */}
          <div className="mb-6 sm:mb-8">
            <ActivityGraph 
              userEmail={userName} 
              userCreatedAt={userProfile?.created_at}
            />
          </div>

          {/* Face Scan Gallery - Full width */}
          <div className="mb-6 sm:mb-8">
            <FaceScanGallery userEmail={userName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
