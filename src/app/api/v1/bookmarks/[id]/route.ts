/**
 * Public API v1 - Individual Bookmark Operations
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

// GET /api/v1/bookmarks/:id - Get a single bookmark
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  const scopeCheck = requireScope(apiKey, API_SCOPES.READ_BOOKMARKS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error || !bookmark) {
      await recordAPISuccess(apiKey.id, request, 404, startTime);
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    await recordAPISuccess(apiKey.id, request, 200, startTime);

    let response = NextResponse.json({ data: bookmark });
    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to fetch bookmark' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/bookmarks/:id - Update a bookmark
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

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
    const { title, description, tags, collection_id, is_public } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (collection_id !== undefined) updates.collection_id = collection_id;
    if (is_public !== undefined) updates.is_public = is_public;

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !bookmark) {
      await recordAPISuccess(apiKey.id, request, 404, startTime);
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    await recordAPISuccess(apiKey.id, request, 200, startTime);

    let response = NextResponse.json({ data: bookmark });
    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/bookmarks/:id - Delete a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  const scopeCheck = requireScope(apiKey, API_SCOPES.DELETE_BOOKMARKS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (error) {
      await recordAPISuccess(apiKey.id, request, 404, startTime);
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    await recordAPISuccess(apiKey.id, request, 204, startTime);

    let response = new NextResponse(null, { status: 204 });
    response = await addRateLimitHeaders(response, apiKey.id);
    return response;
  } catch (error) {
    console.error('API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
