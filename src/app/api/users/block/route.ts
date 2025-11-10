import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Block a user
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { blocked_id, reason } = body;

    if (!blocked_id) {
      return NextResponse.json({ error: 'Missing required field: blocked_id' }, { status: 400 });
    }

    // Can't block yourself
    if (blocked_id === user.id) {
      return NextResponse.json({ error: 'You cannot block yourself' }, { status: 400 });
    }

    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', blocked_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'User is already blocked' }, { status: 400 });
    }

    // Create block
    const { data: block, error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: user.id,
        blocked_id,
        reason,
      })
      .select()
      .single();

    if (error) {
      console.error('Error blocking user:', error);
      return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users/block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Unblock a user
export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blocked_id = searchParams.get('blocked_id');

    if (!blocked_id) {
      return NextResponse.json({ error: 'Missing required parameter: blocked_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blocked_id);

    if (error) {
      console.error('Error unblocking user:', error);
      return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/users/block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get blocked users list
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: blocks, error } = await supabase
      .from('blocked_users')
      .select(`
        *,
        blocked_user:profiles!blocked_users_blocked_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blocked users:', error);
      return NextResponse.json({ error: 'Failed to fetch blocked users' }, { status: 500 });
    }

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error('Error in GET /api/users/block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
