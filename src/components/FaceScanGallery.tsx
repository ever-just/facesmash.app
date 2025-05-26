import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, TrendingUp, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { getFaceScansByUser } from "@/services/faceScanService";
import type { FaceScan } from "@/types";

interface FaceScanGalleryProps {
  userEmail: string;
}

const FaceScanGallery = ({
  userEmail
}: FaceScanGalleryProps) => {
  const [faceScans, setFaceScans] = useState<FaceScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [retryingImages, setRetryingImages] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

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
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching face scans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaceScans();
  }, [userEmail]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial index

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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
    console.error('Image load failed for scan:', scanId, 'URL:', imageUrl);
    setImageLoadErrors(prev => new Set(prev).add(scanId));
    setRetryingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(scanId);
      return newSet;
    });
  };

  const handleImageLoad = (scanId: string, imageUrl: string) => {
    console.log('Image loaded successfully for scan:', scanId);
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

    // Force reload by adding timestamp to URL only during retry
    const scan = faceScans.find(s => s.id === scanId);
    if (scan) {
      const img = new Image();
      img.onload = () => handleImageLoad(scanId, scan.image_url);
      img.onerror = () => handleImageError(scanId, scan.image_url);
      img.src = `${scan.image_url}?retry=${Date.now()}`;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading face cards...</p>
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
            Face Card Log
          </div>
          <Button 
            onClick={fetchFaceScans} 
            variant="outline" 
            size="sm" 
            className="border-gray-600 text-gray-300 bg-slate-900 hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {faceScans.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No face cards found</p>
            <p className="text-gray-500 text-sm">Face images will appear here after registration or login</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card Position Indicator */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Card {currentIndex + 1} of {faceScans.length}
              </p>
            </div>

            {/* Carousel Container */}
            <Carousel 
              className="w-full max-w-md mx-auto"
              setApi={setApi}
            >
              <CarouselContent>
                {faceScans.map((scan, index) => (
                  <CarouselItem key={scan.id}>
                    <div className="flex justify-center">
                      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 w-80 shadow-2xl">
                        {/* Main Face Image */}
                        <div className="aspect-square relative">
                          {imageLoadErrors.has(scan.id) ? (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center flex-col">
                              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                              <p className="text-red-400 text-sm text-center px-4 mb-4">Failed to load image</p>
                              <Button 
                                onClick={() => retryImageLoad(scan.id)} 
                                variant="outline" 
                                size="sm" 
                                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                              </Button>
                            </div>
                          ) : retryingImages.has(scan.id) ? (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            <img 
                              src={scan.image_url} 
                              alt={`Face scan - ${scan.scan_type}`} 
                              className="w-full h-full object-cover" 
                              onError={() => handleImageError(scan.id, scan.image_url)} 
                              onLoad={() => handleImageLoad(scan.id, scan.image_url)} 
                            />
                          )}
                          
                          {/* Scan Type Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge className={`${getScanTypeColor(scan.scan_type)} text-white text-sm px-3 py-1`}>
                              {scan.scan_type}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Card Metadata */}
                        <div className="p-6 space-y-4">
                          {/* Date and Time */}
                          <div className="flex items-center justify-center text-gray-300">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatDate(scan.created_at)}</span>
                          </div>
                          
                          {/* Quality Metrics */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-700 rounded-lg px-3 py-2 text-center">
                              <p className="text-gray-400 text-xs mb-1">Quality</p>
                              <p className="text-white font-semibold">
                                {((scan.quality_score || 0) * 100).toFixed(0)}%
                              </p>
                            </div>
                            <div className="bg-gray-700 rounded-lg px-3 py-2 text-center">
                              <p className="text-gray-400 text-xs mb-1">Confidence</p>
                              <p className="text-white font-semibold">
                                {((scan.confidence_score || 0) * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation Controls */}
              {faceScans.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700" />
                  <CarouselNext className="right-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700" />
                </>
              )}
            </Carousel>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceScanGallery;
