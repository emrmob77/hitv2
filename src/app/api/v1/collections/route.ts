/**
 * Public API v1 - Collections
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

// GET /api/v1/collections - List collections
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  const scopeCheck = requireScope(apiKey, API_SCOPES.READ_COLLECTIONS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeBookmarks = searchParams.get('include_bookmarks') === 'true';

    let query = supabase
      .from('collections')
      .select(
        includeBookmarks
          ? '*, bookmarks(*)'
          : '*',
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: collections, error, count } = await query;

    if (error) throw error;

    await recordAPISuccess(apiKey.id, request, 200, startTime);

    let response = NextResponse.json({
      data: collections || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: (count || 0) > offset + limit,
      },
    });

    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/v1/collections - Create a collection
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  const scopeCheck = requireScope(apiKey, API_SCOPES.WRITE_COLLECTIONS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name) {
      await recordAPISuccess(apiKey.id, request, 400, startTime);
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        name,
        description,
        is_public: is_public || false,
      })
      .select()
      .single();

    if (error) throw error;

    await recordAPISuccess(apiKey.id, request, 201, startTime);

    let response = NextResponse.json(
      { data: collection },
      { status: 201 }
    );

    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
