
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
  detectionInterval?: number; // Allow customizable detection frequency
}

export const useFaceTracking = ({
  webcamRef,
  isActive,
  onFaceDetected,
  onFaceLost,
  detectionInterval = 200 // Reduced from 100ms to 200ms (5 FPS instead of 10 FPS)
}: UseFaceTrackingProps) => {
  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const isDetectingRef = useRef<boolean>(false); // Prevent overlapping detections

  const detectFace = useCallback(async () => {
    // Skip if already detecting or if webcam/video is not ready
    if (isDetectingRef.current || !webcamRef.current || !isActive) return;
    
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    isDetectingRef.current = true;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320, // Reduced from 416 for better performance
          scoreThreshold: 0.4 // Slightly higher threshold for more reliable detection
        }))
        .withFaceLandmarks();

      if (detection) {
        const box = detection.detection.box;
        
        // Get the actual displayed video dimensions
        const videoElement = video.getBoundingClientRect();
        const videoDisplayWidth = videoElement.width;
        const videoDisplayHeight = videoElement.height;
        
        // Calculate scale factors between actual video and displayed video
        const scaleX = videoDisplayWidth / video.videoWidth;
        const scaleY = videoDisplayHeight / video.videoHeight;
        
        // Calculate position as pixels relative to the displayed video
        const position: FacePosition = {
          x: box.x * scaleX,
          y: box.y * scaleY,
          width: box.width * scaleX,
          height: box.height * scaleY,
          confidence: detection.detection.score
        };

        console.log('Face detected at position:', position);
        
        setFacePosition(position);
        lastDetectionTimeRef.current = Date.now();
        onFaceDetected?.(position);
      } else {
        // Clear face position if no detection for more than 500ms (increased from 300ms)
        if (Date.now() - lastDetectionTimeRef.current > 500) {
          console.log('Face lost - clearing position');
          setFacePosition(null);
          onFaceLost?.();
        }
      }
    } catch (error) {
      console.error('Face tracking error:', error);
    } finally {
      isDetectingRef.current = false;
    }
  }, [webcamRef, isActive, onFaceDetected, onFaceLost]);

  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current || !isActive) return;
    
    console.log(`Starting face tracking with ${detectionInterval}ms interval...`);
    setIsTracking(true);
    trackingIntervalRef.current = setInterval(detectFace, detectionInterval);
  }, [detectFace, detectionInterval, isActive]);

  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    console.log('Stopping face tracking...');
    setIsTracking(false);
    setFacePosition(null);
    isDetectingRef.current = false;
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
