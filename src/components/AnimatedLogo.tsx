
import { useState, useEffect } from "react";

interface AnimatedLogoProps {
  onAnimationComplete: () => void;
}

const AnimatedLogo = ({ onAnimationComplete }: AnimatedLogoProps) => {
  const [animationPhase, setAnimationPhase] = useState<'logo' | 'animating' | 'complete'>('logo');

  useEffect(() => {
    // Show logo for 2 seconds
    const logoTimer = setTimeout(() => {
      setAnimationPhase('animating');
    }, 2000);

    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (animationPhase === 'animating') {
      // Animation duration is 0.8s, then notify completion
      const animationTimer = setTimeout(() => {
        setAnimationPhase('complete');
        onAnimationComplete();
      }, 800);

      return () => clearTimeout(animationTimer);
    }
  }, [animationPhase, onAnimationComplete]);

  if (animationPhase === 'complete') {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div 
          className={`w-48 h-48 bg-gray-900 border-4 border-white rounded-xl flex items-center justify-center ${
            animationPhase === 'logo' ? 'animate-logo-pulse' : 'animate-logo-to-camera'
          }`}
        >
          {/* Face icon inside the square */}
          <div className="w-32 h-32 border-4 border-white rounded-full relative bg-gray-800">
            {/* Eyes */}
            <div className="absolute top-8 left-8 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute top-8 right-8 w-4 h-4 bg-white rounded-full"></div>
            {/* Smile */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-6 border-b-4 border-white rounded-b-full"></div>
          </div>
        </div>
        
        {/* Scanning indicator when animating */}
        {animationPhase === 'animating' && (
          <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
            <div className="text-white font-bold text-xl animate-pulse">
              Initializing...
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Face Card</h2>
        <p className="text-gray-400">
          {animationPhase === 'logo' ? 'Preparing your secure login...' : 'Starting camera...'}
        </p>
      </div>
    </div>
  );
};

export default AnimatedLogo;
