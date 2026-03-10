import { Loader2 } from "lucide-react";
import AutoFaceDetection from "@/components/AutoFaceDetection";
import { type ReadyDescriptor } from "@/hooks/useFaceTracking";

interface FaceScanCardProps {
  isScanning: boolean;
  onImagesCapture: (images: string[]) => void;
  onReadyDescriptorCapture?: (descriptor: ReadyDescriptor) => void;
}

const FaceScanCard = ({ isScanning, onImagesCapture, onReadyDescriptorCapture }: FaceScanCardProps) => {
  return (
    <div className="w-full max-w-xl mx-auto">
      {isScanning ? (
        <div className="text-center py-16">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 size-20 rounded-full bg-emerald-500/10 blur-xl" />
            <div className="size-20 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
              <Loader2 className="size-8 text-emerald-400 animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Analyzing...</h3>
          <p className="text-white/35 text-sm max-w-xs mx-auto">
            Matching your face against encrypted biometric data
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <AutoFaceDetection 
            onImagesCapture={onImagesCapture}
            onReadyDescriptorCapture={onReadyDescriptorCapture}
            isScanning={isScanning}
          />
        </div>
      )}
    </div>
  );
};

export default FaceScanCard;
