/**
 * Face Template Service — now backed by Hono API.
 *
 * Key changes from PocketBase version:
 * - Template management (add/rotate) is handled server-side by performLoginBookkeeping()
 * - Duplicate check is server-side via pgvector (no client-side embedding comparison)
 * - getFaceTemplates returns metadata only (no vectors leave the server)
 */

import { api } from "@/integrations/api/client";

export interface FaceTemplate {
  id: string;
  user_email: string;
  descriptor: number[];
  face_embedding: number[]; // alias for descriptor (backward compat)
  quality_score: number;
  confidence_score: number;
  lighting_conditions: unknown;
  template_rank: number;
  created_at: string;
  last_used: string;
  usage_count: number;
}

/**
 * @deprecated — Template management is now handled server-side.
 * The server's performLoginBookkeeping() adds templates and rotates old ones.
 * This stub exists for backward compatibility during migration.
 */
export const manageFaceTemplates = async (
  _userEmail: string,
  faceEmbedding: Float32Array,
  qualityScore: number,
  _confidenceScore: number,
  _lightingConditions: unknown
): Promise<boolean> => {
  try {
    const embeddingArray = Array.from(faceEmbedding);
    const res = await api.addTemplate({
      descriptor: embeddingArray,
      qualityScore,
    });
    return res.ok;
  } catch (error) {
    console.error('Unexpected error managing face templates:', error);
    return false;
  }
};

export const getFaceTemplates = async (_userEmail: string): Promise<FaceTemplate[]> => {
  try {
    const res = await api.getTemplates();
    if (!res.ok) return [];

    const templates = Array.isArray(res.data) ? res.data : [];
    return templates.map((t) => ({
      id: String(t.id),
      user_email: '',
      descriptor: [],
      face_embedding: [], // Vectors stay server-side
      quality_score: t.qualityScore,
      confidence_score: 0,
      lighting_conditions: null,
      template_rank: 0,
      created_at: t.createdAt,
      last_used: t.lastUsed || '',
      usage_count: t.usageCount,
    }));
  } catch (error) {
    console.error('Unexpected error fetching face templates:', error);
    return [];
  }
};

/**
 * @deprecated — Template usage tracking is now handled server-side.
 */
export const updateTemplateUsage = async (_templateId: string): Promise<boolean> => {
  console.log('updateTemplateUsage: now handled server-side');
  return true;
};

/**
 * Duplicate check — now server-side via pgvector.
 * The server's /api/auth/register already checks for duplicates before creating a profile.
 * This stub is kept for callers that still reference it.
 */
export const checkDuplicateUsers = async (
  _faceEmbedding: Float32Array,
  _threshold: number = 0.75
): Promise<{ existing_email: string; similarity_score: number; user_id: string }[]> => {
  // Server-side: /api/auth/register calls checkDuplicateFace() internally
  console.log('checkDuplicateUsers: now handled server-side during registration');
  return [];
};
