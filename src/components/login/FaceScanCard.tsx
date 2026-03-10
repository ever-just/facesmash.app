import AutoFaceDetection from "@/components/AutoFaceDetection";
import { type ReadyDescriptor } from "@/hooks/useFaceTracking";

interface FaceScanCardProps {
  isScanning: boolean;
  onImagesCapture: (images: string[]) => void;
  onReadyDescriptorCapture?: (descriptor: ReadyDescriptor) => void;
}

/** Phase 3: Camera stays visible during scanning — no separate "Analyzing..." card.
 *  The scanning state is communicated via the oval overlay color + text inside AutoFaceDetection. */
const FaceScanCard = ({ isScanning, onImagesCapture, onReadyDescriptorCapture }: FaceScanCardProps) => {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <AutoFaceDetection 
          onImagesCapture={onImagesCapture}
          onReadyDescriptorCapture={onReadyDescriptorCapture}
          isScanning={isScanning}
        />
      </div>
    </div>
  );
};

export default FaceScanCard;
