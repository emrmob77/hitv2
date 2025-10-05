import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/likes - Toggle like on content
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
      await supabase.from('activities').insert({
        user_id: user.id,
        action: 'like',
        object_type: content_type,
        object_id: content_id,
      });

      // Create notification for content owner
      // First, get the content owner
      let ownerId: string | null = null;

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
      } else if (content_type === 'comment') {
        const { data: comment } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', content_id)
          .single();
        ownerId = comment?.user_id || null;
      } else if (content_type === 'exclusive_post') {
        const { data: post } = await supabase
          .from('exclusive_posts')
          .select('user_id')
          .eq('id', content_id)
          .single();
        ownerId = post?.user_id || null;
      }

      // Create notification for content owner
      if (ownerId) {
        await supabase.from('notifications').insert({
          user_id: ownerId,
          type: 'like',
          title: 'New like on your content',
          data: {
            sender_id: user.id,
            content_type,
            content_id,
          },
          is_read: false,
        });
      }
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
    return NextResponse.json(
      { error: 'Internal server error' },
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
