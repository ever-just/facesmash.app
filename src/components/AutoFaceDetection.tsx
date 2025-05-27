
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
  const [captureTimer, setCaptureTimer] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

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

  // Auto-capture after camera is ready and stable
  useEffect(() => {
    if (!hasPermission || isLoading || isScanning || disabled || isCapturing) return;

    let timer: NodeJS.Timeout;
    let countdown = 3;
    
    const startCountdown = () => {
      setIsCapturing(true);
      setCaptureTimer(countdown);
      
      timer = setInterval(() => {
        countdown--;
        setCaptureTimer(countdown);
        
        if (countdown <= 0) {
          clearInterval(timer);
          captureImages();
        }
      }, 1000);
    };

    // Start countdown after camera is stable (2 seconds)
    const initialDelay = setTimeout(startCountdown, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(timer);
    };
  }, [hasPermission, isLoading, isScanning, disabled, isCapturing]);

  const captureImages = async () => {
    if (!webcamRef.current) return;

    try {
      const images = [];
      for (let i = 0; i < 3; i++) {
        const image = webcamRef.current.getScreenshot();
        if (image) {
          images.push(image);
        }
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      onImagesCapture(images);
    } catch (error) {
      console.error('Error capturing images:', error);
      setIsCapturing(false);
    }
  };

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

          {/* Static Face Guide Overlay */}
          {!isLoading && !error && !isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative">
                {/* Main guide oval */}
                <div className="w-48 h-60 border-4 border-blue-500 border-opacity-70 rounded-full bg-transparent">
                  <div className="absolute inset-2 border-2 border-blue-300 border-opacity-50 rounded-full"></div>
                </div>
                
                {/* Instruction text */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                    {isCapturing ? `Capturing in ${captureTimer}...` : 'Position your face within the oval'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Capture countdown overlay */}
          {isCapturing && !isScanning && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-green-500 text-2xl font-bold">{captureTimer}</span>
                </div>
                <p className="text-white mb-2">Get ready for capture!</p>
                <p className="text-gray-300 text-sm">Hold steady...</p>
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
            {isScanning ? 'Processing...' : isLoading ? 'Getting ready...' : isCapturing ? `Capturing in ${captureTimer} seconds...` : 'Look directly at the camera'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoFaceDetection;
