
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFaceScansByUser } from "@/services/faceScanService";
import type { FaceScan } from "@/services/faceScanService";

interface FaceScanGalleryProps {
  userEmail: string;
}

const FaceScanGallery = ({ userEmail }: FaceScanGalleryProps) => {
  const [faceScans, setFaceScans] = useState<FaceScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [retryingImages, setRetryingImages] = useState<Set<string>>(new Set());

  const fetchFaceScans = async () => {
    try {
      console.log('Fetching face scans for user:', userEmail);
      setLoading(true);
      const scans = await getFaceScansByUser(userEmail);
      console.log('Retrieved face scans:', scans);
      setFaceScans(scans);
      // Clear error states when refetching
      setImageLoadErrors(new Set());
      setRetryingImages(new Set());
    } catch (error) {
      console.error('Error fetching face scans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleImageError = (scanId: string, imageUrl: string) => {
    console.error('Failed to load image for scan:', scanId);
    console.error('Image URL:', imageUrl);
    setImageLoadErrors(prev => new Set(prev).add(scanId));
    setRetryingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(scanId);
      return newSet;
    });
  };

  const handleImageLoad = (scanId: string, imageUrl: string) => {
    console.log('Successfully loaded image for scan:', scanId);
    console.log('Image URL:', imageUrl);
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(scanId);
      return newSet;
    });
    setRetryingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(scanId);
      return newSet;
    });
  };

  const retryImageLoad = (scanId: string) => {
    console.log('Retrying image load for scan:', scanId);
    setRetryingImages(prev => new Set(prev).add(scanId));
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(scanId);
      return newSet;
    });
    
    // Force reload by adding timestamp to URL
    const scan = faceScans.find(s => s.id === scanId);
    if (scan) {
      const img = new Image();
      img.onload = () => handleImageLoad(scanId, scan.image_url);
      img.onerror = () => handleImageError(scanId, scan.image_url);
      img.src = `${scan.image_url}?t=${Date.now()}`;
    }
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
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="mr-3 h-6 w-6 text-white" />
            Face Scan Gallery
          </div>
          <Button
            onClick={fetchFaceScans}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                  {imageLoadErrors.has(scan.id) ? (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center flex-col">
                      <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                      <p className="text-red-400 text-sm text-center px-2 mb-2">Failed to load image</p>
                      <Button
                        onClick={() => retryImageLoad(scan.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : retryingImages.has(scan.id) ? (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <img 
                      src={`${scan.image_url}?t=${Date.now()}`}
                      alt={`Face scan - ${scan.scan_type}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(scan.id, scan.image_url)}
                      onLoad={() => handleImageLoad(scan.id, scan.image_url)}
                    />
                  )}
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
            <div className="flex items-center text-sm text-gray-300 flex-wrap gap-2">
              <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
              <span>Total Scans: {faceScans.length}</span>
              <span>•</span>
              <span>Registration: {faceScans.filter(s => s.scan_type === 'registration').length}</span>
              <span>•</span>
              <span>Login: {faceScans.filter(s => s.scan_type === 'login').length}</span>
              {imageLoadErrors.size > 0 && (
                <>
                  <span>•</span>
                  <span className="text-red-400">Failed Images: {imageLoadErrors.size}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceScanGallery;
