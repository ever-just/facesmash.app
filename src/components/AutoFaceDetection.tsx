
import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AutoFaceDetectionProps {
  onImagesCapture: (images: string[]) => void;
  isScanning?: boolean;
  disabled?: boolean;
}

const AutoFaceDetection: React.FC<AutoFaceDetectionProps> = ({
  onImagesCapture,
  isScanning = false,
  disabled = false,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

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

  // Auto-detection logic
  useEffect(() => {
    if (!hasPermission || isLoading || isScanning || disabled) return;

    let detectionCount = 0;
    const maxDetections = 3;
    const detectionInterval = 1500;

    const autoDetect = async () => {
      if (!webcamRef.current) return;

      const image = webcamRef.current.getScreenshot();
      if (image) {
        detectionCount++;
        setDetectionProgress((detectionCount / maxDetections) * 100);
        setFaceDetected(true);

        if (detectionCount >= maxDetections) {
          // Capture multiple images for better accuracy
          const images = [];
          for (let i = 0; i < 3; i++) {
            const capturedImage = webcamRef.current.getScreenshot();
            if (capturedImage) {
              images.push(capturedImage);
            }
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          onImagesCapture(images);
          return;
        }
      }

      setTimeout(autoDetect, detectionInterval);
    };

    // Start auto-detection after camera is ready
    const startTimer = setTimeout(autoDetect, 2000);

    return () => {
      clearTimeout(startTimer);
      setDetectionProgress(0);
      setFaceDetected(false);
    };
  }, [hasPermission, isLoading, isScanning, disabled, onImagesCapture]);

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
        <div className="relative w-full h-[360px] bg-gray-800 rounded-t-lg overflow-hidden">
          {/* Webcam Component */}
          {hasPermission && !error && (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
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

          {/* Face Guide Oval Overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Face guide oval */}
              <div className="relative">
                <div className="w-48 h-60 border-4 border-blue-500 border-opacity-70 rounded-full bg-transparent">
                  <div className="absolute inset-2 border-2 border-blue-300 border-opacity-50 rounded-full"></div>
                </div>
                {/* Instruction text */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                    Position your face within the oval
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Face detection overlay */}
          {!isScanning && faceDetected && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-green-500 rounded-full mx-auto mb-4 relative">
                  <div className="absolute inset-2 border-2 border-green-300 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white mb-2">Face detected</p>
                <p className="text-gray-300 text-sm">Scanning automatically...</p>
                {detectionProgress > 0 && (
                  <div className="w-48 bg-gray-700 rounded-full h-2 mt-3 mx-auto">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${detectionProgress}%` }}
                    ></div>
                  </div>
                )}
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
            {isScanning ? 'Processing...' : isLoading ? 'Getting ready...' : 'Look directly at the camera'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoFaceDetection;
