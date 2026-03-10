import * as Sentry from '@sentry/react';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFaceTracking, type ReadyDescriptor, type LightingCondition } from '@/hooks/useFaceTracking';

interface AutoFaceDetectionProps {
  onImagesCapture: (images: string[]) => void;
  onReadyDescriptorCapture?: (descriptor: ReadyDescriptor) => void;
  isScanning?: boolean;
  disabled?: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const AutoFaceDetection: React.FC<AutoFaceDetectionProps> = ({
  onImagesCapture,
  onReadyDescriptorCapture,
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
  const onReadyDescriptorCaptureRef = useRef(onReadyDescriptorCapture);
  onReadyDescriptorCaptureRef.current = onReadyDescriptorCapture;
  const hasCapturedRef = useRef(false);
  const smoothPositionRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const targetPositionRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [smoothPosition, setSmoothPosition] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const [lightingHint, setLightingHint] = useState<string | null>(null);
  const lightingHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poorLightingStartRef = useRef<number | null>(null);

  // ── Lighting guidance (Phase 3): show hint after 3s of poor lighting ──
  useEffect(() => {
    if (!lightingCondition || lightingCondition === 'ok') {
      poorLightingStartRef.current = null;
      if (lightingHintTimerRef.current) {
        clearTimeout(lightingHintTimerRef.current);
        lightingHintTimerRef.current = null;
      }
      // Clear hint after a short delay so it doesn't flash
      lightingHintTimerRef.current = setTimeout(() => setLightingHint(null), 1000);
      return;
    }
    // Start timing poor lighting
    if (!poorLightingStartRef.current) {
      poorLightingStartRef.current = Date.now();
    }
    // Only show hint after 3 seconds of continuous poor lighting
    const elapsed = Date.now() - poorLightingStartRef.current;
    if (elapsed >= 3000) {
      const hints: Record<string, string> = {
        tooDark: 'Move to a brighter area',
        tooBright: 'Reduce glare — move away from direct light',
        uneven: 'Even out your lighting',
      };
      setLightingHint(hints[lightingCondition] ?? null);
    }
  }, [lightingCondition]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  // Initialize face tracking (includes liveness detection + ready descriptor pre-computation)
  const { facePosition, isTracking, livenessState, readyDescriptor, lightingCondition } = useFaceTracking({
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

  // ── Continuous rAF smoothing loop (Phase 3) ──
  // Runs at 60fps independent of detection frequency.
  // When a new detection arrives, targetPositionRef updates and the loop
  // smoothly interpolates toward it over multiple frames.
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
    }
    targetPositionRef.current = target;
  }, [facePosition]);

  useEffect(() => {
    const smoothLoop = () => {
      const cur = smoothPositionRef.current;
      const tgt = targetPositionRef.current;
      if (cur && tgt) {
        const t = 0.15; // lower = smoother, higher = more responsive
        const next = {
          x: lerp(cur.x, tgt.x, t),
          y: lerp(cur.y, tgt.y, t),
          w: lerp(cur.w, tgt.w, t),
          h: lerp(cur.h, tgt.h, t),
        };
        smoothPositionRef.current = next;
        setSmoothPosition({ ...next });
      }
      rafRef.current = requestAnimationFrame(smoothLoop);
    };
    rafRef.current = requestAnimationFrame(smoothLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
        Sentry.captureException(err, {
          tags: { component: 'AutoFaceDetection', action: 'camera-init' },
        });
        setHasPermission(false);
        setError('Camera access denied or not available');
        setIsLoading(false);
      }
    };

    initializeCamera();
  }, []);

  // Auto-detection logic — gated on liveness to reject static photos
  // Phase 2: When a readyDescriptor is available (pre-computed during tracking),
  // submit it directly — no capture delay. Falls back to traditional capture if not ready.
  useEffect(() => {
    if (!hasPermission || isLoading || isScanning || disabled || !faceDetected || hasCapturedRef.current) return;
    // Require liveness confirmation before allowing capture
    if (!livenessState.isLive) return;

    let cancelled = false;

    // ── Fast path: use pre-computed ready descriptor (zero capture delay) ──
    if (readyDescriptor && onReadyDescriptorCaptureRef.current) {
      // Small delay for visual feedback that liveness passed
      const fastTimer = setTimeout(() => {
        if (cancelled || hasCapturedRef.current) return;
        hasCapturedRef.current = true;
        setDetectionProgress(100);
        onReadyDescriptorCaptureRef.current!(readyDescriptor);
      }, 300);
      return () => { cancelled = true; clearTimeout(fastTimer); setDetectionProgress(0); };
    }

    // ── Fallback: traditional capture (only when readyDescriptor is not available) ──
    let detectionCount = 0;
    const maxDetections = 2;
    const detectionInterval = 1000;
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
          // Capture a single image (was 3, but readyDescriptor handles the quality path)
          const capturedImage = webcamRef.current?.getScreenshot();
          if (!cancelled && capturedImage) {
            onImagesCaptureRef.current([capturedImage]);
          }
          return;
        }
      }

      if (!cancelled) {
        pendingTimer = setTimeout(autoDetect, detectionInterval);
      }
    };

    const startTimer = setTimeout(autoDetect, 600);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (pendingTimer) clearTimeout(pendingTimer);
      setDetectionProgress(0);
    };
  }, [hasPermission, isLoading, isScanning, disabled, faceDetected, livenessState.isLive, readyDescriptor]);

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
                Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
                  tags: { component: 'AutoFaceDetection', action: 'webcam-media-error' },
                });
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

          {/* Dynamic Face Guide Overlay (Phase 3: unified progress + color gradient) */}
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
                    willChange: 'transform, left, top, width, height'
                  }}
                >
                  {/* Oval border color transitions: blue→yellow→green based on liveness confidence */}
                  <div
                    className="w-full h-full rounded-full bg-transparent relative transition-colors duration-300"
                    style={{
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderColor: livenessState.isLive
                        ? 'rgb(34, 197, 94)' // green-500
                        : livenessState.confidence > 0.3
                          ? 'rgb(234, 179, 8)' // yellow-500
                          : 'rgb(59, 130, 246)', // blue-500
                      boxShadow: livenessState.isLive
                        ? '0 0 20px rgba(34,197,94,0.4), inset 0 0 20px rgba(34,197,94,0.1)'
                        : livenessState.confidence > 0.3
                          ? '0 0 15px rgba(234,179,8,0.3)'
                          : '0 0 10px rgba(59,130,246,0.2)',
                    }}
                  >
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: livenessState.isLive
                          ? 'rgba(134, 239, 172, 0.5)' // green-300/50
                          : livenessState.confidence > 0.3
                            ? 'rgba(253, 224, 71, 0.4)' // yellow-300/40
                            : 'rgba(147, 197, 253, 0.4)', // blue-300/40
                        animation: livenessState.isLive ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  </div>
                  {/* Single instruction line below the oval */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                    <p className="text-white text-xs font-medium bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                      {livenessState.isLive
                        ? 'Verified — processing...'
                        : lightingHint
                          ? lightingHint
                          : livenessState.confidence > 0.3
                            ? 'Almost there — blink naturally'
                            : 'Hold still — verifying liveness...'}
                    </p>
                  </div>
                </div>
              ) : (
                // Default centered guide when no face detected
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-60 border-[3px] border-blue-500/70 rounded-full bg-transparent">
                      <div className="absolute inset-2 border-2 border-blue-300/40 rounded-full" />
                    </div>
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center">
                      <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
                        {isTracking ? 'Looking for your face...' : 'Position your face in the oval'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Phase 3: No black overlay flash — camera stays visible during scanning.
              Progress and scanning states are shown via the oval color + instruction text. */}
          {isScanning && smoothPosition && (
            <div className="absolute pointer-events-none" style={{
              left: `${smoothPosition.x}px`,
              top: `${smoothPosition.y}px`,
              width: `${Math.max(smoothPosition.w, 100)}px`,
              height: `${Math.max(smoothPosition.h, 130)}px`,
              transform: 'translate(-50%, -50%)',
            }}>
              {/* Animated green ring fill during analysis */}
              <div className="w-full h-full rounded-full border-[3px] border-emerald-400 relative" style={{
                boxShadow: '0 0 25px rgba(52,211,153,0.5), inset 0 0 25px rgba(52,211,153,0.15)',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}>
                <div className="absolute inset-1 rounded-full border-2 border-emerald-300/40 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                <p className="text-emerald-300 text-xs font-medium bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  Verifying identity...
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Phase 3: Removed duplicate bottom text — the oval overlay
            instruction is the single source of truth for user guidance. */}
      </CardContent>
    </Card>
  );
};

export default AutoFaceDetection;
