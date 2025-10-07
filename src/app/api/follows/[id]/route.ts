import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/follows/[id] - Check if current user follows the given user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isFollowing: false });
    }

    const { id } = await params;

    // Check if following
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .single();

    return NextResponse.json({
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ isFollowing: false });
  }
}
