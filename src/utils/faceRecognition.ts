import * as faceapi from 'face-api.js';

// Cache for loaded models to prevent reloading
let modelsLoaded = false;
let loadingPromise: Promise<boolean> | null = null;

// Progress tracking for better user feedback
export interface LoadingProgress {
  stage: string;
  progress: number;
  total: number;
}

// Initialize face-api.js models with local files and caching
export const initializeFaceAPI = async (
  onProgress?: (progress: LoadingProgress) => void
): Promise<boolean> => {
  // Return immediately if models are already loaded
  if (modelsLoaded) {
    console.log('Face-api.js models already loaded from cache');
    onProgress?.({ stage: 'Complete', progress: 4, total: 4 });
    return true;
  }

  // Return existing loading promise if already in progress
  if (loadingPromise) {
    console.log('Face-api.js models loading already in progress');
    return loadingPromise;
  }

  // Start new loading process
  loadingPromise = loadModels(onProgress);
  const result = await loadingPromise;
  loadingPromise = null;
  
  return result;
};

const loadModels = async (
  onProgress?: (progress: LoadingProgress) => void
): Promise<boolean> => {
  // Try local models first, fallback to CDN
  const MODEL_URL = '/models';
  const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  
  try {
    console.log('Loading Face-api.js models from local files...');
    
    // Define models to load with progress tracking
    const modelLoaders = [
      {
        name: 'Face Detector',
        loader: () => faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      },
      {
        name: 'Landmarks',
        loader: () => faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      },
      {
        name: 'Recognition',
        loader: () => faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      },
      {
        name: 'Expressions',
        loader: () => faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      }
    ];

    // Load models with progress tracking
    for (let i = 0; i < modelLoaders.length; i++) {
      const { name, loader } = modelLoaders[i];
      
      onProgress?.({
        stage: `Loading ${name}...`,
        progress: i,
        total: modelLoaders.length
      });
      
      console.log(`Loading ${name} model...`);
      await loader();
      console.log(`${name} model loaded successfully`);
    }

    onProgress?.({
      stage: 'Complete',
      progress: modelLoaders.length,
      total: modelLoaders.length
    });

    modelsLoaded = true;
    console.log('All Face-api.js models loaded successfully from local files');
    return true;

  } catch (localError) {
    console.warn('Failed to load local models, falling back to CDN:', localError);
    
    try {
      onProgress?.({ stage: 'Loading from CDN...', progress: 0, total: 4 });
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
      ]);

      onProgress?.({ stage: 'Complete', progress: 4, total: 4 });
      
      modelsLoaded = true;
      console.log('Face-api.js models loaded successfully from CDN');
      return true;
    } catch (cdnError) {
      console.error('Failed to load face-api.js models from both local and CDN:', cdnError);
      onProgress?.({ stage: 'Error', progress: 0, total: 4 });
      return false;
    }
  }
};

// Check if models are ready (for components to use)
export const areModelsLoaded = (): boolean => {
  return modelsLoaded;
};

// Force reload models (for retry functionality)
export const reloadModels = async (
  onProgress?: (progress: LoadingProgress) => void
): Promise<boolean> => {
  modelsLoaded = false;
  loadingPromise = null;
  return initializeFaceAPI(onProgress);
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
