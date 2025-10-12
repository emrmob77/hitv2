import { Metadata } from 'next';
import { format } from 'date-fns';
import { BookmarkIcon, FolderIcon, HeartIcon, EyeIcon, UsersIcon, TrendingUpIcon, LinkIcon, FileTextIcon, Activity as ActivityIcon, Globe as GlobeIcon } from 'lucide-react';

import { ClickTrendChart } from '@/components/analytics/click-trend-chart';
import { DeviceBreakdownChart } from '@/components/analytics/device-breakdown-chart';
import { RealtimeAnalyticsFeed } from '@/components/analytics/realtime-activity';
import { TopLinksChart } from '@/components/analytics/top-links-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/analytics/summary';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Analytics',
};

type AnalyticsData = AnalyticsSummary;

const emptyAnalytics: AnalyticsData = {
  bookmarks: {
    total: 0,
    public: 0,
    private: 0,
    totalLikes: 0,
    totalViews: 0,
  },
  collections: {
    total: 0,
    totalBookmarks: 0,
    totalFollowers: 0,
    totalViews: 0,
  },
  posts: {
    total: 0,
    totalViews: 0,
    totalLikes: 0,
  },
  linkGroups: {
    total: 0,
    totalViews: 0,
    totalClicks: 0,
  },
  social: {
    followers: 0,
    following: 0,
    totalLikesReceived: 0,
    username: '',
    displayName: '',
  },
  traffic: {
    currentViews: 0,
    previousViews: 0,
    change: 0,
    dailyViews: [],
    deviceBreakdown: [],
    geoDistribution: [],
    topReferrers: [],
    recentPageViews: [],
    ownedContentIds: {
      bookmark: [],
      collection: [],
      link_group: [],
      profile: '',
    },
    contentMeta: {
      bookmark: [],
      collection: [],
      link_group: [],
      profile: null,
    },
  },
};

export default async function AnalyticsPage() {
  const analytics = await fetchAnalytics();
  const profile = await fetchUserProfile();

  const trendData = analytics.traffic.dailyViews.map((entry) => ({
    date: format(new Date(`${entry.date}T00:00:00Z`), 'MMM d'),
    clicks: entry.value,
  }));

  const deviceData = analytics.traffic.deviceBreakdown;
  const referrerData = analytics.traffic.topReferrers.map((item) => ({
    name: item.source,
    clicks: item.value,
  }));
  const geoData = analytics.traffic.geoDistribution;
  const geoMax = geoData.reduce((max, entry) => Math.max(max, entry.value), 0);
  const trafficChangePositive = analytics.traffic.change >= 0;
  const trafficChangeValue = Math.abs(analytics.traffic.change).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Analytics Dashboard</h1>
          <p className="text-sm text-neutral-600">Track your performance and engagement across HitTags.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/api/analytics/export?format=csv" download>
              Export CSV
            </a>
          </Button>
          <Button asChild>
            <a href="/api/analytics/export?format=pdf" download>
              Export PDF
            </a>
          </Button>
        </div>
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

      {/* Charts Section */}
      {profile?.is_premium && (
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <h2 className="text-2xl font-semibold">Performance Insights</h2>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
                  7-day Traffic
                </CardTitle>
                <CardDescription>Comparing the last 7 days with the previous week.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-semibold text-neutral-900">{analytics.traffic.currentViews}</div>
                  <p className="text-sm text-neutral-500">Views in the last 7 days</p>
                </div>
                <div className={`flex items-center gap-2 text-sm ${trafficChangePositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {trafficChangePositive ? '▲' : '▼'} {trafficChangeValue}%
                  <span className="text-neutral-500">
                    vs previous period ({analytics.traffic.previousViews})
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4 text-neutral-500" />
                  Live Engagement
                </CardTitle>
                <CardDescription>Recently recorded views across your public surfaces.</CardDescription>
              </CardHeader>
              <CardContent>
                <RealtimeAnalyticsFeed
                  initialEvents={analytics.traffic.recentPageViews}
                  ownedContentIds={analytics.traffic.ownedContentIds}
                  contentMeta={analytics.traffic.contentMeta}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Trend (Last 14 Days)</CardTitle>
              <CardDescription>Daily views across bookmarks, collections, and link groups.</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <p className="text-sm text-neutral-500">Traffic data will appear once you start receiving views.</p>
              ) : (
                <ClickTrendChart data={trendData} />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Visitor distribution by device type.</CardDescription>
              </CardHeader>
              <CardContent>
                {deviceData.length === 0 ? (
                  <p className="text-sm text-neutral-500">No device data yet.</p>
                ) : (
                  <DeviceBreakdownChart data={deviceData} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Traffic Sources</CardTitle>
                <CardDescription>Referrers sending the most visits.</CardDescription>
              </CardHeader>
              <CardContent>
                {referrerData.length === 0 ? (
                  <p className="text-sm text-neutral-500">No referral data yet.</p>
                ) : (
                  <TopLinksChart data={referrerData} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4 text-neutral-500" />
                  Top Regions
                </CardTitle>
                <CardDescription>Where your audience viewed your content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {geoData.length === 0 ? (
                  <p className="text-sm text-neutral-500">No regional data yet.</p>
                ) : (
                  geoData.slice(0, 6).map((item) => (
                    <div key={item.country} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.country}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-100">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${geoMax > 0 ? Math.max((item.value / geoMax) * 100, 6) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
    return emptyAnalytics;
  }

  return getAnalyticsSummary(supabase, user.id);
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
