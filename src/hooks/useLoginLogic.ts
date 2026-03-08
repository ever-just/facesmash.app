
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
      if (faceAnalysis.qualityScore < 0.05) {
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
      
      console.log(`Matching against ${userProfiles.length} registered user(s)...`);
      
      for (const profile of userProfiles) {
        const learningStats = await getUserLearningStats(profile.email);
        const baseThreshold = learningStats?.currentThreshold || 0.45;
        const confidenceBoost = learningStats ? getConfidenceBoost(
          learningStats.successfulLogins,
          learningStats.successRate,
          learningStats.avgQualityScore
        ) : 0;
        
        // Always try profile embedding first (most reliable baseline)
        const storedEmbedding = new Float32Array(profile.face_embedding);
        let matchResult = enhancedFaceMatch(
          faceAnalysis.descriptor, 
          storedEmbedding, 
          baseThreshold,
          confidenceBoost,
          faceAnalysis.lightingScore
        );
        console.log(`  ${profile.email}: profile match sim=${matchResult.similarity.toFixed(3)}, threshold=${matchResult.adaptedThreshold.toFixed(3)}`);
        
        // Also try template matching if templates exist (may improve result)
        try {
          const templates = await getFaceTemplates(profile.email);
          if (templates.length > 0) {
            const templateData = templates
              .filter(t => t.face_embedding && t.face_embedding.length > 0)
              .map(t => ({
                descriptor: new Float32Array(t.face_embedding),
                quality: t.quality_score || 0.5,
                weight: confidenceBoost + 1
              }));
            
            if (templateData.length > 0) {
              const multiMatch = multiTemplateMatch(
                faceAnalysis.descriptor,
                templateData,
                baseThreshold,
                faceAnalysis.lightingScore
              );
              console.log(`  ${profile.email}: template match best=${multiMatch.bestSimilarity.toFixed(3)}, matches=${multiMatch.matchCount}/${templateData.length}`);
              
              // Use template result if it's better
              if (multiMatch.bestSimilarity > matchResult.similarity) {
                matchResult = {
                  isMatch: multiMatch.isMatch,
                  similarity: multiMatch.bestSimilarity,
                  adaptedThreshold: baseThreshold
                };
              }
            }
          }
        } catch (templateError) {
          console.warn(`Template matching failed for ${profile.email}, using profile embedding:`, templateError);
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
          
          // Fire-and-forget: post-match bookkeeping runs in background
          // (non-blocking so the UI can respond immediately)
          const bookkeepingEmail = profile.email;
          const bookkeepingDescriptor = faceAnalysis.descriptor;
          const bookkeepingQuality = faceAnalysis.qualityScore;
          const bookkeepingConfidence = faceAnalysis.confidence;
          const bookkeepingConditions = faceAnalysis.environmentalConditions;
          const bookkeepingImageIndex = bestImageIndex;
          
          (async () => {
            try {
              const imageBlob = base64ToBlob(images[bookkeepingImageIndex]);
              const imageFile = await prepareImageFile(imageBlob, 'login');
              
              await createFaceScan(
                bookkeepingEmail,
                bookkeepingDescriptor,
                'login',
                bookkeepingConfidence,
                bookkeepingQuality,
                imageFile
              );
              
              await updateUserEmbeddingWithScan(
                bookkeepingEmail,
                bookkeepingDescriptor,
                learningWeight
              );
              
              if (bookkeepingQuality > 0.6) {
                await manageFaceTemplates(
                  bookkeepingEmail,
                  bookkeepingDescriptor,
                  bookkeepingQuality,
                  bookkeepingConfidence,
                  bookkeepingConditions
                );
              }
              
              await updateUserLearningMetrics(
                bookkeepingEmail,
                true,
                bookkeepingConfidence,
                bookkeepingQuality
              );
              
              console.log(`Enhanced learning applied - Weight: ${learningWeight.toFixed(2)}, Quality: ${bookkeepingQuality.toFixed(3)}`);
            } catch (storageError) {
              console.error('Error storing login scan:', storageError);
            }
          })();
          
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
        toast.success(`Welcome back, ${bestMatch.profile?.email?.split('@')[0] || bestMatch.user}!`);
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
