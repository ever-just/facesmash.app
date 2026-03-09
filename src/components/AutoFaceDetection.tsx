import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFaceTracking } from '@/hooks/useFaceTracking';

interface AutoFaceDetectionProps {
  onImagesCapture: (images: string[]) => void;
  isScanning?: boolean;
  disabled?: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const AutoFaceDetection: React.FC<AutoFaceDetectionProps> = ({
  onImagesCapture,
  isScanning = false,
  disabled = false,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const onImagesCaptureRef = useRef(onImagesCapture);
  onImagesCaptureRef.current = onImagesCapture;
  const hasCapturedRef = useRef(false);
  const smoothPositionRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [smoothPosition, setSmoothPosition] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  // Initialize face tracking (includes liveness detection — zero extra cost)
  const { facePosition, isTracking, livenessState } = useFaceTracking({
    webcamRef,
    isActive: hasPermission && !isLoading && !isScanning && !disabled,
    onFaceDetected: () => {
      setFaceDetected(true);
    },
    onFaceLost: () => {
      setFaceDetected(false);
      setDetectionProgress(0);
      smoothPositionRef.current = null;
      setSmoothPosition(null);
    }
  });

  // Smooth the oval position with lerp so it doesn't jump between frames
  useEffect(() => {
    if (!facePosition) {
      return;
    }
    const target = {
      x: facePosition.x,
      y: facePosition.y,
      w: facePosition.width * 1.4,
      h: facePosition.height * 1.6,
    };
    if (!smoothPositionRef.current) {
      // First detection — snap immediately
      smoothPositionRef.current = target;
      setSmoothPosition(target);
      return;
    }
    const animate = () => {
      const cur = smoothPositionRef.current!;
      const t = 0.35; // smoothing factor (0 = no movement, 1 = snap)
      const next = {
        x: lerp(cur.x, target.x, t),
        y: lerp(cur.y, target.y, t),
        w: lerp(cur.w, target.w, t),
        h: lerp(cur.h, target.h, t),
      };
      smoothPositionRef.current = next;
      setSmoothPosition({ ...next });
    };
    // Run a few interpolation frames
    const id1 = requestAnimationFrame(animate);
    const id2 = requestAnimationFrame(() => requestAnimationFrame(animate));
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [facePosition]);

  useEffect(() => {
    const initializeCamera = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        setIsLoading(false);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Camera initialization error:', err);
        setHasPermission(false);
        setError('Camera access denied or not available');
        setIsLoading(false);
      }
    };

    initializeCamera();
  }, []);

  // Auto-detection logic — gated on liveness to reject static photos
  useEffect(() => {
    if (!hasPermission || isLoading || isScanning || disabled || !faceDetected || hasCapturedRef.current) return;
    // Require liveness confirmation before allowing capture
    if (!livenessState.isLive) return;

    let cancelled = false;
    let detectionCount = 0;
    const maxDetections = 2;
    const detectionInterval = 1500;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    const autoDetect = async () => {
      if (cancelled || !webcamRef.current || hasCapturedRef.current) return;

      const image = webcamRef.current.getScreenshot();
      if (image) {
        detectionCount++;
        setDetectionProgress((detectionCount / maxDetections) * 100);

        if (detectionCount >= maxDetections) {
          if (cancelled || hasCapturedRef.current) return;
          hasCapturedRef.current = true;
          // Capture multiple images for better accuracy
          const images: string[] = [];
          for (let i = 0; i < 3; i++) {
            if (cancelled) return;
            const capturedImage = webcamRef.current?.getScreenshot();
            if (capturedImage) {
              images.push(capturedImage);
            }
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          if (!cancelled && images.length > 0) {
            onImagesCaptureRef.current(images);
          }
          return;
        }
      }

      if (!cancelled) {
        pendingTimer = setTimeout(autoDetect, detectionInterval);
      }
    };

    // Start auto-detection after face is stable
    const startTimer = setTimeout(autoDetect, 1000);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (pendingTimer) clearTimeout(pendingTimer);
      setDetectionProgress(0);
    };
  }, [hasPermission, isLoading, isScanning, disabled, faceDetected, livenessState.isLive]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (error || hasPermission === false) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-white mb-2">Camera Access Required</p>
            <p className="text-gray-400 text-sm mb-4">
              {error || 'Please enable camera access to continue'}
            </p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700 overflow-hidden">
      <CardContent className="p-0">
        <div 
          ref={videoContainerRef}
          className="relative w-full h-[360px] bg-gray-800 rounded-t-lg overflow-hidden"
        >
          {/* Webcam Component */}
          {hasPermission && !error && (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored={true}
              className="w-full h-full object-cover"
              onUserMediaError={(error) => {
                console.error('Webcam error:', error);
                setError('Failed to access camera');
              }}
            />
          )}
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-white mb-2">Preparing your camera...</p>
                <p className="text-gray-400 text-sm">Almost ready</p>
              </div>
            </div>
          )}

          {/* Dynamic Face Guide Overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none">
              {smoothPosition ? (
                // Dynamic face tracking overlay - positioned at face center
                <div
                  className="absolute"
                  style={{
                    left: `${smoothPosition.x}px`,
                    top: `${smoothPosition.y}px`,
                    width: `${Math.max(smoothPosition.w, 100)}px`,
                    height: `${Math.max(smoothPosition.h, 130)}px`,
                    transform: 'translate(-50%, -50%)',
                    willChange: 'left, top, width, height'
                  }}
                >
                  <div className="w-full h-full border-4 border-green-500 border-opacity-80 rounded-full bg-transparent relative">
                    <div className="absolute inset-2 border-2 border-green-300 border-opacity-60 rounded-full animate-pulse"></div>
                  </div>
                  {/* Dynamic instruction text */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                    <p className="text-white text-xs font-medium bg-black bg-opacity-60 px-2 py-1 rounded">
                      {livenessState.isLive ? 'Face detected - hold steady' : 'Verifying liveness...'}
                    </p>
                  </div>
                </div>
              ) : (
                // Default centered guide when no face detected
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-60 border-4 border-blue-500 border-opacity-70 rounded-full bg-transparent">
                      <div className="absolute inset-2 border-2 border-blue-300 border-opacity-50 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                      <p className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                        {isTracking ? 'Looking for your face...' : 'Position your face within the oval'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Face detection progress overlay */}
          {!isScanning && faceDetected && detectionProgress > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-green-500 rounded-full mx-auto mb-4 relative">
                  <div className="absolute inset-2 border-2 border-green-300 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white mb-2">Scanning automatically...</p>
                <div className="w-48 bg-gray-700 rounded-full h-2 mt-3 mx-auto">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${detectionProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Scanning state overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white mb-2">Analyzing with AI...</p>
                <p className="text-gray-300 text-sm">Please wait...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 text-center">
          <p className="text-gray-400 text-sm">
            {isScanning ? 'Processing...' : isLoading ? 'Getting ready...' : smoothPosition ? (livenessState.isLive ? 'Face detected - hold steady' : 'Verifying liveness...') : 'Look directly at the camera'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoFaceDetection;
