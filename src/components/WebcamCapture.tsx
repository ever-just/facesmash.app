
import { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Square, RotateCcw, CheckCircle, Scan, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from 'face-api.js';
import { useFaceAPI } from '@/contexts/FaceAPIContext';

interface WebcamCaptureProps {
  onImagesCapture: (images: string[]) => void;
  isLogin?: boolean;
  autoStart?: boolean;
}

const WebcamCapture = ({ onImagesCapture, isLogin = false, autoStart = false }: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isLoaded } = useFaceAPI();

  // Optimized video constraints for faster initialization
  const videoConstraints = {
    width: { ideal: 640, min: 320 },
    height: { ideal: 640, min: 320 },
    facingMode: "user",
    frameRate: { ideal: 15, max: 30 }
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      console.log('Image captured from webcam');
      
      const newImages = [imageSrc];
      setCapturedImages(newImages);
      onImagesCapture(newImages);
      setIsDetecting(false);
      setFaceDetected(false);
      setScanProgress(0);
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      console.error('Failed to capture image from webcam');
    }
  }, [onImagesCapture]);

  const startFaceDetection = useCallback(async () => {
    if (!webcamRef.current?.video || isDetecting || !webcamReady || !isLoaded) {
      console.log('Cannot start detection:', { 
        hasVideo: !!webcamRef.current?.video, 
        isDetecting, 
        webcamReady, 
        isLoaded 
      });
      return;
    }
    
    setIsDetecting(true);
    setScanProgress(0);
    console.log('Starting automatic face detection...');
    
    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 50);
    
    detectionIntervalRef.current = setInterval(async () => {
      const video = webcamRef.current?.video;
      if (!video || video.readyState !== 4) return;
      
      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }));
        
        if (detection) {
          console.log('Face detected! Capturing image...');
          setFaceDetected(true);
          
          setTimeout(() => {
            capture();
          }, 800);
          
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 200);
  }, [capture, isDetecting, webcamReady, isLoaded]);

  const onWebcamReady = useCallback(() => {
    console.log('Webcam is ready');
    setWebcamReady(true);
    setCameraLoading(false);
    setCameraError(null);
    
    // Clear any existing timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
  }, []);

  const onWebcamError = useCallback((error: string | DOMException) => {
    console.error('Webcam error:', error);
    setCameraLoading(false);
    setCameraError("Camera access failed. Please check permissions and try again.");
    toast.error("Camera access failed. Please check permissions.");
  }, []);

  // Auto-start detection when conditions are met
  useEffect(() => {
    if (webcamReady && autoStart && !isDetecting && capturedImages.length === 0 && isLoaded) {
      console.log('Auto-starting face detection...');
      const timer = setTimeout(() => {
        startFaceDetection();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [webcamReady, autoStart, startFaceDetection, isDetecting, capturedImages.length, isLoaded]);

  // Add timeout for camera initialization
  useEffect(() => {
    if (cameraLoading) {
      initTimeoutRef.current = setTimeout(() => {
        if (cameraLoading) {
          console.log('Camera initialization timeout');
          setCameraLoading(false);
          setCameraError("Camera is taking too long to initialize. Please refresh and try again.");
        }
      }, 10000); // 10 second timeout
    }
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [cameraLoading]);

  const reset = () => {
    setCapturedImages([]);
    setIsDetecting(false);
    setFaceDetected(false);
    setScanProgress(0);
    setCameraError(null);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const retryCamera = () => {
    setCameraLoading(true);
    setWebcamReady(false);
    setCameraError(null);
    reset();
  };

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  // Camera Loading Skeleton Component
  const CameraLoadingSkeleton = () => (
    <div className="relative w-80 h-80 bg-gray-900 rounded-3xl overflow-hidden border-4 border-gray-600 shadow-2xl flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
        {/* Animated face outline */}
        <div className="absolute inset-8">
          <div className="w-full h-full rounded-full border-4 border-dashed border-blue-400/50 animate-spin" style={{ animationDuration: '3s' }}>
            {/* Face detection grid */}
            <div className="absolute inset-4 grid grid-cols-6 grid-rows-6 gap-1 opacity-30">
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-blue-400/20 rounded-sm animate-pulse"
                  style={{ 
                    animationDelay: `${(i * 50)}ms`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
            
            {/* Scanning line */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing camera...</span>
        </div>
      </div>
    </div>
  );

  // Camera Error Component
  const CameraErrorComponent = () => (
    <div className="relative w-80 h-80 bg-red-900/20 rounded-3xl border-4 border-red-600 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
      <div className="text-red-400 mb-4">
        <Square className="h-16 w-16 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Camera Error</h3>
      </div>
      <p className="text-red-300 text-sm mb-6">{cameraError}</p>
      <Button 
        onClick={retryCamera}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="relative flex justify-center">
        {cameraError ? (
          <CameraErrorComponent />
        ) : cameraLoading ? (
          <CameraLoadingSkeleton />
        ) : (
          <div className="relative w-80 h-80 bg-black rounded-3xl overflow-hidden border-4 border-gray-600 shadow-2xl">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              onUserMedia={onWebcamReady}
              onUserMediaError={onWebcamError}
              mirrored={true}
            />
            
            {/* Face Detection Overlay */}
            <div className="absolute inset-4">
              <div className={`w-full h-full rounded-full border-4 transition-all duration-500 ${
                faceDetected 
                  ? 'border-green-400 shadow-lg shadow-green-400/50' 
                  : isDetecting 
                  ? 'border-blue-400 shadow-lg shadow-blue-400/30' 
                  : 'border-white/50'
              }`}>
                <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg"></div>
              </div>
              
              {isDetecting && !faceDetected && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform transition-transform duration-100"
                    style={{ transform: `translateY(${(scanProgress / 100) * 280}px)` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                Position your face here
              </div>
            </div>

            {faceDetected && (
              <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center animate-pulse">
                <div className="text-2xl font-bold text-white drop-shadow-lg flex items-center">
                  <CheckCircle className="mr-2 h-8 w-8" />
                  Face Detected!
                </div>
              </div>
            )}

            {isDetecting && !faceDetected && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="border border-blue-400/20 animate-pulse"
                      style={{ 
                        animationDelay: `${(i * 50)}ms`,
                        animationDuration: '2s'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className={`w-6 h-6 rounded-full transition-all duration-500 ${
            capturedImages.length > 0 
              ? 'bg-green-400 shadow-lg shadow-green-400/50' 
              : faceDetected
              ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50'
              : isDetecting
              ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50'
              : cameraLoading
              ? 'bg-gray-600 animate-pulse'
              : cameraError
              ? 'bg-red-400'
              : 'bg-gray-600'
          }`}>
            {capturedImages.length > 0 && (
              <CheckCircle className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className={`text-lg font-medium transition-colors duration-500 ${
            capturedImages.length > 0 
              ? "text-green-400"
              : faceDetected
              ? "text-green-400"
              : isDetecting
              ? "text-blue-400"
              : cameraLoading
              ? "text-blue-400"
              : cameraError
              ? "text-red-400"
              : "text-gray-300"
          }`}>
            {capturedImages.length > 0 
              ? "✓ Photo captured successfully!"
              : faceDetected
              ? "✓ Face detected - capturing..."
              : isDetecting
              ? "🔍 Scanning for face..."
              : cameraLoading
              ? "📷 Loading camera..."
              : cameraError
              ? "❌ Camera error"
              : autoStart
              ? `📸 Ready to capture your ${isLogin ? 'verification' : 'profile'} photo`
              : `📸 Ready to capture your ${isLogin ? 'verification' : 'profile'} photo`
            }
          </p>

          <p className="text-sm text-gray-400">
            {cameraError
              ? "Please check camera permissions and try again"
              : cameraLoading
              ? "Initializing camera and face detection..."
              : !isLoaded 
              ? "Loading face recognition models..."
              : autoStart 
              ? "Detection will start automatically when ready"
              : isDetecting 
              ? "Hold still and look directly at the camera"
              : "Position your face in the circle for automatic capture"
            }
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {capturedImages.length === 0 && !isDetecting && !autoStart && isLoaded && !cameraLoading && !cameraError && (
          <Button 
            onClick={startFaceDetection}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            disabled={!webcamReady || !isLoaded || cameraLoading}
          >
            <Scan className="mr-2 h-5 w-5" />
            {webcamReady && isLoaded && !cameraLoading ? 'Start Scanning' : 'Loading...'}
          </Button>
        )}

        {capturedImages.length > 0 && (
          <>
            <Button 
              onClick={reset}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <div className="flex items-center space-x-3 text-green-400 px-6 py-3">
              <CheckCircle className="h-6 w-6 animate-pulse" />
              <span className="font-semibold">Photo Ready!</span>
            </div>
          </>
        )}
      </div>

      {capturedImages.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h4 className="text-center text-white font-medium">Captured Photo</h4>
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-600 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img
                src={capturedImages[0]}
                alt="Captured face"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
