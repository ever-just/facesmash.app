
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, ArrowLeft, CheckCircle, AlertCircle, Loader2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { initializeFaceAPI, processMultipleImages } from "@/utils/faceRecognition";
import { analyzeFaceQuality, enhancedFaceMatch, base64ToBlob } from "@/utils/enhancedFaceRecognition";
import { getAllUserProfiles, updateUserProfile } from "@/services/userProfileService";
import { createSignInLog } from "@/services/signInLogService";
import { uploadFaceImage, createFaceScan, updateUserEmbeddingWithScan } from "@/services/faceScanService";
import LoginHeader from "@/components/LoginHeader";
import LoginSuccess from "@/components/LoginSuccess";
import LoginFailed from "@/components/LoginFailed";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const [faceAPILoaded, setFaceAPILoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const existingUser = localStorage.getItem('currentUserName');
    if (existingUser) {
      setCurrentUser(existingUser);
      setShowLoginOptions(true);
    } else {
      // Load face API if no user is logged in
      const loadFaceAPI = async () => {
        console.log('Initializing face recognition models for login...');
        const loaded = await initializeFaceAPI();
        setFaceAPILoaded(loaded);
        if (!loaded) {
          toast.error("Failed to load face recognition models. Please refresh the page.");
        }
      };
      loadFaceAPI();
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('currentUserName');
    setCurrentUser(null);
    setShowLoginOptions(false);
    toast.success("Signed out successfully!");
    
    // Load face API after signing out
    const loadFaceAPI = async () => {
      console.log('Initializing face recognition models for login...');
      const loaded = await initializeFaceAPI();
      setFaceAPILoaded(loaded);
      if (!loaded) {
        toast.error("Failed to load face recognition models. Please refresh the page.");
      }
    };
    loadFaceAPI();
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const handleImagesCapture = async (images: string[]) => {
    if (!faceAPILoaded) {
      toast.error("Face recognition is still loading. Please wait.");
      return;
    }

    console.log('Starting enhanced face verification process...');
    setIsScanning(true);
    
    try {
      // Analyze face quality first
      const faceAnalysis = await analyzeFaceQuality(images[0]);
      
      if (!faceAnalysis) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No face detected in the captured image. Please try again.");
        return;
      }

      // Check quality threshold
      if (faceAnalysis.qualityScore < 0.4) {
        console.log(`Low quality face detected: ${faceAnalysis.qualityScore.toFixed(3)}`);
        toast.warning("Face quality is low. Please ensure good lighting and face the camera directly.");
      }

      console.log('Face analysis complete, comparing with registered users...');
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
      let bestMatch = { user: '', similarity: 0, profile: null as any };
      
      for (const profile of userProfiles) {
        console.log(`Comparing with user: ${profile.email}`);
        const storedEmbedding = new Float32Array(profile.face_embedding);
        
        const matchResult = enhancedFaceMatch(
          faceAnalysis.descriptor, 
          storedEmbedding, 
          profile.recognition_threshold || 0.6,
          faceAnalysis.qualityScore
        );
        
        if (matchResult.similarity > bestMatch.similarity) {
          bestMatch = { user: profile.email, similarity: matchResult.similarity, profile };
        }
        
        if (matchResult.isMatch) {
          foundMatch = true;
          setMatchedUser(profile.email);
          console.log(`Match found! User: ${profile.email}, Similarity: ${matchResult.similarity.toFixed(3)}`);
          
          // Store the login scan
          try {
            const imageBlob = base64ToBlob(images[0]);
            const imageUrl = await uploadFaceImage(imageBlob, profile.email, 'login');
            
            if (imageUrl) {
              await createFaceScan(
                profile.email,
                imageUrl,
                faceAnalysis.descriptor,
                'login',
                faceAnalysis.confidence,
                faceAnalysis.qualityScore
              );
              
              // Update user embedding with new scan (learning)
              await updateUserEmbeddingWithScan(
                profile.email,
                faceAnalysis.descriptor,
                faceAnalysis.qualityScore
              );
              
              // Update login statistics
              await updateUserProfile(profile.id, {
                total_logins: (profile.total_logins || 0) + 1,
                successful_logins: (profile.successful_logins || 0) + 1,
                last_updated: new Date().toISOString()
              });
            }
          } catch (storageError) {
            console.error('Error storing login scan:', storageError);
            // Don't fail login if storage fails
          }
          
          localStorage.setItem('currentUserName', profile.email);
          
          // Log the successful sign-in
          await createSignInLog(profile.email);
          
          break;
        }
      }

      setIsScanning(false);
      setScanComplete(true);
      
      if (foundMatch) {
        setLoginResult('success');
        toast.success(`Welcome back, ${matchedUser}! Face recognition improved with this login.`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setLoginResult('failed');
        console.log(`No matching face found. Best similarity: ${bestMatch.similarity.toFixed(3)} with ${bestMatch.user}`);
        
        // Update failed login statistics for best match if similarity is reasonable
        if (bestMatch.similarity > 0.4 && bestMatch.profile) {
          try {
            await updateUserProfile(bestMatch.profile.id, {
              total_logins: (bestMatch.profile.total_logins || 0) + 1
            });
          } catch (error) {
            console.error('Error updating failed login stats:', error);
          }
        }
        
        toast.error("Face not recognized. Please try again or register a new Face Card.");
      }
    } catch (error) {
      console.error('Enhanced login error:', error);
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
    <div className="min-h-screen bg-black text-white">
      <LoginHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {showLoginOptions && currentUser && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <CardTitle className="text-3xl text-white">Already Signed In</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  You are currently signed in as {currentUser}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-white font-semibold">Current Session Active</p>
                  <p className="text-gray-300 mt-2">Welcome back, {currentUser}!</p>
                  <p className="text-gray-400 text-sm mt-1">You can continue to your dashboard or sign in as a different user</p>
                </div>
                
                <div className="space-y-4">
                  <Button onClick={goToDashboard} className="w-full bg-white text-black hover:bg-gray-200">
                    Continue to Dashboard
                  </Button>
                  <Button onClick={handleSignOut} variant="outline" className="w-full border-white hover:bg-white text-gray-900">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out & Login as Different User
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!showLoginOptions && !faceAPILoaded && (
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="text-center py-8">
                <Loader2 className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
                <p className="text-white">Loading face recognition models...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment on first load</p>
              </CardContent>
            </Card>
          )}

          {!showLoginOptions && !scanComplete && faceAPILoaded && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-white flex items-center justify-center">
                  <Square className="mr-3 h-8 w-8 text-white" />
                  Enhanced Face Card Login
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Position your face in the camera frame to sign in. Your face data will be improved with each login.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isScanning ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-16 w-16 text-white mx-auto mb-6 animate-spin" />
                    <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Face...</h3>
                    <p className="text-gray-400">Please hold still while we verify your identity and improve recognition</p>
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

          {!showLoginOptions && scanComplete && loginResult === 'success' && (
            <LoginSuccess 
              matchedUser={matchedUser}
              onContinue={goToDashboard}
              onSignInAgain={resetLogin}
            />
          )}

          {!showLoginOptions && scanComplete && loginResult === 'failed' && (
            <LoginFailed onTryAgain={resetLogin} />
          )}

          {!showLoginOptions && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
