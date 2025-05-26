
import { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface WebcamCaptureProps {
  onImagesCapture: (images: string[]) => void;
  isLogin?: boolean;
}

const WebcamCapture = ({ onImagesCapture, isLogin = false }: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const targetCaptures = 1; // Changed to only take 1 photo

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const newImages = [imageSrc]; // Only one image now
      setCapturedImages(newImages);
      onImagesCapture(newImages);
      setIsCapturing(false);
    }
  }, [onImagesCapture]);

  const startAutoCapture = () => {
    if (capturedImages.length >= targetCaptures) return;
    
    setIsCapturing(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          capture();
          setCountdown(null);
          return null;
        }
        return (prev || 0) - 1;
      });
    }, 1000);
  };

  const reset = () => {
    setCapturedImages([]);
    setIsCapturing(false);
    setCountdown(null);
  };

  return (
    <div className="space-y-6">
      {/* Webcam Display */}
      <div className="relative">
        <div className="relative mx-auto w-full max-w-md aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-cyan-400/20">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
          />
          
          {/* Countdown Overlay */}
          {countdown && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-6xl font-bold text-cyan-400 animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Face Detection Guide */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-cyan-400/50 rounded-full">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                <span className="text-xs text-cyan-400 bg-slate-900/80 px-2 py-1 rounded">
                  Position your face here
                </span>
              </div>
            </div>
          </div>

          {/* Scanning Animation */}
          {isCapturing && !countdown && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 animate-bounce"></div>
            </div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full ${
            capturedImages.length > 0 
              ? 'bg-cyan-400' 
              : isCapturing
              ? 'bg-cyan-400/50 animate-pulse'
              : 'bg-slate-600'
          }`} />
        </div>
        
        <p className="text-gray-300">
          {capturedImages.length === 0 
            ? `Ready to capture your ${isLogin ? 'verification' : 'profile'} photo`
            : "Photo captured successfully!"
          }
        </p>

        <p className="text-sm text-gray-400">
          {isLogin 
            ? "We'll take 1 photo to verify your identity"
            : "We'll take 1 photo to create your face profile"
          }
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {capturedImages.length === 0 && !isCapturing && (
          <Button 
            onClick={startAutoCapture}
            className="bg-cyan-500 hover:bg-cyan-600 px-8 py-3"
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
        )}

        {capturedImages.length > 0 && (
          <>
            <Button 
              onClick={reset}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Photo Ready!</span>
            </div>
          </>
        )}
      </div>

      {/* Captured Image Preview */}
      {capturedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-center text-white font-medium">Captured Photo</h4>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-cyan-400/20">
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
