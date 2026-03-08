import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFaceSmash } from './FaceSmashProvider';
import type { LoginResult } from '../core/types';

export interface FaceLoginProps {
  /** Called with the login result when authentication completes */
  onResult: (result: LoginResult) => void;
  /** Number of images to capture for matching (default: 3) */
  captureCount?: number;
  /** Delay between captures in ms (default: 500) */
  captureDelay?: number;
  /** Auto-start scanning when component mounts (default: true) */
  autoStart?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom overlay content rendered on top of the video */
  overlay?: React.ReactNode;
  /** Custom loading content */
  loadingContent?: React.ReactNode;
  /** Custom error content */
  errorContent?: (error: string, retry: () => void) => React.ReactNode;
}

/**
 * Drop-in face login component.
 * Renders a webcam feed, auto-detects a face, captures images, and authenticates.
 */
export function FaceLogin({
  onResult,
  captureCount = 3,
  captureDelay = 500,
  autoStart = true,
  className,
  overlay,
  loadingContent,
  errorContent,
}: FaceLoginProps) {
  const { client, isReady, isLoading, error: initError } = useFaceSmash();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'done' | 'error'>('loading');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraError(null);
    } catch {
      setCameraError('Camera access denied or not available');
      setStatus('error');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Capture a frame as base64
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  // Scan and authenticate
  const scan = useCallback(async () => {
    if (!isReady || isScanning) return;
    setIsScanning(true);
    setStatus('scanning');

    const images: string[] = [];
    for (let i = 0; i < captureCount; i++) {
      const frame = captureFrame();
      if (frame) images.push(frame);
      if (i < captureCount - 1) {
        await new Promise((r) => setTimeout(r, captureDelay));
      }
    }

    if (images.length === 0) {
      const result: LoginResult = { success: false, error: 'Failed to capture images from camera' };
      onResult(result);
      setIsScanning(false);
      setStatus('error');
      return;
    }

    const result = await client.login(images);
    onResult(result);
    setIsScanning(false);
    setStatus('done');
  }, [isReady, isScanning, captureCount, captureDelay, captureFrame, client, onResult]);

  // Initialize
  useEffect(() => {
    if (isReady) {
      startCamera();
      setStatus('ready');
    }
    return () => stopCamera();
  }, [isReady, startCamera, stopCamera]);

  // Auto-start scanning once camera is ready
  useEffect(() => {
    if (autoStart && status === 'ready' && !isScanning) {
      const timer = setTimeout(scan, 2000); // 2s delay to let user position face
      return () => clearTimeout(timer);
    }
  }, [autoStart, status, isScanning, scan]);

  const retry = useCallback(() => {
    setCameraError(null);
    setStatus('loading');
    startCamera().then(() => setStatus('ready'));
  }, [startCamera]);

  // Render
  const displayError = cameraError || initError;

  if (displayError && errorContent) {
    return <>{errorContent(displayError, retry)}</>;
  }

  if (isLoading && loadingContent) {
    return <>{loadingContent}</>;
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {overlay}
      {displayError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <div>
            <p>{displayError}</p>
            <button onClick={retry} style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
