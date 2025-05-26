
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, ArrowLeft, CheckCircle, AlertCircle, Loader2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, enhancedFaceMatch, base64ToBlob, multiTemplateMatch, calculateLearningWeight } from "@/utils/enhancedFaceRecognition";
import { getAllUserProfiles, updateUserProfile } from "@/services/userProfileService";
import { createSignInLog } from "@/services/signInLogService";
import { uploadFaceImage, createFaceScan, updateUserEmbeddingWithScan } from "@/services/faceScanService";
import { getFaceTemplates, manageFaceTemplates } from "@/services/faceTemplateService";
import { updateUserLearningMetrics, getUserLearningStats, getConfidenceBoost } from "@/services/learningService";
import LoginHeader from "@/components/LoginHeader";
import LoginSuccess from "@/components/LoginSuccess";
import LoginFailed from "@/components/LoginFailed";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const { isLoaded, isLoading, error: faceAPIError } = useFaceAPI();

  useEffect(() => {
    // Check if user is already logged in
    const existingUser = localStorage.getItem('currentUserName');
    if (existingUser) {
      setCurrentUser(existingUser);
      setShowLoginOptions(true);
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('currentUserName');
    setCurrentUser(null);
    setShowLoginOptions(false);
    toast.success("Signed out successfully!");
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const handleImagesCapture = async (images: string[]) => {
    if (!isLoaded) {
      toast.error("Face recognition is still loading. Please wait.");
      return;
    }

    setIsScanning(true);
    
    try {
      // Enhanced face analysis with lighting detection
      const faceAnalysis = await analyzeFaceQuality(images[0]);
      
      if (!faceAnalysis) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No face detected. Please try again.");
        return;
      }

      // Provide lighting feedback
      if (faceAnalysis.lightingScore < 0.4) {
        const conditions = faceAnalysis.environmentalConditions.lighting;
        let lightingTip = "Poor lighting detected. ";
        if (conditions.tooDark) lightingTip += "Try moving to a brighter area.";
        else if (conditions.tooBright) lightingTip += "Try reducing the light or moving away from direct light.";
        else if (conditions.uneven) lightingTip += "Try to get more even lighting on your face.";
        
        toast.warning(lightingTip);
      }

      console.log(`Enhanced login analysis - Quality: ${faceAnalysis.qualityScore.toFixed(3)}, Lighting: ${faceAnalysis.lightingScore.toFixed(3)}`);

      const userProfiles = await getAllUserProfiles();
      
      if (userProfiles.length === 0) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No registered users found. Please register first.");
        return;
      }
      
      let foundMatch = false;
      let bestMatch = { user: '', similarity: 0, profile: null as any };
      
      for (const profile of userProfiles) {
        // Get user's face templates for multi-template matching
        const templates = await getFaceTemplates(profile.email);
        const learningStats = await getUserLearningStats(profile.email);
        
        let matchResult;
        
        if (templates.length > 0) {
          // Use multi-template matching for better accuracy
          const templateData = templates.map(t => ({
            descriptor: new Float32Array(t.face_embedding),
            quality: t.quality_score,
            weight: learningStats ? getConfidenceBoost(
              learningStats.successfulLogins,
              learningStats.successRate,
              learningStats.avgQualityScore
            ) + 1 : 1
          }));
          
          const multiMatch = multiTemplateMatch(
            faceAnalysis.descriptor,
            templateData,
            learningStats?.currentThreshold || 0.6,
            faceAnalysis.lightingScore
          );
          
          matchResult = {
            isMatch: multiMatch.isMatch,
            similarity: multiMatch.bestSimilarity,
            adaptedThreshold: learningStats?.currentThreshold || 0.6
          };
        } else {
          // Fallback to single embedding matching
          const storedEmbedding = new Float32Array(profile.face_embedding);
          const confidenceBoost = learningStats ? getConfidenceBoost(
            learningStats.successfulLogins,
            learningStats.successRate,
            learningStats.avgQualityScore
          ) : 0;
          
          matchResult = enhancedFaceMatch(
            faceAnalysis.descriptor, 
            storedEmbedding, 
            learningStats?.currentThreshold || 0.6,
            confidenceBoost,
            faceAnalysis.lightingScore
          );
        }
        
        if (matchResult.similarity > bestMatch.similarity) {
          bestMatch = { user: profile.email, similarity: matchResult.similarity, profile };
        }
        
        if (matchResult.isMatch) {
          foundMatch = true;
          setMatchedUser(profile.email);
          
          // Calculate learning weight for this login
          const learningWeight = calculateLearningWeight(
            faceAnalysis.qualityScore,
            faceAnalysis.lightingScore,
            faceAnalysis.confidence
          );
          
          // Store the enhanced login scan
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
              
              // Enhanced learning: Update user embedding and templates
              await updateUserEmbeddingWithScan(
                profile.email,
                faceAnalysis.descriptor,
                learningWeight
              );
              
              // Store new face template if quality is good
              if (faceAnalysis.qualityScore > 0.6) {
                await manageFaceTemplates(
                  profile.email,
                  faceAnalysis.descriptor,
                  faceAnalysis.qualityScore,
                  faceAnalysis.confidence,
                  faceAnalysis.environmentalConditions
                );
              }
              
              // Update learning metrics
              await updateUserLearningMetrics(
                profile.email,
                true,
                faceAnalysis.confidence,
                faceAnalysis.qualityScore
              );
              
              console.log(`Enhanced learning applied - Weight: ${learningWeight.toFixed(2)}, Quality: ${faceAnalysis.qualityScore.toFixed(3)}`);
            }
          } catch (storageError) {
            console.error('Error storing login scan:', storageError);
          }
          
          localStorage.setItem('currentUserName', profile.email);
          await createSignInLog(profile.email);
          
          break;
        }
      }

      setIsScanning(false);
      setScanComplete(true);
      
      if (foundMatch) {
        setLoginResult('success');
        const qualityMsg = faceAnalysis.qualityScore > 0.7 ? " (High quality scan - learning enhanced!)" : "";
        toast.success(`Welcome back, ${matchedUser}!${qualityMsg}`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setLoginResult('failed');
        
        // Update failed login statistics with enhanced feedback
        if (bestMatch.similarity > 0.3 && bestMatch.profile) {
          await updateUserLearningMetrics(
            bestMatch.profile.email,
            false,
            faceAnalysis.confidence,
            faceAnalysis.qualityScore
          );
          
          // Provide helpful feedback
          if (bestMatch.similarity > 0.5) {
            toast.error(`Close match found (${(bestMatch.similarity * 100).toFixed(0)}% similar). Try improving lighting or face positioning.`);
          } else if (faceAnalysis.lightingScore < 0.4) {
            toast.error("Face not recognized. Poor lighting may be affecting recognition quality.");
          } else {
            toast.error("Face not recognized. Please try again or register a new Face Card.");
          }
        } else {
          toast.error("Face not recognized. Please try again or register a new Face Card.");
        }
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

  // Show loading state only when Face API is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <LoginHeader />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <LoadingSkeleton variant="webcam" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <LoginHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <ErrorBoundary>
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

            {/* Face API Error State */}
            {faceAPIError && !showLoginOptions && (
              <Card className="bg-red-900/20 border-red-800 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <p>Face recognition failed to load. Please refresh the page to try again.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!showLoginOptions && !scanComplete && isLoaded && !faceAPIError && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-white flex items-center justify-center">
                    <Square className="mr-3 h-8 w-8 text-white" />
                    Enhanced Adaptive Face Login
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Advanced recognition that learns from each login and adapts to lighting conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isScanning ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-16 w-16 text-white mx-auto mb-6 animate-spin" />
                      <h3 className="text-xl font-semibold text-white mb-2">Analyzing with Enhanced AI...</h3>
                      <p className="text-gray-400">Checking face quality, lighting conditions, and matching against learned patterns</p>
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
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Login;
