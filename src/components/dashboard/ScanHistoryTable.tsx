import { useState, useEffect } from "react";
import { Loader2, Scan, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getFaceScansByUser } from "@/services/faceScanService";
import { FaceScan } from "@/types";

interface ScanHistoryTableProps {
  userEmail: string;
}

const ScanHistoryTable = ({ userEmail }: ScanHistoryTableProps) => {
  const [scans, setScans] = useState<FaceScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchScans = async () => {
      if (!userEmail) return;
      try {
        const data = await getFaceScansByUser(userEmail);
        setScans(data);
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();

    // Poll for new scans every 5 seconds to show live updates
    const pollInterval = setInterval(fetchScans, 5000);

    return () => clearInterval(pollInterval);
  }, [userEmail]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.6) return 'text-amber-400';
    return 'text-red-400';
  };

  const getQualityBg = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-400/10';
    if (score >= 0.6) return 'bg-amber-400/10';
    return 'bg-red-400/10';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.7) return 'Good';
    if (score >= 0.5) return 'Fair';
    return 'Poor';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.7) return ArrowUpRight;
    return ArrowDownRight;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-5 text-white/20 animate-spin" />
      </div>
    );
  }

  const displayScans = showAll ? scans : scans.slice(0, 8);
  const hasMore = scans.length > 8;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center size-8 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <Scan className="size-3.5 text-white/40" />
          </div>
          <div>
            <p className="text-white/20 uppercase tracking-[0.2em] text-[10px]">Scan History</p>
            <p className="text-white/10 text-[10px] mt-0.5">{scans.length} total scans</p>
          </div>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="px-6 pb-8 pt-4 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
            <Scan className="size-5 text-white/15" />
          </div>
          <p className="text-white/25 text-sm">No face scans yet</p>
          <p className="text-white/10 text-xs mt-1">Scans will appear here after you log in with your face.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-6 py-2.5 border-t border-b border-white/[0.04] bg-white/[0.01]">
            <div className="col-span-4 sm:col-span-3">
              <span className="text-[9px] uppercase tracking-wider text-white/15 font-medium">Date</span>
            </div>
            <div className="col-span-3 sm:col-span-3">
              <span className="text-[9px] uppercase tracking-wider text-white/15 font-medium">Type</span>
            </div>
            <div className="col-span-3 sm:col-span-3 text-right sm:text-left">
              <span className="text-[9px] uppercase tracking-wider text-white/15 font-medium">Quality</span>
            </div>
            <div className="col-span-2 sm:col-span-3 text-right">
              <span className="text-[9px] uppercase tracking-wider text-white/15 font-medium">Confidence</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.03]">
            {displayScans.map((scan, index) => {
              const ConfIcon = getConfidenceIcon(scan.confidence_score);
              return (
                <div
                  key={scan.id}
                  className="grid grid-cols-12 gap-2 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className={`size-1.5 rounded-full ${index === 0 ? 'bg-emerald-400' : 'bg-white/10'}`} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">{formatDate(scan.created_at)}</p>
                      <p className="text-white/15 text-[10px]">{formatTime(scan.created_at)}</p>
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-3 flex items-center">
                    <span className="text-white/30 text-sm capitalize">{scan.scan_type}</span>
                  </div>
                  <div className="col-span-3 sm:col-span-3 flex items-center justify-end sm:justify-start">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getQualityBg(scan.quality_score)} ${getQualityColor(scan.quality_score)}`}>
                      {getQualityLabel(scan.quality_score)}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-1">
                    <ConfIcon className={`size-3 ${getQualityColor(scan.confidence_score)}`} />
                    <span className={`text-sm font-medium ${getQualityColor(scan.confidence_score)}`}>
                      {(scan.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more */}
          {hasMore && (
            <div className="px-6 py-3 border-t border-white/[0.04]">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-white/20 text-xs hover:text-white/40 transition-colors py-1"
              >
                {showAll ? 'Show less' : `Show ${scans.length - 8} more scans`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScanHistoryTable;
