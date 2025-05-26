import { supabase } from "@/integrations/supabase/client";
import { FaceScan } from "@/types";

export const uploadFaceImage = async (
  imageBlob: Blob, 
  userEmail: string, 
  scanType: string
): Promise<string | null> => {
  try {
    const timestamp = Date.now();
    const fileName = `${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}/${scanType}_${timestamp}.jpg`;
    
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
    
    // Upload the image
    const { data, error } = await supabase.storage
      .from('face-images')
      .upload(fileName, processedBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('face-images')
      .getPublicUrl(data.path);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error in uploadFaceImage:', error);
    return null;
  }
};

export const createFaceScan = async (
  userEmail: string,
  imageUrl: string,
  faceEmbedding: Float32Array,
  scanType: 'registration' | 'login' | 'verification',
  confidenceScore: number = 0.8,
  qualityScore: number = 0.8,
  lightingScore: number = 0.5,
  environmentalConditions: any = {},
  learningWeight: number = 1.0
): Promise<FaceScan | null> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);
    
    const { data, error } = await supabase
      .from('face_scans')
      .insert([
        {
          user_email: userEmail,
          image_url: imageUrl,
          face_embedding: embeddingArray,
          confidence_score: confidenceScore,
          scan_type: scanType,
          quality_score: qualityScore,
          lighting_score: lightingScore,
          environmental_conditions: environmentalConditions,
          learning_weight: learningWeight
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating enhanced face scan:', error);
      return null;
    }

    return data as FaceScan;
  } catch (error) {
    console.error('Unexpected error creating enhanced face scan:', error);
    return null;
  }
};

export const getFaceScansByUser = async (userEmail: string): Promise<FaceScan[]> => {
  try {
    const { data, error } = await supabase
      .from('face_scans')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching face scans:', error);
      return [];
    }

    return (data || []) as FaceScan[];
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
    const embeddingArray = Array.from(newEmbedding);
    
    const { error } = await supabase.rpc('update_user_embedding_with_scan', {
      p_user_email: userEmail,
      p_new_embedding: embeddingArray,
      p_confidence: learningWeight
    });

    if (error) {
      console.error('Error updating user embedding with enhanced learning:', error);
      return false;
    }

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
    const { data, error } = await supabase
      .from('face_scans')
      .select('*')
      .eq('user_email', userEmail)
      .gte('quality_score', minQuality)
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching high quality scans:', error);
      return [];
    }

    return (data || []) as FaceScan[];
  } catch (error) {
    console.error('Unexpected error fetching high quality scans:', error);
    return [];
  }
};
