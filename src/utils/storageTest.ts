
import { supabase } from "@/integrations/supabase/client";

export const testStorageSetup = async (): Promise<void> => {
  console.log('🔍 Testing storage setup...');
  
  try {
    // Check if bucket exists and is public
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('📁 Available buckets:', buckets?.map(b => ({ 
      id: b.id, 
      public: b.public,
      name: b.name 
    })));
    
    const faceImagesBucket = buckets?.find(b => b.id === 'face-images');
    
    if (!faceImagesBucket) {
      console.log('⚠️ face-images bucket not found');
      return;
    }
    
    console.log('✅ face-images bucket found:', {
      id: faceImagesBucket.id,
      public: faceImagesBucket.public,
      name: faceImagesBucket.name,
      created_at: faceImagesBucket.created_at
    });
    
    if (!faceImagesBucket.public) {
      console.log('⚠️ Bucket is not public - images may not be accessible');
    } else {
      console.log('✅ Bucket is public - images should be accessible');
    }
    
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
        
        // Test accessibility of first file
        const firstFile = files[0];
        if (firstFile) {
          const { data: urlData } = supabase.storage
            .from('face-images')
            .getPublicUrl(firstFile.name);
          
          console.log('🔗 Testing accessibility of first file:', urlData.publicUrl);
          
          try {
            const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
            console.log('🌐 File accessibility test:', response.status, response.statusText);
            if (response.ok) {
              console.log('✅ Files are accessible via public URLs');
            } else {
              console.log('❌ Files are not accessible, status:', response.status);
            }
          } catch (error) {
            console.error('🌐 File accessibility test failed:', error);
          }
        }
      }
    }
    
    // Test upload permissions with a tiny test file
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
      
      // Test accessibility
      try {
        const response = await fetch(urlData.publicUrl);
        console.log('🌐 Test file accessibility:', response.status, response.statusText);
        if (response.ok) {
          console.log('✅ Upload and accessibility working perfectly');
        }
      } catch (error) {
        console.error('🌐 Test file accessibility failed:', error);
      }
      
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
