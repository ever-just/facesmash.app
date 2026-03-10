/**
 * Face Scan Service — now backed by Hono API.
 *
 * Key changes from PocketBase version:
 * - Image upload is now a base64 data URL sent in JSON (server uploads to DO Spaces)
 * - Embedding blending is done server-side in performLoginBookkeeping()
 * - No more FormData; all requests are JSON
 */

import { api } from "@/integrations/api/client";
import { FaceScan } from "@/types";

// Convert image blob to a base64 data URL for API upload
export const prepareImageFile = async (
  imageBlob: Blob,
  _scanType: string
): Promise<string | null> => {
  try {
    // Convert blob to ensure it's a proper JPEG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(img.src);
        reject(err);
      };
      img.src = URL.createObjectURL(imageBlob);
    });

    return dataUrl;
  } catch (error) {
    console.error('Error preparing image file:', error);
    return null;
  }
};

export const createFaceScan = async (
  _userEmail: string,
  faceEmbedding: Float32Array,
  scanType: 'registration' | 'login' | 'verification',
  confidenceScore: number = 0.8,
  qualityScore: number = 0.8,
  imageData?: string | null,
): Promise<FaceScan | null> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);
    const resolvedScanType = scanType === 'verification' ? 'login' : scanType;

    const res = await api.createScan({
      embedding: embeddingArray,
      scanType: resolvedScanType,
      qualityScore,
      confidence: confidenceScore,
      imageData: imageData || undefined,
    });

    if (!res.ok) {
      console.error('Failed to create face scan:', res.data);
      return null;
    }

    console.log(`Face scan created: type=${resolvedScanType}, quality=${qualityScore.toFixed(3)}, confidence=${confidenceScore.toFixed(3)}`);
    return res.data as unknown as FaceScan;
  } catch (error) {
    console.error('Unexpected error creating face scan:', error);
    return null;
  }
};

export const getFaceScansByUser = async (_userEmail: string): Promise<FaceScan[]> => {
  try {
    const res = await api.getScans(1, 50);
    if (!res.ok) return [];
    const items = res.data.items || [];
    return items.map((s) => ({
      id: String(s.id),
      user_email: '',
      image_url: s.imageUrl || '',
      face_embedding: [],
      confidence_score: s.confidence,
      scan_type: s.scanType as FaceScan['scan_type'],
      quality_score: s.qualityScore,
      created_at: s.createdAt,
    }));
  } catch (error) {
    console.error('Unexpected error fetching face scans:', error);
    return [];
  }
};

/**
 * @deprecated — Embedding blending is now done server-side in performLoginBookkeeping().
 * This is a no-op stub to avoid breaking existing callers during migration.
 */
export const updateUserEmbeddingWithScan = async (
  _userEmail: string,
  _newEmbedding: Float32Array,
  _learningWeight: number = 1.0
): Promise<boolean> => {
  // Server-side: handled by /api/auth/login → performLoginBookkeeping()
  console.log('updateUserEmbeddingWithScan: now handled server-side');
  return true;
};

export const getHighQualityScans = async (
  _userEmail: string,
  _minQuality: number = 0.7,
  _limit: number = 10
): Promise<FaceScan[]> => {
  try {
    const res = await api.getScans(1, _limit);
    if (!res.ok) return [];
    const items = res.data.items || [];
    return items
      .filter((s) => s.qualityScore >= _minQuality)
      .map((s) => ({
        id: String(s.id),
        user_email: '',
        image_url: s.imageUrl || '',
        face_embedding: [],
        confidence_score: s.confidence,
        scan_type: s.scanType as FaceScan['scan_type'],
        quality_score: s.qualityScore,
        created_at: s.createdAt,
      }));
  } catch (error) {
    console.error('Unexpected error fetching high quality scans:', error);
    return [];
  }
};
