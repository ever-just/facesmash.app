
import { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Square, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from 'face-api.js';

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
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const newImages = [imageSrc];
      setCapturedImages(newImages);
      onImagesCapture(newImages);
      setIsDetecting(false);
      setFaceDetected(false);
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }
  }, [onImagesCapture]);

  const startFaceDetection = useCallback(async () => {
    if (!webcamRef.current?.video || isDetecting || !webcamReady) return;
    
    setIsDetecting(true);
    console.log('Starting automatic face detection...');
    
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
          }, 300);
          
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 200);
  }, [capture, isDetecting, webcamReady]);

  const onWebcamReady = useCallback(() => {
    console.log('Webcam is ready');
    setWebcamReady(true);
  }, []);

  // Auto-start detection when webcam is ready and autoStart is enabled
  useEffect(() => {
    if (webcamReady && autoStart && !isDetecting && capturedImages.length === 0) {
      console.log('Auto-starting face detection...');
      // Small delay to ensure everything is properly initialized
      setTimeout(() => {
        startFaceDetection();
      }, 500);
    }
  }, [webcamReady, autoStart, startFaceDetection, isDetecting, capturedImages.length]);

  const reset = () => {
    setCapturedImages([]);
    setIsDetecting(false);
    setFaceDetected(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="relative mx-auto w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden border-2 border-gray-600">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            onUserMedia={onWebcamReady}
            mirrored={true}
          />
          
          {faceDetected && (
            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
              <div className="text-4xl font-bold text-white animate-pulse">
                Face Detected!
              </div>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-white/50 rounded-full">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                <span className="text-xs text-white bg-black/80 px-2 py-1 rounded">
                  Position your face here
                </span>
              </div>
            </div>
          </div>

          {isDetecting && !faceDetected && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-white animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full ${
            capturedImages.length > 0 
              ? 'bg-white' 
              : faceDetected
              ? 'bg-white animate-pulse'
              : isDetecting
              ? 'bg-white/50 animate-pulse'
              : 'bg-gray-600'
          }`} />
        </div>
        
        <p className="text-gray-300">
          {capturedImages.length > 0 
            ? "Photo captured successfully!"
            : faceDetected
            ? "Face detected - capturing..."
            : isDetecting
            ? "Looking for your face..."
            : autoStart
            ? `Getting ready to capture your ${isLogin ? 'verification' : 'profile'} photo...`
            : `Ready to capture your ${isLogin ? 'verification' : 'profile'} photo`
          }
        </p>

        <p className="text-sm text-gray-400">
          {autoStart 
            ? "Detection will start automatically when camera is ready"
            : isLogin 
            ? "Position your face in the circle for automatic capture"
            : "Look at the camera - we'll automatically take your photo when ready"
          }
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        {capturedImages.length === 0 && !isDetecting && !autoStart && (
          <Button 
            onClick={startFaceDetection}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3"
            disabled={!webcamReady}
          >
            <Square className="mr-2 h-4 w-4" />
            {webcamReady ? 'Start Detection' : 'Loading Camera...'}
          </Button>
        )}

        {capturedImages.length > 0 && (
          <>
            <Button 
              onClick={reset}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <div className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-5 w-5" />
              <span>Photo Ready!</span>
            </div>
          </>
        )}
      </div>

      {capturedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-center text-white font-medium">Captured Photo</h4>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-600">
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
