
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, type FaceAnalysis } from "@/utils/enhancedFaceRecognition";
import { checkRateLimit, recordLoginAttempt } from "@/utils/livenessDetection";
import { api } from "@/integrations/api/client";

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

      for (let i = 0; i < images.length; i++) {
        const analysis = await analyzeFaceQuality(images[i]);
        if (analysis && !analysis.rejectionReason) {
          if (!bestAnalysis || analysis.qualityScore > bestAnalysis.qualityScore) {
            bestAnalysis = analysis;
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

      console.log(`Best login image — Quality: ${faceAnalysis.qualityScore.toFixed(3)}, Lighting: ${faceAnalysis.lightingScore.toFixed(3)}, Frontal: ${faceAnalysis.headPose.isFrontal}`);

      // ── SERVER-SIDE FACE MATCHING ──
      // Instead of fetching all profiles and looping client-side,
      // we send the embedding to the server which does pgvector matching in one SQL query.
      const embeddingArray = Array.from(faceAnalysis.descriptor);
      
      const loginRes = await api.login({
        embedding: embeddingArray,
        qualityScore: faceAnalysis.qualityScore,
        livenessConfidence: faceAnalysis.eyeAspectRatio, // liveness signal
      });

      clearTimeout(timeoutId);
      setIsScanning(false);
      setScanComplete(true);

      if (loginRes.ok && loginRes.data.match && loginRes.data.user) {
        const matchedEmail = loginRes.data.user.email;
        setMatchedUser(matchedEmail);
        setLoginResult('success');
        recordLoginAttempt(true);

        // Store user in localStorage as fallback display name
        // (auth is actually via httpOnly cookie set by the server)
        localStorage.setItem('currentUserName', matchedEmail);
        
        toast.success(`Welcome back, ${matchedEmail.split('@')[0]}!`);
        console.log(`Server-side match: ${matchedEmail}, similarity=${loginRes.data.bestSimilarity?.toFixed(3)}`);
      } else {
        setLoginResult('failed');
        recordLoginAttempt(false);
        
        // Provide specific failure messages
        if (loginRes.data.bestSimilarity && loginRes.data.bestSimilarity > 0.4) {
          toast.error("Face partially matched but didn't meet security threshold. Try better lighting or face the camera directly.");
        } else {
          toast.error("Face not recognized. Please try again or register a new FaceSmash profile.");
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Login error:', error);
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
