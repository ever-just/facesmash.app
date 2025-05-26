
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { initializeFaceAPI, processMultipleImages, facesMatch } from "@/utils/faceRecognition";
import { getAllUserProfiles } from "@/services/userProfileService";
import LoginHeader from "@/components/LoginHeader";
import LoginSuccess from "@/components/LoginSuccess";
import LoginFailed from "@/components/LoginFailed";

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
      <LoginHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
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
                  <WebcamCapture 
                    onImagesCapture={handleImagesCapture} 
                    isLogin={true} 
                    autoStart={true}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {scanComplete && loginResult === 'success' && (
            <LoginSuccess 
              matchedUser={matchedUser}
              onContinue={goToDashboard}
              onSignInAgain={resetLogin}
            />
          )}

          {scanComplete && loginResult === 'failed' && (
            <LoginFailed onTryAgain={resetLogin} />
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Need help?</p>
            <div className="flex justify-center space-x-4">
              <Link to="/register">
                <button className="text-white hover:text-gray-300 hover:bg-gray-900 px-4 py-2 rounded">
                  Don't have a Face Card?
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
