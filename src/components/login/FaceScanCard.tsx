
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, Loader2 } from "lucide-react";
import WebcamCapture from "@/components/WebcamCapture";

interface FaceScanCardProps {
  isScanning: boolean;
  onImagesCapture: (images: string[]) => void;
}

const FaceScanCard = ({ isScanning, onImagesCapture }: FaceScanCardProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl mx-auto">
      <CardHeader className="text-center p-4 sm:p-6">
        <CardTitle className="text-2xl sm:text-3xl text-white flex items-center justify-center">
          <Square className="mr-3 h-6 w-6 sm:h-8 sm:w-8 text-white" />
          FACECARD LOGIN
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isScanning ? (
          <div className="text-center py-8 sm:py-12">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-white mx-auto mb-4 sm:mb-6 animate-spin" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Analyzing with Enhanced AI...
            </h3>
            <p className="text-sm sm:text-base text-gray-400 px-4">
              Checking face quality, lighting conditions, and matching against learned patterns
            </p>
          </div>
        ) : (
          <WebcamCapture onImagesCapture={onImagesCapture} autoStart={true} />
        )}
      </CardContent>
    </Card>
  );
};

export default FaceScanCard;
