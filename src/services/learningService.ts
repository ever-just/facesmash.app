/**
 * Learning Service — now backed by Hono API.
 *
 * Key changes from PocketBase version:
 * - Learning metrics are updated server-side by performLoginBookkeeping()
 * - getUserLearningStats fetches from /api/profile/learning
 * - getConfidenceBoost remains pure client-side logic (no PB dependency)
 */

import { api } from "@/integrations/api/client";

/**
 * @deprecated — Learning metrics are now updated server-side during login.
 * The Hono API's performLoginBookkeeping() handles threshold adaptation,
 * login counts, and quality score averaging.
 */
export const updateUserLearningMetrics = async (
  _userEmail: string,
  _success: boolean,
  _confidence: number,
  _qualityScore: number
): Promise<boolean> => {
  // Server-side: handled by /api/auth/login → performLoginBookkeeping()
  console.log('updateUserLearningMetrics: now handled server-side');
  return true;
};

export const getUserLearningStats = async (_userEmail: string): Promise<{
  totalLogins: number;
  successfulLogins: number;
  successRate: number;
  currentThreshold: number;
  avgQualityScore: number;
  experienceLevel: 'new' | 'experienced' | 'expert';
} | null> => {
  try {
    const res = await api.getLearningStats();
    if (!res.ok) return null;

    const d = res.data;
    return {
      totalLogins: d.loginCount,
      successfulLogins: d.successfulLogins,
      successRate: d.successRate,
      currentThreshold: d.confidenceThreshold,
      avgQualityScore: d.avgQualityScore,
      experienceLevel: d.experienceLevel as 'new' | 'experienced' | 'expert',
    };
  } catch (error) {
    console.error('Unexpected error fetching learning stats:', error);
    return null;
  }
};

export const getConfidenceBoost = (
  successfulLogins: number,
  successRate: number,
  avgQualityScore: number
): number => {
  let boost = 0;

  // Experience boost
  if (successfulLogins >= 20) boost += 0.15;
  else if (successfulLogins >= 10) boost += 0.10;
  else if (successfulLogins >= 5) boost += 0.05;

  // Success rate boost
  if (successRate >= 0.9) boost += 0.10;
  else if (successRate >= 0.8) boost += 0.05;

  // Quality boost
  if (avgQualityScore >= 0.8) boost += 0.05;
  else if (avgQualityScore >= 0.6) boost += 0.02;

  return Math.min(boost, 0.25); // Cap at 0.25
};
