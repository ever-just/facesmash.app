
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const SecurityCard = () => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="mr-3 h-6 w-6 text-white" />
          Security Status
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your FaceSmash security information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Authentication Method:</span>
          <span className="text-white">Face Recognition</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Security Level:</span>
          <span className="text-white">High</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Last Login:</span>
          <span className="text-white">Just now</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Face Embedding:</span>
          <span className="text-white">128-dimensional</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityCard;
