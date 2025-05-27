import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, Loader2, CheckCircle, AlertCircle, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import WebcamCapture from "@/components/WebcamCapture";

interface EnhancedFaceScanCardProps {
  isScanning: boolean;
  scanComplete: boolean;
  loginResult: 'success' | 'failed' | null;
  matchedUser: string | null;
  onImagesCapture: (images: string[]) => void;
  onTryAgain: () => void;
  onContinue: () => void;
}

const EnhancedFaceScanCard = ({ 
  isScanning, 
  scanComplete, 
  loginResult, 
  matchedUser,
  onImagesCapture, 
  onTryAgain,
  onContinue 
}: EnhancedFaceScanCardProps) => {
  const { isLoading, loadProgress } = useFaceAPI();
  
  // Face API Loading Component
  const FaceAPILoadingAnimation = () => (
    <div className="text-center py-12">
      <div className="relative mb-8">
        <Brain className="h-16 w-16 text-blue-400 mx-auto animate-pulse mb-6" />
        
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-white transition-all duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-white text-sm font-medium">
            {Math.round(loadProgress)}% Complete
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Loading Face Recognition...
        </h3>
        <p className="text-gray-300">
          Preparing AI models for secure authentication
        </p>
      </div>
    </div>
  );

  // AI Processing Animation Component
  const AIProcessingAnimation = () => (
    <div className="text-center py-12">
      <div className="relative mb-8">
        {/* Neural network visualization */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
          <div className="flex flex-col space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded animate-pulse"
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
          <Brain className="h-12 w-12 text-purple-400 animate-pulse" />
        </div>
        
        {/* Scanning progress visualization */}
        <div className="relative w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-in-right" 
               style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
          <h3 className="text-xl font-semibold text-white">
            Analyzing with Enhanced AI...
          </h3>
        </div>
        
        <div className="space-y-2 text-gray-300">
          <p className="animate-fade-in" style={{ animationDelay: '0s' }}>
            🔍 Analyzing facial features and patterns
          </p>
          <p className="animate-fade-in" style={{ animationDelay: '1s' }}>
            💡 Checking lighting conditions and quality
          </p>
          <p className="animate-fade-in" style={{ animationDelay: '2s' }}>
            🧠 Matching against learned face templates
          </p>
          <p className="animate-fade-in" style={{ animationDelay: '3s' }}>
            ⚡ Applying adaptive recognition algorithms
          </p>
        </div>
      </div>
    </div>
  );

  // Success Result Component
  const SuccessResult = () => (
    <div className="text-center py-12 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="h-16 w-16 text-green-400" />
        </div>
        <div className="absolute inset-0 w-24 h-24 border-4 border-green-400/30 rounded-full mx-auto animate-ping" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-green-400">
          Welcome back!
        </h3>
        <p className="text-white text-lg">
          {matchedUser}
        </p>
        <p className="text-gray-300">
          Face recognition successful
        </p>
      </div>
      
      <div className="space-y-3 pt-4">
        <Button 
          onClick={onContinue}
          className="w-full bg-green-400 text-black hover:bg-green-300 py-3 rounded-xl font-semibold text-lg"
        >
          Continue to Dashboard
        </Button>
        <Button 
          onClick={onTryAgain}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-2"
        >
          Sign in as different user
        </Button>
      </div>
    </div>
  );

  // Failed Result Component
  const FailedResult = () => (
    <div className="text-center py-12 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <AlertCircle className="h-16 w-16 text-red-400" />
        </div>
        <div className="absolute inset-0 w-24 h-24 border-4 border-red-400/30 rounded-full mx-auto animate-ping" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-red-400">
          Access Denied
        </h3>
        <p className="text-gray-300">
          Face not recognized
        </p>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-400">
          <p>Try improving lighting or repositioning your face</p>
        </div>
      </div>
      
      <div className="space-y-3 pt-4">
        <Button 
          onClick={onTryAgain}
          className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-semibold text-lg"
        >
          Try Again
        </Button>
        <Button 
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-2"
          onClick={() => window.location.href = '/register'}
        >
          Create New Face Card
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl mx-auto">
      <CardHeader className="text-center p-4 sm:p-6">
        <CardTitle className="text-2xl sm:text-3xl text-white flex items-center justify-center">
          <Square className="mr-3 h-6 w-6 sm:h-8 sm:w-8 text-white" />
          FACECARD LOGIN
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading && (
          <FaceAPILoadingAnimation />
        )}
        
        {!isLoading && !scanComplete && !isScanning && (
          <WebcamCapture onImagesCapture={onImagesCapture} isLogin={true} autoStart={true} />
        )}
        
        {!isLoading && isScanning && !scanComplete && (
          <AIProcessingAnimation />
        )}
        
        {!isLoading && scanComplete && loginResult === 'success' && (
          <SuccessResult />
        )}
        
        {!isLoading && scanComplete && loginResult === 'failed' && (
          <FailedResult />
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedFaceScanCard;
