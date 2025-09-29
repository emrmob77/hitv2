import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const { bookmarkId } = params;
    const supabase = await createSupabaseServerClient();

    // Get bookmark
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select('id, url, view_count')
      .eq('id', bookmarkId)
      .single();

    if (error || !bookmark) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment view count
    await supabase
      .from('bookmarks')
      .update({ view_count: bookmark.view_count + 1 })
      .eq('id', bookmarkId);

    // Track analytics (optional - you can expand this later)
    // const userAgent = request.headers.get('user-agent');
    // const referer = request.headers.get('referer');
    // await trackClick(bookmarkId, { userAgent, referer });

    // Redirect to external URL with proper headers
    return NextResponse.redirect(bookmark.url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Error redirecting bookmark:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}