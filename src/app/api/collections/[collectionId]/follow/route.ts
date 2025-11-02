import { NextResponse } from 'next/server';

import { createSupabaseApiClient } from '@/lib/supabase/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const COLLECTION_FOLLOWERS_MISSING_MESSAGE =
  'Collection followers feature is not configured. Please run migration 009_add_collection_collaboration_support.sql.';

function isMissingCollectionFollowersTable(error?: { message?: string } | null): boolean {
  if (!error?.message) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('collection_followers') &&
    (message.includes('does not exist') || message.includes('schema cache'))
  );
}

export async function POST(request: Request, { params }: { params: { collectionId: string } }) {
  try {
    const supabase = await createSupabaseApiClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collectionId } = params;

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id, privacy_level')
      .eq('id', collectionId)
      .maybeSingle();

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Only allow following public collections or owned ones
    if (
      collection.privacy_level !== 'public' &&
      collection.user_id !== user.id
    ) {
      return NextResponse.json({ error: 'Collection is not followable' }, { status: 403 });
    }

    const {
      data: existingFollow,
      error: existingFollowError,
    } = await supabase
      .from('collection_followers')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingFollowError) {
      if (isMissingCollectionFollowersTable(existingFollowError)) {
        return NextResponse.json({ error: COLLECTION_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
      }

      return NextResponse.json({ error: existingFollowError.message }, { status: 500 });
    }

    let isFollowing = false;

    if (existingFollow) {
      const { error: deleteError } = await supabase
        .from('collection_followers')
        .delete()
        .eq('id', existingFollow.id);

      if (deleteError) {
        if (isMissingCollectionFollowersTable(deleteError)) {
          return NextResponse.json({ error: COLLECTION_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
        }

        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from('collection_followers').insert({
        collection_id: collectionId,
        user_id: user.id,
      });

      if (insertError) {
        if (isMissingCollectionFollowersTable(insertError)) {
          return NextResponse.json({ error: COLLECTION_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
        }

        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      isFollowing = true;
    }

    const {
      count: followerCount,
      error: countError,
    } = await supabase
      .from('collection_followers')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    if (countError) {
      if (isMissingCollectionFollowersTable(countError)) {
        return NextResponse.json({ error: COLLECTION_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
      }

      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Update collection follower count for analytics
    await supabase
      .from('collections')
      .update({ follower_count: followerCount ?? 0 })
      .eq('id', collectionId);

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount: followerCount ?? 0,
    });
  } catch (error) {
    console.error('Error toggling collection follow:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: { params: { collectionId: string } }) {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { collectionId } = params;

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, privacy_level')
      .eq('id', collectionId)
      .maybeSingle();

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const {
      count: followerCount,
      error: followerCountError,
    } = await supabase
      .from('collection_followers')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    if (followerCountError) {
      if (isMissingCollectionFollowersTable(followerCountError)) {
        return NextResponse.json({ error: COLLECTION_FOLLOWERS_MISSING_MESSAGE }, { status: 503 });
      }

      return NextResponse.json({ error: followerCountError.message }, { status: 500 });
    }

    let isFollowing = false;

    const userResult = await supabase.auth.getUser();
    const currentUserId = userResult.data?.user?.id;

    if (currentUserId) {
      const { data: followRecord } = await supabase
        .from('collection_followers')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      isFollowing = Boolean(followRecord);
    }

    return NextResponse.json({
      followerCount: followerCount ?? 0,
      isFollowing,
    });
  } catch (error) {
    console.error('Error fetching collection follower info:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
