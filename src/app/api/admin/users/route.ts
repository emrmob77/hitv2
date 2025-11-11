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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching admin profile:', profileError);
      return NextResponse.json({ error: 'Profile not found: ' + profileError.message }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json({
        error: 'Forbidden - User is not admin',
        profile: profile,
        userId: user.id
      }, { status: 403 });
    }

    // Fetch all users with their stats
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Fetched users count:', users?.length);
    if (users && users.length > 0) {
      console.log('Sample user data:', users[0]);
    }

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

    // Get email addresses from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    const emailMap: Record<string, string> = {};
    if (authUsers?.users) {
      authUsers.users.forEach(u => {
        emailMap[u.id] = u.email || '';
      });
    }

    // Enrich users with counts and emails
    const enrichedUsers = users?.map((user: any) => ({
      id: user.id,
      email: emailMap[user.id] || user.email || '',
      full_name: user.full_name || user.display_name || '',
      avatar_url: user.avatar_url || user.profile_image_url || '',
      subscription_tier: user.subscription_tier || 'free',
      is_suspended: user.is_suspended || false,
      is_admin: user.is_admin || false,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || user.updated_at,
      bookmarks_count: bookmarkCountMap[user.id] || 0,
      collections_count: collectionCountMap[user.id] || 0,
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
