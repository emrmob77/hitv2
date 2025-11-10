/**
 * API Key Management System
 *
 * Handles API key generation, validation, and rate limiting
 * for third-party developer access
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface APIKey {
  id: string;
  user_id: string;
  key_name: string;
  api_key: string;
  scopes: string[];
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  description?: string;
  allowed_origins?: string[];
  ip_whitelist?: string[];
  created_at: string;
  updated_at: string;
}

export interface APIKeyCreateInput {
  key_name: string;
  scopes: string[];
  rate_limit_per_hour?: number;
  rate_limit_per_day?: number;
  expires_at?: string;
  description?: string;
  allowed_origins?: string[];
  ip_whitelist?: string[];
}

export interface APIKeyValidationResult {
  valid: boolean;
  api_key?: APIKey;
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  hourly_remaining: number;
  daily_remaining: number;
  hourly_limit: number;
  daily_limit: number;
}

/**
 * Available API scopes
 */
export const API_SCOPES = {
  // Read permissions
  READ_BOOKMARKS: 'read:bookmarks',
  READ_COLLECTIONS: 'read:collections',
  READ_TAGS: 'read:tags',
  READ_USER: 'read:user',
  READ_ANALYTICS: 'read:analytics',

  // Write permissions
  WRITE_BOOKMARKS: 'write:bookmarks',
  WRITE_COLLECTIONS: 'write:collections',
  WRITE_TAGS: 'write:tags',

  // Delete permissions
  DELETE_BOOKMARKS: 'delete:bookmarks',
  DELETE_COLLECTIONS: 'delete:collections',

  // Admin permissions
  ADMIN_WEBHOOKS: 'admin:webhooks',
  ADMIN_API_KEYS: 'admin:api_keys',
} as const;

/**
 * API Key Manager
 */
export class APIKeyManager {
  /**
   * Generate a new API key
   */
  static async createAPIKey(
    userId: string,
    input: APIKeyCreateInput,
    supabase: any
  ): Promise<{ api_key: string; secret_key: string; key_data: APIKey }> {
    // Generate API key
    const apiKey = this.generateAPIKey();
    const secretKey = this.generateSecretKey();
    const secretKeyHash = this.hashSecretKey(secretKey);

    // Insert into database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_name: input.key_name,
        api_key: apiKey,
        key_secret_hash: secretKeyHash,
        scopes: input.scopes,
        rate_limit_per_hour: input.rate_limit_per_hour || 1000,
        rate_limit_per_day: input.rate_limit_per_day || 10000,
        expires_at: input.expires_at,
        description: input.description,
        allowed_origins: input.allowed_origins,
        ip_whitelist: input.ip_whitelist,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      api_key: apiKey,
      secret_key: secretKey,
      key_data: data,
    };
  }

  /**
   * Validate API key and secret
   */
  static async validateAPIKey(
    apiKey: string,
    secretKey: string,
    supabase: any
  ): Promise<APIKeyValidationResult> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Verify secret key
    const secretKeyHash = this.hashSecretKey(secretKey);
    if (secretKeyHash !== data.key_secret_hash) {
      return { valid: false, error: 'Invalid secret key' };
    }

    return { valid: true, api_key: data };
  }

  /**
   * Check rate limit for API key
   */
  static async checkRateLimit(
    apiKeyId: string,
    supabase: any
  ): Promise<RateLimitResult> {
    // Get API key limits
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('rate_limit_per_hour, rate_limit_per_day')
      .eq('id', apiKeyId)
      .single();

    if (!apiKey) {
      return {
        allowed: false,
        hourly_remaining: 0,
        daily_remaining: 0,
        hourly_limit: 0,
        daily_limit: 0,
      };
    }

    // Count hourly usage
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: hourlyCount } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId)
      .gte('created_at', oneHourAgo);

    // Count daily usage
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: dailyCount } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId)
      .gte('created_at', oneDayAgo);

    const hourlyRemaining = apiKey.rate_limit_per_hour - (hourlyCount || 0);
    const dailyRemaining = apiKey.rate_limit_per_day - (dailyCount || 0);

    return {
      allowed: hourlyRemaining > 0 && dailyRemaining > 0,
      hourly_remaining: Math.max(0, hourlyRemaining),
      daily_remaining: Math.max(0, dailyRemaining),
      hourly_limit: apiKey.rate_limit_per_hour,
      daily_limit: apiKey.rate_limit_per_day,
    };
  }

  /**
   * Record API usage
   */
  static async recordUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs?: number,
    ipAddress?: string,
    supabase?: any
  ): Promise<void> {
    await supabase.from('api_usage').insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      ip_address: ipAddress,
    });

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyId);
  }

  /**
   * List API keys for a user
   */
  static async listAPIKeys(userId: string, supabase: any): Promise<APIKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  /**
   * Revoke API key
   */
  static async revokeAPIKey(
    apiKeyId: string,
    userId: string,
    supabase: any
  ): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', apiKeyId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get API usage statistics
   */
  static async getUsageStats(
    apiKeyId: string,
    supabase: any
  ): Promise<{
    total_requests: number;
    requests_today: number;
    requests_this_week: number;
    avg_response_time: number;
    error_rate: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Total requests
    const { count: totalRequests } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId);

    // Requests today
    const { count: requestsToday } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId)
      .gte('created_at', oneDayAgo);

    // Requests this week
    const { count: requestsThisWeek } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId)
      .gte('created_at', oneWeekAgo);

    // Get response time and error rate
    const { data: recentRequests } = await supabase
      .from('api_usage')
      .select('response_time_ms, status_code')
      .eq('api_key_id', apiKeyId)
      .gte('created_at', oneWeekAgo)
      .limit(1000);

    let avgResponseTime = 0;
    let errorCount = 0;

    if (recentRequests && recentRequests.length > 0) {
      const totalResponseTime = recentRequests.reduce(
        (sum, req) => sum + (req.response_time_ms || 0),
        0
      );
      avgResponseTime = totalResponseTime / recentRequests.length;
      errorCount = recentRequests.filter((req) => req.status_code >= 400).length;
    }

    const errorRate = recentRequests
      ? (errorCount / recentRequests.length) * 100
      : 0;

    return {
      total_requests: totalRequests || 0,
      requests_today: requestsToday || 0,
      requests_this_week: requestsThisWeek || 0,
      avg_response_time: Math.round(avgResponseTime),
      error_rate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * Check if API key has scope
   */
  static hasScope(apiKey: APIKey, scope: string): boolean {
    return apiKey.scopes.includes(scope);
  }

  /**
   * Check if IP is whitelisted
   */
  static isIPWhitelisted(apiKey: APIKey, ipAddress: string): boolean {
    if (!apiKey.ip_whitelist || apiKey.ip_whitelist.length === 0) {
      return true; // No whitelist means all IPs allowed
    }

    return apiKey.ip_whitelist.includes(ipAddress);
  }

  /**
   * Check if origin is allowed (CORS)
   */
  static isOriginAllowed(apiKey: APIKey, origin: string): boolean {
    if (!apiKey.allowed_origins || apiKey.allowed_origins.length === 0) {
      return true; // No restriction
    }

    return apiKey.allowed_origins.includes(origin);
  }

  // Private helper methods

  private static generateAPIKey(): string {
    const prefix = 'hv2_'; // hitv2 prefix
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return prefix + randomBytes;
  }

  private static generateSecretKey(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  private static hashSecretKey(secretKey: string): string {
    return crypto.createHash('sha256').update(secretKey).digest('hex');
  }
}
