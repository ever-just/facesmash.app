
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, LogOut, User, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserProfileByName } from "@/services/userProfileService";
import SignInHistory from "@/components/SignInHistory";

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
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('currentUserName');
    toast.success("Successfully signed out!");
    navigate('/');
  };

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
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded border-2 border-white flex items-center justify-center">
            <div className="w-4 h-4 border border-black rounded-full relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
            </div>
          </div>
          <span className="text-2xl font-bold">Face Card Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">Welcome, {userName}</span>
          <Button onClick={handleSignOut} variant="outline" className="border-white hover:bg-white text-gray-900">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-white">
              FACECARD: {userName}
            </h1>
            <p className="text-gray-300 text-lg">
              You have successfully authenticated using facial recognition
            </p>
          </div>

          {/* User Profile and Security Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="mr-3 h-6 w-6 text-white" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your Face Card details and recognition data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{userName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Face Profile:</span>
                  <span className="text-white">✓ Registered</span>
                </div>
                {userProfile && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Card Created:</span>
                      <span className="text-white">
                        {new Date(userProfile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white">
                        {new Date(userProfile.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-3 h-6 w-6 text-white" />
                  Security Status
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your Face Card security information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Authentication Method:</span>
                  <span className="text-white">Face Recognition</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Security Level:</span>
                  <span className="text-white">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Login:</span>
                  <span className="text-white">Just now</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Face Embedding:</span>
                  <span className="text-white">128-dimensional</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign-In History Section */}
          <SignInHistory userEmail={userName} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
