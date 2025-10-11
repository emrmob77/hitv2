import { createSupabaseApiClient } from '@/lib/supabase/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type SupabaseClientType = SupabaseClient<Database>;

async function createLikeNotification({
  supabase,
  actorId,
  contentType,
  contentId,
}: {
  supabase: SupabaseClientType;
  actorId: string;
  contentType: string;
  contentId: string;
}): Promise<void> {
  try {
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', actorId)
      .single();

    const baseData: Record<string, unknown> = {
      sender_id: actorId,
      sender_username: senderProfile?.username ?? null,
      sender_display_name: senderProfile?.display_name ?? null,
      like_target_type: contentType,
      content_type: contentType,
      content_id: contentId,
    };

    let ownerId: string | null = null;
    let title = 'New like';
    let notificationData = { ...baseData };

    if (contentType === 'bookmark') {
      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('user_id, slug')
        .eq('id', contentId)
        .single();

      ownerId = bookmark?.user_id ?? null;
      notificationData = {
        ...notificationData,
        bookmark_id: contentId,
        bookmark_slug: bookmark?.slug ?? null,
        action: 'liked',
      };
      title = 'Someone liked your bookmark';
    } else if (contentType === 'collection') {
      const { data: collection } = await supabase
        .from('collections')
        .select('user_id, slug, profiles!collections_user_id_fkey(username)')
        .eq('id', contentId)
        .single();

      ownerId = collection?.user_id ?? null;
      notificationData = {
        ...notificationData,
        collection_slug: collection?.slug ?? null,
        collection_owner_username: collection?.profiles?.username ?? null,
        action: 'liked',
      };
      title = 'Someone liked your collection';
    } else if (contentType === 'comment') {
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id, commentable_type, commentable_id, parent_id')
        .eq('id', contentId)
        .single();

      ownerId = comment?.user_id ?? null;
      const commentContentType = comment?.commentable_type ?? null;
      const commentContentId = comment?.commentable_id ?? null;

      notificationData = {
        ...notificationData,
        comment_id: contentId,
        parent_comment_id: comment?.parent_id ?? null,
        action: 'liked',
      };

      if (commentContentType && commentContentId) {
        notificationData.content_type = commentContentType;
        notificationData.content_id = commentContentId;

        if (commentContentType === 'bookmark') {
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('slug')
            .eq('id', commentContentId)
            .single();

          notificationData = {
            ...notificationData,
            bookmark_id: commentContentId,
            bookmark_slug: bookmark?.slug ?? null,
          };
        } else if (commentContentType === 'collection') {
          const { data: collection } = await supabase
            .from('collections')
            .select('slug, user_id, profiles!collections_user_id_fkey(username)')
            .eq('id', commentContentId)
            .single();

          notificationData = {
            ...notificationData,
            collection_slug: collection?.slug ?? null,
            collection_owner_username: collection?.profiles?.username ?? null,
          };
        }
      }

      title = 'Someone liked your comment';
    } else if (contentType === 'exclusive_post') {
      const { data: post } = await supabase
        .from('exclusive_posts')
        .select('user_id')
        .eq('id', contentId)
        .single();

      ownerId = post?.user_id ?? null;
      title = 'Someone liked your post';
      notificationData = {
        ...notificationData,
        action: 'liked',
      };
    }

    if (!ownerId || ownerId === actorId) {
      return;
    }

    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: ownerId,
      type: 'like',
      title,
      data: notificationData,
      is_read: false,
    });

    if (notificationError) {
      console.error('Notification error (like):', notificationError);
    }
  } catch (error) {
    console.error('Failed to create like notification:', error);
  }
}

// POST /api/likes - Toggle like on content
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseApiClient(request);

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content_type, content_id } = body;

    // Validate input
    if (!content_type || !content_id) {
      return NextResponse.json(
        { error: 'content_type and content_id are required' },
        { status: 400 }
      );
    }

    // Validate content_type
    const validTypes = ['bookmark', 'collection', 'comment', 'exclusive_post'];
    if (!validTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content_type' },
        { status: 400 }
      );
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('likeable_type', content_type)
      .eq('likeable_id', content_id)
      .single();

    let isLiked = false;
    let likeCount = 0;

    if (existingLike) {
      // Unlike - delete the like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      isLiked = false;
    } else {
      // Like - create new like
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          likeable_type: content_type,
          likeable_id: content_id,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      isLiked = true;

      // Create activity for the like
      const { error: activityError } = await supabase.from('activities').insert({
        user_id: user.id,
        action: 'like',
        object_type: content_type,
        object_id: content_id,
        is_public: true,
      });

      if (activityError) {
        console.error('Activity error:', activityError);
      }

      await createLikeNotification({
        supabase,
        actorId: user.id,
        contentType: content_type,
        contentId: content_id,
      });
    }

    // Get updated like count
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('likeable_type', content_type)
      .eq('likeable_id', content_id);

    likeCount = count || 0;

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    const message = error instanceof Error ? error.message : undefined;
    const details =
      typeof error === 'object' && error !== null && 'details' in error
        ? (error as { details?: string }).details
        : undefined;
    const hint =
      typeof error === 'object' && error !== null && 'hint' in error
        ? (error as { hint?: string }).hint
        : undefined;
    if (details) {
      console.error('Error details:', details, hint ?? '');
    }
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

// GET /api/likes - Get like status for content
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const content_type = searchParams.get('content_type');
    const content_id = searchParams.get('content_id');

    if (!content_type || !content_id) {
      return NextResponse.json(
        { error: 'content_type and content_id are required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get total like count
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('likeable_type', content_type)
      .eq('likeable_id', content_id);

    // Check if current user liked
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isLiked = false;
    if (user) {
      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('likeable_type', content_type)
        .eq('likeable_id', content_id)
        .single();

      isLiked = !!userLike;
    }

    return NextResponse.json({
      likeCount: likeCount || 0,
      isLiked,
    });
  } catch (error) {
    console.error('Error getting like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
