
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface FaceAPIErrorProps {
  error: string | null;
}

const FaceAPIError = ({ error }: FaceAPIErrorProps) => {
  if (!error) return null;

  return (
    <Card className="bg-red-900/20 border-red-800 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>Face recognition failed to load. Please refresh the page to try again.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceAPIError;
