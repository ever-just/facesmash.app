
import { useRef, useCallback, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Webcam from 'react-webcam';
import { getSsdOptions } from '@/utils/faceRecognition';

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

  const busyRef = useRef(false);

  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !isActive || busyRef.current) return;
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
    } finally {
      busyRef.current = false;
    }
  }, [webcamRef, isActive, onFaceDetected, onFaceLost]);

  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) return;
    
    console.log('Starting face tracking...');
    setIsTracking(true);
    trackingIntervalRef.current = setInterval(detectFace, 300); // ~3 FPS with SSD (heavier but more reliable)
  }, [detectFace]);

  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    console.log('Stopping face tracking...');
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
