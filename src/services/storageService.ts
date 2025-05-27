
import { supabase } from "@/integrations/supabase/client";

export const createFaceImagesBucket = async (): Promise<boolean> => {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'face-images');
    
    if (bucketExists) {
      console.log('Face images bucket already exists');
      return true;
    }

    // Create the bucket
    const { error } = await supabase.storage.createBucket('face-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('Error creating face images bucket:', error);
      return false;
    }

    console.log('Face images bucket created successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error creating bucket:', error);
    return false;
  }
};

export const initializeStorage = async (): Promise<void> => {
  await createFaceImagesBucket();
};
