import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // Optional block duration
}

export interface SpamDetectionResult {
  allowed: boolean;
  riskScore: number;
  reason?: string;
  retryAfter?: number; // Seconds until retry allowed
}

// Default rate limit configurations
export const RATE_LIMITS = {
  BOOKMARK_CREATE: { maxAttempts: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  COLLECTION_CREATE: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  POST_CREATE: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  COMMENT_CREATE: { maxAttempts: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
  AFFILIATE_CLICK: { maxAttempts: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  REPORT_CREATE: { maxAttempts: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 per day
} as const;

/**
 * Check if an action should be rate limited
 */
export async function checkRateLimit(
  userId: string,
  actionType: keyof typeof RATE_LIMITS,
  config?: RateLimitConfig
): Promise<SpamDetectionResult> {
  const supabase = await createSupabaseServerClient();

  const limitConfig = config || RATE_LIMITS[actionType];
  const windowStart = new Date(Date.now() - limitConfig.windowMs);

  // Count recent actions
  const { count, error } = await supabase
    .from('spam_detection_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    // Fail open - allow the action but log
    return { allowed: true, riskScore: 0 };
  }

  const attemptCount = count || 0;

  if (attemptCount >= limitConfig.maxAttempts) {
    const retryAfterSeconds = Math.ceil(limitConfig.windowMs / 1000);

    // Log suspicious activity
    await logSpamDetection(userId, actionType, {
      isSuspicious: true,
      riskScore: 100,
      reason: `Rate limit exceeded: ${attemptCount}/${limitConfig.maxAttempts} in ${limitConfig.windowMs}ms`,
    });

    return {
      allowed: false,
      riskScore: 100,
      reason: `Rate limit exceeded. Please try again later.`,
      retryAfter: retryAfterSeconds,
    };
  }

  // Calculate risk score (0-100)
  const riskScore = Math.min((attemptCount / limitConfig.maxAttempts) * 100, 100);

  return {
    allowed: true,
    riskScore,
  };
}

/**
 * Log spam detection activity
 */
export async function logSpamDetection(
  userId: string | null,
  actionType: string,
  options: {
    isSuspicious?: boolean;
    riskScore?: number;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();

    await supabase.from('spam_detection_log').insert({
      user_id: userId,
      ip_address: options.ipAddress,
      action_type: actionType,
      is_suspicious: options.isSuspicious || false,
      risk_score: options.riskScore || 0,
      detection_reason: options.reason,
      user_agent: options.userAgent,
      metadata: options.metadata || {},
    });
  } catch (error) {
    console.error('Error logging spam detection:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Check for suspicious patterns in user behavior
 */
export async function detectSuspiciousActivity(
  userId: string,
  actionType: string
): Promise<SpamDetectionResult> {
  const supabase = await createSupabaseServerClient();

  // Check for rapid-fire actions (multiple actions in very short time)
  const last10Seconds = new Date(Date.now() - 10 * 1000);
  const { count } = await supabase
    .from('spam_detection_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', last10Seconds.toISOString());

  if ((count || 0) > 10) {
    await logSpamDetection(userId, actionType, {
      isSuspicious: true,
      riskScore: 90,
      reason: 'Rapid-fire actions detected (>10 in 10 seconds)',
    });

    return {
      allowed: false,
      riskScore: 90,
      reason: 'Suspicious activity detected. Please slow down.',
      retryAfter: 60,
    };
  }

  // Check for bot-like patterns
  const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
  const { data: recentActions } = await supabase
    .from('spam_detection_log')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', last5Minutes.toISOString())
    .order('created_at', { ascending: true })
    .limit(20);

  if (recentActions && recentActions.length >= 10) {
    // Check for perfectly timed intervals (bot behavior)
    const intervals = [];
    for (let i = 1; i < recentActions.length; i++) {
      const interval =
        new Date(recentActions[i].created_at).getTime() -
        new Date(recentActions[i - 1].created_at).getTime();
      intervals.push(interval);
    }

    // If intervals are too uniform, it's likely a bot
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 100) {
      // Very low variance = bot-like
      await logSpamDetection(userId, actionType, {
        isSuspicious: true,
        riskScore: 85,
        reason: 'Bot-like behavior detected (uniform intervals)',
      });

      return {
        allowed: false,
        riskScore: 85,
        reason: 'Automated behavior detected.',
        retryAfter: 300,
      };
    }
  }

  return {
    allowed: true,
    riskScore: 0,
  };
}

/**
 * Combined spam check (rate limit + suspicious activity)
 */
export async function checkForSpam(
  userId: string,
  actionType: keyof typeof RATE_LIMITS
): Promise<SpamDetectionResult> {
  // First check rate limits
  const rateLimitResult = await checkRateLimit(userId, actionType);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  // Then check for suspicious patterns
  const suspiciousResult = await detectSuspiciousActivity(userId, actionType);
  if (!suspiciousResult.allowed) {
    return suspiciousResult;
  }

  // Log the action for future analysis
  await logSpamDetection(userId, actionType, {
    isSuspicious: false,
    riskScore: Math.max(rateLimitResult.riskScore, suspiciousResult.riskScore),
  });

  return {
    allowed: true,
    riskScore: Math.max(rateLimitResult.riskScore, suspiciousResult.riskScore),
  };
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return null;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent');
}
