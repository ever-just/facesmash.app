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
    console.log('Starting face image upload process...');
    console.log('Blob size:', imageBlob.size, 'bytes');
    console.log('Blob type:', imageBlob.type);
    
    const timestamp = Date.now();
    const fileName = `${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}/${scanType}_${timestamp}.jpg`;
    
    console.log('Uploading to path:', fileName);
    
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets?.map(b => b.id));
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    }
    
    const { data, error } = await supabase.storage
      .from('face-images')
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error('Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('face-images')
      .getPublicUrl(data.path);
      
    console.log('Generated public URL:', urlData.publicUrl);
    
    // Test if the URL is accessible
    try {
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
      console.log('URL accessibility test:', response.status, response.statusText);
    } catch (urlError) {
      console.error('URL accessibility test failed:', urlError);
    }
    
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
