
import { useRef, useCallback, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';

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
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);

  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !isActive) return;

    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) return;

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 224, 
          scoreThreshold: 0.4 
        }))
        .withFaceLandmarks();

      if (detection) {
        const box = detection.detection.box;
        const videoRect = video.getBoundingClientRect();
        
        // Calculate relative position within the video element
        const position: FacePosition = {
          x: (box.x / video.videoWidth) * 100,
          y: (box.y / video.videoHeight) * 100,
          width: (box.width / video.videoWidth) * 100,
          height: (box.height / video.videoHeight) * 100,
          confidence: detection.detection.score
        };

        setFacePosition(position);
        lastDetectionTimeRef.current = Date.now();
        onFaceDetected?.(position);
      } else {
        // Clear face position if no detection for more than 500ms
        if (Date.now() - lastDetectionTimeRef.current > 500) {
          setFacePosition(null);
          onFaceLost?.();
        }
      }
    } catch (error) {
      console.error('Face tracking error:', error);
    }
  }, [webcamRef, isActive, onFaceDetected, onFaceLost]);

  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) return;
    
    setIsTracking(true);
    trackingIntervalRef.current = setInterval(detectFace, 200); // 5 FPS for good performance
  }, [detectFace]);

  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setIsTracking(false);
    setFacePosition(null);
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
    startTracking,
    stopTracking
  };
};
