import * as faceapi from 'face-api.js';
import { calculateSimilarity } from './faceRecognition';
import {
  estimateHeadPose,
  validateFaceSize,
  getEyeAspectRatios,
  normalizeDescriptor,
  type HeadPose,
  type FaceSizeCheck,
} from './livenessDetection';

export interface FaceAnalysis {
  descriptor: Float32Array;
  normalizedDescriptor: Float32Array;
  confidence: number;
  qualityScore: number;
  boundingBox: faceapi.Box;
  landmarks: faceapi.FaceLandmarks68;
  lightingScore: number;
  environmentalConditions: any;
  headPose: HeadPose;
  faceSizeCheck: FaceSizeCheck;
  eyeAspectRatio: number;
  rejectionReason?: string;
}

export interface LightingAnalysis {
  score: number;
  brightness: number;
  contrast: number;
  evenness: number;
  conditions: {
    tooDark: boolean;
    tooBright: boolean;
    uneven: boolean;
    optimal: boolean;
  };
}

// Analyze lighting conditions from face detection
export const analyzeLightingConditions = (
  detection: faceapi.WithFaceLandmarks<faceapi.WithFaceDescriptor<faceapi.WithFaceDetection<{ detection: faceapi.FaceDetection }>>>,
  imageElement: HTMLImageElement | HTMLCanvasElement
): LightingAnalysis => {
  try {
    // Create canvas to analyze pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    canvas.width = imageElement.width || 640;
    canvas.height = imageElement.height || 640;
    
    if (imageElement instanceof HTMLImageElement) {
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(imageElement, 0, 0);
    }

    // Get face region
    const faceBox = detection.detection.box;
    const faceImageData = ctx.getImageData(
      Math.max(0, faceBox.x - 20),
      Math.max(0, faceBox.y - 20),
      Math.min(canvas.width - faceBox.x, faceBox.width + 40),
      Math.min(canvas.height - faceBox.y, faceBox.height + 40)
    );

    // Calculate brightness and contrast
    const pixels = faceImageData.data;
    let totalBrightness = 0;
    let brightnessValues = [];

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      brightnessValues.push(brightness);
    }

    const avgBrightness = totalBrightness / (pixels.length / 4);
    
    // Calculate contrast (standard deviation of brightness)
    const variance = brightnessValues.reduce((acc, val) => acc + Math.pow(val - avgBrightness, 2), 0) / brightnessValues.length;
    const contrast = Math.sqrt(variance);

    // Calculate evenness (how uniform the lighting is)
    const evenness = Math.max(0, 1 - (contrast / 128)); // Normalize to 0-1

    // Determine lighting conditions
    const tooDark = avgBrightness < 80;
    const tooBright = avgBrightness > 200;
    const uneven = evenness < 0.6;
    const optimal = !tooDark && !tooBright && !uneven;

    // Calculate overall lighting score
    let score = 0.5; // Base score
    
    if (optimal) score = 0.9;
    else if (tooDark) score = Math.max(0.2, avgBrightness / 160);
    else if (tooBright) score = Math.max(0.2, (255 - avgBrightness) / 110);
    else if (uneven) score = Math.max(0.3, evenness);

    return {
      score,
      brightness: avgBrightness / 255,
      contrast: Math.min(contrast / 64, 1),
      evenness,
      conditions: {
        tooDark,
        tooBright,
        uneven,
        optimal
      }
    };
  } catch (error) {
    console.error('Error analyzing lighting:', error);
    return {
      score: 0.5,
      brightness: 0.5,
      contrast: 0.5,
      evenness: 0.5,
      conditions: {
        tooDark: false,
        tooBright: false,
        uneven: false,
        optimal: false
      }
    };
  }
};

// Enhanced face analysis with better error handling and reliability
export const analyzeFaceQuality = async (imageData: string): Promise<FaceAnalysis | null> => {
  try {
    console.log('Analyzing face quality with enhanced detection...');
    const img = await faceapi.fetchImage(imageData);
    
    // Try multiple detection options for better reliability
    let detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    // Fallback to more sensitive detection if first attempt fails
    if (!detection) {
      console.log('Retrying with more sensitive detection...');
      detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.2 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    }
    
    if (!detection) {
      console.log('No face detected in image after retries');
      return null;
    }

    // ── Head pose validation ──
    const headPose = estimateHeadPose(detection.landmarks, detection.detection.box);
    if (!headPose.isFrontal) {
      console.log(`Face not frontal: yaw=${headPose.yaw.toFixed(2)}, pitch=${headPose.pitch.toFixed(2)}, roll=${headPose.roll.toFixed(2)}`);
      // Don't hard-reject, but penalize quality score below
    }

    // ── Face size validation ──
    const imgWidth = img.width || 640;
    const imgHeight = img.height || 480;
    const faceSizeCheck = validateFaceSize(detection.detection.box, imgWidth, imgHeight);
    if (!faceSizeCheck.isValid) {
      console.log(`Face size invalid: ${faceSizeCheck.reason} (ratio: ${faceSizeCheck.ratio.toFixed(3)})`);
      // Return with rejection reason so caller can show appropriate message
      return {
        descriptor: detection.descriptor,
        normalizedDescriptor: normalizeDescriptor(detection.descriptor),
        confidence: detection.detection.score,
        qualityScore: 0,
        boundingBox: detection.detection.box,
        landmarks: detection.landmarks,
        lightingScore: 0,
        environmentalConditions: {},
        headPose,
        faceSizeCheck,
        eyeAspectRatio: 0,
        rejectionReason: faceSizeCheck.reason,
      };
    }

    // ── Eye Aspect Ratio ──
    const { avgEAR } = getEyeAspectRatios(detection.landmarks);

    // Analyze lighting conditions with better error handling
    let lightingAnalysis;
    try {
      lightingAnalysis = analyzeLightingConditions(detection, img);
    } catch (lightingError) {
      console.warn('Lighting analysis failed, using default values:', lightingError);
      lightingAnalysis = {
        score: 0.5,
        brightness: 0.5,
        contrast: 0.5,
        evenness: 0.5,
        conditions: { tooDark: false, tooBright: false, uneven: false, optimal: false }
      };
    }

    // Calculate enhanced quality score
    let qualityScore = Math.min(detection.detection.score, 1.0);
    
    // Adjust quality based on lighting
    qualityScore = qualityScore * (0.7 + lightingAnalysis.score * 0.3);

    // Face size factor (larger faces generally better)
    const faceArea = detection.detection.box.width * detection.detection.box.height;
    const imageArea = 640 * 640;
    const sizeRatio = Math.min(faceArea / imageArea, 0.3) / 0.3;
    qualityScore = qualityScore * (0.8 + sizeRatio * 0.2);

    // Penalize non-frontal faces
    if (!headPose.isFrontal) {
      const anglePenalty = Math.max(0.5, 1 - (Math.abs(headPose.yaw) + Math.abs(headPose.pitch)) * 0.3);
      qualityScore *= anglePenalty;
    }

    // Ensure quality score is in valid range
    qualityScore = Math.max(0, Math.min(1, qualityScore));

    const normalizedDesc = normalizeDescriptor(detection.descriptor);

    console.log(`Enhanced face quality: ${qualityScore.toFixed(3)}, lighting: ${lightingAnalysis.score.toFixed(3)}, EAR: ${avgEAR.toFixed(3)}, frontal: ${headPose.isFrontal}`);

    return {
      descriptor: detection.descriptor,
      normalizedDescriptor: normalizedDesc,
      confidence: detection.detection.score,
      qualityScore,
      boundingBox: detection.detection.box,
      landmarks: detection.landmarks,
      lightingScore: lightingAnalysis.score,
      environmentalConditions: {
        lighting: lightingAnalysis.conditions,
        brightness: lightingAnalysis.brightness,
        contrast: lightingAnalysis.contrast,
        evenness: lightingAnalysis.evenness
      },
      headPose,
      faceSizeCheck,
      eyeAspectRatio: avgEAR,
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

// Enhanced matching with adaptive threshold and multiple templates
export const enhancedFaceMatch = (
  descriptor1: Float32Array, 
  descriptor2: Float32Array, 
  userThreshold: number = 0.6,
  confidenceBoost: number = 0,
  lightingScore: number = 0.5
): { isMatch: boolean; similarity: number; adaptedThreshold: number } => {
  const similarity = 1 - faceapi.euclideanDistance(descriptor1, descriptor2);
  
  // Adaptive threshold based on user experience and lighting
  let adaptedThreshold = userThreshold;
  
  // Adjust for lighting conditions
  if (lightingScore < 0.4) {
    adaptedThreshold = Math.max(0.4, adaptedThreshold - 0.05); // More lenient in poor lighting
  } else if (lightingScore > 0.8) {
    adaptedThreshold = Math.min(0.7, adaptedThreshold + 0.02); // Slightly stricter in good lighting
  }
  
  // Apply confidence boost for experienced users
  adaptedThreshold = Math.max(0.4, adaptedThreshold - (confidenceBoost * 0.05));
  
  const isMatch = similarity >= adaptedThreshold;
  
  console.log(`Enhanced face match: similarity=${similarity.toFixed(3)}, threshold=${adaptedThreshold.toFixed(3)}, lighting=${lightingScore.toFixed(3)}, match=${isMatch}`);
  
  return {
    isMatch,
    similarity,
    adaptedThreshold
  };
};

// Multi-template matching for better accuracy
export const multiTemplateMatch = (
  newDescriptor: Float32Array,
  templates: { descriptor: Float32Array; quality: number; weight: number }[],
  baseThreshold: number,
  lightingScore: number = 0.5
): { isMatch: boolean; bestSimilarity: number; avgSimilarity: number; matchCount: number } => {
  if (templates.length === 0) {
    return { isMatch: false, bestSimilarity: 0, avgSimilarity: 0, matchCount: 0 };
  }

  let bestSimilarity = 0;
  let weightedSimilaritySum = 0;
  let totalWeight = 0;
  let matchCount = 0;

  for (const template of templates) {
    const matchResult = enhancedFaceMatch(
      newDescriptor,
      template.descriptor,
      baseThreshold,
      template.weight,
      lightingScore
    );

    if (matchResult.similarity > bestSimilarity) {
      bestSimilarity = matchResult.similarity;
    }

    const templateWeight = template.quality * template.weight;
    weightedSimilaritySum += matchResult.similarity * templateWeight;
    totalWeight += templateWeight;

    if (matchResult.isMatch) {
      matchCount++;
    }
  }

  const avgSimilarity = totalWeight > 0 ? weightedSimilaritySum / totalWeight : 0;
  
  // Match if either best similarity is high enough OR majority of templates match
  const isMatch = bestSimilarity >= baseThreshold || (matchCount / templates.length) >= 0.6;

  console.log(`Multi-template match: best=${bestSimilarity.toFixed(3)}, avg=${avgSimilarity.toFixed(3)}, matches=${matchCount}/${templates.length}, result=${isMatch}`);

  return {
    isMatch,
    bestSimilarity,
    avgSimilarity,
    matchCount
  };
};

// Check for duplicate registrations
export const checkForDuplicateRegistration = async (
  faceDescriptor: Float32Array,
  threshold: number = 0.75
): Promise<{ isDuplicate: boolean; similarUsers: any[]; bestMatch?: any }> => {
  try {
    // This would typically call the database function
    console.log('Checking for duplicate registration with threshold:', threshold);
    
    // For now, return no duplicates - this will be implemented with the database function
    return {
      isDuplicate: false,
      similarUsers: [],
      bestMatch: null
    };
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return {
      isDuplicate: false,
      similarUsers: [],
      bestMatch: null
    };
  }
};

// Get learning weight based on quality and conditions
export const calculateLearningWeight = (
  qualityScore: number,
  lightingScore: number,
  confidence: number
): number => {
  let weight = 1.0;

  // Quality factor (high quality gets more weight)
  if (qualityScore > 0.8) weight *= 1.5;
  else if (qualityScore > 0.6) weight *= 1.2;
  else if (qualityScore < 0.4) weight *= 0.5;

  // Lighting factor
  if (lightingScore > 0.7) weight *= 1.3;
  else if (lightingScore < 0.4) weight *= 0.7;

  // Confidence factor
  if (confidence > 0.8) weight *= 1.2;
  else if (confidence < 0.5) weight *= 0.8;

  return Math.max(0.1, Math.min(weight, 3.0)); // Clamp between 0.1 and 3.0
};
