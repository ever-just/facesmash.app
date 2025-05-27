
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
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
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading face scans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-lg sm:text-xl">
          <User className="mr-2 h-5 w-5" />
          Face Card Log
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your captured face scans and quality metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {faceScans.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No face scans found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {faceScans.map((scan) => (
              <div key={scan.id} className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="relative mb-2">
                  <img
                    src={scan.image_url}
                    alt={`Face scan from ${formatDate(scan.created_at)}`}
                    className="w-full h-20 sm:h-24 object-cover rounded border-2 border-white"
                    style={{
                      border: '2px solid white',
                      borderRadius: '4px'
                    }}
                  />
                  {/* Face detection box overlay */}
                  <div 
                    className="absolute inset-2 border-2 border-green-400 rounded"
                    style={{
                      top: '10%',
                      left: '20%',
                      right: '20%',
                      bottom: '10%'
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-300">{formatDate(scan.created_at)}</p>
                  <p className={`text-xs font-medium ${getQualityColor(scan.quality_score)}`}>
                    Quality: {(scan.quality_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{scan.scan_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceScanGallery;
