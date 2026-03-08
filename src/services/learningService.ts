
import { pb } from "@/integrations/pocketbase/client";
import { UserProfile } from "@/types";

export const updateUserLearningMetrics = async (
  userEmail: string,
  success: boolean,
  confidence: number,
  qualityScore: number
): Promise<boolean> => {
  try {
    const profiles = await pb.collection('user_profiles').getList(1, 1, {
      filter: `email="${userEmail}"`,
    });

    if (profiles.items.length === 0) return false;
    const profile = profiles.items[0];

    const loginCount = (profile.login_count || 0) + 1;
    const successfulLogins = (profile.successful_logins || 0) + (success ? 1 : 0);
    const failedLogins = (profile.failed_logins || 0) + (success ? 0 : 1);
    
    // Running average of quality score
    const oldAvg = profile.avg_quality_score || 0;
    const avgQualityScore = oldAvg === 0 ? qualityScore : (oldAvg * 0.8 + qualityScore * 0.2);

    // Adaptive threshold: tighten for experienced users, loosen for new users
    const successRate = loginCount > 0 ? successfulLogins / loginCount : 0;
    let threshold = profile.confidence_threshold || 0.6;
    if (success && successRate > 0.8 && successfulLogins > 5) {
      threshold = Math.min(0.7, threshold + 0.005);
    } else if (!success && successRate < 0.5) {
      threshold = Math.max(0.45, threshold - 0.01);
    }

    await pb.collection('user_profiles').update(profile.id, {
      login_count: loginCount,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      avg_quality_score: avgQualityScore,
      confidence_threshold: threshold,
      last_login: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Unexpected error updating learning metrics:', error);
    return false;
  }
};

export const getUserLearningStats = async (userEmail: string): Promise<{
  totalLogins: number;
  successfulLogins: number;
  successRate: number;
  currentThreshold: number;
  avgQualityScore: number;
  experienceLevel: 'new' | 'experienced' | 'expert';
} | null> => {
  try {
    const profiles = await pb.collection('user_profiles').getList(1, 1, {
      filter: `email="${userEmail}"`,
    });

    if (profiles.items.length === 0) return null;
    const data = profiles.items[0];

    const totalLogins = data.login_count || 0;
    const successfulLogins = data.successful_logins || 0;
    const successRate = totalLogins > 0 ? successfulLogins / totalLogins : 0;
    
    let experienceLevel: 'new' | 'experienced' | 'expert' = 'new';
    if (successfulLogins >= 20) experienceLevel = 'expert';
    else if (successfulLogins >= 5) experienceLevel = 'experienced';

    return {
      totalLogins,
      successfulLogins,
      successRate,
      currentThreshold: data.confidence_threshold || 0.6,
      avgQualityScore: data.avg_quality_score || 0,
      experienceLevel
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
