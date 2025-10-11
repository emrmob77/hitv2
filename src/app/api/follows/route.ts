import { createSupabaseApiClient } from '@/lib/supabase/api';
import type { Database } from '@/lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type SupabaseClientType = SupabaseClient<Database>;

async function createFollowNotification(
  supabase: SupabaseClientType,
  actorId: string,
  targetUserId: string
): Promise<void> {
  try {
    if (actorId === targetUserId) {
      return;
    }

    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', actorId)
      .single();

    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'follow',
      title: 'New follower',
      data: {
        sender_id: actorId,
        sender_username: senderProfile?.username ?? null,
        sender_display_name: senderProfile?.display_name ?? null,
        content_type: 'profile',
        content_id: actorId,
        action: 'followed',
      },
      is_read: false,
    });

    if (notificationError) {
      console.error('Notification error (follow):', notificationError);
    }
  } catch (error) {
    console.error('Failed to create follow notification:', error);
  }
}

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

      await createFollowNotification(supabase, user.id, following_id);
    }

    return NextResponse.json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
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
