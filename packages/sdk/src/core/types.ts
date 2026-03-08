/** Configuration for the FaceSmash client */
export interface FaceSmashConfig {
  /** PocketBase API URL (default: https://api.facesmash.app) */
  apiUrl?: string;
  /** URL to load face-api.js models from (default: jsdelivr CDN) */
  modelUrl?: string;
  /** Minimum confidence for SSD MobileNet face detection (default: 0.3) */
  minDetectionConfidence?: number;
  /** Similarity threshold for face matching (default: 0.45) */
  matchThreshold?: number;
  /** Minimum quality score to accept a face scan (default: 0.2) */
  minQualityScore?: number;
  /** Maximum face templates stored per user (default: 10) */
  maxTemplatesPerUser?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/** Resolved config with all defaults applied */
export interface ResolvedConfig {
  apiUrl: string;
  modelUrl: string;
  minDetectionConfidence: number;
  matchThreshold: number;
  minQualityScore: number;
  maxTemplatesPerUser: number;
  debug: boolean;
}

export const DEFAULT_CONFIG: ResolvedConfig = {
  apiUrl: 'https://api.facesmash.app',
  modelUrl: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
  minDetectionConfidence: 0.3,
  matchThreshold: 0.45,
  minQualityScore: 0.2,
  maxTemplatesPerUser: 10,
  debug: false,
};

export function resolveConfig(config?: FaceSmashConfig): ResolvedConfig {
  return { ...DEFAULT_CONFIG, ...config };
}

/** 2D point */
export interface Point {
  x: number;
  y: number;
}

/** Head pose estimation */
export interface HeadPose {
  yaw: number;
  pitch: number;
  roll: number;
  isFrontal: boolean;
}

/** Face size validation result */
export interface FaceSizeCheck {
  isValid: boolean;
  ratio: number;
  reason?: string;
}

/** Lighting analysis */
export interface LightingAnalysis {
  score: number;
  brightness: number;
  contrast: number;
  evenness: number;
  conditions: {
    tooDark: boolean;
    tooBright: boolean;
    uneven: boolean;
    optimal: boolean;
  };
}

/** Full face analysis result */
export interface FaceAnalysis {
  descriptor: Float32Array;
  normalizedDescriptor: Float32Array;
  confidence: number;
  qualityScore: number;
  lightingScore: number;
  headPose: HeadPose;
  faceSizeCheck: FaceSizeCheck;
  eyeAspectRatio: number;
  rejectionReason?: string;
}

/** Face match result */
export interface MatchResult {
  isMatch: boolean;
  similarity: number;
  adaptedThreshold: number;
}

/** Multi-template match result */
export interface MultiTemplateMatchResult {
  isMatch: boolean;
  bestSimilarity: number;
  avgSimilarity: number;
  matchCount: number;
}

/** A stored face template */
export interface FaceTemplate {
  id: string;
  user_email: string;
  descriptor: number[];
  quality_score: number;
  created: string;
}

/** A user profile from PocketBase */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  face_embedding: number[];
  created: string;
  updated: string;
}

/** Login result */
export interface LoginResult {
  success: boolean;
  user?: UserProfile;
  similarity?: number;
  error?: string;
}

/** Registration result */
export interface RegisterResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

/** Model loading progress callback */
export type OnProgress = (progress: number) => void;

/** Event types emitted by the SDK */
export type FaceSmashEvent =
  | { type: 'models-loading'; progress: number }
  | { type: 'models-loaded' }
  | { type: 'models-error'; error: string }
  | { type: 'face-detected'; analysis: FaceAnalysis }
  | { type: 'face-lost' }
  | { type: 'login-start' }
  | { type: 'login-success'; user: UserProfile; similarity: number }
  | { type: 'login-failed'; error: string; bestSimilarity?: number }
  | { type: 'register-start' }
  | { type: 'register-success'; user: UserProfile }
  | { type: 'register-failed'; error: string };

export type FaceSmashEventListener = (event: FaceSmashEvent) => void;
