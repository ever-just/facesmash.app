
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeFaceAPI } from '@/utils/faceRecognition';
import { initializeStorage } from '@/services/storageService';

interface FaceAPIContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadProgress: number;
  retryLoading: () => void;
}

const FaceAPIContext = createContext<FaceAPIContextType | undefined>(undefined);

export const useFaceAPI = () => {
  const context = useContext(FaceAPIContext);
  if (context === undefined) {
    throw new Error('useFaceAPI must be used within a FaceAPIProvider');
  }
  return context;
};

interface FaceAPIProviderProps {
  children: ReactNode;
}

export const FaceAPIProvider = ({ children }: FaceAPIProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const loadModels = async () => {
    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      console.log('Starting global Face API initialization...');
      
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      // Initialize storage first
      await initializeStorage();
      
      const success = await initializeFaceAPI();
      
      clearInterval(progressInterval);
      setLoadProgress(100);
      
      if (success) {
        setIsLoaded(true);
        setIsLoading(false);
        console.log('Global Face API initialization completed successfully');
      } else {
        throw new Error('Failed to load face recognition models');
      }
    } catch (err) {
      console.error('Global Face API initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsLoading(false);
      setLoadProgress(0);
    }
  };

  const retryLoading = () => {
    loadModels();
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <FaceAPIContext.Provider
      value={{
        isLoaded,
        isLoading,
        error,
        loadProgress,
        retryLoading,
      }}
    >
      {children}
    </FaceAPIContext.Provider>
  );
};
