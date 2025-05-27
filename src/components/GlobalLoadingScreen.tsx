
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Square, RefreshCw, AlertCircle, Download } from 'lucide-react';

const LoadingTips = [
  "💡 Ensure good lighting for better face recognition",
  "🎯 Position your face directly in front of the camera",
  "✨ Face recognition improves with each login",
  "🔒 Your face data is securely encrypted",
  "⚡ Models are cached for faster future loading",
  "🚀 Local models provide the best performance",
];

// Create a safe hook that doesn't throw if used outside provider
const useFaceAPISafe = () => {
  try {
    const { useFaceAPI } = require('@/contexts/FaceAPIContext');
    return useFaceAPI();
  } catch {
    return {
      isLoading: false,
      error: null,
      loadProgress: 0,
      loadingStage: '',
      retryLoading: () => {}
    };
  }
};

const GlobalLoadingScreen = () => {
  const { isLoading, error, loadProgress, loadingStage, retryLoading } = useFaceAPISafe();
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % LoadingTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [isLoading]);

  if (!isLoading && !error) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-white rounded border-2 border-white flex items-center justify-center">
            <div className="w-6 h-6 border border-black rounded-full relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
            </div>
          </div>
          <span className="text-3xl font-bold text-white">Face Card</span>
        </div>

        {error ? (
          // Error State
          <div className="space-y-6">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Loading Failed</h2>
              <p className="text-gray-400 mb-4">
                Failed to load face recognition models. Please check your internet connection.
              </p>
              <p className="text-red-400 text-sm bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-800">
                {error}
              </p>
            </div>
            <Button 
              onClick={retryLoading}
              className="bg-white text-black hover:bg-gray-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          </div>
        ) : (
          // Enhanced Loading State
          <div className="space-y-6">
            <div className="relative">
              <Square className="h-16 w-16 text-white mx-auto" />
              {loadProgress > 0 && (
                <Download className="h-6 w-6 text-blue-400 absolute -bottom-1 -right-1 animate-bounce" />
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Initializing Face Recognition
              </h2>
              <p className="text-gray-400 mb-2">
                Loading advanced AI models for secure face authentication...
              </p>
              <p className="text-blue-400 text-sm font-medium">
                {loadingStage}
              </p>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-white transition-all duration-500 ease-out relative"
                  style={{ width: `${loadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white font-medium">
                  {Math.round(loadProgress)}% Complete
                </span>
                <span className="text-gray-400">
                  {loadProgress === 100 ? 'Ready!' : 'Loading...'}
                </span>
              </div>
            </div>

            {/* Rotating Tips */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
              <p className="text-gray-300 text-sm transition-opacity duration-500">
                {LoadingTips[currentTip]}
              </p>
            </div>

            {/* Enhanced Loading Animation */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  style={{
                    animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* Performance Hint */}
            {loadProgress > 25 && loadProgress < 100 && (
              <div className="text-xs text-gray-500 bg-gray-900 bg-opacity-50 p-2 rounded border border-gray-800">
                💡 First-time loading may take longer. Subsequent loads will be much faster!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoadingScreen;
