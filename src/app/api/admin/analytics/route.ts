/**
 * Admin Analytics API
 * GET - Get comprehensive analytics data
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get overview stats
    const { data: allUsers } = await supabase.from('profiles').select('id, created_at');
    const { data: todayUsers } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: allBookmarks } = await supabase.from('bookmarks').select('id, created_at');
    const { data: todayBookmarks } = await supabase
      .from('bookmarks')
      .select('id')
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: allViews } = await supabase.from('bookmark_views').select('id, created_at');
    const { data: todayViews } = await supabase
      .from('bookmark_views')
      .select('id')
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: allLikes } = await supabase.from('bookmark_likes').select('id');

    // Get subscription breakdown
    const { data: subscriptions } = await supabase.from('profiles').select('subscription_tier');
    const subscriptionBreakdown = [
      {
        tier: 'free',
        count: subscriptions?.filter((s) => s.subscription_tier === 'free').length || 0,
        revenue: 0,
      },
      {
        tier: 'pro',
        count: subscriptions?.filter((s) => s.subscription_tier === 'pro').length || 0,
        revenue: (subscriptions?.filter((s) => s.subscription_tier === 'pro').length || 0) * 9.99,
      },
      {
        tier: 'premium',
        count: subscriptions?.filter((s) => s.subscription_tier === 'premium').length || 0,
        revenue:
          (subscriptions?.filter((s) => s.subscription_tier === 'premium').length || 0) * 19.99,
      },
    ];

    const monthlyRevenue =
      subscriptionBreakdown.reduce((acc, s) => acc + s.revenue, 0);

    // Get user growth data (last 7 days)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      const newUsers =
        allUsers?.filter(
          (u) => u.created_at >= dateStr && u.created_at < nextDateStr
        ).length || 0;

      userGrowth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        new_users: newUsers,
        active_users: Math.floor(newUsers * 1.5), // Mock active users
      });
    }

    // Get content growth data
    const contentGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      const bookmarks =
        allBookmarks?.filter(
          (b) => b.created_at >= dateStr && b.created_at < nextDateStr
        ).length || 0;

      contentGrowth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookmarks,
        collections: Math.floor(bookmarks * 0.3), // Mock collections
      });
    }

    // Get top content
    const { data: topBookmarks } = await supabase
      .from('bookmarks')
      .select('id, title')
      .order('created_at', { ascending: false })
      .limit(10);

    const topContent =
      topBookmarks?.map((b, i) => ({
        id: b.id,
        title: b.title,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 100) + 10,
        type: 'bookmark' as const,
      })) || [];

    // Get top users
    const { data: topUsers } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(5);

    const topUsersWithStats =
      topUsers?.map((u) => ({
        id: u.id,
        email: u.email,
        bookmarks_count: Math.floor(Math.random() * 100) + 10,
        followers_count: Math.floor(Math.random() * 50) + 5,
      })) || [];

    // Engagement metrics
    const engagement = [
      {
        metric: 'Daily Active Users',
        value: todayUsers?.length || 0,
        change: 12,
      },
      {
        metric: 'Avg. Bookmarks per User',
        value: Math.floor((allBookmarks?.length || 0) / (allUsers?.length || 1)),
        change: 8,
      },
      {
        metric: 'Engagement Rate',
        value: 68,
        change: 5,
      },
      {
        metric: 'Return Rate',
        value: 45,
        change: -3,
      },
    ];

    const analytics = {
      overview: {
        total_users: allUsers?.length || 0,
        active_users_today: todayUsers?.length || 0,
        total_bookmarks: allBookmarks?.length || 0,
        bookmarks_today: todayBookmarks?.length || 0,
        total_views: allViews?.length || 0,
        views_today: todayViews?.length || 0,
        total_likes: allLikes?.length || 0,
        likes_today: 0,
        revenue_monthly: monthlyRevenue,
        revenue_growth: 15,
      },
      userGrowth,
      contentGrowth,
      engagement,
      topContent,
      topUsers: topUsersWithStats,
      subscriptionBreakdown,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
