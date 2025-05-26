
import { supabase } from "@/integrations/supabase/client";

export interface FaceScan {
  id: string;
  user_email: string;
  image_url: string;
  face_embedding: number[];
  confidence_score: number;
  scan_type: 'registration' | 'login' | 'verification';
  quality_score: number;
  created_at: string;
}

export const uploadFaceImage = async (
  imageBlob: Blob, 
  userEmail: string, 
  scanType: string
): Promise<string | null> => {
  try {
    const timestamp = Date.now();
    const fileName = `${userEmail}/${scanType}_${timestamp}.jpg`;
    
    console.log('Uploading face image:', fileName);
    
    const { data, error } = await supabase.storage
      .from('face-images')
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading face image:', error);
      return null;
    }

    console.log('Face image uploaded successfully:', data.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('face-images')
      .getPublicUrl(data.path);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading face image:', error);
    return null;
  }
};

export const createFaceScan = async (
  userEmail: string,
  imageUrl: string,
  faceEmbedding: Float32Array,
  scanType: 'registration' | 'login' | 'verification',
  confidenceScore: number = 0.8,
  qualityScore: number = 0.8
): Promise<FaceScan | null> => {
  try {
    console.log('Creating face scan record for user:', userEmail);
    
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
          quality_score: qualityScore
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating face scan:', error);
      return null;
    }

    console.log('Face scan created successfully:', data);
    return data as FaceScan;
  } catch (error) {
    console.error('Unexpected error creating face scan:', error);
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
  confidence: number
): Promise<boolean> => {
  try {
    console.log('Updating user embedding with new scan data');
    
    const embeddingArray = Array.from(newEmbedding);
    
    const { error } = await supabase.rpc('update_user_embedding_with_scan', {
      p_user_email: userEmail,
      p_new_embedding: embeddingArray,
      p_confidence: confidence
    });

    if (error) {
      console.error('Error updating user embedding:', error);
      return false;
    }

    console.log('User embedding updated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error updating user embedding:', error);
    return false;
  }
};
