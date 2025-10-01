import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkIcon, FolderIcon, HeartIcon, EyeIcon, UsersIcon, TrendingUpIcon, LinkIcon, FileTextIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics • HitTags',
};

interface AnalyticsData {
  bookmarks: {
    total: number;
    public: number;
    private: number;
    totalLikes: number;
    totalViews: number;
  };
  collections: {
    total: number;
    totalBookmarks: number;
    totalFollowers: number;
  };
  posts: {
    total: number;
    totalViews: number;
    totalLikes: number;
  };
  linkGroups: {
    total: number;
    totalViews: number;
    totalClicks: number;
  };
  social: {
    followers: number;
    following: number;
    totalLikesReceived: number;
  };
}

export default async function AnalyticsPage() {
  const analytics = await fetchAnalytics();
  const profile = await fetchUserProfile();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-7xl">
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Analytics Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Track your performance and engagement across HitTags.
        </p>
      </header>

      {/* Overview Stats */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Bookmarks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
              <BookmarkIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.bookmarks.total}</div>
              <p className="text-xs text-neutral-500">
                {analytics.bookmarks.public} public, {analytics.bookmarks.private} private
              </p>
            </CardContent>
          </Card>

          {/* Total Collections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <FolderIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.collections.total}</div>
              <p className="text-xs text-neutral-500">
                {analytics.collections.totalBookmarks} total bookmarks
              </p>
            </CardContent>
          </Card>

          {/* Followers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <UsersIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.social.followers}</div>
              <p className="text-xs text-neutral-500">
                Following {analytics.social.following}
              </p>
            </CardContent>
          </Card>

          {/* Total Engagement */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <HeartIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.social.totalLikesReceived}</div>
              <p className="text-xs text-neutral-500">
                Across all content
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bookmarks Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Bookmark Performance</CardTitle>
              <CardDescription>Engagement metrics for your bookmarks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Total Views</span>
                </div>
                <span className="font-semibold">{analytics.bookmarks.totalViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Total Likes</span>
                </div>
                <span className="font-semibold">{analytics.bookmarks.totalLikes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Avg. Likes per Bookmark</span>
                </div>
                <span className="font-semibold">
                  {analytics.bookmarks.total > 0
                    ? (analytics.bookmarks.totalLikes / analytics.bookmarks.total).toFixed(1)
                    : '0'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Collections Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Performance</CardTitle>
              <CardDescription>Your curated collections stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Total Collections</span>
                </div>
                <span className="font-semibold">{analytics.collections.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookmarkIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Bookmarks in Collections</span>
                </div>
                <span className="font-semibold">{analytics.collections.totalBookmarks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Collection Followers</span>
                </div>
                <span className="font-semibold">{analytics.collections.totalFollowers}</span>
              </div>
            </CardContent>
          </Card>

          {/* Premium Posts Analytics */}
          {profile?.is_premium && (
            <Card>
              <CardHeader>
                <CardTitle>Premium Posts</CardTitle>
                <CardDescription>Exclusive content performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">Total Posts</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">Total Views</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.totalViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">Total Likes</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.totalLikes}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Link Groups Analytics */}
          {profile?.is_premium && (
            <Card>
              <CardHeader>
                <CardTitle>Link Groups</CardTitle>
                <CardDescription>Your link pages performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">Total Link Groups</span>
                  </div>
                  <span className="font-semibold">{analytics.linkGroups.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">Total Views</span>
                  </div>
                  <span className="font-semibold">{analytics.linkGroups.totalViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">Total Clicks</span>
                  </div>
                  <span className="font-semibold">{analytics.linkGroups.totalClicks}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {!profile?.is_premium && (
        <div className="mx-auto w-full max-w-7xl">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-blue-900">Unlock Advanced Analytics</h3>
              <p className="mb-6 text-blue-700">
                Upgrade to Pro or Enterprise to access detailed analytics, export data, and get insights into your content performance.
              </p>
              <ul className="mb-6 space-y-2 text-left text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Real-time engagement metrics
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Geographic analytics and traffic sources
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Export data in CSV/PDF formats
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Affiliate link performance tracking
                </li>
              </ul>
              <a
                href="/pricing"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Upgrade Now
              </a>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      bookmarks: { total: 0, public: 0, private: 0, totalLikes: 0, totalViews: 0 },
      collections: { total: 0, totalBookmarks: 0, totalFollowers: 0 },
      posts: { total: 0, totalViews: 0, totalLikes: 0 },
      linkGroups: { total: 0, totalViews: 0, totalClicks: 0 },
      social: { followers: 0, following: 0, totalLikesReceived: 0 },
    };
  }

  // Fetch bookmarks stats
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('privacy_level, like_count')
    .eq('user_id', user.id);

  const bookmarkStats = {
    total: bookmarks?.length || 0,
    public: bookmarks?.filter(b => b.privacy_level === 'public').length || 0,
    private: bookmarks?.filter(b => b.privacy_level === 'private').length || 0,
    totalLikes: bookmarks?.reduce((sum, b) => sum + (b.like_count || 0), 0) || 0,
    totalViews: 0, // Would come from page_views table
  };

  // Fetch collections stats
  const { data: collections } = await supabase
    .from('collections')
    .select('bookmark_count, follower_count')
    .eq('user_id', user.id);

  const collectionStats = {
    total: collections?.length || 0,
    totalBookmarks: collections?.reduce((sum, c) => sum + (c.bookmark_count || 0), 0) || 0,
    totalFollowers: collections?.reduce((sum, c) => sum + (c.follower_count || 0), 0) || 0,
  };

  // Fetch posts stats
  const { data: posts } = await supabase
    .from('exclusive_posts')
    .select('view_count, like_count')
    .eq('user_id', user.id);

  const postStats = {
    total: posts?.length || 0,
    totalViews: posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0,
    totalLikes: posts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0,
  };

  // Fetch link groups stats
  const { data: linkGroups } = await supabase
    .from('link_groups')
    .select('view_count, click_count')
    .eq('user_id', user.id);

  const linkGroupStats = {
    total: linkGroups?.length || 0,
    totalViews: linkGroups?.reduce((sum, lg) => sum + (lg.view_count || 0), 0) || 0,
    totalClicks: linkGroups?.reduce((sum, lg) => sum + (lg.click_count || 0), 0) || 0,
  };

  // Fetch social stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('follower_count, following_count, total_likes_received')
    .eq('id', user.id)
    .single();

  const socialStats = {
    followers: profile?.follower_count || 0,
    following: profile?.following_count || 0,
    totalLikesReceived: profile?.total_likes_received || 0,
  };

  return {
    bookmarks: bookmarkStats,
    collections: collectionStats,
    posts: postStats,
    linkGroups: linkGroupStats,
    social: socialStats,
  };
}

async function fetchUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('is_premium, subscription_tier')
    .eq('id', user.id)
    .single();

  return data;
}
