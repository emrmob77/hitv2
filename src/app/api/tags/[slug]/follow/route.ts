import { NextResponse } from 'next/server';

import { createSupabaseApiClient } from '@/lib/supabase/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const TAG_FOLLOWERS_MISSING_MESSAGE =
  'Tag followers feature is not configured. Please run migration 008_create_tag_followers.sql.';

function isMissingTagFollowersTable(error?: { message?: string } | null): boolean {
  if (!error?.message) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes('tag_followers') && (message.includes('does not exist') || message.includes('schema cache'));
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createSupabaseApiClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;

    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .single();

    if (tagError || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const {
      data: existingFollow,
      error: existingFollowError,
    } = await supabase
      .from('tag_followers')
      .select('id')
      .eq('tag_id', tag.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingFollowError) {
      if (isMissingTagFollowersTable(existingFollowError)) {
        return NextResponse.json({ error: TAG_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
      }

      return NextResponse.json({ error: existingFollowError.message }, { status: 500 });
    }

    let isFollowing = false;

    if (existingFollow) {
      const { error: deleteError } = await supabase
        .from('tag_followers')
        .delete()
        .eq('id', existingFollow.id);

      if (deleteError) {
        if (isMissingTagFollowersTable(deleteError)) {
          return NextResponse.json({ error: TAG_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
        }

        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from('tag_followers').insert({
        tag_id: tag.id,
        user_id: user.id,
      });

      if (insertError) {
        if (isMissingTagFollowersTable(insertError)) {
          return NextResponse.json({ error: TAG_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
        }

        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      isFollowing = true;
    }

    const {
      count: followerCount,
      error: countError,
    } = await supabase
      .from('tag_followers')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tag.id);

    if (countError) {
      if (isMissingTagFollowersTable(countError)) {
        return NextResponse.json({ error: TAG_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
      }

      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount: followerCount ?? 0,
    });
  } catch (error) {
    console.error('Error toggling tag follow:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { slug } = params;

    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .single();

    if (tagError || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const {
      count: followerCount,
      error: followerCountError,
    } = await supabase
      .from('tag_followers')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tag.id);

    if (followerCountError) {
      if (isMissingTagFollowersTable(followerCountError)) {
        return NextResponse.json({ error: TAG_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
      }

      return NextResponse.json({ error: followerCountError.message }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isFollowing = false;

    if (user) {
      const {
        data: followRow,
        error: followRowError,
      } = await supabase
        .from('tag_followers')
        .select('id')
        .eq('tag_id', tag.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (followRowError) {
        if (isMissingTagFollowersTable(followRowError)) {
          return NextResponse.json({ error: TAG_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
        }

        return NextResponse.json({ error: followRowError.message }, { status: 500 });
      }

      isFollowing = Boolean(followRow);
    }

    return NextResponse.json({
      followerCount: followerCount ?? 0,
      isFollowing,
    });
  } catch (error) {
    console.error('Error retrieving tag follow status:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
