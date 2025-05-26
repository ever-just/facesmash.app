import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface LoginFailedProps {
  onTryAgain: () => void;
}
const LoginFailed = ({
  onTryAgain
}: LoginFailedProps) => {
  return <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="text-center">
        <AlertCircle className="h-20 w-20 text-white mx-auto mb-4" />
        <CardTitle className="text-3xl text-white">Access Denied</CardTitle>
        
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <p className="text-white font-semibold">Authentication Failed</p>
          <p className="text-gray-300 mt-2">Your face could not be verified</p>
        </div>
        
        <div className="space-y-4">
          <Button onClick={onTryAgain} className="w-full bg-white text-black hover:bg-gray-200">
            Try Again
          </Button>
          <Link to="/register">
            <Button variant="outline" className="w-full border-white bg-gray-700 hover:bg-gray-600 text-gray-200 my-[13px]">
              Create New Face Card
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>;
};
export default LoginFailed;