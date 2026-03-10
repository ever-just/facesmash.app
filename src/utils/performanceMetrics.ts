// ─── Performance Instrumentation ────────────────────────────
// Tracks timing metrics for face detection pipeline to enable data-driven optimization.
// Metrics are logged to console and stored in sessionStorage for debugging.

interface PipelineMetrics {
  // Tracking loop metrics
  trackingFrameCount: number;
  trackingTotalMs: number;
  trackingMinMs: number;
  trackingMaxMs: number;
  // Descriptor extraction metrics
  descriptorExtractions: number;
  descriptorTotalMs: number;
  // Full pipeline metrics (camera ready → liveness → match → done)
  cameraReadyAt: number;
  livenessPassAt: number;
  descriptorReadyAt: number;
  apiResponseAt: number;
  loginCompleteAt: number;
  // Model warmup
  warmupMs: number;
}

const STORAGE_KEY = 'facesmash_perf_metrics';

let metrics: PipelineMetrics = createEmptyMetrics();

function createEmptyMetrics(): PipelineMetrics {
  return {
    trackingFrameCount: 0,
    trackingTotalMs: 0,
    trackingMinMs: Infinity,
    trackingMaxMs: 0,
    descriptorExtractions: 0,
    descriptorTotalMs: 0,
    cameraReadyAt: 0,
    livenessPassAt: 0,
    descriptorReadyAt: 0,
    apiResponseAt: 0,
    loginCompleteAt: 0,
    warmupMs: 0,
  };
}

/** Reset all metrics (call at start of each login attempt) */
export const resetMetrics = (): void => {
  metrics = createEmptyMetrics();
};

/**
 * Reset only login-phase metrics, preserving tracking milestones.
 * Use this in the fast path where cameraReady, livenessPass, and descriptorReady
 * were already recorded during tracking and should not be zeroed out.
 */
export const resetLoginMetrics = (): void => {
  metrics.apiResponseAt = 0;
  metrics.loginCompleteAt = 0;
};

/** Record a single tracking frame duration */
export const recordTrackingFrame = (durationMs: number): void => {
  metrics.trackingFrameCount++;
  metrics.trackingTotalMs += durationMs;
  if (durationMs < metrics.trackingMinMs) metrics.trackingMinMs = durationMs;
  if (durationMs > metrics.trackingMaxMs) metrics.trackingMaxMs = durationMs;
};

/** Record a descriptor extraction duration */
export const recordDescriptorExtraction = (durationMs: number): void => {
  metrics.descriptorExtractions++;
  metrics.descriptorTotalMs += durationMs;
};

/** Mark pipeline milestones */
export const markCameraReady = (): void => { metrics.cameraReadyAt = performance.now(); };
export const markLivenessPass = (): void => { metrics.livenessPassAt = performance.now(); };
export const markDescriptorReady = (): void => { metrics.descriptorReadyAt = performance.now(); };
export const markApiResponse = (): void => { metrics.apiResponseAt = performance.now(); };
export const markLoginComplete = (): void => {
  metrics.loginCompleteAt = performance.now();
  persistMetrics();
};

/** Record model warmup duration */
export const recordWarmup = (durationMs: number): void => {
  metrics.warmupMs = durationMs;
};

/** Get current average tracking FPS */
export const getTrackingFPS = (): number => {
  if (metrics.trackingFrameCount === 0) return 0;
  const avgMs = metrics.trackingTotalMs / metrics.trackingFrameCount;
  return avgMs > 0 ? 1000 / avgMs : 0;
};

/** Log a summary of current metrics to console */
export const logMetricsSummary = (): void => {
  const avgTrackingMs = metrics.trackingFrameCount > 0
    ? (metrics.trackingTotalMs / metrics.trackingFrameCount).toFixed(1)
    : 'N/A';
  const avgDescriptorMs = metrics.descriptorExtractions > 0
    ? (metrics.descriptorTotalMs / metrics.descriptorExtractions).toFixed(1)
    : 'N/A';

  const cameraToLiveness = metrics.livenessPassAt && metrics.cameraReadyAt
    ? ((metrics.livenessPassAt - metrics.cameraReadyAt) / 1000).toFixed(2)
    : 'N/A';
  const livenessToDescriptor = metrics.descriptorReadyAt && metrics.livenessPassAt
    ? ((metrics.descriptorReadyAt - metrics.livenessPassAt) / 1000).toFixed(2)
    : 'N/A';
  const descriptorToApi = metrics.apiResponseAt && metrics.descriptorReadyAt
    ? ((metrics.apiResponseAt - metrics.descriptorReadyAt) / 1000).toFixed(2)
    : 'N/A';
  const totalLogin = metrics.loginCompleteAt && metrics.cameraReadyAt
    ? ((metrics.loginCompleteAt - metrics.cameraReadyAt) / 1000).toFixed(2)
    : 'N/A';

  console.log(
    `%c[FaceSmash Perf]%c\n` +
    `  Tracking: ${avgTrackingMs}ms avg (${metrics.trackingMinMs === Infinity ? 'N/A' : metrics.trackingMinMs.toFixed(0)}-${metrics.trackingMaxMs.toFixed(0)}ms), ${metrics.trackingFrameCount} frames, ~${getTrackingFPS().toFixed(1)} FPS\n` +
    `  Descriptors: ${avgDescriptorMs}ms avg, ${metrics.descriptorExtractions} extractions\n` +
    `  Warmup: ${metrics.warmupMs.toFixed(0)}ms\n` +
    `  Pipeline: camera→liveness ${cameraToLiveness}s | liveness→descriptor ${livenessToDescriptor}s | descriptor→API ${descriptorToApi}s | total ${totalLogin}s`,
    'color: #22c55e; font-weight: bold',
    'color: inherit'
  );
};

/** Persist metrics to sessionStorage for post-session analysis */
function persistMetrics(): void {
  try {
    const data = {
      ...metrics,
      timestamp: new Date().toISOString(),
      avgTrackingMs: metrics.trackingFrameCount > 0
        ? metrics.trackingTotalMs / metrics.trackingFrameCount : 0,
      avgDescriptorMs: metrics.descriptorExtractions > 0
        ? metrics.descriptorTotalMs / metrics.descriptorExtractions : 0,
    };
    const history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    history.push(data);
    // Keep last 10 sessions
    if (history.length > 10) history.splice(0, history.length - 10);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // sessionStorage not available — no-op
  }
}
