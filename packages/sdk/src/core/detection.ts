import * as faceapi from '@vladmandic/face-api';
import type { ResolvedConfig, FaceAnalysis, LightingAnalysis } from './types';
import {
  estimateHeadPose,
  getEyeAspectRatios,
  validateFaceSize,
  normalizeDescriptor,
} from './liveness';

let modelsLoaded = false;

// ─── Model Loading ──────────────────────────────────────────

export async function loadModels(
  config: ResolvedConfig,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (modelsLoaded) {
    onProgress?.(100);
    return true;
  }

  try {
    // Initialize TF.js backend
    try {
      const tf = faceapi.tf as any;
      if (tf) {
        await tf.setBackend('webgl');
        await tf.ready();
        if (tf.env().flagRegistry?.CANVAS2D_WILL_READ_FREQUENTLY) {
          tf.env().set('CANVAS2D_WILL_READ_FREQUENTLY', true);
        }
        if (tf.env().flagRegistry?.WEBGL_EXP_CONV) {
          tf.env().set('WEBGL_EXP_CONV', true);
        }
        if (config.debug) {
          console.log(`[FaceSmash] TF.js backend: ${tf.getBackend()}`);
        }
      }
    } catch {
      // Non-fatal: webgl may not be available
    }

    onProgress?.(10);

    // Load models in parallel
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(config.modelUrl),
      faceapi.nets.tinyFaceDetector.loadFromUri(config.modelUrl),
      faceapi.nets.faceLandmark68Net.loadFromUri(config.modelUrl),
      faceapi.nets.faceRecognitionNet.loadFromUri(config.modelUrl),
      faceapi.nets.faceExpressionNet.loadFromUri(config.modelUrl),
    ]);

    modelsLoaded = true;
    onProgress?.(100);

    if (config.debug) {
      console.log('[FaceSmash] Models loaded successfully');
    }

    return true;
  } catch (error) {
    if (config.debug) {
      console.error('[FaceSmash] Failed to load models:', error);
    }
    return false;
  }
}

export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

// ─── Detection Options ──────────────────────────────────────

export function getSsdOptions(minConfidence: number) {
  return new faceapi.SsdMobilenetv1Options({ minConfidence });
}

export function getTinyOptions() {
  return new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });
}

// ─── Face Descriptor Extraction ─────────────────────────────

export async function extractDescriptor(
  input: string | HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  config: ResolvedConfig
): Promise<Float32Array | null> {
  try {
    const media = typeof input === 'string' ? await faceapi.fetchImage(input) : input;

    // SSD primary
    let detection = await faceapi
      .detectSingleFace(media, getSsdOptions(config.minDetectionConfidence))
      .withFaceLandmarks()
      .withFaceDescriptor();

    // Tiny fallback
    if (!detection) {
      detection = await faceapi
        .detectSingleFace(media, getTinyOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
    }

    return detection?.descriptor ?? null;
  } catch (error) {
    if (config.debug) {
      console.error('[FaceSmash] Descriptor extraction failed:', error);
    }
    return null;
  }
}

/**
 * Detect a face using TinyFaceDetector (fast) with landmarks.
 * Used for continuous tracking at high FPS.
 */
export async function detectFaceTiny(
  input: HTMLVideoElement | HTMLCanvasElement,
) {
  try {
    return await faceapi
      .detectSingleFace(input, getTinyOptions())
      .withFaceLandmarks();
  } catch {
    return null;
  }
}

/**
 * Detect a face using SsdMobilenetv1 (accurate) with landmarks and descriptor.
 * Used for quality descriptor extraction during tracking.
 */
export async function detectFaceSsd(
  input: HTMLVideoElement | HTMLCanvasElement,
  minConfidence = 0.3,
) {
  try {
    return await faceapi
      .detectSingleFace(input, getSsdOptions(minConfidence))
      .withFaceLandmarks()
      .withFaceDescriptor();
  } catch {
    return null;
  }
}

// ─── Full Face Quality Analysis ─────────────────────────────

export async function analyzeFace(
  imageData: string,
  config: ResolvedConfig
): Promise<FaceAnalysis | null> {
  try {
    const img = await faceapi.fetchImage(imageData);

    let detection = await faceapi
      .detectSingleFace(img, getSsdOptions(config.minDetectionConfidence))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      detection = await faceapi
        .detectSingleFace(img, getTinyOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
    }

    if (!detection) return null;

    const headPose = estimateHeadPose(detection.landmarks, detection.detection.box);
    const imgWidth = img.width || 640;
    const imgHeight = img.height || 480;
    const faceSizeCheck = validateFaceSize(detection.detection.box, imgWidth, imgHeight);

    if (!faceSizeCheck.isValid) {
      return {
        descriptor: detection.descriptor,
        normalizedDescriptor: normalizeDescriptor(detection.descriptor),
        confidence: detection.detection.score,
        qualityScore: 0,
        lightingScore: 0,
        headPose,
        faceSizeCheck,
        eyeAspectRatio: 0,
        rejectionReason: faceSizeCheck.reason,
      };
    }

    const { avgEAR } = getEyeAspectRatios(detection.landmarks);

    let lightingAnalysis: LightingAnalysis;
    try {
      lightingAnalysis = analyzeLighting(detection, img);
    } catch {
      lightingAnalysis = {
        score: 0.5, brightness: 0.5, contrast: 0.5, evenness: 0.5,
        conditions: { tooDark: false, tooBright: false, uneven: false, optimal: false },
      };
    }

    // Quality score calculation
    let qualityScore = Math.min(detection.detection.score, 1.0);
    qualityScore *= (0.7 + lightingAnalysis.score * 0.3);

    const faceArea = detection.detection.box.width * detection.detection.box.height;
    const imageArea = 640 * 640;
    const sizeRatio = Math.min(faceArea / imageArea, 0.3) / 0.3;
    qualityScore *= (0.8 + sizeRatio * 0.2);

    if (!headPose.isFrontal) {
      const anglePenalty = Math.max(0.5, 1 - (Math.abs(headPose.yaw) + Math.abs(headPose.pitch)) * 0.3);
      qualityScore *= anglePenalty;
    }

    qualityScore = Math.max(0, Math.min(1, qualityScore));

    return {
      descriptor: detection.descriptor,
      normalizedDescriptor: normalizeDescriptor(detection.descriptor),
      confidence: detection.detection.score,
      qualityScore,
      lightingScore: lightingAnalysis.score,
      headPose,
      faceSizeCheck,
      eyeAspectRatio: avgEAR,
    };
  } catch (error) {
    if (config.debug) {
      console.error('[FaceSmash] Face analysis failed:', error);
    }
    return null;
  }
}

// ─── Multi-Image Processing ─────────────────────────────────

export async function processImages(
  images: string[],
  config: ResolvedConfig
): Promise<Float32Array | null> {
  if (images.length === 1) {
    return extractDescriptor(images[0], config);
  }

  const descriptors: Float32Array[] = [];
  for (const image of images) {
    const d = await extractDescriptor(image, config);
    if (d) descriptors.push(d);
  }

  if (descriptors.length === 0) return null;

  const avg = new Float32Array(descriptors[0].length);
  for (let i = 0; i < avg.length; i++) {
    let sum = 0;
    for (const d of descriptors) sum += d[i];
    avg[i] = sum / descriptors.length;
  }

  return avg;
}

// ─── Lighting Analysis ───────────────────────────────────────

function analyzeLighting(
  detection: faceapi.WithFaceLandmarks<faceapi.WithFaceDescriptor<faceapi.WithFaceDetection<{ detection: faceapi.FaceDetection }>>>,
  imageElement: HTMLImageElement | HTMLCanvasElement
): LightingAnalysis {
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

  const faceBox = detection.detection.box;
  const faceImageData = ctx.getImageData(
    Math.max(0, faceBox.x - 20),
    Math.max(0, faceBox.y - 20),
    Math.min(canvas.width - faceBox.x, faceBox.width + 40),
    Math.min(canvas.height - faceBox.y, faceBox.height + 40)
  );

  const pixels = faceImageData.data;
  let totalBrightness = 0;
  const brightnessValues: number[] = [];

  for (let i = 0; i < pixels.length; i += 4) {
    const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    totalBrightness += brightness;
    brightnessValues.push(brightness);
  }

  const avgBrightness = totalBrightness / (pixels.length / 4);
  const variance = brightnessValues.reduce((acc, val) => acc + (val - avgBrightness) ** 2, 0) / brightnessValues.length;
  const contrast = Math.sqrt(variance);
  const evenness = Math.max(0, 1 - contrast / 128);

  const tooDark = avgBrightness < 80;
  const tooBright = avgBrightness > 200;
  const uneven = evenness < 0.6;
  const optimal = !tooDark && !tooBright && !uneven;

  let score = 0.5;
  if (optimal) score = 0.9;
  else if (tooDark) score = Math.max(0.2, avgBrightness / 160);
  else if (tooBright) score = Math.max(0.2, (255 - avgBrightness) / 110);
  else if (uneven) score = Math.max(0.3, evenness);

  return {
    score,
    brightness: avgBrightness / 255,
    contrast: Math.min(contrast / 64, 1),
    evenness,
    conditions: { tooDark, tooBright, uneven, optimal },
  };
}

// Re-export liveness functions so existing consumers don't break
export { estimateHeadPose, getEyeAspectRatios, validateFaceSize, normalizeDescriptor } from './liveness';
