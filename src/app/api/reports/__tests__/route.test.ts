import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => mockSupabase),
}));

describe('Reports API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/reports', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: '123',
          reason: 'spam',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if required fields are missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const request = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'bookmark',
          // Missing content_id and reason
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if content_type is invalid', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const request = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'invalid_type',
          content_id: '123',
          reason: 'spam',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid content_type');
    });

    it('should return 400 if reason is invalid', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const request = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: '123',
          reason: 'invalid_reason',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid reason');
    });

    it('should return 400 if user already reported this content', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock existing report check
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'existing-report' },
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: '123',
          reason: 'spam',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already reported');
    });

    it('should create a report successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock no existing report
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock successful insert
      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockInsertSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'report-123',
          reporter_id: 'user-123',
          content_type: 'bookmark',
          content_id: '123',
          reason: 'spam',
          status: 'pending',
        },
        error: null,
      });

      // First call: check existing
      mockSupabase.from.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      // Second call: insert new
      mockSupabase.from.mockReturnValueOnce({
        insert: mockInsert,
        select: mockInsertSelect,
        single: mockInsertSingle,
      });

      const request = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: '123',
          reason: 'spam',
          description: 'This is spam content',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.report.id).toBe('report-123');
      expect(data.report.reason).toBe('spam');
    });
  });

  describe('GET /api/reports', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new Request('http://localhost/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return user own reports for non-moderator', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock non-moderator profile
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { is_moderator: false },
          error: null,
        }),
      });

      // Mock reports query
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: [
          { id: 'report-1', reporter_id: 'user-123', status: 'pending' },
        ],
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
        eq: mockEq,
      });

      const request = new Request('http://localhost/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toHaveLength(1);
      expect(data.reports[0].reporter_id).toBe('user-123');
    });

    it('should return all reports for moderator', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'moderator-123' } },
        error: null,
      });

      // Mock moderator profile
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { is_moderator: true },
          error: null,
        }),
      });

      // Mock reports query (without eq filter for moderator)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            { id: 'report-1', reporter_id: 'user-1', status: 'pending' },
            { id: 'report-2', reporter_id: 'user-2', status: 'reviewing' },
          ],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toHaveLength(2);
    });

    it('should apply status filter', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'moderator-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { is_moderator: true },
          error: null,
        }),
      });

      const mockEq = vi.fn().mockReturnThis();
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: mockEq,
      });

      mockEq.mockResolvedValue({
        data: [{ id: 'report-1', status: 'pending' }],
        error: null,
      });

      const request = new Request('http://localhost/api/reports?status=pending');
      await GET(request);

      // Verify status filter was applied
      expect(mockEq).toHaveBeenCalledWith('status', 'pending');
    });
  });
});
