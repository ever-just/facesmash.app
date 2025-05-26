
import { useState, useEffect } from "react";
import { Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserProfileByName } from "@/services/userProfileService";
import SignInHistory from "@/components/SignInHistory";
import FaceScanGallery from "@/components/FaceScanGallery";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ProfileCard from "@/components/dashboard/ProfileCard";
import SecurityCard from "@/components/dashboard/SecurityCard";
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

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <WelcomeSection userName={userName} />

          {/* User Profile and Security Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <ProfileCard userName={userName} userProfile={userProfile} />
            <SecurityCard />
          </div>

          {/* Face Scan Gallery */}
          <div className="mb-8">
            <FaceScanGallery userEmail={userName} />
          </div>

          {/* Sign-In History Section */}
          <SignInHistory userEmail={userName} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
