
import { pb } from "@/integrations/supabase/client";
import * as faceapi from 'face-api.js';

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

const MAX_TEMPLATES_PER_USER = 10;

export const manageFaceTemplates = async (
  userEmail: string,
  faceEmbedding: Float32Array,
  qualityScore: number,
  confidenceScore: number,
  lightingConditions: any
): Promise<boolean> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);

    // Get existing templates
    const existing = await pb.collection('face_templates').getList(1, 50, {
      filter: `user_email="${userEmail}"`,
      sort: 'quality_score',
    });

    // If at max templates, remove the lowest quality one
    if (existing.items.length >= MAX_TEMPLATES_PER_USER) {
      const lowest = existing.items[0];
      await pb.collection('face_templates').delete(lowest.id);
    }

    // Create new template
    await pb.collection('face_templates').create({
      user_email: userEmail,
      face_embedding: embeddingArray,
      quality_score: qualityScore,
      confidence: confidenceScore,
      environmental_conditions: lightingConditions,
      usage_count: 0,
    });

    return true;
  } catch (error) {
    console.error('Unexpected error managing face templates:', error);
    return false;
  }
};

export const getFaceTemplates = async (userEmail: string): Promise<FaceTemplate[]> => {
  try {
    const records = await pb.collection('face_templates').getList(1, 50, {
      filter: `user_email="${userEmail}"`,
      sort: '-quality_score',
    });

    return records.items as unknown as FaceTemplate[];
  } catch (error) {
    console.error('Unexpected error fetching face templates:', error);
    return [];
  }
};

export const updateTemplateUsage = async (templateId: string): Promise<boolean> => {
  try {
    const current = await pb.collection('face_templates').getOne(templateId);

    await pb.collection('face_templates').update(templateId, {
      last_used: new Date().toISOString(),
      usage_count: (current.usage_count || 0) + 1,
    });

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
    // Client-side duplicate check: fetch all profiles and compare embeddings
    const profiles = await pb.collection('user_profiles').getFullList();
    const results: { existing_email: string; similarity_score: number; user_id: string }[] = [];

    for (const profile of profiles) {
      if (!profile.face_embedding) continue;
      const storedEmbedding = new Float32Array(profile.face_embedding as number[]);
      const similarity = 1 - faceapi.euclideanDistance(faceEmbedding, storedEmbedding);
      if (similarity >= threshold) {
        results.push({
          existing_email: profile.email as string,
          similarity_score: similarity,
          user_id: profile.id,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Unexpected error checking duplicate users:', error);
    return [];
  }
};
