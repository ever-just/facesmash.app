/**
 * Sign-In Log Service — now backed by Hono API.
 *
 * Key changes from PocketBase version:
 * - Sign-in logs are created server-side during /api/auth/login
 * - Client-side createSignInLog is a no-op (kept for backward compat)
 * - Logs are fetched via /api/logs
 */

import { api } from "@/integrations/api/client";

export interface SignInLog {
  id: string;
  user_email: string;
  created: string;
}

/**
 * @deprecated — Sign-in logs are now created server-side during login.
 * This is a no-op stub for backward compatibility.
 */
export const createSignInLog = async (_userEmail: string): Promise<SignInLog | null> => {
  // Server-side: login endpoint creates the sign-in log automatically
  console.log('createSignInLog: now handled server-side');
  return null;
};

export const getSignInLogsByUser = async (_userEmail: string): Promise<SignInLog[]> => {
  try {
    const res = await api.getLogs(1, 500);
    if (!res.ok) return [];

    return res.data.logs
      .filter((l) => l.success)
      .map((l) => ({
        id: String(l.id),
        user_email: '',
        created: l.createdAt,
      }));
  } catch (error) {
    console.error('Unexpected error fetching sign-in logs:', error);
    return [];
  }
};
