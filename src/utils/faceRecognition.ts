
import * as faceapi from 'face-api.js';

// Initialize face-api.js models
export const initializeFaceAPI = async () => {
  // Use CDN for easier setup - change back to '/models' when you have local models
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  
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
    console.log('Extracting face descriptor from image...');
    const img = await faceapi.fetchImage(imageData);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (detection) {
      console.log('Face descriptor extracted successfully');
      return detection.descriptor;
    }
    console.log('No face detected in image');
    return null;
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    return null;
  }
};

// Calculate similarity between two face descriptors
export const calculateSimilarity = (descriptor1: Float32Array, descriptor2: Float32Array): number => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  const similarity = 1 - distance; // Convert distance to similarity (higher = more similar)
  console.log(`Face similarity calculated: ${similarity.toFixed(3)} (distance: ${distance.toFixed(3)})`);
  return similarity;
};

// Check if two faces match (similarity threshold)
export const facesMatch = (descriptor1: Float32Array, descriptor2: Float32Array, threshold: number = 0.6): boolean => {
  const similarity = calculateSimilarity(descriptor1, descriptor2);
  const matches = similarity >= threshold;
  console.log(`Face match result: ${matches} (similarity: ${similarity.toFixed(3)}, threshold: ${threshold})`);
  return matches;
};

// Process single or multiple images and get face descriptor
export const processMultipleImages = async (images: string[]): Promise<Float32Array | null> => {
  console.log(`Processing ${images.length} image(s) for face recognition...`);
  
  if (images.length === 1) {
    // Single image - just extract descriptor directly
    console.log('Processing single image');
    return await extractFaceDescriptor(images[0]);
  }
  
  // Multiple images - extract descriptors and average them
  const descriptors: Float32Array[] = [];
  
  for (let i = 0; i < images.length; i++) {
    console.log(`Processing image ${i + 1}/${images.length}`);
    const descriptor = await extractFaceDescriptor(images[i]);
    if (descriptor) {
      descriptors.push(descriptor);
    }
  }
  
  if (descriptors.length === 0) {
    console.log('No valid face descriptors found in any image');
    return null;
  }
  
  console.log(`Successfully extracted ${descriptors.length} face descriptors, averaging...`);
  
  // Average the descriptors for better accuracy
  const avgDescriptor = new Float32Array(descriptors[0].length);
  for (let i = 0; i < avgDescriptor.length; i++) {
    let sum = 0;
    for (const descriptor of descriptors) {
      sum += descriptor[i];
    }
    avgDescriptor[i] = sum / descriptors.length;
  }
  
  console.log('Face descriptor averaging complete');
  return avgDescriptor;
};
