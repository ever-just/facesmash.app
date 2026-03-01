import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getFaceScansByUser } from "@/services/faceScanService";

interface FaceScan {
  id: string;
  user_email: string;
  image_url: string;
  scan_type: string;
  quality_score: number;
  confidence_score: number;
  created_at: string;
}

interface FaceScanGalleryProps {
  userEmail: string;
}

const FaceScanGallery = ({ userEmail }: FaceScanGalleryProps) => {
  const [faceScans, setFaceScans] = useState<FaceScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaceScans = async () => {
      console.log('Fetching face scans for user:', userEmail);
      const scans = await getFaceScansByUser(userEmail);
      setFaceScans(scans);
      setLoading(false);
    };

    if (userEmail) {
      fetchFaceScans();
    }
  }, [userEmail]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.6) return 'text-amber-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-5 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] mb-6">Face scans</p>
      {faceScans.length === 0 ? (
        <p className="text-white/25 text-sm text-center py-6">No face scans yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {faceScans.map((scan) => (
            <div key={scan.id} className="group">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                <img
                  src={scan.image_url}
                  alt={`Face scan from ${formatDate(scan.created_at)}`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                {/* subtle corner brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-emerald-500/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-emerald-500/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-emerald-500/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-emerald-500/30" />
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-[10px]">{formatDate(scan.created_at)}</span>
                  <span className={`text-[10px] font-medium ${getQualityColor(scan.quality_score)}`}>
                    {(scan.quality_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-white/15 text-[10px] capitalize">{scan.scan_type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceScanGallery;
