/**
 * Public API v1 - Tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  authenticateAPIRequest,
  recordAPISuccess,
  requireScope,
  addRateLimitHeaders,
} from '@/lib/api/api-auth-middleware';
import { API_SCOPES } from '@/lib/api/api-key-manager';

// GET /api/v1/tags - List all tags for user
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  const scopeCheck = requireScope(apiKey, API_SCOPES.READ_TAGS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all bookmarks for user and extract unique tags
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('tags')
      .eq('user_id', userId);

    if (error) throw error;

    // Extract and count tags
    const tagCounts = new Map<string, number>();

    bookmarks?.forEach((bookmark) => {
      const tags = bookmark.tags as string[];
      tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Convert to array and sort by count
    const tags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    await recordAPISuccess(apiKey.id, request, 200, startTime);

    let response = NextResponse.json({
      data: tags,
      total: tags.length,
    });

    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
