import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseFallback = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const supabase = hasServiceRole ? supabaseAdmin : supabaseFallback;

const normalizeExternalUrl = (input: string | null): string | null => {
  if (!input) {
    return null;
  }

  let candidate = input.trim();

  if (!candidate) {
    return null;
  }

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, '')}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookmarkId: string }> }
) {
  const { bookmarkId } = await params;

  if (!bookmarkId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select('url, click_count, privacy_level')
      .eq('id', bookmarkId)
      .single();

    if (error || !bookmark) {
      console.error('Bookmark redirect: failed to fetch bookmark', error);
      return NextResponse.redirect(new URL('/', request.url));
    }

    const normalized = normalizeExternalUrl(bookmark.url);

    if (!normalized) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (hasServiceRole) {
      try {
        await supabaseAdmin
          .from('bookmarks')
          .update({ click_count: (bookmark.click_count ?? 0) + 1 })
          .eq('id', bookmarkId);
      } catch (updateError) {
        console.error('Bookmark redirect: failed to update click count', updateError);
      }
    }

    return NextResponse.redirect(normalized, {
      status: 302,
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Bookmark redirect: unexpected error', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
