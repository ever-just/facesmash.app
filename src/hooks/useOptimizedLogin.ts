
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { quickQualityScore, parallelUserMatching } from "@/utils/optimizedMatching";
import { backgroundProcessor } from "@/utils/backgroundAnalysis";
import { getAllUserProfiles } from "@/services/userProfileService";
import { createSignInLog } from "@/services/signInLogService";
import { uploadFaceImage, createFaceScan } from "@/services/faceScanService";
import * as faceapi from 'face-api.js';

export const useOptimizedLogin = () => {
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

    setIsScanning(true);
    
    try {
      console.log('Starting optimized face analysis...');
      
      // Step 1: Quick face detection and descriptor extraction
      const img = await faceapi.fetchImage(images[0]);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        console.log("No face detected in image");
        return;
      }

      // Step 2: Quick quality assessment (simplified)
      const quickQuality = quickQualityScore(detection.descriptor);
      console.log(`Quick quality assessment: ${quickQuality.toFixed(3)}`);

      // Step 3: Get user profiles and perform parallel matching
      const userProfiles = await getAllUserProfiles();
      
      if (userProfiles.length === 0) {
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        console.log("No registered users found");
        return;
      }
      
      // Step 4: Fast parallel matching
      const matchResult = await parallelUserMatching(
        detection.descriptor,
        userProfiles,
        quickQuality
      );
      
      setIsScanning(false);
      setScanComplete(true);
      
      if (matchResult.isMatch && matchResult.matchedUser) {
        // Success - immediate response
        setLoginResult('success');
        setMatchedUser(matchResult.matchedUser);
        localStorage.setItem('currentUserName', matchResult.matchedUser);
        
        // Create sign-in log immediately
        await createSignInLog(matchResult.matchedUser);
        toast.success(`Welcome back, ${matchResult.matchedUser}!`);
        
        // Background tasks - detailed analysis and learning updates
        backgroundProcessor.addTask({
          type: 'detailed_analysis',
          data: { imageData: images[0], userEmail: matchResult.matchedUser },
          priority: 1
        });
        
        backgroundProcessor.addTask({
          type: 'learning_update',
          data: {
            userEmail: matchResult.matchedUser,
            success: true,
            confidence: matchResult.confidence,
            qualityScore: quickQuality
          },
          priority: 2
        });
        
        // Background image storage and template management
        try {
          const imageBlob = new Blob([await fetch(images[0]).then(r => r.arrayBuffer())], { type: 'image/jpeg' });
          const imageUrl = await uploadFaceImage(imageBlob, matchResult.matchedUser, 'login');
          
          if (imageUrl) {
            await createFaceScan(
              matchResult.matchedUser,
              imageUrl,
              detection.descriptor,
              'login',
              matchResult.confidence,
              quickQuality
            );
            
            // Background template management for high-quality scans
            if (quickQuality > 0.6) {
              backgroundProcessor.addTask({
                type: 'template_management',
                data: {
                  userEmail: matchResult.matchedUser,
                  descriptor: detection.descriptor,
                  qualityScore: quickQuality,
                  confidenceScore: matchResult.confidence,
                  lightingConditions: {}
                },
                priority: 3
              });
            }
          }
        } catch (storageError) {
          console.error('Background storage error:', storageError);
        }
        
      } else {
        // Failed match
        setLoginResult('failed');
        
        // Background learning update for failed attempts
        if (matchResult.similarity > 0.3) {
          const bestProfile = userProfiles.reduce((best, current) => 
            matchResult.similarity > 0.3 ? current : best
          );
          
          backgroundProcessor.addTask({
            type: 'learning_update',
            data: {
              userEmail: bestProfile.email,
              success: false,
              confidence: matchResult.confidence,
              qualityScore: quickQuality
            },
            priority: 2
          });
        }
        
        toast.error("Face not recognized. Please try again or register a new Face Card.");
      }
      
    } catch (error) {
      console.error('Optimized login error:', error);
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
