import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookmarkId: string }> }
) {
  const { bookmarkId } = await params;

  if (!bookmarkId) {
    return NextResponse.json(
      { error: 'Bookmark id is required' },
      { status: 400 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Service role key is not configured' },
      { status: 500 }
    );
  }

  try {
    const { data: bookmark, error } = await supabaseAdmin
      .from('bookmarks')
      .select('click_count')
      .eq('id', bookmarkId)
      .single();

    if (error || !bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const nextCount = (bookmark.click_count ?? 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from('bookmarks')
      .update({ click_count: nextCount })
      .eq('id', bookmarkId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, clickCount: nextCount });
  } catch (error) {
    console.error('Bookmark visit tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to record bookmark click' },
      { status: 500 }
    );
  }
}
