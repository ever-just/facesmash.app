
import { supabase } from "@/integrations/supabase/client";

export const testStorageSetup = async (): Promise<void> => {
  console.log('🔍 Testing storage setup...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('📁 Available buckets:', buckets?.map(b => b.id));
    
    const faceImagesBucket = buckets?.find(b => b.id === 'face-images');
    
    if (!faceImagesBucket) {
      console.log('⚠️ face-images bucket not found');
      return;
    }
    
    console.log('✅ face-images bucket found:', faceImagesBucket);
    
    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('face-images')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
    } else {
      console.log('📄 Files in bucket:', files?.length || 0);
      console.log('📋 File details:', files);
    }
    
    // Test if we can create a test file
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testPath = `test/storage-test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-images')
      .upload(testPath, testBlob);
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
    } else {
      console.log('✅ Test upload successful:', uploadData);
      
      // Clean up test file
      await supabase.storage
        .from('face-images')
        .remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
};
