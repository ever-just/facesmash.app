import { useState, useCallback } from 'react';
import { useFaceSmash } from './FaceSmashProvider';
import type { LoginResult, RegisterResult, FaceAnalysis } from '../core/types';

/** Hook for face login flow */
export function useFaceLogin() {
  const { client, isReady } = useFaceSmash();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<LoginResult | null>(null);

  const login = useCallback(
    async (images: string[]): Promise<LoginResult> => {
      if (!isReady) {
        return { success: false, error: 'Models not loaded yet' };
      }
      setIsScanning(true);
      setResult(null);

      const loginResult = await client.login(images);
      setResult(loginResult);
      setIsScanning(false);
      return loginResult;
    },
    [client, isReady]
  );

  const reset = useCallback(() => {
    setIsScanning(false);
    setResult(null);
  }, []);

  return { login, isScanning, result, reset, isReady };
}

/** Hook for face registration flow */
export function useFaceRegister() {
  const { client, isReady } = useFaceSmash();
  const [isRegistering, setIsRegistering] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);

  const register = useCallback(
    async (name: string, images: string[], email?: string): Promise<RegisterResult> => {
      if (!isReady) {
        return { success: false, error: 'Models not loaded yet' };
      }
      setIsRegistering(true);
      setResult(null);

      const regResult = await client.register(name, images, email);
      setResult(regResult);
      setIsRegistering(false);
      return regResult;
    },
    [client, isReady]
  );

  const reset = useCallback(() => {
    setIsRegistering(false);
    setResult(null);
  }, []);

  return { register, isRegistering, result, reset, isReady };
}

/** Hook for face analysis (quality scoring, detection) */
export function useFaceAnalysis() {
  const { client, isReady } = useFaceSmash();
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(
    async (imageData: string): Promise<FaceAnalysis | null> => {
      if (!isReady) return null;
      setIsAnalyzing(true);
      const result = await client.analyzeFace(imageData);
      setAnalysis(result);
      setIsAnalyzing(false);
      return result;
    },
    [client, isReady]
  );

  return { analyze, analysis, isAnalyzing, isReady };
}
