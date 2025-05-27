
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
    console.log('🔄 handleImagesCapture called with', images.length, 'images');
    
    if (!isLoaded) {
      console.error("❌ Face recognition not loaded");
      toast.error("Face recognition models not loaded. Please wait and try again.");
      return;
    }

    if (!images || images.length === 0) {
      console.error("❌ No images provided");
      toast.error("No images captured. Please try again.");
      return;
    }

    console.log('✅ Starting face analysis...');
    setIsScanning(true);
    
    try {
      console.log('🔍 Step 1: Loading image and detecting face...');
      
      // Step 1: Quick face detection and descriptor extraction
      const img = await faceapi.fetchImage(images[0]);
      console.log('📷 Image loaded successfully');
      
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        console.log("❌ No face detected in image");
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No face detected in image. Please try again.");
        return;
      }

      console.log('✅ Face detected successfully with confidence:', detection.detection.score);

      // Step 2: Quick quality assessment (simplified)
      const quickQuality = quickQualityScore(detection.descriptor);
      console.log(`📊 Quick quality assessment: ${quickQuality.toFixed(3)}`);

      // Step 3: Get user profiles and perform parallel matching
      console.log('👥 Loading user profiles...');
      const userProfiles = await getAllUserProfiles();
      console.log(`📋 Found ${userProfiles.length} registered users`);
      
      if (userProfiles.length === 0) {
        console.log("❌ No registered users found");
        setIsScanning(false);
        setScanComplete(true);
        setLoginResult('failed');
        toast.error("No registered users found. Please register first.");
        return;
      }
      
      // Step 4: Fast parallel matching
      console.log('🔍 Starting parallel user matching...');
      const matchResult = await parallelUserMatching(
        detection.descriptor,
        userProfiles,
        quickQuality
      );
      
      console.log('🎯 Match result:', {
        isMatch: matchResult.isMatch,
        matchedUser: matchResult.matchedUser,
        confidence: matchResult.confidence,
        similarity: matchResult.similarity
      });
      
      setIsScanning(false);
      setScanComplete(true);
      
      if (matchResult.isMatch && matchResult.matchedUser) {
        // Success - immediate response
        console.log('✅ Login successful for user:', matchResult.matchedUser);
        setLoginResult('success');
        setMatchedUser(matchResult.matchedUser);
        localStorage.setItem('currentUserName', matchResult.matchedUser);
        
        // Create sign-in log immediately
        console.log('📝 Creating sign-in log...');
        await createSignInLog(matchResult.matchedUser);
        toast.success(`Welcome back, ${matchResult.matchedUser}!`);
        
        // Background tasks - detailed analysis and learning updates
        console.log('🔄 Scheduling background tasks...');
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
          console.log('💾 Storing image and creating face scan...');
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
          console.error('❌ Background storage error:', storageError);
        }
        
      } else {
        // Failed match
        console.log('❌ Login failed - face not recognized');
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
      console.error('❌ Optimized login error:', error);
      setIsScanning(false);
      setScanComplete(true);
      setLoginResult('failed');
      toast.error("An error occurred during face recognition. Please try again.");
    }
  };

  const resetLogin = () => {
    console.log('🔄 Resetting login state...');
    setIsScanning(false);
    setScanComplete(false);
    setLoginResult(null);
    setMatchedUser(null);
  };

  const goToDashboard = () => {
    console.log('🏠 Navigating to dashboard...');
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
