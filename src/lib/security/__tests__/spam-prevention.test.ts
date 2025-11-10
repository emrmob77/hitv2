import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, RATE_LIMITS, getIpAddress, getUserAgent } from '../spam-prevention';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}));

describe('Spam Prevention', () => {
  describe('Rate Limiting', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should allow action when under rate limit', async () => {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const mockSupabase = createSupabaseServerClient();

      // Mock count as 5 (under limit of 20 for BOOKMARK_CREATE)
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
      } as any);

      const result = await checkRateLimit('user-123', 'BOOKMARK_CREATE');

      expect(result.allowed).toBe(true);
      expect(result.riskScore).toBeLessThan(100);
    });

    it('should block action when over rate limit', async () => {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const mockSupabase = createSupabaseServerClient();

      // Mock count as 25 (over limit of 20 for BOOKMARK_CREATE)
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 25, error: null }),
      } as any);

      const result = await checkRateLimit('user-123', 'BOOKMARK_CREATE');

      expect(result.allowed).toBe(false);
      expect(result.riskScore).toBe(100);
      expect(result.reason).toContain('Rate limit exceeded');
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should calculate risk score proportionally', async () => {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const mockSupabase = createSupabaseServerClient();

      // Mock count as 10 (50% of 20 limit)
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 10, error: null }),
      } as any);

      const result = await checkRateLimit('user-123', 'BOOKMARK_CREATE');

      expect(result.allowed).toBe(true);
      expect(result.riskScore).toBeCloseTo(50, 0);
    });

    it('should fail open on database error', async () => {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const mockSupabase = createSupabaseServerClient();

      // Mock database error
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: null, error: new Error('DB error') }),
      } as any);

      const result = await checkRateLimit('user-123', 'BOOKMARK_CREATE');

      // Should allow action on error (fail open)
      expect(result.allowed).toBe(true);
      expect(result.riskScore).toBe(0);
    });
  });

  describe('Request Headers', () => {
    it('should extract IP address from x-forwarded-for header', () => {
      const request = new Request('http://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const ip = getIpAddress(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP address from x-real-ip header', () => {
      const request = new Request('http://example.com', {
        headers: {
          'x-real-ip': '192.168.1.1',
        },
      });

      const ip = getIpAddress(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return null if no IP headers present', () => {
      const request = new Request('http://example.com');

      const ip = getIpAddress(request);
      expect(ip).toBeNull();
    });

    it('should extract user agent from headers', () => {
      const request = new Request('http://example.com', {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      });

      const userAgent = getUserAgent(request);
      expect(userAgent).toBe('Mozilla/5.0');
    });
  });

  describe('Rate Limit Configurations', () => {
    it('should have correct rate limits defined', () => {
      expect(RATE_LIMITS.BOOKMARK_CREATE.maxAttempts).toBe(20);
      expect(RATE_LIMITS.COLLECTION_CREATE.maxAttempts).toBe(10);
      expect(RATE_LIMITS.POST_CREATE.maxAttempts).toBe(10);
      expect(RATE_LIMITS.COMMENT_CREATE.maxAttempts).toBe(30);
      expect(RATE_LIMITS.AFFILIATE_CLICK.maxAttempts).toBe(100);
      expect(RATE_LIMITS.REPORT_CREATE.maxAttempts).toBe(5);
    });

    it('should have time windows defined', () => {
      // All should be 1 hour except REPORT_CREATE (24 hours)
      expect(RATE_LIMITS.BOOKMARK_CREATE.windowMs).toBe(60 * 60 * 1000);
      expect(RATE_LIMITS.REPORT_CREATE.windowMs).toBe(24 * 60 * 60 * 1000);
    });
  });
});
