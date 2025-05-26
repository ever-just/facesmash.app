
import * as faceapi from 'face-api.js';

// Initialize face-api.js models
export const initializeFaceAPI = async () => {
  const MODEL_URL = '/models';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    console.log('Face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load face-api.js models:', error);
    return false;
  }
};

// Extract face descriptor from image
export const extractFaceDescriptor = async (imageData: string): Promise<Float32Array | null> => {
  try {
    const img = await faceapi.fetchImage(imageData);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (detection) {
      return detection.descriptor;
    }
    return null;
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    return null;
  }
};

// Calculate similarity between two face descriptors
export const calculateSimilarity = (descriptor1: Float32Array, descriptor2: Float32Array): number => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return 1 - distance; // Convert distance to similarity (higher = more similar)
};

// Check if two faces match (similarity threshold)
export const facesMatch = (descriptor1: Float32Array, descriptor2: Float32Array, threshold: number = 0.6): boolean => {
  const similarity = calculateSimilarity(descriptor1, descriptor2);
  return similarity >= threshold;
};

// Process multiple images and get average descriptor
export const processMultipleImages = async (images: string[]): Promise<Float32Array | null> => {
  const descriptors: Float32Array[] = [];
  
  for (const image of images) {
    const descriptor = await extractFaceDescriptor(image);
    if (descriptor) {
      descriptors.push(descriptor);
    }
  }
  
  if (descriptors.length === 0) {
    return null;
  }
  
  // Average the descriptors for better accuracy
  const avgDescriptor = new Float32Array(descriptors[0].length);
  for (let i = 0; i < avgDescriptor.length; i++) {
    let sum = 0;
    for (const descriptor of descriptors) {
      sum += descriptor[i];
    }
    avgDescriptor[i] = sum / descriptors.length;
  }
  
  return avgDescriptor;
};
