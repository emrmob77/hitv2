/**
 * Bookmark Detail API
 * GET /api/bookmarks/[bookmarkId] - Get single bookmark
 * PATCH /api/bookmarks/[bookmarkId] - Update bookmark
 * DELETE /api/bookmarks/[bookmarkId] - Delete bookmark
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET single bookmark
export async function GET(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const bookmarkId = params.bookmarkId;

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select(
        `
        *,
        bookmark_tags:bookmark_tags(
          tags(
            name,
            slug
          )
        ),
        collection_bookmarks:collection_bookmarks(
          collections(
            slug,
            name
          )
        )
      `
      )
      .eq('id', bookmarkId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Get bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark' },
      { status: 500 }
    );
  }
}

// PATCH update bookmark
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarkId = params.bookmarkId;
    const body = await request.json();

    // Update bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .update(body)
      .eq('id', bookmarkId)
      .eq('user_id', user.id) // Ensure user owns the bookmark
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

// DELETE bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarkId = params.bookmarkId;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id); // Ensure user owns the bookmark

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
