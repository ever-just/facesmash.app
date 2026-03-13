// Core client
import { FaceSmashClient } from './core/client';
export { FaceSmashClient };

// Detection utilities
export {
  loadModels,
  areModelsLoaded,
  extractDescriptor,
  analyzeFace,
  processImages,
  detectFaceTiny,
  detectFaceSsd,
} from './core/detection';

// Liveness utilities
export {
  createLivenessState,
  updateLivenessState,
  getEyeAspectRatios,
  calculateEAR,
  estimateHeadPose,
  validateFaceSize,
  normalizeDescriptor,
} from './core/liveness';

// Matching utilities
export {
  calculateSimilarity,
  facesMatch,
  enhancedMatch,
  multiTemplateMatch,
  calculateLearningWeight,
} from './core/matching';

// API client
export { FaceSmashApiClient } from './core/api-client';

// Types
export type {
  FaceSmashConfig,
  ResolvedConfig,
  FaceAnalysis,
  MatchResult,
  MultiTemplateMatchResult,
  LoginResult,
  RegisterResult,
  MatchedUser,
  FaceTemplate,
  HeadPose,
  FaceSizeCheck,
  LightingAnalysis,
  LightingCondition,
  LivenessState,
  ReadyDescriptor,
  FacePosition,
  OnProgress,
  FaceSmashEvent,
  FaceSmashEventListener,
  Point,
} from './core/types';

// Convenience factory
export function createFaceSmash(config?: import('./core/types').FaceSmashConfig) {
  return new FaceSmashClient(config);
}
