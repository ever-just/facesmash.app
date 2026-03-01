
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, enhancedFaceMatch, base64ToBlob, multiTemplateMatch, calculateLearningWeight, type FaceAnalysis } from "@/utils/enhancedFaceRecognition";
import { getAllUserProfiles, updateUserProfile } from "@/services/userProfileService";
import { createSignInLog } from "@/services/signInLogService";
import { prepareImageFile, createFaceScan, updateUserEmbeddingWithScan } from "@/services/faceScanService";
import { getFaceTemplates, manageFaceTemplates } from "@/services/faceTemplateService";
import { updateUserLearningMetrics, getUserLearningStats, getConfidenceBoost } from "@/services/learningService";
import { checkRateLimit, recordLoginAttempt } from "@/utils/livenessDetection";

const LOGIN_TIMEOUT_MS = 30000; // 30 second timeout for the entire login process

export const useLoginLogic = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const { isLoaded } = useFaceAPI();

  const handleImagesCapture = async (images: string[]) => {
    if (!isLoaded) {
      console.error("Face recognition not loaded");
      return;
    }

    // ── Rate limiting ──
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast.error(`Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds.`);
      return;
    }

    setIsScanning(true);
    
    // ── Login timeout ──
    const timeoutId = setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setLoginResult('failed');
      toast.error("Login timed out. Please try again.");
    }, LOGIN_TIMEOUT_MS);
    
    try {
      // ── Analyze ALL captured images, pick the best one ──
      console.log(`Analyzing ${images.length} captured image(s) for login...`);
      let bestAnalysis: FaceAnalysis | null = null;
      let bestImageIndex = 0;

      for (let i = 0; i < images.length; i++) {
        const analysis = await analyzeFaceQuality(images[i]);
        if (analysis && !analysis.rejectionReason) {
          if (!bestAnalysis || analysis.qualityScore > bestAnalysis.qualityScore) {
            bestAnalysis = analysis;
            bestImageIndex = i;
          }
        }
      }

      const faceAnalysis = bestAnalysis;
      
      if (!faceAnalysis) {
        clearTimeout(timeoutId);
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        recordLoginAttempt(false);
        console.log("No face detected in any captured image");
        toast.error("No face detected. Please ensure your face is visible.");
        return;
      }

      // ── Check for rejection reasons (face too small/large) ──
      if (faceAnalysis.rejectionReason) {
        clearTimeout(timeoutId);
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error(faceAnalysis.rejectionReason);
        return;
      }

      // ── Quality gate: reject very low quality scans ──
      if (faceAnalysis.qualityScore < 0.2) {
        clearTimeout(timeoutId);
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("Face quality too low. Please improve lighting and face the camera directly.");
        return;
      }

      console.log(`Best login image: #${bestImageIndex + 1}/${images.length} — Quality: ${faceAnalysis.qualityScore.toFixed(3)}, Lighting: ${faceAnalysis.lightingScore.toFixed(3)}, Frontal: ${faceAnalysis.headPose.isFrontal}`);

      const userProfiles = await getAllUserProfiles();
      
      if (userProfiles.length === 0) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        console.log("No registered users found");
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
          
          // Store the enhanced login scan (image + embedding in one record)
          try {
            const imageBlob = base64ToBlob(images[bestImageIndex]);
            const imageFile = await prepareImageFile(imageBlob, 'login');
            
            await createFaceScan(
              profile.email,
              faceAnalysis.descriptor,
              'login',
              faceAnalysis.confidence,
              faceAnalysis.qualityScore,
              imageFile
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
          } catch (storageError) {
            console.error('Error storing login scan:', storageError);
          }
          
          localStorage.setItem('currentUserName', profile.email);
          await createSignInLog(profile.email);
          
          break;
        }
      }

      clearTimeout(timeoutId);
      setIsScanning(false);
      setScanComplete(true);
      
      if (foundMatch) {
        setLoginResult('success');
        recordLoginAttempt(true);
        toast.success(`Welcome back, ${matchedUser}!`);
      } else {
        setLoginResult('failed');
        recordLoginAttempt(false);
        
        // Update failed login statistics
        if (bestMatch.similarity > 0.3 && bestMatch.profile) {
          await updateUserLearningMetrics(
            bestMatch.profile.email,
            false,
            faceAnalysis.confidence,
            faceAnalysis.qualityScore
          );
        }
        
        // Provide more specific failure messages
        if (bestMatch.similarity > 0.4) {
          toast.error("Face partially matched but didn't meet security threshold. Try better lighting or face the camera directly.");
        } else {
          toast.error("Face not recognized. Please try again or register a new FaceSmash profile.");
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Enhanced login error:', error);
      setIsScanning(false);
      setScanComplete(true);
      setLoginResult('failed');
      recordLoginAttempt(false);
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
