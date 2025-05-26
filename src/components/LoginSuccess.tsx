
import { CheckCircle, Sparkles, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface LoginSuccessProps {
  matchedUser: string | null;
  onContinue: () => void;
  onSignInAgain: () => void;
}

const LoginSuccess = ({
  matchedUser,
  onContinue,
  onSignInAgain
}: LoginSuccessProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 animate-pulse"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <CardHeader className="text-center relative z-10">
        <div className={`transform transition-all duration-1000 ${showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
          <div className="relative mx-auto mb-6">
            <CheckCircle className="h-24 w-24 text-green-400 mx-auto animate-bounce" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Shield className="h-8 w-8 text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        <CardTitle className={`text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent transform transition-all duration-1000 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          Welcome Back!
        </CardTitle>
        
        <CardDescription className={`text-gray-300 text-xl transform transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          Face recognition successful
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-8 relative z-10">
        <div className={`transform transition-all duration-1000 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse mr-3"></div>
              <p className="text-green-400 font-bold text-lg">Authentication Successful</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-white text-xl font-semibold">
                Welcome back, <span className="text-blue-400">{matchedUser}</span>!
              </p>
              <p className="text-gray-400">You have been securely logged in with Face Card technology</p>
              
              <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-green-400" />
                  Verified
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-blue-400" />
                  Encrypted
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-400" />
                  Instant
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`space-y-4 transform transition-all duration-1000 delay-1000 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Button 
            onClick={onContinue} 
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-black hover:from-green-500 hover:to-blue-600 font-bold py-4 rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Continue to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onSignInAgain} 
            className="w-full border-2 border-gray-600 hover:border-white text-gray-300 hover:text-white hover:bg-gray-800 py-4 rounded-xl font-semibold transition-all duration-300"
          >
            Sign In Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginSuccess;
