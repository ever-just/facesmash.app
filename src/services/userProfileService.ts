/**
 * User Profile Service — now backed by Hono API (server-side pgvector).
 *
 * Key changes from PocketBase version:
 * - Registration goes through /api/auth/register (server creates profile + first template)
 * - Login goes through /api/auth/login (server does pgvector matching — no client-side loop)
 * - getAllUserProfiles() is REMOVED — embeddings never leave the server
 * - Profile CRUD uses /api/profile (auth via httpOnly cookie)
 */

import { api } from "@/integrations/api/client";
import { UserProfile } from "@/types";

export const createUserProfile = async (
  name: string,
  faceEmbedding: Float32Array,
  imageData?: string
): Promise<UserProfile | null> => {
  try {
    console.log('Creating user profile with name:', name);

    const embeddingArray = Array.from(faceEmbedding);

    const res = await api.register({
      email: name,
      embedding: embeddingArray,
      qualityScore: 0.8,
      imageData,
    });

    if (!res.ok) {
      console.error('Registration failed:', res.data);
      return null;
    }

    const user = res.data.user;
    console.log('User profile created successfully:', user);

    return {
      id: String(user.id),
      email: user.email,
      face_embedding: embeddingArray,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Unexpected error creating user profile:', error);
    return null;
  }
};

export const getUserProfileByName = async (name: string): Promise<UserProfile | null> => {
  try {
    // After login, the profile is available via the authenticated /api/profile endpoint.
    // This function is called in contexts where the user is already authenticated.
    const res = await api.getProfile();
    if (!res.ok) return null;

    const p = res.data;
    if (p.email !== name) return null;

    return {
      id: String(p.id),
      email: p.email,
      face_embedding: [], // Embeddings stay server-side
      created_at: p.createdAt,
      updated_at: p.createdAt,
      successful_logins: p.successfulLogins,
      total_logins: p.loginCount,
    };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};

/**
 * @deprecated — No longer fetches all profiles.
 * Face matching is now done server-side via /api/auth/login.
 * This stub exists only to avoid breaking callers during migration.
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  console.warn('getAllUserProfiles() is deprecated — matching is now server-side');
  return [];
};

export const updateUserProfile = async (
  _id: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const res = await api.updateProfile({
      fullName: updates.email, // The old code used email as display name
    });

    if (!res.ok) return null;
    return updates as UserProfile;
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return null;
  }
};

export const deleteUserProfile = async (_id: string): Promise<boolean> => {
  try {
    const res = await api.deleteProfile();
    return res.ok;
  } catch (error) {
    console.error('Unexpected error deleting user profile:', error);
    return false;
  }
};
