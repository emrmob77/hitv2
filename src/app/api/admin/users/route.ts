/**
 * Admin Users API
 * GET - List all users with stats
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users with their stats
    const { data: users, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        subscription_tier,
        is_suspended,
        is_admin,
        created_at,
        last_sign_in_at
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get bookmark counts for each user
    const userIds = users?.map((u) => u.id) || [];
    const { data: bookmarkCounts } = await supabase
      .from('bookmarks')
      .select('user_id')
      .in('user_id', userIds);

    const { data: collectionCounts } = await supabase
      .from('collections')
      .select('user_id')
      .in('user_id', userIds);

    // Aggregate counts
    const bookmarkCountMap = (bookmarkCounts || []).reduce((acc, b) => {
      acc[b.user_id] = (acc[b.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const collectionCountMap = (collectionCounts || []).reduce((acc, c) => {
      acc[c.user_id] = (acc[c.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Enrich users with counts
    const enrichedUsers = users?.map((user) => ({
      ...user,
      bookmarks_count: bookmarkCountMap[user.id] || 0,
      collections_count: collectionCountMap[user.id] || 0,
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
