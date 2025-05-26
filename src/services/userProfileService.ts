
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  face_embedding: number[];
  created_at: string;
  updated_at: string;
}

export const createUserProfile = async (email: string, faceEmbedding: Float32Array): Promise<UserProfile | null> => {
  try {
    // For registration, we need to temporarily use the service role or allow anon access
    // Since this is registration, we'll insert directly and let the RLS policy handle it
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        email,
        face_embedding: Array.from(faceEmbedding)
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};

export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      console.error('Error fetching user profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
};

export const updateUserProfile = async (id: string, faceEmbedding: Float32Array): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        face_embedding: Array.from(faceEmbedding),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};
