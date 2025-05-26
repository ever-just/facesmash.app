
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";

export const createUserProfile = async (name: string, faceEmbedding: Float32Array): Promise<UserProfile | null> => {
  try {
    console.log('Creating user profile with name:', name);
    
    const embeddingArray = Array.from(faceEmbedding);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          email: name,
          face_embedding: embeddingArray
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    console.log('User profile created successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error creating user profile:', error);
    return null;
  }
};

export const getUserProfileByName = async (name: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', name)
      .single();

    if (error) {
      console.error('Error fetching user profile by name:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      console.error('Error fetching all user profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching user profiles:', error);
    return [];
  }
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return null;
  }
};

export const deleteUserProfile = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting user profile:', error);
    return false;
  }
};
