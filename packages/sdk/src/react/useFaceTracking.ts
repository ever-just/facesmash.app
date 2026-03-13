/**
 * useFaceTracking — real-time face tracking with liveness detection.
 *
 * Ported from facesmash.app's useFaceTracking.ts.
 * Uses TinyFaceDetector at ~5 FPS for tracking and SsdMobilenetv1 for
 * descriptor pre-computation. Tracks liveness via EAR blink detection,
 * head pose motion variance, and EAR fluctuation.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { detectFaceTiny, detectFaceSsd } from '../core/detection';
import {
  createLivenessState,
  updateLivenessState,
  getEyeAspectRatios,
  estimateHeadPose,
  validateFaceSize,
  normalizeDescriptor,
} from '../core/liveness';
import type {
  LivenessState,
  ReadyDescriptor,
  FacePosition,
  LightingCondition,
  ResolvedConfig,
} from '../core/types';

// ─── Constants ───────────────────────────────────────────────

const TRACKING_INTERVAL_MS = 200; // ~5 FPS
const DESCRIPTOR_START_FRAME = 5;
const DESCRIPTOR_EVERY_N_FRAMES = 3;
const LIGHTING_EVERY_N_FRAMES = 5;
const FACE_LOST_GRACE_MS = 1000;

export interface UseFaceTrackingOptions {
  /** SDK resolved config (for detection confidence, debug, etc.) */
  config: ResolvedConfig;
  /** Auto-start tracking when video is available (default: true) */
  autoStart?: boolean;
}

export interface UseFaceTrackingResult {
  /** Current face position in the video frame */
  facePosition: FacePosition | null;
  /** Whether the tracking loop is active */
  isTracking: boolean;
  /** Current liveness detection state */
  livenessState: LivenessState;
  /** Best pre-computed descriptor ready for submission */
  readyDescriptor: ReadyDescriptor | null;
  /** Current lighting condition */
  lightingCondition: LightingCondition;
  /** Start tracking on a video element */
  startTracking: (video: HTMLVideoElement) => void;
  /** Stop tracking */
  stopTracking: () => void;
  /** Reset liveness state and descriptor (for retry) */
  reset: () => void;
}

export function useFaceTracking(options: UseFaceTrackingOptions): UseFaceTrackingResult {
  const { config } = options;

  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [livenessState, setLivenessState] = useState<LivenessState>(createLivenessState);
  const [readyDescriptor, setReadyDescriptor] = useState<ReadyDescriptor | null>(null);
  const [lightingCondition, setLightingCondition] = useState<LightingCondition>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef(0);
  const bestDescriptorRef = useRef<ReadyDescriptor | null>(null);
  const livenessRef = useRef<LivenessState>(createLivenessState());
  const faceLostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lightingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ─── Tracking Loop ──────────────────────────────────────────

  const trackFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    frameCountRef.current++;
    const frameNum = frameCountRef.current;

    // ── Step 1: Fast face detection with TinyFaceDetector ──
    const tinyResult = await detectFaceTiny(video);

    if (!tinyResult) {
      // Grace period before clearing face position
      if (faceLostTimerRef.current === null) {
        faceLostTimerRef.current = setTimeout(() => {
          setFacePosition(null);
          faceLostTimerRef.current = null;
        }, FACE_LOST_GRACE_MS);
      }
      return;
    }

    // Clear grace timer — face is visible
    if (faceLostTimerRef.current !== null) {
      clearTimeout(faceLostTimerRef.current);
      faceLostTimerRef.current = null;
    }

    const box = tinyResult.detection.box;
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Update face position (mirrored for front camera)
    setFacePosition({
      x: videoWidth - box.x - box.width, // mirror X
      y: box.y,
      width: box.width,
      height: box.height,
      confidence: tinyResult.detection.score,
    });

    // Validate face size
    const sizeCheck = validateFaceSize(box, videoWidth, videoHeight);
    if (!sizeCheck.isValid) return;

    // ── Step 2: Liveness detection (EAR + head pose) ──
    const { avgEAR } = getEyeAspectRatios(tinyResult.landmarks);
    const headPose = estimateHeadPose(tinyResult.landmarks, box);

    const newLiveness = updateLivenessState(livenessRef.current, avgEAR, headPose);
    livenessRef.current = newLiveness;
    setLivenessState(newLiveness);

    // ── Step 3: Descriptor pre-computation (SSD, every Nth frame) ──
    if (
      frameNum >= DESCRIPTOR_START_FRAME &&
      frameNum % DESCRIPTOR_EVERY_N_FRAMES === 0 &&
      !newLiveness.isLive // stop computing once liveness passed + we have a descriptor
    ) {
      // Run SSD for accurate descriptor extraction
      const ssdResult = await detectFaceSsd(video, config.minDetectionConfidence);
      if (ssdResult) {
        // Calculate quality score
        let qualityScore = Math.min(ssdResult.detection.score, 1.0);
        const faceArea = ssdResult.detection.box.width * ssdResult.detection.box.height;
        const imageArea = videoWidth * videoHeight;
        const sizeRatio = Math.min(faceArea / imageArea, 0.3) / 0.3;
        qualityScore *= (0.8 + sizeRatio * 0.2);

        const ssdPose = estimateHeadPose(ssdResult.landmarks, ssdResult.detection.box);
        if (!ssdPose.isFrontal) {
          qualityScore *= Math.max(0.5, 1 - (Math.abs(ssdPose.yaw) + Math.abs(ssdPose.pitch)) * 0.3);
        }

        // Keep best descriptor by quality
        const candidate: ReadyDescriptor = {
          descriptor: ssdResult.descriptor,
          qualityScore,
          livenessConfidence: newLiveness.confidence,
          timestamp: Date.now(),
        };

        if (!bestDescriptorRef.current || qualityScore > bestDescriptorRef.current.qualityScore) {
          bestDescriptorRef.current = candidate;
          setReadyDescriptor(candidate);
        }
      }
    }

    // Also pre-compute after liveness passes if we don't have a descriptor yet
    if (newLiveness.isLive && !bestDescriptorRef.current) {
      const ssdResult = await detectFaceSsd(video, config.minDetectionConfidence);
      if (ssdResult) {
        const candidate: ReadyDescriptor = {
          descriptor: ssdResult.descriptor,
          qualityScore: ssdResult.detection.score,
          livenessConfidence: newLiveness.confidence,
          timestamp: Date.now(),
        };
        bestDescriptorRef.current = candidate;
        setReadyDescriptor(candidate);
      }
    }

    // ── Step 4: Lighting analysis (every Nth frame) ──
    if (frameNum % LIGHTING_EVERY_N_FRAMES === 0) {
      try {
        if (!lightingCanvasRef.current) {
          lightingCanvasRef.current = document.createElement('canvas');
        }
        const canvas = lightingCanvasRef.current;
        canvas.width = box.width;
        canvas.height = box.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
          const imageData = ctx.getImageData(0, 0, box.width, box.height);
          const pixels = imageData.data;
          let totalBrightness = 0;
          for (let i = 0; i < pixels.length; i += 16) { // sample every 4th pixel for perf
            totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          }
          const avgBrightness = totalBrightness / (pixels.length / 16);

          if (avgBrightness < 60) setLightingCondition('tooDark');
          else if (avgBrightness > 210) setLightingCondition('tooBright');
          else setLightingCondition('ok');
        }
      } catch {
        // Non-fatal
      }
    }
  }, [config]);

  // ─── Start/Stop Controls ────────────────────────────────────

  const startTracking = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    frameCountRef.current = 0;
    bestDescriptorRef.current = null;
    livenessRef.current = createLivenessState();
    setLivenessState(createLivenessState());
    setReadyDescriptor(null);
    setFacePosition(null);
    setLightingCondition(null);
    setIsTracking(true);

    // Start tracking loop
    intervalRef.current = setInterval(trackFrame, TRACKING_INTERVAL_MS);
  }, [trackFrame]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (faceLostTimerRef.current) {
      clearTimeout(faceLostTimerRef.current);
      faceLostTimerRef.current = null;
    }
    videoRef.current = null;
    setIsTracking(false);
  }, []);

  const reset = useCallback(() => {
    frameCountRef.current = 0;
    bestDescriptorRef.current = null;
    livenessRef.current = createLivenessState();
    setLivenessState(createLivenessState());
    setReadyDescriptor(null);
    setFacePosition(null);
    setLightingCondition(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (faceLostTimerRef.current) clearTimeout(faceLostTimerRef.current);
    };
  }, []);

  return {
    facePosition,
    isTracking,
    livenessState,
    readyDescriptor,
    lightingCondition,
    startTracking,
    stopTracking,
    reset,
  };
}
