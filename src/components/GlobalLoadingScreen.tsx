import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { useFaceAPI } from '@/contexts/FaceAPIContext';

const FACE_ROUTES = ['/login', '/register', '/dashboard'];

const tips = [
  "Ensure good lighting for better recognition",
  "Position your face directly in front of the camera",
  "Recognition improves with each login",
  "Your face data is securely encrypted",
  "Models are cached for faster future loads",
];

const GlobalLoadingScreen = () => {
  const { isLoading, error, loadProgress, retryLoading } = useFaceAPI();
  const location = useLocation();
  const [currentTip, setCurrentTip] = useState(0);

  const needsFaceAPI = FACE_ROUTES.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    if (!isLoading) return;
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 2500);
    return () => clearInterval(tipInterval);
  }, [isLoading]);

  if (!needsFaceAPI || (!isLoading && !error)) return null;

  return (
    <div className="fixed inset-0 bg-[#07080A] z-50 flex items-center justify-center">
      {/* grain */}
      <div className="fixed inset-0 pointer-events-none animate-grain opacity-40 mix-blend-overlay" />
      {/* ambient */}
      <div className="absolute top-[-20%] left-[30%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-[140px]" />

      <div className="text-center max-w-sm mx-auto px-6 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <img src="/facesmash-logo.png" alt="FaceSmash" className="size-10 rounded-lg shadow-lg shadow-emerald-500/20" />
          <span className="text-xl font-semibold tracking-tight text-white">FaceSmash</span>
        </div>

        {error ? (
          <div className="space-y-6">
            <div className="size-16 rounded-full border-2 border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertCircle className="size-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Loading failed</h2>
              <p className="text-white/35 text-sm mb-3">
                Face recognition models couldn't load. Check your connection.
              </p>
              <p className="text-red-400/60 text-xs font-mono">{error}</p>
            </div>
            <Button
              onClick={retryLoading}
              className="h-10 px-6 bg-white hover:bg-white/90 text-black text-sm font-medium rounded-full"
            >
              <RotateCcw className="mr-2 size-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-2">Loading face recognition</h2>
              <p className="text-white/30 text-sm">
                Preparing AI models for secure authentication
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="w-full h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="text-white/25 text-xs">
                {Math.round(loadProgress)}%
              </p>
            </div>

            {/* Tips */}
            <p className="text-white/20 text-xs min-h-[2rem] transition-opacity duration-500">
              {tips[currentTip]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoadingScreen;
