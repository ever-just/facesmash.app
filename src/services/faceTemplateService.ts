
import { supabase } from "@/integrations/supabase/client";

export interface FaceTemplate {
  id: string;
  user_email: string;
  face_embedding: number[];
  quality_score: number;
  confidence_score: number;
  lighting_conditions: any;
  template_rank: number;
  created_at: string;
  last_used: string;
  usage_count: number;
}

export const manageFaceTemplates = async (
  userEmail: string,
  faceEmbedding: Float32Array,
  qualityScore: number,
  confidenceScore: number,
  lightingConditions: any
): Promise<boolean> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);
    
    const { error } = await supabase.rpc('manage_face_templates', {
      p_user_email: userEmail,
      p_face_embedding: embeddingArray,
      p_quality_score: qualityScore,
      p_confidence_score: confidenceScore,
      p_lighting_conditions: lightingConditions
    });

    if (error) {
      console.error('Error managing face templates:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error managing face templates:', error);
    return false;
  }
};

export const getFaceTemplates = async (userEmail: string): Promise<FaceTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('face_templates')
      .select('*')
      .eq('user_email', userEmail)
      .order('template_rank', { ascending: true });

    if (error) {
      console.error('Error fetching face templates:', error);
      return [];
    }

    return (data || []) as FaceTemplate[];
  } catch (error) {
    console.error('Unexpected error fetching face templates:', error);
    return [];
  }
};

export const updateTemplateUsage = async (templateId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('face_templates')
      .update({
        last_used: new Date().toISOString(),
        usage_count: supabase.rpc('increment_usage_count', { template_id: templateId })
      })
      .eq('id', templateId);

    if (error) {
      console.error('Error updating template usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating template usage:', error);
    return false;
  }
};

export const checkDuplicateUsers = async (
  faceEmbedding: Float32Array,
  threshold: number = 0.75
): Promise<{ existing_email: string; similarity_score: number; user_id: string }[]> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);
    
    const { data, error } = await supabase.rpc('check_duplicate_user', {
      p_face_embedding: embeddingArray,
      p_threshold: threshold
    });

    if (error) {
      console.error('Error checking duplicate users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error checking duplicate users:', error);
    return [];
  }
};
