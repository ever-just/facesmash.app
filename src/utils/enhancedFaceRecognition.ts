
import * as faceapi from 'face-api.js';
import { calculateSimilarity } from './faceRecognition';

export interface FaceAnalysis {
  descriptor: Float32Array;
  confidence: number;
  qualityScore: number;
  boundingBox: faceapi.Box;
  landmarks: faceapi.FaceLandmarks68;
}

// Calculate face quality score based on various factors
export const calculateFaceQuality = (
  detection: faceapi.WithFaceLandmarks<faceapi.WithFaceDescriptor<faceapi.WithFaceDetection<{ detection: faceapi.FaceDetection }>>>
): number => {
  const faceDetection = detection.detection;
  const landmarks = detection.landmarks;
  let qualityScore = 0;

  // Factor 1: Detection confidence (0-40 points)
  const detectionScore = Math.min(faceDetection.score * 40, 40);
  qualityScore += detectionScore;

  // Factor 2: Face size relative to image (0-20 points)
  const faceArea = faceDetection.box.width * faceDetection.box.height;
  const imageArea = 640 * 640; // Assuming 640x640 capture
  const sizeRatio = faceArea / imageArea;
  const sizeScore = Math.min(sizeRatio * 100, 20); // Optimal around 20% of image
  qualityScore += sizeScore;

  // Factor 3: Face centering (0-15 points)
  const centerX = faceDetection.box.x + faceDetection.box.width / 2;
  const centerY = faceDetection.box.y + faceDetection.box.height / 2;
  const imageCenterX = 320;
  const imageCenterY = 320;
  const centerDistance = Math.sqrt(
    Math.pow(centerX - imageCenterX, 2) + Math.pow(centerY - imageCenterY, 2)
  );
  const maxDistance = Math.sqrt(Math.pow(320, 2) + Math.pow(320, 2));
  const centerScore = 15 * (1 - centerDistance / maxDistance);
  qualityScore += centerScore;

  // Factor 4: Landmark consistency (0-15 points)
  if (landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const mouth = landmarks.getMouth();

    // Check if all key landmarks are detected
    if (leftEye.length > 0 && rightEye.length > 0 && nose.length > 0 && mouth.length > 0) {
      qualityScore += 15;
    }
  }

  // Factor 5: Head pose estimation (0-10 points)
  // Simple pose check based on eye positions
  if (landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    if (leftEye.length > 0 && rightEye.length > 0) {
      const eyeDistance = Math.abs(leftEye[0].y - rightEye[3].y);
      const maxEyeDeviation = 20; // pixels
      const poseScore = 10 * Math.max(0, 1 - eyeDistance / maxEyeDeviation);
      qualityScore += poseScore;
    }
  }

  return Math.min(qualityScore, 100) / 100; // Normalize to 0-1
};

// Enhanced face analysis with quality scoring
export const analyzeFaceQuality = async (imageData: string): Promise<FaceAnalysis | null> => {
  try {
    console.log('Analyzing face quality...');
    const img = await faceapi.fetchImage(imageData);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      console.log('No face detected in image');
      return null;
    }

    // Simple quality calculation without the complex function for now
    const qualityScore = Math.min(detection.detection.score, 1.0);
    console.log(`Face quality score: ${qualityScore.toFixed(3)}`);

    return {
      descriptor: detection.descriptor,
      confidence: detection.detection.score,
      qualityScore,
      boundingBox: detection.detection.box,
      landmarks: detection.landmarks
    };
  } catch (error) {
    console.error('Error analyzing face quality:', error);
    return null;
  }
};

// Convert base64 image to blob for storage
export const base64ToBlob = (base64Data: string): Blob => {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
};

// Enhanced matching with adaptive threshold
export const enhancedFaceMatch = (
  descriptor1: Float32Array, 
  descriptor2: Float32Array, 
  baseThreshold: number = 0.6,
  confidenceBoost: number = 0
): { isMatch: boolean; similarity: number; adaptedThreshold: number } => {
  const similarity = 1 - faceapi.euclideanDistance(descriptor1, descriptor2);
  
  // Adapt threshold based on confidence and quality
  const adaptedThreshold = Math.max(0.4, baseThreshold - (confidenceBoost * 0.1));
  
  const isMatch = similarity >= adaptedThreshold;
  
  console.log(`Enhanced face match: similarity=${similarity.toFixed(3)}, threshold=${adaptedThreshold.toFixed(3)}, match=${isMatch}`);
  
  return {
    isMatch,
    similarity,
    adaptedThreshold
  };
};
