/**
 * Admin Content Bookmarks API
 * GET - List all bookmarks
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all bookmarks with user info
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        title,
        url,
        description,
        is_public,
        is_featured,
        created_at,
        user_id,
        profiles!inner(email)
      `
      )
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    // Get views and likes counts
    const bookmarkIds = bookmarks?.map((b) => b.id) || [];

    const { data: views } = await supabase
      .from('bookmark_views')
      .select('bookmark_id')
      .in('bookmark_id', bookmarkIds);

    const { data: likes } = await supabase
      .from('bookmark_likes')
      .select('bookmark_id')
      .in('bookmark_id', bookmarkIds);

    // Create count maps
    const viewsMap = (views || []).reduce((acc, v) => {
      acc[v.bookmark_id] = (acc[v.bookmark_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const likesMap = (likes || []).reduce((acc, l) => {
      acc[l.bookmark_id] = (acc[l.bookmark_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Enrich bookmarks
    const enrichedBookmarks = bookmarks?.map((bookmark: any) => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      is_public: bookmark.is_public,
      is_featured: bookmark.is_featured,
      created_at: bookmark.created_at,
      user_email: bookmark.profiles.email,
      views_count: viewsMap[bookmark.id] || 0,
      likes_count: likesMap[bookmark.id] || 0,
      type: 'bookmark' as const,
    }));

    return NextResponse.json({ bookmarks: enrichedBookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
