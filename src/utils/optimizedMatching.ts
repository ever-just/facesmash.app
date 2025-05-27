
import { multiTemplateMatch, enhancedFaceMatch } from './enhancedFaceRecognition';
import { getFaceTemplates } from '../services/faceTemplateService';
import { getUserLearningStats, getConfidenceBoost } from '../services/learningService';

interface CachedTemplate {
  descriptor: Float32Array;
  quality: number;
  weight: number;
  userId: string;
}

interface QuickMatchResult {
  isMatch: boolean;
  similarity: number;
  matchedUser: string | null;
  confidence: number;
}

// Template cache for session-based performance
class TemplateCache {
  private cache = new Map<string, CachedTemplate[]>();
  private cacheTime = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getTemplates(userEmail: string): Promise<CachedTemplate[]> {
    const now = Date.now();
    const cached = this.cache.get(userEmail);
    const cacheTime = this.cacheTime.get(userEmail) || 0;

    if (cached && (now - cacheTime) < this.CACHE_DURATION) {
      return cached;
    }

    // Load templates and cache them
    const templates = await getFaceTemplates(userEmail);
    const learningStats = await getUserLearningStats(userEmail);

    const cachedTemplates: CachedTemplate[] = templates.map(t => ({
      descriptor: new Float32Array(t.face_embedding),
      quality: t.quality_score,
      weight: learningStats ? getConfidenceBoost(
        learningStats.successfulLogins,
        learningStats.successRate,
        learningStats.avgQualityScore
      ) + 1 : 1,
      userId: userEmail
    }));

    this.cache.set(userEmail, cachedTemplates);
    this.cacheTime.set(userEmail, now);
    return cachedTemplates;
  }

  clearCache(userEmail?: string): void {
    if (userEmail) {
      this.cache.delete(userEmail);
      this.cacheTime.delete(userEmail);
    } else {
      this.cache.clear();
      this.cacheTime.clear();
    }
  }
}

export const templateCache = new TemplateCache();

// Fast, simplified quality scoring for initial matching
export const quickQualityScore = (descriptor: Float32Array): number => {
  // Simple quality check based on descriptor properties
  const magnitude = Math.sqrt(descriptor.reduce((sum, val) => sum + val * val, 0));
  const normalizedMagnitude = magnitude / descriptor.length;
  
  // Basic quality score - more sophisticated analysis happens in background
  return Math.min(0.9, Math.max(0.3, normalizedMagnitude));
};

// Optimized parallel matching function
export const parallelUserMatching = async (
  faceDescriptor: Float32Array,
  userProfiles: any[],
  quickQuality: number
): Promise<QuickMatchResult> => {
  const matchPromises = userProfiles.map(async (profile) => {
    try {
      const templates = await templateCache.getTemplates(profile.email);
      const learningStats = await getUserLearningStats(profile.email);
      
      let matchResult;
      
      if (templates.length > 0) {
        // Use cached templates for faster matching
        matchResult = multiTemplateMatch(
          faceDescriptor,
          templates,
          learningStats?.currentThreshold || 0.6,
          0.5 // Default lighting score for quick match
        );
      } else {
        // Fallback to profile embedding
        const storedEmbedding = new Float32Array(profile.face_embedding);
        const confidenceBoost = learningStats ? getConfidenceBoost(
          learningStats.successfulLogins,
          learningStats.successRate,
          learningStats.avgQualityScore
        ) : 0;
        
        matchResult = enhancedFaceMatch(
          faceDescriptor,
          storedEmbedding,
          learningStats?.currentThreshold || 0.6,
          confidenceBoost,
          0.5 // Default lighting score
        );
      }
      
      return {
        userEmail: profile.email,
        similarity: matchResult.bestSimilarity || matchResult.similarity,
        isMatch: matchResult.isMatch,
        profile
      };
    } catch (error) {
      console.error(`Error matching user ${profile.email}:`, error);
      return {
        userEmail: profile.email,
        similarity: 0,
        isMatch: false,
        profile
      };
    }
  });

  const results = await Promise.all(matchPromises);
  const bestMatch = results.reduce((best, current) => 
    current.similarity > best.similarity ? current : best
  );

  return {
    isMatch: bestMatch.isMatch,
    similarity: bestMatch.similarity,
    matchedUser: bestMatch.isMatch ? bestMatch.userEmail : null,
    confidence: quickQuality
  };
};
