import * as faceapi from '@vladmandic/face-api';

// ─── Eye Aspect Ratio (EAR) ────────────────────────────────
// Based on the 68-point landmark model:
// Left eye:  points 36-41
// Right eye: points 42-47
// EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
// When eyes are open EAR ≈ 0.25-0.35, closed EAR < 0.2

interface Point {
  x: number;
  y: number;
}

const euclidean = (a: Point, b: Point): number =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const calculateEAR = (eye: Point[]): number => {
  if (eye.length < 6) return 0.3; // fallback if landmarks missing
  const vertical1 = euclidean(eye[1], eye[5]);
  const vertical2 = euclidean(eye[2], eye[4]);
  const horizontal = euclidean(eye[0], eye[3]);
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2 * horizontal);
};

export const getEyeAspectRatios = (
  landmarks: faceapi.FaceLandmarks68
): { leftEAR: number; rightEAR: number; avgEAR: number } => {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const leftEAR = calculateEAR(leftEye);
  const rightEAR = calculateEAR(rightEye);
  return { leftEAR, rightEAR, avgEAR: (leftEAR + rightEAR) / 2 };
};

// ─── Head Pose Estimation (from landmarks) ──────────────────
// Approximate yaw/pitch from nose and jaw landmarks
export interface HeadPose {
  yaw: number;   // left-right rotation (-1 to 1)
  pitch: number; // up-down rotation (-1 to 1)
  roll: number;  // tilt (-1 to 1)
  isFrontal: boolean;
}

export const estimateHeadPose = (
  landmarks: faceapi.FaceLandmarks68,
  box: faceapi.Box
): HeadPose => {
  const nose = landmarks.getNose();
  const jaw = landmarks.getJawOutline();

  // Yaw: nose tip position relative to face center
  const noseTip = nose[3]; // tip of nose
  const faceCenterX = box.x + box.width / 2;
  const yaw = (noseTip.x - faceCenterX) / (box.width / 2);

  // Pitch: nose tip vertical position relative to face center
  const faceCenterY = box.y + box.height / 2;
  const pitch = (noseTip.y - faceCenterY) / (box.height / 2);

  // Roll: angle between jaw endpoints
  const jawLeft = jaw[0];
  const jawRight = jaw[jaw.length - 1];
  const roll = Math.atan2(jawRight.y - jawLeft.y, jawRight.x - jawLeft.x);

  // Frontal if yaw and pitch are within thresholds
  const isFrontal = Math.abs(yaw) < 0.35 && Math.abs(pitch) < 0.4 && Math.abs(roll) < 0.25;

  return { yaw, pitch, roll, isFrontal };
};

// ─── Face Size Validation ───────────────────────────────────
export interface FaceSizeCheck {
  isValid: boolean;
  ratio: number;
  reason?: string;
}

export const validateFaceSize = (
  box: faceapi.Box,
  frameWidth: number = 640,
  frameHeight: number = 480
): FaceSizeCheck => {
  const faceArea = box.width * box.height;
  const frameArea = frameWidth * frameHeight;
  const ratio = faceArea / frameArea;

  if (ratio < 0.02) {
    return { isValid: false, ratio, reason: 'Face too far from camera' };
  }
  if (ratio > 0.65) {
    return { isValid: false, ratio, reason: 'Face too close to camera' };
  }
  if (box.width < 80 || box.height < 80) {
    return { isValid: false, ratio, reason: 'Face too small for reliable recognition' };
  }
  return { isValid: true, ratio };
};

// ─── Multi-Frame Liveness Check ─────────────────────────────
// Tracks EAR over multiple frames to detect blinks and motion

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

const EAR_BLINK_THRESHOLD = 0.21;
const MIN_FRAMES_FOR_LIVENESS = 4;
const MAX_HISTORY = 30;
const LIVENESS_TIMEOUT_FRAMES = 20; // ~4s at 200ms intervals — fallback if 1+ signal present

export const createLivenessState = (): LivenessState => ({
  earHistory: [],
  poseHistory: [],
  blinkCount: 0,
  frameCount: 0,
  hasMotion: false,
  hasBlinked: false,
  isLive: false,
  confidence: 0,
});

export const updateLivenessState = (
  state: LivenessState,
  avgEAR: number,
  pose: HeadPose
): LivenessState => {
  const newState = { ...state };
  newState.frameCount++;

  // Track EAR history (rolling window)
  newState.earHistory = [...state.earHistory, avgEAR].slice(-MAX_HISTORY);

  // Track pose history (rolling window)
  newState.poseHistory = [...state.poseHistory, pose].slice(-MAX_HISTORY);

  // ── Blink detection ──
  // A blink is: EAR drops below threshold then rises back above
  const history = newState.earHistory;
  if (history.length >= 3) {
    const prev2 = history[history.length - 3];
    const prev1 = history[history.length - 2];
    const curr = history[history.length - 1];
    if (
      prev2 > EAR_BLINK_THRESHOLD &&
      prev1 < EAR_BLINK_THRESHOLD &&
      curr > EAR_BLINK_THRESHOLD
    ) {
      newState.blinkCount++;
      newState.hasBlinked = true;
    }
  }

  // ── Motion detection ──
  // Check if head has moved at all across frames (not a static photo)
  if (newState.poseHistory.length >= 4) {
    const poses = newState.poseHistory;
    let totalVariance = 0;
    for (let i = 1; i < poses.length; i++) {
      totalVariance += Math.abs(poses[i].yaw - poses[i - 1].yaw);
      totalVariance += Math.abs(poses[i].pitch - poses[i - 1].pitch);
    }
    const avgVariance = totalVariance / (poses.length - 1);
    // Real faces have micro-movements; photos are perfectly still
    // Lowered threshold to be more tolerant of users trying to hold still
    newState.hasMotion = avgVariance > 0.003;
  }

  // ── EAR variance check ──
  // Real eyes have natural EAR fluctuation; printed photos don't
  let earVariance = 0;
  if (newState.earHistory.length >= 5) {
    const mean = newState.earHistory.reduce((a, b) => a + b, 0) / newState.earHistory.length;
    earVariance = newState.earHistory.reduce((a, b) => a + (b - mean) ** 2, 0) / newState.earHistory.length;
  }
  const hasEarFluctuation = earVariance > 0.0001;

  // ── Liveness score ──
  let confidence = 0;
  if (newState.frameCount >= MIN_FRAMES_FOR_LIVENESS) {
    if (newState.hasBlinked) confidence += 0.45;
    if (newState.hasMotion) confidence += 0.30;
    if (hasEarFluctuation) confidence += 0.15;
    // Bonus for multiple blinks
    if (newState.blinkCount >= 2) confidence += 0.10;
  }
  confidence = Math.min(confidence, 1.0);

  newState.confidence = confidence;
  // We consider it live if we have ANY two of: blink, motion, ear fluctuation
  // OR if we've waited long enough (timeout) with at least 1 signal (prevents UX deadlock)
  const signals = [newState.hasBlinked, newState.hasMotion, hasEarFluctuation].filter(Boolean).length;
  const timedOut = newState.frameCount >= LIVENESS_TIMEOUT_FRAMES;
  newState.isLive = signals >= 2
    || (newState.hasBlinked && newState.frameCount >= MIN_FRAMES_FOR_LIVENESS)
    || (timedOut && signals >= 1);

  return newState;
};

// ─── Expression Consistency Check ───────────────────────────
// Photos always have the exact same expression; real faces shift

export const checkExpressionVariance = (
  expressions: faceapi.FaceExpressions[]
): { hasVariance: boolean; dominantExpression: string } => {
  if (expressions.length < 3) {
    return { hasVariance: false, dominantExpression: 'unknown' };
  }

  // Track the dominant expression value across frames
  const neutralValues = expressions.map(e => e.neutral);
  const mean = neutralValues.reduce((a, b) => a + b, 0) / neutralValues.length;
  const variance = neutralValues.reduce((a, b) => a + (b - mean) ** 2, 0) / neutralValues.length;

  // Get dominant from last expression
  const last = expressions[expressions.length - 1];
  const sorted = Object.entries(last).sort((a, b) => (b[1] as number) - (a[1] as number));
  const dominantExpression = sorted[0]?.[0] || 'unknown';

  return {
    hasVariance: variance > 0.001,
    dominantExpression,
  };
};

// ─── Rate Limiter ───────────────────────────────────────────

interface RateLimiterState {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil: number;
}

const rateLimiterKey = 'facesmash_rate_limiter';

export const checkRateLimit = (): { allowed: boolean; waitSeconds: number } => {
  const now = Date.now();
  const stored = localStorage.getItem(rateLimiterKey);
  let state: RateLimiterState = stored
    ? JSON.parse(stored)
    : { attempts: 0, firstAttemptTime: now, lockedUntil: 0 };

  // Check if currently locked
  if (state.lockedUntil > now) {
    return { allowed: false, waitSeconds: Math.ceil((state.lockedUntil - now) / 1000) };
  }

  // Reset window after 5 minutes
  if (now - state.firstAttemptTime > 5 * 60 * 1000) {
    state = { attempts: 0, firstAttemptTime: now, lockedUntil: 0 };
  }

  return { allowed: true, waitSeconds: 0 };
};

export const recordLoginAttempt = (success: boolean): void => {
  const now = Date.now();
  const stored = localStorage.getItem(rateLimiterKey);
  let state: RateLimiterState = stored
    ? JSON.parse(stored)
    : { attempts: 0, firstAttemptTime: now, lockedUntil: 0 };

  if (success) {
    // Reset on success
    state = { attempts: 0, firstAttemptTime: now, lockedUntil: 0 };
  } else {
    state.attempts++;
    // Lock after 5 failed attempts: 30s, then 60s, then 120s...
    if (state.attempts >= 5) {
      const lockDuration = Math.min(30000 * Math.pow(2, state.attempts - 5), 300000);
      state.lockedUntil = now + lockDuration;
    }
  }

  localStorage.setItem(rateLimiterKey, JSON.stringify(state));
};

// ─── Descriptor Normalization ───────────────────────────────
// Normalize face descriptors for more consistent comparisons

export const normalizeDescriptor = (descriptor: Float32Array): Float32Array => {
  let norm = 0;
  for (let i = 0; i < descriptor.length; i++) {
    norm += descriptor[i] ** 2;
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return descriptor;
  const normalized = new Float32Array(descriptor.length);
  for (let i = 0; i < descriptor.length; i++) {
    normalized[i] = descriptor[i] / norm;
  }
  return normalized;
};
