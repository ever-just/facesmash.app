
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { initializeFaceAPI, processMultipleImages, facesMatch } from "@/utils/faceRecognition";
import { getAllUserProfiles } from "@/services/userProfileService";

const Login = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const [faceAPILoaded, setFaceAPILoaded] = useState(false);

  useEffect(() => {
    const loadFaceAPI = async () => {
      const loaded = await initializeFaceAPI();
      setFaceAPILoaded(loaded);
      if (!loaded) {
        toast.error("Failed to load face recognition models. Please refresh the page.");
      }
    };
    loadFaceAPI();
  }, []);

  const handleImagesCapture = async (images: string[]) => {
    if (!faceAPILoaded) {
      toast.error("Face recognition is still loading. Please wait.");
      return;
    }

    setIsScanning(true);
    
    try {
      // Extract face embedding from captured images
      const loginFaceEmbedding = await processMultipleImages(images);
      
      if (!loginFaceEmbedding) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No face detected in the captured images. Please try again.");
        return;
      }

      // Get all registered user profiles
      const userProfiles = await getAllUserProfiles();
      
      if (userProfiles.length === 0) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No registered users found. Please register first.");
        return;
      }

      // Find matching user
      let foundMatch = false;
      for (const profile of userProfiles) {
        const storedEmbedding = new Float32Array(profile.face_embedding);
        
        if (facesMatch(loginFaceEmbedding, storedEmbedding, 0.6)) {
          foundMatch = true;
          setMatchedUser(profile.email);
          break;
        }
      }

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsScanning(false);
      setScanComplete(true);
      
      if (foundMatch) {
        setLoginResult('success');
        toast.success(`Welcome back, ${matchedUser}!`);
      } else {
        setLoginResult('failed');
        toast.error("Face not recognized. Please try again or register a new account.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsScanning(false);
      setScanComplete(true);
      setLoginResult('failed');
      toast.error("An error occurred during face recognition. Please try again.");
    }
  };

  const resetLogin = () => {
    setIsScanning(false);
    setScanComplete(false);
    setLoginResult(null);
    setMatchedUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold">FaceAuth</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="text-white hover:text-cyan-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Loading State for Face API */}
          {!faceAPILoaded && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
              <CardContent className="text-center py-8">
                <Loader2 className="h-8 w-8 text-cyan-400 mx-auto mb-4 animate-spin" />
                <p className="text-white">Loading face recognition models...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment on first load</p>
              </CardContent>
            </Card>
          )}

          {!scanComplete && faceAPILoaded && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-white flex items-center justify-center">
                  <Camera className="mr-3 h-8 w-8 text-cyan-400" />
                  Face Recognition Login
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Position your face in the camera frame to sign in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isScanning ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-16 w-16 text-cyan-400 mx-auto mb-6 animate-spin" />
                    <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Face...</h3>
                    <p className="text-gray-400">Please hold still while we verify your identity</p>
                    
                    {/* Scanning Animation */}
                    <div className="mt-8 relative">
                      <div className="w-64 h-64 mx-auto border-2 border-cyan-400 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 animate-bounce"></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-4">Matching face patterns...</p>
                    </div>
                  </div>
                ) : (
                  <WebcamCapture onImagesCapture={handleImagesCapture} isLogin={true} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Login Result */}
          {scanComplete && loginResult === 'success' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-3xl text-white">Welcome Back!</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Face recognition successful
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-6">
                  <p className="text-green-400 font-semibold">Authentication Successful</p>
                  <p className="text-gray-300 mt-2">Welcome back, {matchedUser}!</p>
                  <p className="text-gray-400 text-sm mt-1">You have been securely logged in</p>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                    Continue to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetLogin}
                    className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                  >
                    Sign In Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {scanComplete && loginResult === 'failed' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-3xl text-white">Access Denied</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Face not recognized
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-6">
                  <p className="text-red-400 font-semibold">Authentication Failed</p>
                  <p className="text-gray-300 mt-2">Your face could not be verified</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={resetLogin}
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                  >
                    Try Again
                  </Button>
                  <Link to="/register">
                    <Button 
                      variant="outline"
                      className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                    >
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Need help?</p>
            <div className="flex justify-center space-x-4">
              <Link to="/register">
                <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  Don't have an account?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
