/**
 * Fetch-based API client for the FaceSmash Hono API.
 * Replaces PocketBase for server-side face matching and registration.
 */

export interface MatchResponse {
  match: boolean;
  user?: {
    id: number;
    email: string;
    name: string | null;
    similarity: number;
  };
  bestSimilarity?: number;
}

export interface RegisterParams {
  email: string;
  fullName?: string;
  descriptor: number[];
  qualityScore?: number;
  appId: string;
}

export interface RegisterResponse {
  success: boolean;
  profileId?: number;
  created?: boolean;
  updated?: boolean;
  error?: string;
  matchedEmail?: string;
}

export interface StatusResponse {
  registered: boolean;
  verified?: boolean;
  profileId?: number;
  createdAt?: string;
}

export class FaceSmashApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {}
  ): Promise<{ data: T; ok: boolean; status: number }> {
    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };

    const fetchOptions: RequestInit = { method, headers };
    if (body !== undefined && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(`${this.baseUrl}${path}`, fetchOptions);
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      data = {} as T;
    }

    return { data, ok: res.ok, status: res.status };
  }

  /** Match a face descriptor against registered profiles */
  async matchFace(descriptor: number[], appId: string): Promise<MatchResponse> {
    const result = await this.request<MatchResponse>('/api/devportal/match', {
      method: 'POST',
      body: { descriptor, appId },
    });
    return result.data;
  }

  /** Register a face descriptor for a user */
  async registerFace(params: RegisterParams): Promise<RegisterResponse> {
    const result = await this.request<RegisterResponse>('/api/devportal/register', {
      method: 'POST',
      body: params,
    });
    return result.data;
  }

  /** Check FaceCard registration status for an email */
  async checkStatus(email: string, appId: string): Promise<StatusResponse> {
    const params = new URLSearchParams({ email, appId });
    const result = await this.request<StatusResponse>(
      `/api/devportal/register?${params.toString()}`
    );
    return result.data;
  }

  /** Unlink a FaceCard registration */
  async unlinkFace(email: string, appId: string): Promise<{ success: boolean }> {
    const result = await this.request<{ success: boolean }>('/api/devportal/register', {
      method: 'DELETE',
      body: { email, appId },
    });
    return result.data;
  }
}
