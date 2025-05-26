
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, LogOut, User, Shield, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserProfileByEmail } from "@/services/userProfileService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Get user email from localStorage (set during login)
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      navigate('/login');
      return;
    }
    
    setUserEmail(email);
    
    // Fetch user profile
    const fetchUserProfile = async () => {
      const profile = await getUserProfileByEmail(email);
      setUserProfile(profile);
    };
    
    fetchUserProfile();
  }, [navigate]);

  const handleSignOut = () => {
    // Clear user session data
    localStorage.removeItem('currentUserEmail');
    
    toast.success("Successfully signed out!");
    navigate('/');
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-16 w-16 text-cyan-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold">FaceAuth Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">Welcome, {userEmail}</span>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-slate-900"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-300 text-lg">
              You have successfully authenticated using facial recognition
            </p>
          </div>

          {/* User Profile Card */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="mr-3 h-6 w-6 text-cyan-400" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your account details and face recognition data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{userEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Face Profile:</span>
                  <span className="text-green-400">✓ Registered</span>
                </div>
                {userProfile && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Account Created:</span>
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

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-3 h-6 w-6 text-cyan-400" />
                  Security Status
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your account security information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Authentication Method:</span>
                  <span className="text-cyan-400">Face Recognition</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Security Level:</span>
                  <span className="text-green-400">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Login:</span>
                  <span className="text-white">Just now</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Face Embedding:</span>
                  <span className="text-green-400">128-dimensional</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Section */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-3 h-6 w-6 text-cyan-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Test the face recognition system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Test Authentication</h4>
                  <p className="text-gray-400 text-sm">
                    Sign out and try logging back in with your face to test the recognition system.
                  </p>
                  <Button 
                    onClick={handleSignOut}
                    className="bg-cyan-500 hover:bg-cyan-600 w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out & Test Login
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Return to Home</h4>
                  <p className="text-gray-400 text-sm">
                    Go back to the main page to learn more about FaceAuth.
                  </p>
                  <Link to="/">
                    <Button 
                      variant="outline"
                      className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg p-6">
                <h4 className="text-cyan-400 font-semibold mb-2">How Face Recognition Works</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Your face is converted into a unique 128-dimensional vector</li>
                  <li>• The system compares similarity with a 0.6 threshold for matching</li>
                  <li>• Face data is securely encrypted and stored in the database</li>
                  <li>• Authentication typically takes under 2 seconds</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
