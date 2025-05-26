
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoginSuccessProps {
  matchedUser: string | null;
  onContinue: () => void;
  onSignInAgain: () => void;
}

const LoginSuccess = ({ matchedUser, onContinue, onSignInAgain }: LoginSuccessProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="text-center">
        <CheckCircle className="h-20 w-20 text-white mx-auto mb-4" />
        <CardTitle className="text-3xl text-white">Welcome Back!</CardTitle>
        <CardDescription className="text-gray-400 text-lg">
          Face recognition successful
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <p className="text-white font-semibold">Authentication Successful</p>
          <p className="text-gray-300 mt-2">Welcome back, {matchedUser}!</p>
          <p className="text-gray-400 text-sm mt-1">You have been securely logged in</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={onContinue}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            Continue to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={onSignInAgain}
            className="w-full border-white text-white hover:bg-white hover:text-black"
          >
            Sign In Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginSuccess;
