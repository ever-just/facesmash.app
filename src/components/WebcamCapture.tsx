
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
  const [currentCapture, setCurrentCapture] = useState(0);
  const targetCaptures = isLogin ? 3 : 5;

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const newImages = [...capturedImages, imageSrc];
      setCapturedImages(newImages);
      setCurrentCapture(prev => prev + 1);
      
      if (newImages.length >= targetCaptures) {
        onImagesCapture(newImages);
      }
    }
  }, [capturedImages, onImagesCapture, targetCaptures]);

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
          
          // Continue capturing if we need more images
          if (capturedImages.length + 1 < targetCaptures) {
            setTimeout(() => startAutoCapture(), 1500);
          } else {
            setIsCapturing(false);
          }
          return null;
        }
        return (prev || 0) - 1;
      });
    }, 1000);
  };

  const reset = () => {
    setCapturedImages([]);
    setCurrentCapture(0);
    setIsCapturing(false);
    setCountdown(null);
  };

  useEffect(() => {
    if (capturedImages.length > 0 && capturedImages.length < targetCaptures) {
      const timer = setTimeout(() => {
        if (!isCapturing) {
          startAutoCapture();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [capturedImages.length, targetCaptures, isCapturing]);

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

      {/* Progress Indicator */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          {Array.from({ length: targetCaptures }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < capturedImages.length 
                  ? 'bg-cyan-400' 
                  : i === capturedImages.length && isCapturing
                  ? 'bg-cyan-400/50 animate-pulse'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        <p className="text-gray-300">
          {capturedImages.length < targetCaptures 
            ? `${capturedImages.length}/${targetCaptures} photos captured`
            : "All photos captured!"
          }
        </p>

        {capturedImages.length < targetCaptures && (
          <p className="text-sm text-gray-400">
            {isLogin 
              ? "We'll take 3 quick photos for verification"
              : "We'll take 5 photos to create your secure face profile"
            }
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {capturedImages.length === 0 && !isCapturing && (
          <Button 
            onClick={startAutoCapture}
            className="bg-cyan-500 hover:bg-cyan-600 px-8 py-3"
          >
            <Camera className="mr-2 h-4 w-4" />
            Start Capture
          </Button>
        )}

        {capturedImages.length > 0 && capturedImages.length < targetCaptures && (
          <Button 
            onClick={reset}
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        )}

        {capturedImages.length >= targetCaptures && (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span>Capture Complete!</span>
          </div>
        )}
      </div>

      {/* Captured Images Preview */}
      {capturedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-center text-white font-medium">Captured Photos</h4>
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {capturedImages.map((image, index) => (
              <div key={index} className="flex-shrink-0">
                <img
                  src={image}
                  alt={`Captured ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-cyan-400/20"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
