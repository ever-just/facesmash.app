import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFaceSmash } from './FaceSmashProvider';
import { useFaceTracking } from './useFaceTracking';
import type { RegisterResult, ReadyDescriptor, LivenessState, LightingCondition } from '../core/types';

export interface FaceRegisterProps {
  /** User's email for registration (API mode) */
  email?: string;
  /** User's display name (API mode) */
  fullName?: string;
  /** Called with the registration result (API mode) */
  onResult?: (result: RegisterResult) => void;
  /** Called with the ready descriptor when liveness passes (descriptor mode) */
  onDescriptorReady?: (descriptor: ReadyDescriptor) => void;
  /** Called on liveness state changes */
  onLivenessUpdate?: (state: LivenessState) => void;
  /** Called on lighting condition changes */
  onLightingChange?: (condition: LightingCondition) => void;
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
 * Drop-in face registration component with liveness detection.
 */
export function FaceRegister({
  email,
  fullName,
  onResult,
  onDescriptorReady,
  onLivenessUpdate,
  onLightingChange,
  autoStart = true,
  className,
  overlay,
  loadingContent,
  errorContent,
}: FaceRegisterProps) {
  const { client, isReady, isLoading, error: initError } = useFaceSmash();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureAttemptedRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'registering' | 'done' | 'error'>('loading');

  const tracking = useFaceTracking({ config: client.config });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        tracking.startTracking(videoRef.current);
      }
      setCameraError(null);
      setStatus('scanning');
    } catch {
      setCameraError('Camera access denied or not available');
      setStatus('error');
    }
  }, [tracking]);

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

  // Auto-register when liveness passes and descriptor is ready
  useEffect(() => {
    if (
      tracking.livenessState.isLive &&
      tracking.readyDescriptor &&
      !captureAttemptedRef.current &&
      status === 'scanning'
    ) {
      captureAttemptedRef.current = true;

      // Descriptor mode
      if (onDescriptorReady) {
        onDescriptorReady(tracking.readyDescriptor);
        setStatus('done');
        stopCamera();
        return;
      }

      // API mode
      if (onResult && client.hasApiClient && email) {
        setStatus('registering');
        client.register({
          email,
          fullName,
          descriptor: tracking.readyDescriptor.descriptor,
          qualityScore: tracking.readyDescriptor.qualityScore,
        }).then((result) => {
          onResult(result);
          setStatus(result.success ? 'done' : 'error');
          if (result.success) stopCamera();
        });
      }
    }
  }, [tracking.livenessState.isLive, tracking.readyDescriptor, status, client, email, fullName, onResult, onDescriptorReady, stopCamera]);

  useEffect(() => {
    if (isReady && autoStart) {
      startCamera();
    }
    return () => stopCamera();
  }, [isReady, autoStart, startCamera, stopCamera]);

  const retry = useCallback(() => {
    captureAttemptedRef.current = false;
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
