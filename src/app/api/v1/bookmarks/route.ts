/**
 * Public API v1 - Bookmarks
 *
 * RESTful API for bookmark management with API key authentication
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

// GET /api/v1/bookmarks - List bookmarks
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Authenticate
  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  // Check scope
  const scopeCheck = requireScope(apiKey, API_SCOPES.READ_BOOKMARKS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const collectionId = searchParams.get('collection_id');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: bookmarks, error, count } = await query;

    if (error) throw error;

    // Record usage
    await recordAPISuccess(apiKey.id, request, 200, startTime);

    // Create response
    let response = NextResponse.json({
      data: bookmarks || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: (count || 0) > offset + limit,
      },
    });

    // Add rate limit headers
    response = await addRateLimitHeaders(response, apiKey.id);

    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// POST /api/v1/bookmarks - Create a bookmark
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Authenticate
  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  // Check scope
  const scopeCheck = requireScope(apiKey, API_SCOPES.WRITE_BOOKMARKS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { url, title, description, tags, collection_id, is_public } = body;

    if (!url) {
      await recordAPISuccess(apiKey.id, request, 400, startTime);
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Create bookmark
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        url,
        title,
        description,
        tags: tags || [],
        collection_id,
        is_public: is_public || false,
      })
      .select()
      .single();

    if (error) throw error;

    // Record usage
    await recordAPISuccess(apiKey.id, request, 201, startTime);

    let response = NextResponse.json(
      { data: bookmark },
      { status: 201 }
    );

    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}
