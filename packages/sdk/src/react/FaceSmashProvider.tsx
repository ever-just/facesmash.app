import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { FaceSmashClient } from '../core/client';
import type { FaceSmashConfig, FaceSmashEvent } from '../core/types';

interface FaceSmashContextValue {
  client: FaceSmashClient;
  isReady: boolean;
  isLoading: boolean;
  loadProgress: number;
  error: string | null;
  retryInit: () => void;
}

const FaceSmashContext = createContext<FaceSmashContextValue | null>(null);

export interface FaceSmashProviderProps {
  children: ReactNode;
  /** SDK configuration */
  config?: FaceSmashConfig;
  /** Called when models finish loading */
  onReady?: () => void;
  /** Called on model loading error */
  onError?: (error: string) => void;
  /** Called for any SDK event */
  onEvent?: (event: FaceSmashEvent) => void;
}

export function FaceSmashProvider({
  children,
  config,
  onReady,
  onError,
  onEvent,
}: FaceSmashProviderProps) {
  const clientRef = useRef<FaceSmashClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new FaceSmashClient(config);
  }
  const client = clientRef.current;

  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const initModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    const success = await client.init((progress) => {
      setLoadProgress(progress);
    });

    if (success) {
      setIsReady(true);
      setIsLoading(false);
      onReady?.();
    } else {
      const msg = 'Failed to load face recognition models';
      setError(msg);
      setIsLoading(false);
      onError?.(msg);
    }
  }, [client, onReady, onError]);

  useEffect(() => {
    initModels();
  }, [initModels]);

  // Forward events
  useEffect(() => {
    if (!onEvent) return;
    return client.on(onEvent);
  }, [client, onEvent]);

  const retryInit = useCallback(() => {
    initModels();
  }, [initModels]);

  return (
    <FaceSmashContext.Provider
      value={{ client, isReady, isLoading, loadProgress, error, retryInit }}
    >
      {children}
    </FaceSmashContext.Provider>
  );
}

export function useFaceSmash(): FaceSmashContextValue {
  const ctx = useContext(FaceSmashContext);
  if (!ctx) {
    throw new Error('useFaceSmash must be used within a <FaceSmashProvider>');
  }
  return ctx;
}
