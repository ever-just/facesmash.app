import * as faceapi from '@vladmandic/face-api';
import type { ResolvedConfig, FaceAnalysis, HeadPose, FaceSizeCheck, LightingAnalysis, Point } from './types';

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
    // Initialize TF.js backend (runtime APIs not fully typed)
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

  // Average descriptors
  const avg = new Float32Array(descriptors[0].length);
  for (let i = 0; i < avg.length; i++) {
    let sum = 0;
    for (const d of descriptors) sum += d[i];
    avg[i] = sum / descriptors.length;
  }

  return avg;
}

// ─── Helpers ────────────────────────────────────────────────

function euclidean(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calculateEAR(eye: Point[]): number {
  if (eye.length < 6) return 0.3;
  const v1 = euclidean(eye[1], eye[5]);
  const v2 = euclidean(eye[2], eye[4]);
  const h = euclidean(eye[0], eye[3]);
  return h === 0 ? 0 : (v1 + v2) / (2 * h);
}

function getEyeAspectRatios(landmarks: faceapi.FaceLandmarks68) {
  const leftEAR = calculateEAR(landmarks.getLeftEye());
  const rightEAR = calculateEAR(landmarks.getRightEye());
  return { leftEAR, rightEAR, avgEAR: (leftEAR + rightEAR) / 2 };
}

export function estimateHeadPose(landmarks: faceapi.FaceLandmarks68, box: faceapi.Box): HeadPose {
  const nose = landmarks.getNose();
  const jaw = landmarks.getJawOutline();
  const noseTip = nose[3];
  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;
  const yaw = (noseTip.x - faceCenterX) / (box.width / 2);
  const pitch = (noseTip.y - faceCenterY) / (box.height / 2);
  const jawLeft = jaw[0];
  const jawRight = jaw[jaw.length - 1];
  const roll = Math.atan2(jawRight.y - jawLeft.y, jawRight.x - jawLeft.x);
  const isFrontal = Math.abs(yaw) < 0.35 && Math.abs(pitch) < 0.4 && Math.abs(roll) < 0.25;
  return { yaw, pitch, roll, isFrontal };
}

export function validateFaceSize(
  box: faceapi.Box,
  frameWidth = 640,
  frameHeight = 480
): FaceSizeCheck {
  const ratio = (box.width * box.height) / (frameWidth * frameHeight);
  if (ratio < 0.02) return { isValid: false, ratio, reason: 'Face too far from camera' };
  if (ratio > 0.65) return { isValid: false, ratio, reason: 'Face too close to camera' };
  if (box.width < 80 || box.height < 80) return { isValid: false, ratio, reason: 'Face too small for reliable recognition' };
  return { isValid: true, ratio };
}

export function normalizeDescriptor(descriptor: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < descriptor.length; i++) norm += descriptor[i] ** 2;
  norm = Math.sqrt(norm);
  if (norm === 0) return descriptor;
  const normalized = new Float32Array(descriptor.length);
  for (let i = 0; i < descriptor.length; i++) normalized[i] = descriptor[i] / norm;
  return normalized;
}

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
