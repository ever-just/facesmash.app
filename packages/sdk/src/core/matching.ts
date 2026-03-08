import * as faceapi from '@vladmandic/face-api';
import type { MatchResult, MultiTemplateMatchResult, ResolvedConfig } from './types';

/** Calculate cosine similarity between two face descriptors (1 - euclidean distance) */
export function calculateSimilarity(d1: Float32Array, d2: Float32Array): number {
  return 1 - faceapi.euclideanDistance(d1, d2);
}

/** Check if two face descriptors match */
export function facesMatch(
  d1: Float32Array,
  d2: Float32Array,
  threshold = 0.45
): boolean {
  return calculateSimilarity(d1, d2) >= threshold;
}

/**
 * Enhanced face matching with adaptive threshold.
 * Adjusts threshold based on lighting conditions and user confidence boost.
 */
export function enhancedMatch(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  baseThreshold = 0.45,
  confidenceBoost = 0,
  lightingScore = 0.5
): MatchResult {
  if (descriptor1.length !== descriptor2.length) {
    return { isMatch: false, similarity: 0, adaptedThreshold: baseThreshold };
  }

  const similarity = calculateSimilarity(descriptor1, descriptor2);

  let adaptedThreshold = baseThreshold;

  // More lenient in poor lighting
  if (lightingScore < 0.4) {
    adaptedThreshold = Math.max(0.35, adaptedThreshold - 0.05);
  } else if (lightingScore > 0.8) {
    adaptedThreshold = Math.min(0.6, adaptedThreshold + 0.02);
  }

  // Confidence boost for experienced users
  adaptedThreshold = Math.max(0.35, adaptedThreshold - confidenceBoost * 0.05);

  return {
    isMatch: similarity >= adaptedThreshold,
    similarity,
    adaptedThreshold,
  };
}

/** Match a face descriptor against multiple stored templates */
export function multiTemplateMatch(
  newDescriptor: Float32Array,
  templates: { descriptor: Float32Array; quality: number; weight: number }[],
  baseThreshold: number,
  lightingScore = 0.5
): MultiTemplateMatchResult {
  if (templates.length === 0) {
    return { isMatch: false, bestSimilarity: 0, avgSimilarity: 0, matchCount: 0 };
  }

  let bestSimilarity = 0;
  let weightedSum = 0;
  let totalWeight = 0;
  let matchCount = 0;

  for (const template of templates) {
    if (!template.descriptor || template.descriptor.length === 0) continue;

    const result = enhancedMatch(
      newDescriptor,
      template.descriptor,
      baseThreshold,
      template.weight,
      lightingScore
    );

    if (result.similarity > bestSimilarity) {
      bestSimilarity = result.similarity;
    }

    const w = template.quality * template.weight;
    weightedSum += result.similarity * w;
    totalWeight += w;

    if (result.isMatch) matchCount++;
  }

  const avgSimilarity = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const isMatch = bestSimilarity >= baseThreshold || (matchCount / templates.length) >= 0.6;

  return { isMatch, bestSimilarity, avgSimilarity, matchCount };
}

/** Calculate a learning weight based on scan quality */
export function calculateLearningWeight(
  qualityScore: number,
  lightingScore: number,
  confidence: number
): number {
  let weight = 1.0;

  if (qualityScore > 0.8) weight *= 1.5;
  else if (qualityScore > 0.6) weight *= 1.2;
  else if (qualityScore < 0.4) weight *= 0.5;

  if (lightingScore > 0.7) weight *= 1.3;
  else if (lightingScore < 0.4) weight *= 0.7;

  if (confidence > 0.8) weight *= 1.2;
  else if (confidence < 0.5) weight *= 0.8;

  return Math.max(0.1, Math.min(weight, 3.0));
}
