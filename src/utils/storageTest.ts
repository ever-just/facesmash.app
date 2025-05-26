
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
    
    console.log('📁 Available buckets:', buckets?.map(b => ({ id: b.id, public: b.public })));
    
    const faceImagesBucket = buckets?.find(b => b.id === 'face-images');
    
    if (!faceImagesBucket) {
      console.log('⚠️ face-images bucket not found');
      return;
    }
    
    console.log('✅ face-images bucket found:', {
      id: faceImagesBucket.id,
      public: faceImagesBucket.public,
      created_at: faceImagesBucket.created_at
    });
    
    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('face-images')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      console.error('🔍 Error details:', JSON.stringify(filesError, null, 2));
    } else {
      console.log('📄 Files in bucket:', files?.length || 0);
      if (files && files.length > 0) {
        console.log('📋 Recent files:', files.slice(0, 3).map(f => ({
          name: f.name,
          size: f.metadata?.size,
          updated_at: f.updated_at
        })));
      }
    }
    
    // Test upload permissions
    const testBlob = new Blob(['test-storage-setup'], { type: 'text/plain' });
    const testPath = `test/storage-test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-images')
      .upload(testPath, testBlob);
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      console.error('🔍 Upload error details:', JSON.stringify(uploadError, null, 2));
    } else {
      console.log('✅ Test upload successful:', uploadData);
      
      // Test public URL access
      const { data: urlData } = supabase.storage
        .from('face-images')
        .getPublicUrl(uploadData.path);
      
      console.log('🔗 Test file public URL:', urlData.publicUrl);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('face-images')
        .remove([testPath]);
        
      if (deleteError) {
        console.error('⚠️ Failed to clean up test file:', deleteError);
      } else {
        console.log('🧹 Test file cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('💥 Storage test failed with exception:', error);
  }
};
