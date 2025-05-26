
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
    
    // Check if bucket exists first and create if needed
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets?.map(b => b.id));
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.id === 'face-images');
    console.log('face-images bucket exists:', bucketExists);
    
    if (!bucketExists) {
      console.log('Creating face-images bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('face-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        fileSizeLimit: 1024 * 1024 * 2 // 2MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return null;
      }
      console.log('Bucket created successfully:', newBucket);
    }
    
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
    
    console.log('Processed blob size:', processedBlob.size, 'bytes');
    console.log('Processed blob type:', processedBlob.type);
    
    const { data, error } = await supabase.storage
      .from('face-images')
      .upload(fileName, processedBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error('Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try alternative upload method
      console.log('Trying alternative upload method...');
      const { data: retryData, error: retryError } = await supabase.storage
        .from('face-images')
        .upload(fileName, imageBlob, {
          upsert: true
        });
        
      if (retryError) {
        console.error('Retry upload also failed:', retryError);
        return null;
      }
      
      console.log('Retry upload successful:', retryData);
      const { data: urlData } = supabase.storage
        .from('face-images')
        .getPublicUrl(retryData.path);
      return urlData.publicUrl;
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
      
      if (response.status === 200) {
        console.log('✅ Image upload and accessibility confirmed');
        return urlData.publicUrl;
      } else {
        console.error('❌ Image uploaded but not accessible, status:', response.status);
        return urlData.publicUrl; // Return anyway, might be CORS issue
      }
    } catch (urlError) {
      console.error('URL accessibility test failed:', urlError);
      console.log('Returning URL anyway, might be CORS restriction');
      return urlData.publicUrl;
    }
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
