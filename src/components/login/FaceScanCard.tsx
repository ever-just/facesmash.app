

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, Loader2 } from "lucide-react";
import WebcamCapture from "@/components/WebcamCapture";
interface FaceScanCardProps {
  isScanning: boolean;
  onImagesCapture: (images: string[]) => void;
}
const FaceScanCard = ({
  isScanning,
  onImagesCapture
}: FaceScanCardProps) => {
  return <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-white flex items-center justify-center">
          <Square className="mr-3 h-8 w-8 text-white" />
          FACECARD LOGIN
        </CardTitle>
        
      </CardHeader>
      <CardContent>
        {isScanning ? <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-white mx-auto mb-6 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing with Enhanced AI...</h3>
            <p className="text-gray-400">Checking face quality, lighting conditions, and matching against learned patterns</p>
          </div> : <WebcamCapture onImagesCapture={onImagesCapture} isLogin={true} autoStart={true} />}
      </CardContent>
    </Card>;
};
export default FaceScanCard;

