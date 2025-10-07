import { createSupabaseApiClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';

// POST /api/follows - Toggle follow
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
    const { following_id } = body;

    if (!following_id) {
      return NextResponse.json(
        { error: 'following_id is required' },
        { status: 400 }
      );
    }

    // Prevent self-follow
    if (user.id === following_id) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single();

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('id', existingFollow.id);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      isFollowing = false;
    } else {
      // Follow
      const { error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: following_id,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      isFollowing = true;

      // Create activity
      const { error: activityError } = await supabase.from('activities').insert({
        user_id: user.id,
        action: 'follow',
        object_type: 'user',
        object_id: following_id,
        is_public: true,
      });

      if (activityError) {
        console.error('Activity error:', activityError);
      }

      // TODO: Notifications - disabled temporarily for debugging
      // Will enable after fixing database schema
    }

    return NextResponse.json({
      success: true,
      isFollowing,
    });
  } catch (error: any) {
    console.error('Error toggling follow:', error);
    console.error('Error details:', error?.message, error?.details, error?.hint);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
