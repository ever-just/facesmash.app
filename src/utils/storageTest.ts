
import { pb } from "@/integrations/supabase/client";

export const testStorageSetup = async (): Promise<void> => {
  console.log('Testing PocketBase backend...');
  
  try {
    // Test health
    const health = await pb.health.check();
    console.log('PocketBase health:', health);

    // Test collections exist
    const collections = ['user_profiles', 'face_scans', 'face_templates', 'sign_in_logs', 'feedback'];
    for (const col of collections) {
      try {
        const result = await pb.collection(col).getList(1, 1);
        console.log(`${col}: OK (${result.totalItems} records)`);
      } catch (error) {
        console.error(`${col}: FAILED`, error);
      }
    }

    console.log('Backend test complete');
  } catch (error) {
    console.error('Backend test failed:', error);
  }
};
