/**
 * FaceSmash API Client
 * Replaces PocketBase SDK with direct fetch calls to the Hono API.
 * Uses httpOnly cookies for authentication (auto-sent by browser with credentials: 'include').
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.facesmash.app';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  data: T;
  ok: boolean;
  status: number;
}

class FaceSmashAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T = unknown>(
    path: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {} } = options;

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include', // Send httpOnly cookies automatically
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body !== undefined && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(`${this.baseUrl}${path}`, fetchOptions);
    let data: T;

    try {
      data = await res.json();
    } catch {
      data = {} as T;
    }

    return { data, ok: res.ok, status: res.status };
  }

  // ─── Auth ───

  async register(params: {
    email: string;
    embedding: number[];
    qualityScore: number;
    imageData?: string;
  }) {
    return this.request<{
      user: { id: number; email: string; fullName: string | null };
      message: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: params,
    });
  }

  async login(params: { embedding: number[]; qualityScore?: number; livenessConfidence?: number }) {
    return this.request<{
      match: boolean;
      user?: { id: number; email: string; fullName: string | null };
      bestSimilarity?: number;
      message: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: params,
    });
  }

  async verify() {
    return this.request<{
      valid: boolean;
      user: { id: number; email: string };
    }>('/api/auth/verify');
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // ─── Profile ───

  async getProfile() {
    return this.request<{
      id: number;
      email: string;
      fullName: string | null;
      loginCount: number;
      successfulLogins: number;
      failedLogins: number;
      avgQualityScore: number;
      confidenceThreshold: number;
      lastLogin: string | null;
      createdAt: string;
    }>('/api/profile');
  }

  async updateProfile(updates: { fullName?: string; email?: string }) {
    return this.request('/api/profile', { method: 'PATCH', body: updates });
  }

  async deleteProfile() {
    return this.request('/api/profile', { method: 'DELETE' });
  }

  async getProfileStats() {
    return this.request<{
      templatesCount: number;
      scansCount: number;
      recentLogs: Array<{
        id: number;
        success: boolean;
        similarity: number | null;
        createdAt: string;
      }>;
    }>('/api/profile/stats');
  }

  async getLearningStats() {
    return this.request<{
      loginCount: number;
      successfulLogins: number;
      failedLogins: number;
      successRate: number;
      avgQualityScore: number;
      confidenceThreshold: number;
      experienceLevel: string;
    }>('/api/profile/learning');
  }

  // ─── Templates ───

  async getTemplates() {
    return this.request<
      Array<{
        id: number;
        qualityScore: number;
        label: string;
        lastUsed: string | null;
        usageCount: number;
        createdAt: string;
      }>
    >('/api/templates');
  }

  async addTemplate(params: { embedding: number[]; qualityScore: number }) {
    return this.request('/api/templates', { method: 'POST', body: params });
  }

  // ─── Scans ───

  async getScans(page: number = 1, limit: number = 50) {
    return this.request<{
      scans: Array<{
        id: number;
        imageUrl: string | null;
        scanType: string;
        qualityScore: number;
        confidence: number;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/scans?page=${page}&limit=${limit}`);
  }

  async createScan(params: {
    embedding: number[];
    scanType: string;
    qualityScore: number;
    confidence: number;
    imageData?: string;
  }) {
    return this.request('/api/scans', { method: 'POST', body: params });
  }

  // ─── Logs ───

  async getLogs(page: number = 1, limit: number = 50) {
    return this.request<{
      logs: Array<{
        id: number;
        success: boolean;
        similarity: number | null;
        livenessConfidence: number | null;
        ipAddress: string | null;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/logs?page=${page}&limit=${limit}`);
  }

  // ─── Feedback ───

  async submitFeedback(params: {
    category: string;
    message: string;
    rating?: number;
  }) {
    return this.request('/api/feedback', { method: 'POST', body: params });
  }

  // ─── Health ───

  async health() {
    return this.request<{
      status: string;
      checks: Record<string, string>;
      timestamp: string;
    }>('/api/health');
  }
}

export const api = new FaceSmashAPI(API_URL);
