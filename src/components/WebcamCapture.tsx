
import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WebcamCaptureProps {
  onImagesCapture: (images: string[]) => void;
  isCapturing?: boolean;
  disabled?: boolean;
  autoStart?: boolean;
  captureCount?: number;
  captureInterval?: number;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onImagesCapture,
  isCapturing = false,
  disabled = false,
  autoStart = false,
  captureCount = 3,
  captureInterval = 1000,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [currentCaptureCount, setCurrentCaptureCount] = useState(0);

  // Video constraints - simplified for faster initialization
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
        // Clean up the test stream
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

  // Auto-start capture when requested
  useEffect(() => {
    if (autoStart && hasPermission && !isLoading && !isCapturing) {
      const timer = setTimeout(() => {
        handleCapture();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasPermission, isLoading, isCapturing]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    return imageSrc;
  }, [webcamRef]);

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current || isCapturing) return;

    const images: string[] = [];
    setCurrentCaptureCount(0);
    setCaptureProgress(0);

    for (let i = 0; i < captureCount; i++) {
      const image = capture();
      if (image) {
        images.push(image);
        setCurrentCaptureCount(i + 1);
        setCaptureProgress(((i + 1) / captureCount) * 100);
        
        if (i < captureCount - 1) {
          await new Promise(resolve => setTimeout(resolve, captureInterval));
        }
      }
    }

    onImagesCapture(images);
    setCaptureProgress(0);
    setCurrentCaptureCount(0);
  }, [capture, onImagesCapture, captureCount, captureInterval, isCapturing]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-white mb-2">Initializing camera...</p>
            <p className="text-gray-400 text-sm">Please allow camera access</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div className="relative">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-auto rounded-t-lg"
            onUserMediaError={(error) => {
              console.error('Webcam error:', error);
              setError('Failed to access camera');
            }}
          />
          
          {isCapturing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white mb-2">Capturing...</p>
                <p className="text-gray-300 text-sm">
                  {currentCaptureCount} of {captureCount}
                </p>
                {captureProgress > 0 && (
                  <div className="w-48 bg-gray-700 rounded-full h-2 mt-2 mx-auto">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${captureProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <Button 
            onClick={handleCapture}
            disabled={disabled || isCapturing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Capturing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Capture Face
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamCapture;
