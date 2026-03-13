/** Configuration for the FaceSmash client */
export interface FaceSmashConfig {
  /** API base URL for face matching/registration (default: https://api.facesmash.app) */
  apiUrl?: string;
  /** URL to load face-api.js models from (default: jsdelivr CDN) */
  modelUrl?: string;
  /** API key for server-side face matching via the FaceSmash API (enables API mode) */
  apiKey?: string;
  /** Application ID for scoping face profiles (default: 'default') */
  appId?: string;
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
  apiKey: string;
  appId: string;
  minDetectionConfidence: number;
  matchThreshold: number;
  minQualityScore: number;
  maxTemplatesPerUser: number;
  debug: boolean;
}

export const DEFAULT_CONFIG: ResolvedConfig = {
  apiUrl: 'https://api.facesmash.app',
  modelUrl: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model',
  apiKey: '',
  appId: 'default',
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

/** Lighting condition summary for UI hints */
export type LightingCondition = 'ok' | 'tooDark' | 'tooBright' | 'uneven' | null;

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

/** A matched user from the API */
export interface MatchedUser {
  id: number | string;
  email: string;
  name: string | null;
  similarity: number;
}

/** Login result */
export interface LoginResult {
  success: boolean;
  user?: MatchedUser;
  similarity?: number;
  error?: string;
}

/** Registration result */
export interface RegisterResult {
  success: boolean;
  profileId?: number;
  created?: boolean;
  updated?: boolean;
  error?: string;
}

/** Model loading progress callback */
export type OnProgress = (progress: number) => void;

// ─── Liveness Types ──────────────────────────────────────────

/** Multi-frame liveness detection state */
export interface LivenessState {
  earHistory: number[];
  poseHistory: HeadPose[];
  blinkCount: number;
  frameCount: number;
  hasMotion: boolean;
  hasBlinked: boolean;
  isLive: boolean;
  confidence: number;
}

/** Pre-computed face descriptor ready for submission */
export interface ReadyDescriptor {
  descriptor: Float32Array;
  qualityScore: number;
  livenessConfidence: number;
  timestamp: number;
}

/** Face position in the video frame */
export interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

// ─── Events ──────────────────────────────────────────────────

/** Event types emitted by the SDK */
export type FaceSmashEvent =
  | { type: 'models-loading'; progress: number }
  | { type: 'models-loaded' }
  | { type: 'models-error'; error: string }
  | { type: 'face-detected'; analysis: FaceAnalysis }
  | { type: 'face-lost' }
  | { type: 'liveness-update'; state: LivenessState }
  | { type: 'liveness-passed'; descriptor: ReadyDescriptor }
  | { type: 'descriptor-ready'; descriptor: ReadyDescriptor }
  | { type: 'lighting-update'; condition: LightingCondition }
  | { type: 'login-start' }
  | { type: 'login-success'; user: MatchedUser; similarity: number }
  | { type: 'login-failed'; error: string; bestSimilarity?: number }
  | { type: 'register-start' }
  | { type: 'register-success'; profileId: number }
  | { type: 'register-failed'; error: string };

export type FaceSmashEventListener = (event: FaceSmashEvent) => void;
