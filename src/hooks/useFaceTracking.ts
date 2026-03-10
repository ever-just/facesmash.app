
import * as Sentry from '@sentry/react';
import { useRef, useCallback, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Webcam from 'react-webcam';
import { getSsdOptions, getTinyOptions } from '@/utils/faceRecognition';
import {
  getEyeAspectRatios,
  estimateHeadPose,
  createLivenessState,
  updateLivenessState,
  type LivenessState,
} from '@/utils/livenessDetection';
import {
  recordTrackingFrame,
  recordDescriptorExtraction,
  markCameraReady,
  markLivenessPass,
  markDescriptorReady,
} from '@/utils/performanceMetrics';

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

/** Pre-computed descriptor kept during tracking so we can submit instantly when liveness passes */
export interface ReadyDescriptor {
  descriptor: Float32Array;
  qualityScore: number;
  livenessConfidence: number;
  timestamp: number;
}

interface UseFaceTrackingProps {
  webcamRef: React.RefObject<Webcam>;
  isActive: boolean;
  onFaceDetected?: (position: FacePosition) => void;
  onFaceLost?: () => void;
}

// ── Descriptor pre-computation constants ──
// Start extracting descriptors after this many tracking frames (liveness is building up)
const DESCRIPTOR_START_FRAME = 10;
// Extract a descriptor every Nth tracking frame to avoid overloading the GPU
const DESCRIPTOR_EVERY_N_FRAMES = 3;

export const useFaceTracking = ({
  webcamRef,
  isActive,
  onFaceDetected,
  onFaceLost
}: UseFaceTrackingProps) => {
  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [livenessState, setLivenessState] = useState<LivenessState>(createLivenessState());
  const livenessRef = useRef<LivenessState>(createLivenessState());
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);

  const busyRef = useRef(false);
  const frameCounterRef = useRef(0);
  const livenessMarkedRef = useRef(false);

  // ── Ready Descriptor state ──
  // Pre-computed descriptor maintained during tracking so there's zero capture delay
  // when liveness passes. Updated every 3rd frame once frameCount >= 10.
  const readyDescriptorRef = useRef<ReadyDescriptor | null>(null);
  const [readyDescriptor, setReadyDescriptor] = useState<ReadyDescriptor | null>(null);

  // Keep callback refs stable to avoid re-render churn
  const onFaceDetectedRef = useRef(onFaceDetected);
  onFaceDetectedRef.current = onFaceDetected;
  const onFaceLostRef = useRef(onFaceLost);
  onFaceLostRef.current = onFaceLost;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !isActiveRef.current || busyRef.current) return;
    busyRef.current = true;
    const frameStart = performance.now();

    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) { busyRef.current = false; return; }

      frameCounterRef.current++;

      // ── Phase 2: Use TinyFaceDetector for tracking (1.5-3x faster than SSD) ──
      // TinyFaceDetector is used here because tracking only needs face position + landmarks
      // for liveness detection. SSD is still used for final descriptor quality analysis.
      const detection = await faceapi
        .detectSingleFace(video, getTinyOptions())
        .withFaceLandmarks();

      if (detection) {
        const box = detection.detection.box;

        // ── Liveness: compute EAR + head pose from existing landmarks ──
        // This is pure arithmetic on data we already have — adds <0.5ms per frame
        const landmarks = detection.landmarks;
        const { avgEAR } = getEyeAspectRatios(landmarks);
        const headPose = estimateHeadPose(landmarks, box);
        livenessRef.current = updateLivenessState(livenessRef.current, avgEAR, headPose);
        setLivenessState({ ...livenessRef.current });

        // ── Ready Descriptor: pre-compute best descriptor during tracking ──
        // Once we have enough liveness frames, start extracting descriptors every 3rd frame.
        // This eliminates the 4-8s capture delay after liveness passes.
        const currentFrameCount = livenessRef.current.frameCount;
        if (
          currentFrameCount >= DESCRIPTOR_START_FRAME &&
          frameCounterRef.current % DESCRIPTOR_EVERY_N_FRAMES === 0 &&
          !livenessRef.current.isLive // stop once liveness passes (descriptor is ready)
        ) {
          // Run descriptor extraction — use SSD for quality (more reliable than Tiny)
          const descStart = performance.now();
          const fullDetection = await faceapi
            .detectSingleFace(video, getSsdOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          const descMs = performance.now() - descStart;
          recordDescriptorExtraction(descMs);

          if (fullDetection) {
            const score = fullDetection.detection.score;
            const current = readyDescriptorRef.current;
            // Keep the descriptor with the highest quality score
            if (!current || score > current.qualityScore) {
              const newDescriptor: ReadyDescriptor = {
                descriptor: fullDetection.descriptor,
                qualityScore: score,
                livenessConfidence: livenessRef.current.confidence,
                timestamp: Date.now(),
              };
              readyDescriptorRef.current = newDescriptor;
              setReadyDescriptor(newDescriptor);
              markDescriptorReady();
              console.log(`Ready descriptor updated: score=${score.toFixed(3)}, frame=${currentFrameCount}`);
            }
          }
        }

        // Mark liveness pass milestone (once)
        if (livenessRef.current.isLive && !livenessMarkedRef.current) {
          livenessMarkedRef.current = true;
          markLivenessPass();
        }

        // Get the displayed container dimensions
        const rect = video.getBoundingClientRect();
        const containerW = rect.width;
        const containerH = rect.height;
        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        
        // object-cover scales & crops: compute the effective scale and offsets
        const scale = Math.max(containerW / videoW, containerH / videoH);
        const scaledW = videoW * scale;
        const scaledH = videoH * scale;
        // object-cover centers the overflow, so the crop offset is:
        const offsetX = (scaledW - containerW) / 2;
        const offsetY = (scaledH - containerH) / 2;
        
        // Map detection box center to container pixel coords
        const centerX = (box.x + box.width / 2) * scale - offsetX;
        const centerY = (box.y + box.height / 2) * scale - offsetY;
        const w = box.width * scale;
        const h = box.height * scale;
        
        // Mirror X axis because the front camera video is displayed mirrored via CSS scaleX(-1)
        const mirroredCenterX = containerW - centerX;
        
        const position: FacePosition = {
          x: mirroredCenterX,
          y: centerY,
          width: w,
          height: h,
          confidence: detection.detection.score
        };
        
        setFacePosition(position);
        lastDetectionTimeRef.current = Date.now();
        onFaceDetectedRef.current?.(position);
      } else {
        // Clear face position if no detection for more than 1000ms
        // (raised from 500ms — brief tracking drops during slight movement
        //  were resetting liveness progress, causing the "takes forever" UX issue)
        if (Date.now() - lastDetectionTimeRef.current > 1000) {
          setFacePosition(null);
          onFaceLostRef.current?.();
        }
      }
    } catch (error) {
      console.error('Face tracking error:', error);
      Sentry.captureException(error, {
        tags: { component: 'useFaceTracking', action: 'detectFace' },
        extra: { frameCount: frameCounterRef.current },
      });
    } finally {
      const frameMs = performance.now() - frameStart;
      recordTrackingFrame(frameMs);
      busyRef.current = false;
    }
  }, [webcamRef]);

  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) return;
    
    console.log('Starting face tracking (TinyFaceDetector)...');
    setIsTracking(true);
    markCameraReady();
    frameCounterRef.current = 0;
    livenessMarkedRef.current = false;
    trackingIntervalRef.current = setInterval(detectFace, 200); // ~5 FPS — faster liveness signal collection
  }, [detectFace]);

  const stopTracking = useCallback(() => {
    if (!trackingIntervalRef.current) return;
    clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = null;
    console.log('Stopping face tracking...');
    setIsTracking(false);
    setFacePosition(null);
    // Reset liveness state when tracking fully stops
    // (brief face-lost pauses no longer reset — only full stop does)
    livenessRef.current = createLivenessState();
    setLivenessState(createLivenessState());
    // Reset ready descriptor
    readyDescriptorRef.current = null;
    setReadyDescriptor(null);
    frameCounterRef.current = 0;
    livenessMarkedRef.current = false;
  }, []);

  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isActive, startTracking, stopTracking]);

  return {
    facePosition,
    isTracking,
    livenessState,
    readyDescriptor,
    startTracking,
    stopTracking
  };
};
