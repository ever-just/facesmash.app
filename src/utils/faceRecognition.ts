
import * as Sentry from '@sentry/react';
import * as faceapi from '@vladmandic/face-api';

import { recordWarmup } from './performanceMetrics';

// Shared SSD detection options — used across the app for reliable detection
const SSD_MIN_CONFIDENCE = 0.3;
export const getSsdOptions = () => new faceapi.SsdMobilenetv1Options({ minConfidence: SSD_MIN_CONFIDENCE });
export const getTinyOptions = () => new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });

// Initialize face-api models + TF.js backend
export const initializeFaceAPI = async () => {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  
  try {
    // Initialize TF.js backend with optimizations (vladmandic demo pattern)
    try {
      if (faceapi.tf) {
        // Configure WASM paths to CDN before backend initialization.
        // Without this, TF.js tries to load .wasm files from the same origin,
        // which fails on Netlify SPA because the fallback serves index.html.
        //
        // @vladmandic/face-api bundles its own TF.js and re-exports
        // setWasmPaths at runtime, but the .d.ts omits the declaration.
        // TypeScript's `import *` namespace doesn't include undeclared exports,
        // so we use Object.getOwnPropertyDescriptor on the module prototype
        // to bypass the namespace restriction and access the runtime export.
        const wasmVersion = faceapi.tf.version_core || '4.22.0';
        const wasmCdnUrl = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${wasmVersion}/dist/`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const faceapiAny = faceapi as Record<string, any>;
        if (typeof faceapiAny['setWasmPaths'] === 'function') {
          faceapiAny['setWasmPaths'](wasmCdnUrl);
          console.log(`WASM paths configured to CDN via bundled TF.js (v${wasmVersion})`);
        } else {
          // Fallback: configure via the bundled tf engine's WASM backend
          // This covers edge case where Vite's module resolution strips unexported symbols
          console.log('setWasmPaths not on faceapi namespace, WebGL is primary backend');
        }

        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();
        if (faceapi.tf.env().flagRegistry?.CANVAS2D_WILL_READ_FREQUENTLY) {
          faceapi.tf.env().set('CANVAS2D_WILL_READ_FREQUENTLY', true);
        }
        if (faceapi.tf.env().flagRegistry?.WEBGL_EXP_CONV) {
          faceapi.tf.env().set('WEBGL_EXP_CONV', true);
        }
        console.log(`TF.js backend: ${faceapi.tf.getBackend()}, version: ${faceapi.tf.version_core}`);
      }
    } catch (tfError) {
      console.warn('TF.js backend init skipped (non-fatal):', tfError);
      Sentry.addBreadcrumb({
        category: 'faceapi',
        message: 'TF.js backend init skipped',
        level: 'warning',
        data: { error: String(tfError) },
      });
    }

    // Load models — SsdMobilenetv1 is the primary detector (more reliable than TinyFaceDetector)
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    const tensorCount = faceapi.tf?.engine()?.state?.numTensors ?? 'unknown';
    console.log(`FaceAPI models loaded — tensors: ${tensorCount}`);

    // ── Model warmup ──
    // Run a full detection pipeline on a tiny synthetic face image so that
    // WebGL shader programs are compiled BEFORE the first real inference.
    // Without this, the first real detection is 2-5x slower because the GPU
    // has to compile shaders on the fly.
    try {
      const warmupStart = performance.now();
      const warmupCanvas = document.createElement('canvas');
      warmupCanvas.width = 128;
      warmupCanvas.height = 128;
      const ctx = warmupCanvas.getContext('2d');
      if (ctx) {
        // Draw a simple oval "face" shape — enough to trigger detection paths
        ctx.fillStyle = '#d2a87e'; // skin-tone fill
        ctx.beginPath();
        ctx.ellipse(64, 60, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        // Two dark circles for "eyes"
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(52, 52, 4, 0, Math.PI * 2);
        ctx.arc(76, 52, 4, 0, Math.PI * 2);
        ctx.fill();

        // Run full pipelines to compile all shader programs.
        // face-api's chained task objects are not standard Promises,
        // so .catch() doesn't exist on them — use try/catch instead.
        // 1. SSD + landmarks + descriptor
        try {
          await faceapi.detectSingleFace(warmupCanvas, getSsdOptions())
            .withFaceLandmarks().withFaceDescriptor();
        } catch { /* no face found in synthetic image — expected */ }
        // 2. TinyFaceDetector + landmarks (used for tracking)
        try {
          await faceapi.detectSingleFace(warmupCanvas, getTinyOptions())
            .withFaceLandmarks();
        } catch { /* expected */ }
      }
      const warmupMs = performance.now() - warmupStart;
      recordWarmup(warmupMs);
      console.log(`Model warmup complete in ${warmupMs.toFixed(0)}ms`);
    } catch (warmupErr) {
      console.warn('Model warmup failed (non-fatal):', warmupErr);
      Sentry.addBreadcrumb({
        category: 'faceapi',
        message: 'Model warmup failed (non-fatal)',
        level: 'warning',
        data: { error: String(warmupErr) },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to load FaceAPI models:', error);
    Sentry.captureException(error, {
      tags: { component: 'faceRecognition', action: 'initializeFaceAPI' },
    });
    return false;
  }
};

// Extract face descriptor from an image data URL or HTMLVideoElement
export const extractFaceDescriptor = async (input: string | HTMLVideoElement): Promise<Float32Array | null> => {
  try {
    const media = typeof input === 'string' ? await faceapi.fetchImage(input) : input;
    
    // Use SsdMobilenetv1 for reliable detection
    let detection = await faceapi
      .detectSingleFace(media, getSsdOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    // Fallback to TinyFaceDetector if SSD misses
    if (!detection) {
      detection = await faceapi
        .detectSingleFace(media, getTinyOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
    }

    if (detection) {
      console.log(`Face descriptor extracted (score: ${detection.detection.score.toFixed(3)})`);
      return detection.descriptor;
    }
    console.log('No face detected in input');
    return null;
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    Sentry.captureException(error, {
      tags: { component: 'faceRecognition', action: 'extractFaceDescriptor' },
    });
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
