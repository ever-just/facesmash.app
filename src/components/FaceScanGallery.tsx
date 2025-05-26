
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, TrendingUp } from "lucide-react";
import { getFaceScansByUser } from "@/services/faceScanService";
import type { FaceScan } from "@/services/faceScanService";

interface FaceScanGalleryProps {
  userEmail: string;
}

const FaceScanGallery = ({ userEmail }: FaceScanGalleryProps) => {
  const [faceScans, setFaceScans] = useState<FaceScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaceScans = async () => {
      try {
        const scans = await getFaceScansByUser(userEmail);
        setFaceScans(scans);
      } catch (error) {
        console.error('Error fetching face scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaceScans();
  }, [userEmail]);

  const getScanTypeColor = (scanType: string) => {
    switch (scanType) {
      case 'registration':
        return 'bg-blue-500';
      case 'login':
        return 'bg-green-500';
      case 'verification':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading face scans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Camera className="mr-3 h-6 w-6 text-white" />
          Face Scan Gallery
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your captured face images and scan history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {faceScans.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No face scans found</p>
            <p className="text-gray-500 text-sm">Face images will appear here after registration or login</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faceScans.map((scan) => (
              <div key={scan.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="aspect-square relative">
                  <img 
                    src={scan.image_url} 
                    alt={`Face scan - ${scan.scan_type}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDODkuNTQzIDcwIDgxIDc4LjU0MyA4MSA4OUM4MSA5OS40NTcgODkuNTQzIDEwOCAxMDAgMTA4QzExMC40NTcgMTA4IDExOSA5OS40NTcgMTE5IDg5QzExOSA3OC41NDMgMTEwLjQ1NyA3MCAxMDAgNzBaIiBmaWxsPSIjNkI3Mjg0Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzc3LjkwODYgMTIwIDYwIDEzNy45MDkgNjAgMTYwSDE0MEM0MCAxMzcuOTA5IDEyMi4wOTEgMTIwIDEwMCAxMjBaIiBmaWxsPSIjNkI3Mjg0Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0E0QUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getScanTypeColor(scan.scan_type)} text-white text-xs`}>
                      {scan.scan_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(scan.created_at)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-700 rounded px-2 py-1">
                      <span className="text-gray-400">Quality:</span>
                      <span className="text-white ml-1">
                        {((scan.quality_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded px-2 py-1">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-white ml-1">
                        {((scan.confidence_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {faceScans.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center text-sm text-gray-300">
              <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
              <span>Total Scans: {faceScans.length}</span>
              <span className="mx-2">•</span>
              <span>
                Registration: {faceScans.filter(s => s.scan_type === 'registration').length}
              </span>
              <span className="mx-2">•</span>
              <span>
                Login: {faceScans.filter(s => s.scan_type === 'login').length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceScanGallery;
