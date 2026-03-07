import { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle, Camera } from "lucide-react";
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
  const [attempts, setAttempts] = useState(0);
  const [bestImage, setBestImage] = useState<string | null>(null);
  const [bestQuality, setBestQuality] = useState(0);
  const [webcamReady, setWebcamReady] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const captureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);
  const captureAndAnalyzeRef = useRef<() => Promise<void>>();
  const { isLoaded } = useFaceAPI();

  // Use refs for values the interval callback needs to avoid stale closures
  const attemptsRef = useRef(0);
  const bestQualityRef = useRef(0);
  const bestImageRef = useRef<string | null>(null);
  const isCapturingRef = useRef(false);

  const videoConstraints = {
    width: 640,
    height: 640,
    facingMode: "user"
  };

  const scheduleNextCapture = useCallback(() => {
    if (!isCapturingRef.current) return;
    captureTimerRef.current = setTimeout(() => captureAndAnalyzeRef.current?.(), 2000);
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current || !isLoaded || !isCapturingRef.current || busyRef.current) {
      if (isCapturingRef.current && busyRef.current) scheduleNextCapture();
      return;
    }
    busyRef.current = true;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      busyRef.current = false;
      scheduleNextCapture();
      return;
    }

    try {
      console.log(`Capture attempt ${attemptsRef.current + 1}/${maxAttempts} — analyzing...`);
      const faceAnalysis = await analyzeFaceQuality(imageSrc);
      
      if (faceAnalysis) {
        const quality = faceAnalysis.qualityScore;
        
        if (quality > bestQualityRef.current) {
          bestImageRef.current = imageSrc;
          bestQualityRef.current = quality;
          setBestImage(imageSrc);
          setBestQuality(quality);
        }

        console.log(`  → Quality ${(quality * 100).toFixed(1)}% (best: ${(bestQualityRef.current * 100).toFixed(1)}%, threshold: ${(qualityThreshold * 100).toFixed(1)}%)`);

        if (quality >= qualityThreshold) {
          console.log('Quality threshold met!');
          isCapturingRef.current = false;
          busyRef.current = false;
          setIsCapturing(false);
          setCaptureSuccess(true);
          onImageCapture(imageSrc, quality);
          return;
        }
      } else {
        console.log('  → No face detected in current frame');
      }

      attemptsRef.current += 1;
      const newAttempts = attemptsRef.current;
      setAttempts(newAttempts);

      if (newAttempts >= maxAttempts) {
        console.log(`Max attempts (${maxAttempts}) reached. Best quality: ${(bestQualityRef.current * 100).toFixed(1)}%`);
        isCapturingRef.current = false;
        busyRef.current = false;
        setIsCapturing(false);
        
        if (bestImageRef.current && bestQualityRef.current > 0.15) {
          setCaptureSuccess(true);
          onImageCapture(bestImageRef.current, bestQualityRef.current);
        } else {
          reset();
        }
        return;
      }
    } catch (error) {
      console.error('Error during capture and analysis:', error);
    }
    busyRef.current = false;
    scheduleNextCapture();
  }, [isLoaded, maxAttempts, onImageCapture, qualityThreshold, scheduleNextCapture]);

  // Keep ref in sync so scheduleNextCapture always calls latest version
  captureAndAnalyzeRef.current = captureAndAnalyze;

  const startContinuousCapture = useCallback(() => {
    if (!webcamReady || !isLoaded) {
      return;
    }

    // Reset all refs and state
    attemptsRef.current = 0;
    bestQualityRef.current = 0;
    bestImageRef.current = null;
    isCapturingRef.current = true;

    setIsCapturing(true);
    setAttempts(0);
    setBestImage(null);
    setBestQuality(0);
    setCaptureSuccess(false);
    
    console.log(`Starting continuous capture with ${qualityThreshold * 100}% quality threshold, max ${maxAttempts} attempts`);
    
    // Start first capture after a short delay, then chain subsequent captures
    captureTimerRef.current = setTimeout(captureAndAnalyze, 1000);
  }, [webcamReady, isLoaded, qualityThreshold, maxAttempts, captureAndAnalyze]);

  const reset = () => {
    isCapturingRef.current = false;
    attemptsRef.current = 0;
    bestQualityRef.current = 0;
    bestImageRef.current = null;

    setIsCapturing(false);
    setAttempts(0);
    setBestImage(null);
    setBestQuality(0);
    setCaptureSuccess(false);
    
    if (captureTimerRef.current) {
      clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }
  };

  const onWebcamReady = useCallback(() => {
    console.log('Webcam ready for continuous capture');
    setWebcamReady(true);
  }, []);

  // Auto-start capture when webcam is ready and autoStart is enabled
  useEffect(() => {
    if (autoStart && webcamReady && isLoaded && !isCapturing && !captureSuccess) {
      startContinuousCapture();
    }
  }, [autoStart, webcamReady, isLoaded, isCapturing, captureSuccess, startContinuousCapture]);

  useEffect(() => {
    return () => {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
      }
    };
  }, []);

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
          
          {/* Simple face detection overlay */}
          <div className="absolute inset-4">
            <div className={`w-full h-full rounded-full border-4 transition-all duration-500 ${
              captureSuccess
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
              {captureSuccess ? 'Captured!' : isCapturing ? 'Capturing...' : 'Ready to capture'}
            </div>
          </div>

          {/* Success overlay */}
          {captureSuccess && (
            <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center animate-pulse">
              <div className="text-2xl font-bold text-white drop-shadow-lg flex items-center">
                <CheckCircle className="mr-2 h-8 w-8" />
                Captured!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-2">
        <p className={`text-lg font-medium transition-colors duration-500 ${
          captureSuccess
            ? "text-green-400"
            : isCapturing
            ? "text-blue-400"
            : "text-gray-300"
        }`}>
          {captureSuccess
            ? "✓ Face captured successfully!"
            : isCapturing
            ? "🔍 Looking for your face..."
            : "📸 Ready for face capture"
          }
        </p>

        <p className="text-sm text-gray-400">
          {!isLoaded 
            ? "Waiting for face recognition to load..."
            : isCapturing 
            ? `Attempt ${attempts + 1}/${maxAttempts} — Hold still and look at the camera${bestQuality > 0 ? ` (best: ${(bestQuality * 100).toFixed(0)}%)` : ''}`
            : "Will automatically capture when your face is detected"
          }
        </p>
      </div>

      {/* Controls */}
      {!autoStart && (
        <div className="flex justify-center space-x-4">
          {!isCapturing && !captureSuccess ? (
            <Button 
              onClick={startContinuousCapture}
              className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-semibold"
              disabled={!webcamReady || !isLoaded}
            >
              <Camera className="mr-2 h-5 w-5" />
              Start Face Capture
            </Button>
          ) : !captureSuccess ? (
            <Button 
              onClick={reset}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 rounded-xl font-semibold"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Stop & Reset
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ContinuousQualityCapture;
