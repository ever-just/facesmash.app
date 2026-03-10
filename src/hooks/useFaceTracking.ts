
import { useRef, useCallback, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Webcam from 'react-webcam';
import { getSsdOptions } from '@/utils/faceRecognition';
import {
  getEyeAspectRatios,
  estimateHeadPose,
  createLivenessState,
  updateLivenessState,
  type LivenessState,
} from '@/utils/livenessDetection';

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface UseFaceTrackingProps {
  webcamRef: React.RefObject<Webcam>;
  isActive: boolean;
  onFaceDetected?: (position: FacePosition) => void;
  onFaceLost?: () => void;
}

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

    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) { busyRef.current = false; return; }

      // Use SsdMobilenetv1 for reliable detection directly from the video element
      const detection = await faceapi
        .detectSingleFace(video, getSsdOptions())
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
        // Clear face position if no detection for more than 500ms
        if (Date.now() - lastDetectionTimeRef.current > 500) {
          setFacePosition(null);
          onFaceLostRef.current?.();
        }
      }
    } catch (error) {
      console.error('Face tracking error:', error);
    } finally {
      busyRef.current = false;
    }
  }, [webcamRef]);

  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) return;
    
    console.log('Starting face tracking...');
    setIsTracking(true);
    trackingIntervalRef.current = setInterval(detectFace, 200); // ~5 FPS — faster liveness signal collection
  }, [detectFace]);

  const stopTracking = useCallback(() => {
    if (!trackingIntervalRef.current) return;
    clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = null;
    console.log('Stopping face tracking...');
    setIsTracking(false);
    setFacePosition(null);
    // Reset liveness state when tracking stops
    livenessRef.current = createLivenessState();
    setLivenessState(createLivenessState());
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
    startTracking,
    stopTracking
  };
};
