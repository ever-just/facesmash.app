
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { initializeFaceAPI, processMultipleImages, facesMatch } from "@/utils/faceRecognition";
import { getAllUserProfiles } from "@/services/userProfileService";

const Login = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const [faceAPILoaded, setFaceAPILoaded] = useState(false);

  useEffect(() => {
    const loadFaceAPI = async () => {
      console.log('Initializing face recognition models for login...');
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

    console.log('Starting face verification process...');
    setIsScanning(true);
    
    try {
      const loginFaceEmbedding = await processMultipleImages(images);
      
      if (!loginFaceEmbedding) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No face detected in the captured image. Please try again.");
        return;
      }

      console.log('Face embedding extracted, comparing with registered users...');
      const userProfiles = await getAllUserProfiles();
      
      if (userProfiles.length === 0) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No registered users found. Please register first.");
        return;
      }

      console.log(`Checking against ${userProfiles.length} registered user(s)...`);
      
      let foundMatch = false;
      for (const profile of userProfiles) {
        console.log(`Comparing with user: ${profile.email}`);
        const storedEmbedding = new Float32Array(profile.face_embedding);
        
        if (facesMatch(loginFaceEmbedding, storedEmbedding, 0.6)) {
          foundMatch = true;
          setMatchedUser(profile.email);
          console.log(`Match found! User: ${profile.email}`);
          
          localStorage.setItem('currentUserName', profile.email);
          break;
        }
      }

      setIsScanning(false);
      setScanComplete(true);
      
      if (foundMatch) {
        setLoginResult('success');
        toast.success(`Welcome back, ${matchedUser}!`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setLoginResult('failed');
        console.log('No matching face found');
        toast.error("Face not recognized. Please try again or register a new Face Card.");
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

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded border-2 border-white flex items-center justify-center">
            <div className="w-4 h-4 border border-black rounded-full relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
            </div>
          </div>
          <span className="text-2xl font-bold">Face Card</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Loading State for Face API */}
          {!faceAPILoaded && (
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="text-center py-8">
                <Loader2 className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
                <p className="text-white">Loading face recognition models...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment on first load</p>
              </CardContent>
            </Card>
          )}

          {!scanComplete && faceAPILoaded && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-white flex items-center justify-center">
                  <Square className="mr-3 h-8 w-8 text-white" />
                  Face Card Login
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Position your face in the camera frame to sign in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isScanning ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-16 w-16 text-white mx-auto mb-6 animate-spin" />
                    <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Face...</h3>
                    <p className="text-gray-400">Please hold still while we verify your identity</p>
                  </div>
                ) : (
                  <WebcamCapture onImagesCapture={handleImagesCapture} isLogin={true} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Login Result - Success */}
          {scanComplete && loginResult === 'success' && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CheckCircle className="h-20 w-20 text-white mx-auto mb-4" />
                <CardTitle className="text-3xl text-white">Welcome Back!</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Face recognition successful
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-white font-semibold">Authentication Successful</p>
                  <p className="text-gray-300 mt-2">Welcome back, {matchedUser}!</p>
                  <p className="text-gray-400 text-sm mt-1">You have been securely logged in</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={goToDashboard}
                    className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    Continue to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetLogin}
                    className="w-full border-white text-white hover:bg-white hover:text-black"
                  >
                    Sign In Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Login Result - Failed */}
          {scanComplete && loginResult === 'failed' && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <AlertCircle className="h-20 w-20 text-white mx-auto mb-4" />
                <CardTitle className="text-3xl text-white">Access Denied</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Face not recognized
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-white font-semibold">Authentication Failed</p>
                  <p className="text-gray-300 mt-2">Your face could not be verified</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={resetLogin}
                    className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    Try Again
                  </Button>
                  <Link to="/register">
                    <Button 
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white hover:text-black"
                    >
                      Create New Face Card
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
                <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-gray-900">
                  Don't have a Face Card?
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
