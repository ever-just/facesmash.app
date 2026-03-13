import { loadModels, areModelsLoaded, analyzeFace } from './detection';
import { FaceSmashApiClient } from './api-client';
import type {
  FaceSmashConfig,
  ResolvedConfig,
  FaceSmashEvent,
  FaceSmashEventListener,
  FaceAnalysis,
  LoginResult,
  RegisterResult,
  OnProgress,
} from './types';
import { resolveConfig } from './types';

export class FaceSmashClient {
  readonly config: ResolvedConfig;
  private apiClient: FaceSmashApiClient | null = null;
  private listeners: FaceSmashEventListener[] = [];
  private _modelsLoaded = false;

  constructor(config?: FaceSmashConfig) {
    this.config = resolveConfig(config);

    // Create API client if apiKey is provided (API mode)
    if (this.config.apiKey) {
      this.apiClient = new FaceSmashApiClient(this.config.apiUrl, this.config.apiKey);
    }
  }

  /** Whether the SDK has an API client configured for server-side matching */
  get hasApiClient(): boolean {
    return this.apiClient !== null;
  }

  // ─── Event System ───────────────────────────────────────────

  on(listener: FaceSmashEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: FaceSmashEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Don't let listener errors break the SDK
      }
    }
  }

  // ─── Model Loading ──────────────────────────────────────────

  get isReady(): boolean {
    return this._modelsLoaded;
  }

  async init(onProgress?: OnProgress): Promise<boolean> {
    if (this._modelsLoaded) return true;

    this.emit({ type: 'models-loading', progress: 0 });

    const success = await loadModels(this.config, (progress) => {
      onProgress?.(progress);
      this.emit({ type: 'models-loading', progress });
    });

    if (success) {
      this._modelsLoaded = true;
      this.emit({ type: 'models-loaded' });
    } else {
      this.emit({ type: 'models-error', error: 'Failed to load face recognition models' });
    }

    return success;
  }

  // ─── Face Analysis ──────────────────────────────────────────

  async analyzeFace(imageData: string): Promise<FaceAnalysis | null> {
    this.ensureReady();
    const result = await analyzeFace(imageData, this.config);
    if (result) {
      this.emit({ type: 'face-detected', analysis: result });
    } else {
      this.emit({ type: 'face-lost' });
    }
    return result;
  }

  // ─── Login (API mode only) ─────────────────────────────────

  async login(descriptor: number[] | Float32Array): Promise<LoginResult> {
    this.ensureReady();

    if (!this.apiClient) {
      return {
        success: false,
        error: 'API mode not configured. Provide apiKey in config to use login(), '
          + 'or use analyzeFace() to get descriptors and handle server communication yourself.',
      };
    }

    this.emit({ type: 'login-start' });

    try {
      const descriptorArray = descriptor instanceof Float32Array
        ? Array.from(descriptor)
        : descriptor;

      const matchResult = await this.apiClient.matchFace(descriptorArray, this.config.appId);

      if (!matchResult.match || !matchResult.user) {
        const error = matchResult.bestSimilarity && matchResult.bestSimilarity > 0.4
          ? 'Face partially matched but did not meet security threshold.'
          : 'Face not recognized.';
        this.emit({ type: 'login-failed', error, bestSimilarity: matchResult.bestSimilarity });
        return { success: false, error, similarity: matchResult.bestSimilarity };
      }

      const user = matchResult.user;
      this.emit({ type: 'login-success', user, similarity: user.similarity });
      return { success: true, user, similarity: user.similarity };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error during login';
      this.emit({ type: 'login-failed', error });
      return { success: false, error };
    }
  }

  // ─── Registration (API mode only) ──────────────────────────

  async register(params: {
    email: string;
    fullName?: string;
    descriptor: number[] | Float32Array;
    qualityScore?: number;
  }): Promise<RegisterResult> {
    this.ensureReady();

    if (!this.apiClient) {
      return {
        success: false,
        error: 'API mode not configured. Provide apiKey in config to use register(), '
          + 'or use analyzeFace() to get descriptors and handle server communication yourself.',
      };
    }

    this.emit({ type: 'register-start' });

    try {
      const descriptorArray = params.descriptor instanceof Float32Array
        ? Array.from(params.descriptor)
        : params.descriptor;

      const result = await this.apiClient.registerFace({
        email: params.email,
        fullName: params.fullName,
        descriptor: descriptorArray,
        qualityScore: params.qualityScore,
        appId: this.config.appId,
      });

      if (result.error) {
        this.emit({ type: 'register-failed', error: result.error });
        return { success: false, error: result.error };
      }

      this.emit({ type: 'register-success', profileId: result.profileId! });
      return {
        success: true,
        profileId: result.profileId,
        created: result.created,
        updated: result.updated,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error during registration';
      this.emit({ type: 'register-failed', error });
      return { success: false, error };
    }
  }

  // ─── Status Check (API mode only) ──────────────────────────

  async checkFaceCardStatus(email: string) {
    if (!this.apiClient) {
      throw new Error('API mode not configured. Provide apiKey in config.');
    }
    return this.apiClient.checkStatus(email, this.config.appId);
  }

  async unlinkFaceCard(email: string) {
    if (!this.apiClient) {
      throw new Error('API mode not configured. Provide apiKey in config.');
    }
    return this.apiClient.unlinkFace(email, this.config.appId);
  }

  // ─── Helpers ────────────────────────────────────────────────

  private ensureReady() {
    if (!areModelsLoaded()) {
      throw new Error(
        'FaceSmash models not loaded. Call client.init() first.'
      );
    }
  }
}
