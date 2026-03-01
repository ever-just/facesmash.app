
import { pb } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";

export const createUserProfile = async (name: string, faceEmbedding: Float32Array): Promise<UserProfile | null> => {
  try {
    console.log('Creating user profile with name:', name);
    
    const embeddingArray = Array.from(faceEmbedding);
    
    const record = await pb.collection('user_profiles').create({
      email: name,
      face_embedding: embeddingArray,
    });

    console.log('User profile created successfully:', record);
    return record as unknown as UserProfile;
  } catch (error) {
    console.error('Unexpected error creating user profile:', error);
    return null;
  }
};

export const getUserProfileByName = async (name: string): Promise<UserProfile | null> => {
  try {
    const records = await pb.collection('user_profiles').getList(1, 1, {
      filter: `email="${name}"`,
    });

    if (records.items.length === 0) return null;
    return records.items[0] as unknown as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const records = await pb.collection('user_profiles').getFullList({
      sort: '-created',
    });

    return records as unknown as UserProfile[];
  } catch (error) {
    console.error('Unexpected error fetching user profiles:', error);
    return [];
  }
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const record = await pb.collection('user_profiles').update(id, updates);
    return record as unknown as UserProfile;
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return null;
  }
};

export const deleteUserProfile = async (id: string): Promise<boolean> => {
  try {
    await pb.collection('user_profiles').delete(id);
    return true;
  } catch (error) {
    console.error('Unexpected error deleting user profile:', error);
    return false;
  }
};
