import { pb } from "@/integrations/pocketbase/client";
import { FaceScan } from "@/types";

// Convert image blob to a proper JPEG File for PocketBase upload
export const prepareImageFile = async (
  imageBlob: Blob,
  scanType: string
): Promise<File | null> => {
  try {
    const timestamp = Date.now();
    const fileName = `${scanType}_${timestamp}.jpg`;

    // Convert blob to ensure it's a proper JPEG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const processedBlob = await new Promise<Blob>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/jpeg', 0.9);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(imageBlob);
    });

    return new File([processedBlob], fileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error preparing image file:', error);
    return null;
  }
};

export const createFaceScan = async (
  userEmail: string,
  faceEmbedding: Float32Array,
  scanType: 'registration' | 'login' | 'verification',
  confidenceScore: number = 0.8,
  qualityScore: number = 0.8,
  imageFile?: File | null,
): Promise<FaceScan | null> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);
    const resolvedScanType = scanType === 'verification' ? 'login' : scanType;

    // Use FormData so we can attach the image file in the same record
    const formData = new FormData();
    formData.append('user_email', userEmail);
    formData.append('face_embedding', JSON.stringify(embeddingArray));
    formData.append('confidence', String(confidenceScore));
    formData.append('scan_type', resolvedScanType);
    formData.append('quality_score', String(qualityScore));
    if (imageFile) {
      formData.append('image_file', imageFile);
    }

    const record = await pb.collection('face_scans').create(formData);

    // Build image_url from the stored file if present
    if (record.image_file) {
      record.image_url = pb.files.getURL(record, record.image_file);
    }

    console.log(`Face scan created: type=${resolvedScanType}, quality=${qualityScore.toFixed(3)}, confidence=${confidenceScore.toFixed(3)}`);
    return record as unknown as FaceScan;
  } catch (error) {
    console.error('Unexpected error creating face scan:', error);
    return null;
  }
};

export const getFaceScansByUser = async (userEmail: string): Promise<FaceScan[]> => {
  try {
    const records = await pb.collection('face_scans').getList(1, 50, {
      filter: `user_email="${userEmail}"`,
      sort: '-created',
    });

    // Build image_url from PocketBase file field for each record
    const items = records.items.map(record => {
      if (record.image_file && !record.image_url) {
        record.image_url = pb.files.getURL(record, record.image_file);
      }
      return record;
    });

    return items as unknown as FaceScan[];
  } catch (error) {
    console.error('Unexpected error fetching face scans:', error);
    return [];
  }
};

export const updateUserEmbeddingWithScan = async (
  userEmail: string,
  newEmbedding: Float32Array,
  learningWeight: number = 1.0
): Promise<boolean> => {
  try {
    // Get the user profile
    const profiles = await pb.collection('user_profiles').getList(1, 1, {
      filter: `email="${userEmail}"`,
    });

    if (profiles.items.length === 0) return false;
    const profile = profiles.items[0];
    
    const oldEmbedding = profile.face_embedding as number[];
    const newEmbeddingArray = Array.from(newEmbedding);
    
    // Weighted average of old and new embeddings
    const weight = Math.min(learningWeight * 0.1, 0.3); // Cap influence of single scan
    const blendedEmbedding = oldEmbedding.map((val: number, i: number) => 
      val * (1 - weight) + newEmbeddingArray[i] * weight
    );

    await pb.collection('user_profiles').update(profile.id, {
      face_embedding: blendedEmbedding,
    });

    console.log(`Enhanced embedding update completed for ${userEmail} with weight ${learningWeight.toFixed(2)}`);
    return true;
  } catch (error) {
    console.error('Unexpected error updating user embedding:', error);
    return false;
  }
};

export const getHighQualityScans = async (
  userEmail: string,
  minQuality: number = 0.7,
  limit: number = 10
): Promise<FaceScan[]> => {
  try {
    const records = await pb.collection('face_scans').getList(1, limit, {
      filter: `user_email="${userEmail}" && quality_score>=${minQuality}`,
      sort: '-quality_score,-created',
    });

    return records.items as unknown as FaceScan[];
  } catch (error) {
    console.error('Unexpected error fetching high quality scans:', error);
    return [];
  }
};
