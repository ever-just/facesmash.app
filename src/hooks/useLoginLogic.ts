
import * as Sentry from '@sentry/react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, type FaceAnalysis } from "@/utils/enhancedFaceRecognition";
import { checkRateLimit, recordLoginAttempt } from "@/utils/livenessDetection";
import { api } from "@/integrations/api/client";
import { type ReadyDescriptor } from "@/hooks/useFaceTracking";
import {
  resetMetrics,
  resetLoginMetrics,
  markApiResponse,
  markLoginComplete,
  logMetricsSummary,
} from "@/utils/performanceMetrics";

const LOGIN_TIMEOUT_MS = 30000; // 30 second timeout for the entire login process

export const useLoginLogic = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loginResult, setLoginResult] = useState<'success' | 'failed' | null>(null);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const { isLoaded } = useFaceAPI();

  // ── Fast path: handle pre-computed descriptor from tracking (Phase 2) ──
  // When the tracking loop has already extracted a high-quality descriptor,
  // we skip the entire analyzeFaceQuality pipeline and go straight to the API.
  const handleReadyDescriptorCapture = async (ready: ReadyDescriptor) => {
    if (!isLoaded) {
      console.error("Face recognition not loaded");
      return;
    }

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast.error(`Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds.`);
      return;
    }

    resetLoginMetrics(); // preserve tracking milestones (cameraReady, livenessPass, descriptorReady)
    setIsScanning(true);
    const timeoutId = setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setLoginResult('failed');
      toast.error("Login timed out. Please try again.");
    }, LOGIN_TIMEOUT_MS);

    try {
      console.log(`[Fast path] Using pre-computed descriptor (score=${ready.qualityScore.toFixed(3)}, age=${Date.now() - ready.timestamp}ms)`);

      const embeddingArray = Array.from(ready.descriptor);
      const loginRes = await api.login({
        embedding: embeddingArray,
        qualityScore: ready.qualityScore,
        livenessConfidence: ready.livenessConfidence, // actual liveness confidence from tracking
      });

      markApiResponse();
      clearTimeout(timeoutId);
      setIsScanning(false);
      setScanComplete(true);

      if (loginRes.ok && loginRes.data.match && loginRes.data.user) {
        const matchedEmail = loginRes.data.user.email;
        setMatchedUser(matchedEmail);
        setLoginResult('success');
        recordLoginAttempt(true);
        localStorage.setItem('currentUserName', matchedEmail);
        toast.success(`Welcome back, ${matchedEmail.split('@')[0]}!`);
        console.log(`[Fast path] Server-side match: ${matchedEmail}, similarity=${loginRes.data.bestSimilarity?.toFixed(3)}`);
      } else {
        setLoginResult('failed');
        recordLoginAttempt(false);
        if (loginRes.data.bestSimilarity && loginRes.data.bestSimilarity > 0.4) {
          toast.error("Face partially matched but didn't meet security threshold. Try better lighting or face the camera directly.");
        } else {
          toast.error("Face not recognized. Please try again or register a new FaceSmash profile.");
        }
      }

      markLoginComplete();
      logMetricsSummary();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Fast path] Login error:', error);
      Sentry.captureException(error, {
        tags: { component: 'useLoginLogic', action: 'fast-path-login' },
        extra: { qualityScore: ready.qualityScore, descriptorAge: Date.now() - ready.timestamp },
      });
      setIsScanning(false);
      setScanComplete(true);
      setLoginResult('failed');
      recordLoginAttempt(false);
      toast.error("An error occurred during face recognition. Please try again.");
    }
  };

  // ── Fallback path: handle traditional image capture ──
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

    resetMetrics();
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
      const embeddingArray = Array.from(faceAnalysis.descriptor);
      
      const loginRes = await api.login({
        embedding: embeddingArray,
        qualityScore: faceAnalysis.qualityScore,
        livenessConfidence: faceAnalysis.eyeAspectRatio,
      });

      markApiResponse();
      clearTimeout(timeoutId);
      setIsScanning(false);
      setScanComplete(true);

      if (loginRes.ok && loginRes.data.match && loginRes.data.user) {
        const matchedEmail = loginRes.data.user.email;
        setMatchedUser(matchedEmail);
        setLoginResult('success');
        recordLoginAttempt(true);
        localStorage.setItem('currentUserName', matchedEmail);
        toast.success(`Welcome back, ${matchedEmail.split('@')[0]}!`);
        console.log(`Server-side match: ${matchedEmail}, similarity=${loginRes.data.bestSimilarity?.toFixed(3)}`);
      } else {
        setLoginResult('failed');
        recordLoginAttempt(false);
        if (loginRes.data.bestSimilarity && loginRes.data.bestSimilarity > 0.4) {
          toast.error("Face partially matched but didn't meet security threshold. Try better lighting or face the camera directly.");
        } else {
          toast.error("Face not recognized. Please try again or register a new FaceSmash profile.");
        }
      }

      markLoginComplete();
      logMetricsSummary();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Login error:', error);
      Sentry.captureException(error, {
        tags: { component: 'useLoginLogic', action: 'fallback-login' },
        extra: { imageCount: images.length },
      });
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
    handleReadyDescriptorCapture,
    resetLogin,
    goToDashboard
  };
};
