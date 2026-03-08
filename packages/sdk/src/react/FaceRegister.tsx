import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFaceSmash } from './FaceSmashProvider';
import type { RegisterResult } from '../core/types';

export interface FaceRegisterProps {
  /** User's display name */
  name: string;
  /** Optional email */
  email?: string;
  /** Called with the registration result */
  onResult: (result: RegisterResult) => void;
  /** Number of images to capture (default: 3) */
  captureCount?: number;
  /** Delay between captures in ms (default: 500) */
  captureDelay?: number;
  /** Auto-start when component mounts (default: true) */
  autoStart?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom overlay */
  overlay?: React.ReactNode;
  /** Custom loading content */
  loadingContent?: React.ReactNode;
  /** Custom error content */
  errorContent?: (error: string, retry: () => void) => React.ReactNode;
}

/**
 * Drop-in face registration component.
 * Renders a webcam feed, captures face images, and registers a new user.
 */
export function FaceRegister({
  name,
  email,
  onResult,
  captureCount = 3,
  captureDelay = 500,
  autoStart = true,
  className,
  overlay,
  loadingContent,
  errorContent,
}: FaceRegisterProps) {
  const { client, isReady, isLoading, error: initError } = useFaceSmash();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'capturing' | 'done' | 'error'>('loading');

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

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

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

  const capture = useCallback(async () => {
    if (!isReady || isCapturing) return;
    setIsCapturing(true);
    setStatus('capturing');

    const images: string[] = [];
    for (let i = 0; i < captureCount; i++) {
      const frame = captureFrame();
      if (frame) images.push(frame);
      if (i < captureCount - 1) {
        await new Promise((r) => setTimeout(r, captureDelay));
      }
    }

    if (images.length === 0) {
      const result: RegisterResult = { success: false, error: 'Failed to capture images' };
      onResult(result);
      setIsCapturing(false);
      setStatus('error');
      return;
    }

    const result = await client.register(name, images, email);
    onResult(result);
    setIsCapturing(false);
    setStatus('done');
  }, [isReady, isCapturing, captureCount, captureDelay, captureFrame, client, name, email, onResult]);

  useEffect(() => {
    if (isReady) {
      startCamera();
      setStatus('ready');
    }
    return () => stopCamera();
  }, [isReady, startCamera, stopCamera]);

  useEffect(() => {
    if (autoStart && status === 'ready' && !isCapturing) {
      const timer = setTimeout(capture, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, status, isCapturing, capture]);

  const retry = useCallback(() => {
    setCameraError(null);
    setStatus('loading');
    startCamera().then(() => setStatus('ready'));
  }, [startCamera]);

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
