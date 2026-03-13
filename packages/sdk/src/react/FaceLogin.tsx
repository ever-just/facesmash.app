import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFaceSmash } from './FaceSmashProvider';
import { useFaceTracking } from './useFaceTracking';
import type { LoginResult, ReadyDescriptor, LivenessState, LightingCondition } from '../core/types';

export interface FaceLoginProps {
  /** Called with the login result when authentication completes (API mode) */
  onResult?: (result: LoginResult) => void;
  /** Called with the ready descriptor when liveness passes (descriptor mode) */
  onDescriptorReady?: (descriptor: ReadyDescriptor) => void;
  /** Called on liveness state changes */
  onLivenessUpdate?: (state: LivenessState) => void;
  /** Called on lighting condition changes */
  onLightingChange?: (condition: LightingCondition) => void;
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
 * Drop-in face login component with liveness detection.
 * Renders a webcam feed, detects face with TinyFaceDetector,
 * validates liveness via EAR blink + head pose motion,
 * pre-computes descriptor, and authenticates.
 */
export function FaceLogin({
  onResult,
  onDescriptorReady,
  onLivenessUpdate,
  onLightingChange,
  autoStart = true,
  className,
  overlay,
  loadingContent,
  errorContent,
}: FaceLoginProps) {
  const { client, isReady, isLoading, error: initError } = useFaceSmash();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const authAttemptedRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'authenticating' | 'done' | 'error'>('loading');

  const tracking = useFaceTracking({ config: client.config });

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
        // Start tracking once video is playing
        tracking.startTracking(videoRef.current);
      }
      setCameraError(null);
      setStatus('scanning');
    } catch {
      setCameraError('Camera access denied or not available');
      setStatus('error');
    }
  }, [tracking]);

  // Stop camera
  const stopCamera = useCallback(() => {
    tracking.stopTracking();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, [tracking]);

  // Forward liveness updates
  useEffect(() => {
    onLivenessUpdate?.(tracking.livenessState);
  }, [tracking.livenessState, onLivenessUpdate]);

  // Forward lighting updates
  useEffect(() => {
    onLightingChange?.(tracking.lightingCondition);
  }, [tracking.lightingCondition, onLightingChange]);

  // Auto-authenticate when liveness passes and descriptor is ready
  useEffect(() => {
    if (
      tracking.livenessState.isLive &&
      tracking.readyDescriptor &&
      !authAttemptedRef.current &&
      status === 'scanning'
    ) {
      authAttemptedRef.current = true;

      // Descriptor mode: just return the descriptor
      if (onDescriptorReady) {
        onDescriptorReady(tracking.readyDescriptor);
        setStatus('done');
        stopCamera();
        return;
      }

      // API mode: send descriptor to server
      if (onResult && client.hasApiClient) {
        setStatus('authenticating');
        const desc = tracking.readyDescriptor.descriptor;
        client.login(desc).then((result) => {
          onResult(result);
          setStatus(result.success ? 'done' : 'error');
          if (result.success) stopCamera();
        });
      }
    }
  }, [tracking.livenessState.isLive, tracking.readyDescriptor, status, client, onResult, onDescriptorReady, stopCamera]);

  // Initialize
  useEffect(() => {
    if (isReady && autoStart) {
      startCamera();
    }
    return () => stopCamera();
  }, [isReady, autoStart, startCamera, stopCamera]);

  const retry = useCallback(() => {
    authAttemptedRef.current = false;
    setCameraError(null);
    tracking.reset();
    setStatus('loading');
    startCamera();
  }, [startCamera, tracking]);

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
