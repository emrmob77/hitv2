/**
 * API Authentication Middleware
 *
 * Validates API keys and enforces rate limits for public API access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { APIKeyManager, APIKey } from './api-key-manager';

export interface APIAuthContext {
  apiKey: APIKey;
  userId: string;
}

/**
 * Extract API credentials from request headers
 */
function extractAPICredentials(request: NextRequest): {
  apiKey: string | null;
  secretKey: string | null;
} {
  // Try Authorization header (Bearer token format)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const [apiKey, secretKey] = token.split(':');
    return { apiKey: apiKey || null, secretKey: secretKey || null };
  }

  // Try custom headers
  const apiKey = request.headers.get('X-API-Key');
  const secretKey = request.headers.get('X-API-Secret');

  return { apiKey, secretKey };
}

/**
 * Authenticate API request
 */
export async function authenticateAPIRequest(
  request: NextRequest
): Promise<{ success: true; context: APIAuthContext } | { success: false; error: NextResponse }> {
  const startTime = Date.now();

  try {
    // Extract credentials
    const { apiKey, secretKey } = extractAPICredentials(request);

    if (!apiKey || !secretKey) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Missing API credentials',
            message:
              'Include API key and secret in Authorization header (Bearer apiKey:secretKey) or X-API-Key and X-API-Secret headers',
          },
          { status: 401 }
        ),
      };
    }

    // Create Supabase client for API key validation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Validate API key
    const validation = await APIKeyManager.validateAPIKey(
      apiKey,
      secretKey,
      supabase
    );

    if (!validation.valid || !validation.api_key) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid API credentials', message: validation.error },
          { status: 401 }
        ),
      };
    }

    // Check IP whitelist
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!APIKeyManager.isIPWhitelisted(validation.api_key, ipAddress)) {
      await APIKeyManager.recordUsage(
        validation.api_key.id,
        request.nextUrl.pathname,
        request.method,
        403,
        Date.now() - startTime,
        ipAddress,
        supabase
      );

      return {
        success: false,
        error: NextResponse.json(
          { error: 'IP address not whitelisted' },
          { status: 403 }
        ),
      };
    }

    // Check origin (CORS)
    const origin = request.headers.get('origin') || '';
    if (origin && !APIKeyManager.isOriginAllowed(validation.api_key, origin)) {
      await APIKeyManager.recordUsage(
        validation.api_key.id,
        request.nextUrl.pathname,
        request.method,
        403,
        Date.now() - startTime,
        ipAddress,
        supabase
      );

      return {
        success: false,
        error: NextResponse.json(
          { error: 'Origin not allowed' },
          { status: 403 }
        ),
      };
    }

    // Check rate limit
    const rateLimit = await APIKeyManager.checkRateLimit(
      validation.api_key.id,
      supabase
    );

    if (!rateLimit.allowed) {
      await APIKeyManager.recordUsage(
        validation.api_key.id,
        request.nextUrl.pathname,
        request.method,
        429,
        Date.now() - startTime,
        ipAddress,
        supabase
      );

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            rate_limit: {
              hourly_remaining: rateLimit.hourly_remaining,
              daily_remaining: rateLimit.daily_remaining,
              hourly_limit: rateLimit.hourly_limit,
              daily_limit: rateLimit.daily_limit,
            },
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit-Hour': rateLimit.hourly_limit.toString(),
              'X-RateLimit-Remaining-Hour': rateLimit.hourly_remaining.toString(),
              'X-RateLimit-Limit-Day': rateLimit.daily_limit.toString(),
              'X-RateLimit-Remaining-Day': rateLimit.daily_remaining.toString(),
            },
          }
        ),
      };
    }

    return {
      success: true,
      context: {
        apiKey: validation.api_key,
        userId: validation.api_key.user_id,
      },
    };
  } catch (error) {
    console.error('API authentication error:', error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Record successful API request
 */
export async function recordAPISuccess(
  apiKeyId: string,
  request: NextRequest,
  statusCode: number,
  startTime: number
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await APIKeyManager.recordUsage(
      apiKeyId,
      request.nextUrl.pathname,
      request.method,
      statusCode,
      Date.now() - startTime,
      ipAddress,
      supabase
    );
  } catch (error) {
    console.error('Error recording API usage:', error);
  }
}

/**
 * Check if API key has required scope
 */
export function requireScope(apiKey: APIKey, scope: string): { allowed: true } | { allowed: false; error: NextResponse } {
  if (!APIKeyManager.hasScope(apiKey, scope)) {
    return {
      allowed: false,
      error: NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: `This endpoint requires the '${scope}' scope`,
          your_scopes: apiKey.scopes,
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Helper to add rate limit headers to response
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  apiKeyId: string
): Promise<NextResponse> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const rateLimit = await APIKeyManager.checkRateLimit(apiKeyId, supabase);

    response.headers.set('X-RateLimit-Limit-Hour', rateLimit.hourly_limit.toString());
    response.headers.set('X-RateLimit-Remaining-Hour', rateLimit.hourly_remaining.toString());
    response.headers.set('X-RateLimit-Limit-Day', rateLimit.daily_limit.toString());
    response.headers.set('X-RateLimit-Remaining-Day', rateLimit.daily_remaining.toString());

    return response;
  } catch (error) {
    console.error('Error adding rate limit headers:', error);
    return response;
  }
}
