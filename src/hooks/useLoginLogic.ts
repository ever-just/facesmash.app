
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, enhancedFaceMatch, base64ToBlob, multiTemplateMatch, calculateLearningWeight } from "@/utils/enhancedFaceRecognition";
import { getAllUserProfiles, updateUserProfile } from "@/services/userProfileService";
import { createSignInLog } from "@/services/signInLogService";
import { uploadFaceImage, createFaceScan, updateUserEmbeddingWithScan } from "@/services/faceScanService";
import { getFaceTemplates, manageFaceTemplates } from "@/services/faceTemplateService";
import { updateUserLearningMetrics, getUserLearningStats, getConfidenceBoost } from "@/services/learningService";

export const useLoginLogic = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const { isLoaded } = useFaceAPI();

  const handleImagesCapture = async (images: string[]) => {
    if (!isLoaded) {
      toast.error("Face recognition is still loading. Please wait.");
      return;
    }

    setIsScanning(true);
    setScanComplete(false);
    
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

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsScanning(false);
      setScanComplete(true);
      
      if (foundMatch) {
        setLoginResult('success');
        const qualityMsg = faceAnalysis.qualityScore > 0.7 ? " (High quality scan - learning enhanced!)" : "";
        toast.success(`Welcome back, ${matchedUser}!${qualityMsg}`);
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

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return {
    isScanning,
    scanComplete,
    loginResult,
    matchedUser,
    handleImagesCapture,
    resetLogin,
    goToDashboard
  };
};
