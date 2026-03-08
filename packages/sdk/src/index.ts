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
  normalizeDescriptor,
} from './core/detection';

// Matching utilities
export {
  calculateSimilarity,
  facesMatch,
  enhancedMatch,
  multiTemplateMatch,
  calculateLearningWeight,
} from './core/matching';

// Types
export type {
  FaceSmashConfig,
  ResolvedConfig,
  FaceAnalysis,
  MatchResult,
  MultiTemplateMatchResult,
  LoginResult,
  RegisterResult,
  UserProfile,
  FaceTemplate,
  HeadPose,
  FaceSizeCheck,
  LightingAnalysis,
  OnProgress,
  FaceSmashEvent,
  FaceSmashEventListener,
} from './core/types';

// Convenience factory
export function createFaceSmash(config?: import('./core/types').FaceSmashConfig) {
  return new FaceSmashClient(config);
}
