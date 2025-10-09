import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/saved-bookmarks - Get user's saved bookmarks
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get saved bookmarks
    const { data: savedBookmarks, error } = await supabase
      .from('saved_bookmarks')
      .select(
        `
        id,
        created_at,
        bookmarks (
          id,
          title,
          description,
          url,
          domain,
          image_url,
          favicon_url,
          slug,
          created_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ savedBookmarks: savedBookmarks || [] });
  } catch (error) {
    console.error('Error fetching saved bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/saved-bookmarks - Toggle save bookmark
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookmark_id } = body;

    if (!bookmark_id) {
      return NextResponse.json(
        { error: 'bookmark_id is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('saved_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('bookmark_id', bookmark_id)
      .single();

    let isSaved = false;
    let totalSaveCount: number | null = null;

    if (existingSave) {
      // Unsave
      const { error: deleteError } = await supabase
        .from('saved_bookmarks')
        .delete()
        .eq('id', existingSave.id);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      isSaved = false;
    } else {
      // Save
      const { error: insertError } = await supabase
        .from('saved_bookmarks')
        .insert({
          user_id: user.id,
          bookmark_id: bookmark_id,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      isSaved = true;

      // Get bookmark details for notification
      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('user_id, title, slug')
        .eq('id', bookmark_id)
        .single();

      // Send notification to bookmark owner (if not saving own bookmark)
      if (bookmark && bookmark.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: bookmark.user_id,
          type: 'bookmark_saved',
          title: 'Someone saved your bookmark',
          data: {
            sender_id: user.id,
            content_type: 'bookmark',
            content_id: bookmark_id,
            bookmark_slug: bookmark.slug,
            action: 'saved',
          },
          is_read: false,
        });
      }
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { count: saveCount, error: countError } = await supabaseAdmin
          .from('saved_bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('bookmark_id', bookmark_id);

        if (!countError) {
          totalSaveCount = saveCount ?? 0;

          await supabaseAdmin
            .from('bookmarks')
            .update({ save_count: totalSaveCount })
            .eq('id', bookmark_id);
        }
      } catch (error) {
        console.error('Error calculating total save count:', error);
      }
    }

    return NextResponse.json({
      success: true,
      isSaved,
      saveCount: totalSaveCount,
    });
  } catch (error) {
    console.error('Error toggling saved bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
