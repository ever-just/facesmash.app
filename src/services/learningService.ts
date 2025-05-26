
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";

export const updateUserLearningMetrics = async (
  userEmail: string,
  success: boolean,
  confidence: number,
  qualityScore: number
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('update_user_learning_metrics', {
      p_user_email: userEmail,
      p_success: success,
      p_confidence: confidence,
      p_quality_score: qualityScore
    });

    if (error) {
      console.error('Error updating learning metrics:', error);
      return false;
    }

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
    const { data, error } = await supabase
      .from('user_profiles')
      .select('total_logins, successful_logins, current_threshold, quality_score_avg')
      .eq('email', userEmail)
      .single();

    if (error) {
      console.error('Error fetching learning stats:', error);
      return null;
    }

    const totalLogins = data.total_logins || 0;
    const successfulLogins = data.successful_logins || 0;
    const successRate = totalLogins > 0 ? successfulLogins / totalLogins : 0;
    
    let experienceLevel: 'new' | 'experienced' | 'expert' = 'new';
    if (successfulLogins >= 20) experienceLevel = 'expert';
    else if (successfulLogins >= 5) experienceLevel = 'experienced';

    return {
      totalLogins,
      successfulLogins,
      successRate,
      currentThreshold: data.current_threshold || 0.6,
      avgQualityScore: data.quality_score_avg || 0,
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
