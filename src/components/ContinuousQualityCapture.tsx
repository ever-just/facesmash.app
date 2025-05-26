
import { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, CheckCircle, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { analyzeFaceQuality } from "@/utils/enhancedFaceRecognition";
import { useFaceAPI } from '@/contexts/FaceAPIContext';

interface ContinuousQualityCaptureProps {
  onImageCapture: (image: string, quality: number) => void;
  qualityThreshold?: number;
  maxAttempts?: number;
  autoStart?: boolean;
}

const ContinuousQualityCapture = ({ 
  onImageCapture, 
  qualityThreshold = 0.5,
  maxAttempts = 10,
  autoStart = false
}: ContinuousQualityCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [bestImage, setBestImage] = useState<string | null>(null);
  const [bestQuality, setBestQuality] = useState(0);
  const [webcamReady, setWebcamReady] = useState(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isLoaded } = useFaceAPI();

  const videoConstraints = {
    width: 640,
    height: 640,
    facingMode: "user"
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current || !isLoaded) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const faceAnalysis = await analyzeFaceQuality(imageSrc);
      
      if (faceAnalysis) {
        const quality = faceAnalysis.qualityScore;
        setCurrentQuality(quality);
        
        // Keep track of best image
        if (quality > bestQuality) {
          setBestImage(imageSrc);
          setBestQuality(quality);
        }

        console.log(`Quality ${(quality * 100).toFixed(1)}%`);

        // Check if quality meets threshold
        if (quality >= qualityThreshold) {
          console.log('Quality threshold met!');
          setIsCapturing(false);
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
          }
          onImageCapture(imageSrc, quality);
          toast.success(`High-quality photo captured! Quality: ${(quality * 100).toFixed(1)}%`);
          return;
        }
      } else {
        console.log('No face detected in current frame');
        setCurrentQuality(0);
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Check if max attempts reached
      if (newAttempts >= maxAttempts) {
        console.log('Max attempts reached');
        setIsCapturing(false);
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
          captureIntervalRef.current = null;
        }
        
        if (bestImage && bestQuality > 0.3) {
          onImageCapture(bestImage, bestQuality);
          toast.warning(`Used best available photo after ${maxAttempts} attempts. Quality: ${(bestQuality * 100).toFixed(1)}%`);
        } else {
          toast.error("Unable to capture a suitable photo. Please try again with better lighting.");
          reset();
        }
      }
    } catch (error) {
      console.error('Error during capture and analysis:', error);
    }
  }, [attempts, bestQuality, bestImage, isLoaded, maxAttempts, onImageCapture, qualityThreshold]);

  const startContinuousCapture = useCallback(() => {
    if (!webcamReady || !isLoaded) {
      toast.error("Camera not ready. Please wait.");
      return;
    }

    setIsCapturing(true);
    setAttempts(0);
    setCurrentQuality(0);
    setBestImage(null);
    setBestQuality(0);
    
    console.log(`Starting continuous capture with ${qualityThreshold * 100}% quality threshold`);
    
    // Capture every 1.5 seconds
    captureIntervalRef.current = setInterval(captureAndAnalyze, 1500);
  }, [webcamReady, isLoaded, qualityThreshold, captureAndAnalyze]);

  const reset = () => {
    setIsCapturing(false);
    setCurrentQuality(0);
    setAttempts(0);
    setBestImage(null);
    setBestQuality(0);
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const onWebcamReady = useCallback(() => {
    console.log('Webcam ready for continuous capture');
    setWebcamReady(true);
  }, []);

  // Auto-start capture when webcam is ready and autoStart is enabled
  useEffect(() => {
    if (autoStart && webcamReady && isLoaded && !isCapturing) {
      startContinuousCapture();
    }
  }, [autoStart, webcamReady, isLoaded, isCapturing, startContinuousCapture]);

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  const qualityPercentage = Math.round(currentQuality * 100);
  const thresholdPercentage = Math.round(qualityThreshold * 100);
  const progressValue = Math.min((qualityPercentage / thresholdPercentage) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="relative flex justify-center">
        <div className="relative w-80 h-80 bg-black rounded-3xl overflow-hidden border-4 border-gray-600 shadow-2xl">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            onUserMedia={onWebcamReady}
            mirrored={true}
          />
          
          {/* Quality overlay */}
          <div className="absolute inset-4">
            <div className={`w-full h-full rounded-full border-4 transition-all duration-500 ${
              qualityPercentage >= thresholdPercentage
                ? 'border-green-400 shadow-lg shadow-green-400/50' 
                : isCapturing 
                ? 'border-blue-400 shadow-lg shadow-blue-400/30' 
                : 'border-white/50'
            }`}>
              <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg"></div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
              {isCapturing ? 'Capturing...' : 'Ready to capture'}
            </div>
          </div>

          {/* Quality indicator */}
          {isCapturing && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                Quality: {qualityPercentage}% (Target: {thresholdPercentage}%)
              </div>
            </div>
          )}

          {/* Success overlay */}
          {qualityPercentage >= thresholdPercentage && (
            <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center animate-pulse">
              <div className="text-2xl font-bold text-white drop-shadow-lg flex items-center">
                <CheckCircle className="mr-2 h-8 w-8" />
                Perfect Quality!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isCapturing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Quality Progress</span>
            <span>{qualityPercentage}% / {thresholdPercentage}%</span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-3"
          />
        </div>
      )}

      {/* Status */}
      <div className="text-center space-y-2">
        <p className={`text-lg font-medium transition-colors duration-500 ${
          qualityPercentage >= thresholdPercentage
            ? "text-green-400"
            : isCapturing
            ? "text-blue-400"
            : "text-gray-300"
        }`}>
          {qualityPercentage >= thresholdPercentage
            ? "✓ Perfect quality achieved!"
            : isCapturing
            ? `🔍 Analyzing quality... (${qualityPercentage}%)`
            : "📸 Ready for high-quality capture"
          }
        </p>

        <p className="text-sm text-gray-400">
          {!isLoaded 
            ? "Waiting for face recognition to load..."
            : isCapturing 
            ? "Hold still and maintain good lighting for best results"
            : `Will automatically capture when quality reaches ${thresholdPercentage}%`
          }
        </p>
      </div>

      {/* Controls */}
      {!autoStart && (
        <div className="flex justify-center space-x-4">
          {!isCapturing ? (
            <Button 
              onClick={startContinuousCapture}
              className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-semibold"
              disabled={!webcamReady || !isLoaded}
            >
              <Camera className="mr-2 h-5 w-5" />
              Start Quality Capture
            </Button>
          ) : (
            <Button 
              onClick={reset}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 rounded-xl font-semibold"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Stop & Reset
            </Button>
          )}
        </div>
      )}

      {/* Best quality indicator */}
      {bestQuality > 0 && isCapturing && (
        <div className="text-center">
          <p className="text-sm text-green-400">
            Best quality so far: {Math.round(bestQuality * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ContinuousQualityCapture;
