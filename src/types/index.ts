export interface UserProfile {
  id: string;
  email: string;
  face_embedding: number[];
  created_at: string;
  updated_at: string;
  embedding_count?: number;
  last_updated?: string;
  recognition_threshold?: number;
  total_logins?: number;
  successful_logins?: number;
  is_admin: boolean;
}

export interface FaceScan {
  id: string;
  user_email: string;
  image_url: string;
  face_embedding: number[];
  confidence_score: number;
  scan_type: 'registration' | 'login' | 'verification';
  quality_score: number;
  created_at: string;
}

export interface SignInLog {
  id: string;
  user_email: string;
  sign_in_time: string;
  success_status: boolean;
  ip_address?: string;
  created_at: string;
}

export interface FaceAnalysis {
  descriptor: Float32Array;
  confidence: number;
  qualityScore: number;
  landmarks?: any;
}

export interface MatchResult {
  isMatch: boolean;
  similarity: number;
  adjustedThreshold?: number;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
