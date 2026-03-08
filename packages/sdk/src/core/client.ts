import PocketBase from 'pocketbase';
import { loadModels, areModelsLoaded, analyzeFace, processImages } from './detection';
import { enhancedMatch, multiTemplateMatch, calculateLearningWeight } from './matching';
import type {
  FaceSmashConfig,
  ResolvedConfig,
  FaceSmashEvent,
  FaceSmashEventListener,
  FaceAnalysis,
  LoginResult,
  RegisterResult,
  UserProfile,
  OnProgress,
} from './types';
import { resolveConfig } from './types';

export class FaceSmashClient {
  readonly config: ResolvedConfig;
  readonly pb: PocketBase;
  private listeners: FaceSmashEventListener[] = [];
  private _modelsLoaded = false;

  constructor(config?: FaceSmashConfig) {
    this.config = resolveConfig(config);
    this.pb = new PocketBase(this.config.apiUrl);
    this.pb.autoCancellation(false);
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

  // ─── Login ──────────────────────────────────────────────────

  async login(images: string[]): Promise<LoginResult> {
    this.ensureReady();
    this.emit({ type: 'login-start' });

    try {
      // Analyze all images, pick the best
      let bestAnalysis: FaceAnalysis | null = null;
      for (const img of images) {
        const analysis = await analyzeFace(img, this.config);
        if (analysis && !analysis.rejectionReason) {
          if (!bestAnalysis || analysis.qualityScore > bestAnalysis.qualityScore) {
            bestAnalysis = analysis;
          }
        }
      }

      if (!bestAnalysis) {
        const error = 'No face detected in any image';
        this.emit({ type: 'login-failed', error });
        return { success: false, error };
      }

      if (bestAnalysis.qualityScore < this.config.minQualityScore) {
        const error = 'Face quality too low. Improve lighting and face the camera directly.';
        this.emit({ type: 'login-failed', error });
        return { success: false, error };
      }

      // Fetch all registered users
      const profiles = await this.pb.collection('user_profiles').getFullList();

      if (profiles.length === 0) {
        const error = 'No registered users found';
        this.emit({ type: 'login-failed', error });
        return { success: false, error };
      }

      let bestMatch = { user: null as UserProfile | null, similarity: 0 };

      for (const profile of profiles) {
        if (!profile.face_embedding) continue;

        const storedEmbedding = new Float32Array(profile.face_embedding as number[]);
        let matchResult = enhancedMatch(
          bestAnalysis.descriptor,
          storedEmbedding,
          this.config.matchThreshold,
          0,
          bestAnalysis.lightingScore
        );

        // Try templates if available
        try {
          const templates = await this.pb.collection('face_templates').getList(1, 50, {
            filter: `user_email="${profile.email}"`,
            sort: '-quality_score',
          });

          if (templates.items.length > 0) {
            const templateData = templates.items
              .filter((t: any) => t.descriptor && t.descriptor.length > 0)
              .map((t: any) => ({
                descriptor: new Float32Array(t.descriptor),
                quality: t.quality_score || 0.5,
                weight: 1,
              }));

            if (templateData.length > 0) {
              const multiResult = multiTemplateMatch(
                bestAnalysis.descriptor,
                templateData,
                this.config.matchThreshold,
                bestAnalysis.lightingScore
              );

              if (multiResult.bestSimilarity > matchResult.similarity) {
                matchResult = {
                  isMatch: multiResult.isMatch,
                  similarity: multiResult.bestSimilarity,
                  adaptedThreshold: this.config.matchThreshold,
                };
              }
            }
          }
        } catch {
          // Template matching failed, use profile embedding result
        }

        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name as string,
          email: profile.email as string,
          face_embedding: profile.face_embedding as number[],
          created: profile.created as string,
          updated: profile.updated as string,
        };

        if (matchResult.similarity > bestMatch.similarity) {
          bestMatch = { user: userProfile, similarity: matchResult.similarity };
        }

        if (matchResult.isMatch) {
          // Store scan + update templates on successful login
          try {
            await this.storeLoginScan(userProfile, bestAnalysis);
          } catch {
            // Non-fatal
          }

          this.emit({
            type: 'login-success',
            user: userProfile,
            similarity: matchResult.similarity,
          });

          return { success: true, user: userProfile, similarity: matchResult.similarity };
        }
      }

      const error = bestMatch.similarity > 0.4
        ? 'Face partially matched but did not meet security threshold.'
        : 'Face not recognized.';

      this.emit({ type: 'login-failed', error, bestSimilarity: bestMatch.similarity });
      return { success: false, error, similarity: bestMatch.similarity };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error during login';
      this.emit({ type: 'login-failed', error });
      return { success: false, error };
    }
  }

  // ─── Registration ───────────────────────────────────────────

  async register(
    name: string,
    images: string[],
    email?: string
  ): Promise<RegisterResult> {
    this.ensureReady();
    this.emit({ type: 'register-start' });

    try {
      // Analyze best image
      let bestAnalysis: FaceAnalysis | null = null;
      let bestImageIdx = 0;

      for (let i = 0; i < images.length; i++) {
        const analysis = await analyzeFace(images[i], this.config);
        if (analysis && !analysis.rejectionReason) {
          if (!bestAnalysis || analysis.qualityScore > bestAnalysis.qualityScore) {
            bestAnalysis = analysis;
            bestImageIdx = i;
          }
        }
      }

      if (!bestAnalysis) {
        const error = 'No face detected in any image';
        this.emit({ type: 'register-failed', error });
        return { success: false, error };
      }

      if (bestAnalysis.qualityScore < this.config.minQualityScore) {
        const error = 'Face quality too low for registration.';
        this.emit({ type: 'register-failed', error });
        return { success: false, error };
      }

      // Check for duplicate users
      const existingProfiles = await this.pb.collection('user_profiles').getFullList();
      for (const profile of existingProfiles) {
        if (!profile.face_embedding) continue;
        const stored = new Float32Array(profile.face_embedding as number[]);
        if (stored.length !== bestAnalysis.descriptor.length) continue;
        const similarity = 1 - (await import('@vladmandic/face-api')).euclideanDistance(bestAnalysis.descriptor, stored);
        if (similarity >= 0.75) {
          const error = `This face is already registered to ${profile.name || profile.email}`;
          this.emit({ type: 'register-failed', error });
          return { success: false, error };
        }
      }

      // Create user profile
      const embeddingArray = Array.from(bestAnalysis.descriptor);
      const record = await this.pb.collection('user_profiles').create({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@facesmash.app`,
        face_embedding: embeddingArray,
      });

      // Create initial face template
      await this.pb.collection('face_templates').create({
        user_email: record.email,
        descriptor: embeddingArray,
        quality_score: bestAnalysis.qualityScore,
        label: 'registration',
      });

      // Create face scan record
      await this.pb.collection('face_scans').create({
        user_email: record.email,
        face_embedding: JSON.stringify(embeddingArray),
        confidence: String(bestAnalysis.confidence),
        scan_type: 'registration',
        quality_score: String(bestAnalysis.qualityScore),
      });

      const user: UserProfile = {
        id: record.id,
        name: record.name as string,
        email: record.email as string,
        face_embedding: embeddingArray,
        created: record.created as string,
        updated: record.updated as string,
      };

      this.emit({ type: 'register-success', user });
      return { success: true, user };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error during registration';
      this.emit({ type: 'register-failed', error });
      return { success: false, error };
    }
  }

  // ─── Helpers ────────────────────────────────────────────────

  private ensureReady() {
    if (!areModelsLoaded()) {
      throw new Error(
        'FaceSmash models not loaded. Call client.init() first.'
      );
    }
  }

  private async storeLoginScan(user: UserProfile, analysis: FaceAnalysis) {
    const embeddingArray = Array.from(analysis.descriptor);

    // Create sign-in log
    await this.pb.collection('sign_in_logs').create({
      user_email: user.email,
      success: true,
    });

    // Create face scan
    await this.pb.collection('face_scans').create({
      user_email: user.email,
      face_embedding: JSON.stringify(embeddingArray),
      confidence: String(analysis.confidence),
      scan_type: 'login',
      quality_score: String(analysis.qualityScore),
    });

    // Update user embedding with weighted average (adaptive learning)
    if (analysis.qualityScore > 0.5) {
      const weight = calculateLearningWeight(
        analysis.qualityScore,
        analysis.lightingScore,
        analysis.confidence
      );
      const learningRate = Math.min(weight * 0.1, 0.3);

      const current = new Float32Array(user.face_embedding);
      const updated = new Float32Array(current.length);
      for (let i = 0; i < current.length; i++) {
        updated[i] = current[i] * (1 - learningRate) + analysis.descriptor[i] * learningRate;
      }

      await this.pb.collection('user_profiles').update(user.id, {
        face_embedding: Array.from(updated),
      });
    }

    // Store template if quality is good
    if (analysis.qualityScore > 0.6) {
      const existing = await this.pb.collection('face_templates').getList(1, 50, {
        filter: `user_email="${user.email}"`,
        sort: 'quality_score',
      });

      if (existing.items.length >= this.config.maxTemplatesPerUser) {
        await this.pb.collection('face_templates').delete(existing.items[0].id);
      }

      await this.pb.collection('face_templates').create({
        user_email: user.email,
        descriptor: embeddingArray,
        quality_score: analysis.qualityScore,
        label: 'auto',
      });
    }
  }
}
