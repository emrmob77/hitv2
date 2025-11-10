/**
 * Zapier Action: Create Bookmark
 *
 * This endpoint is called by Zapier to create a new bookmark
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  authenticateAPIRequest,
  recordAPISuccess,
  requireScope,
} from '@/lib/api/api-auth-middleware';
import { API_SCOPES } from '@/lib/api/api-key-manager';

export async function POST(request: NextRequest) {
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
    const { url, title, description, tags, collection_id, is_public } = body;

    if (!url) {
      await recordAPISuccess(apiKey.id, request, 400, startTime);
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Parse tags if it's a comma-separated string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim()).filter((t) => t);
    }

    // Create bookmark
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        url,
        title,
        description,
        tags: parsedTags || [],
        collection_id,
        is_public: is_public || false,
      })
      .select()
      .single();

    if (error) throw error;

    await recordAPISuccess(apiKey.id, request, 201, startTime);

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Zapier action error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      {
        error: 'Failed to create bookmark',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
