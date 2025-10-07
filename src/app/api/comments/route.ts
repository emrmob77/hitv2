import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/comments - Get comments for a specific content
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const content_type = searchParams.get('content_type');
    const content_id = searchParams.get('content_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!content_type || !content_id) {
      return NextResponse.json(
        { error: 'content_type and content_id are required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get comments with user profiles
    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        profiles!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .eq('commentable_type', content_type)
      .eq('commentable_id', content_id)
      .is('parent_id', null) // Only get top-level comments
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        // Get like count for comment
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('likeable_type', 'comment')
          .eq('likeable_id', comment.id);

        const { data: replies } = await supabase
          .from('comments')
          .select(
            `
            *,
            profiles!comments_user_id_fkey (
              id,
              username,
              display_name,
              avatar_url
            )
          `
          )
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        // Get like counts for replies
        const repliesWithLikes = await Promise.all(
          (replies || []).map(async (reply) => {
            const { count: replyLikeCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('likeable_type', 'comment')
              .eq('likeable_id', reply.id);

            return {
              ...reply,
              like_count: replyLikeCount || 0,
            };
          })
        );

        return {
          ...comment,
          like_count: likeCount || 0,
          replies: repliesWithLikes,
        };
      })
    );

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
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
    const { content_type, content_id, content, parent_comment_id } = body;

    // Validate input
    if (!content_type || !content_id || !content) {
      return NextResponse.json(
        { error: 'content_type, content_id, and content are required' },
        { status: 400 }
      );
    }

    // Validate content_type
    const validTypes = ['bookmark', 'collection', 'exclusive_post'];
    if (!validTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content_type' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.trim().length === 0 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 1000 characters' },
        { status: 400 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        commentable_type: content_type,
        commentable_id: content_id,
        content: content.trim(),
        parent_id: parent_comment_id || null,
      })
      .select(
        `
        *,
        profiles!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .single();

    if (commentError) {
      return NextResponse.json(
        { error: commentError.message },
        { status: 500 }
      );
    }

    // Create activity for the comment
    await supabase.from('activities').insert({
      user_id: user.id,
      action: 'comment',
      object_type: content_type,
      object_id: content_id,
    });

    // Create notification for content owner
    let ownerId: string | null = null;

    if (parent_comment_id) {
      // Reply to comment - notify the comment author
      const { data: parentComment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', parent_comment_id)
        .single();
      ownerId = parentComment?.user_id || null;
    } else {
      // New comment on content - notify the content owner
      if (content_type === 'bookmark') {
        const { data: bookmark } = await supabase
          .from('bookmarks')
          .select('user_id')
          .eq('id', content_id)
          .single();
        ownerId = bookmark?.user_id || null;
      } else if (content_type === 'collection') {
        const { data: collection } = await supabase
          .from('collections')
          .select('user_id')
          .eq('id', content_id)
          .single();
        ownerId = collection?.user_id || null;
      } else if (content_type === 'exclusive_post') {
        const { data: post } = await supabase
          .from('exclusive_posts')
          .select('user_id')
          .eq('id', content_id)
          .single();
        ownerId = post?.user_id || null;
      }
    }

    // Create notification for content owner
    console.log('Creating notification for ownerId:', ownerId, 'user.id:', user.id);
    if (ownerId) {
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: ownerId,
        type: parent_comment_id ? 'comment_reply' : 'comment',
        title: parent_comment_id ? 'New reply to your comment' : 'New comment on your content',
        data: {
          sender_id: user.id,
          content_type,
          content_id: parent_comment_id || content_id,
        },
        is_read: false,
      });
      if (notifError) console.error('Notification error:', notifError);
      else console.log('Notification created successfully');
    } else {
      console.log('No ownerId, notification not created');
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
