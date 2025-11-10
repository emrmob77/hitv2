/**
 * Admin Analytics Page
 *
 * Comprehensive analytics dashboard for admins
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Bookmark,
  Eye,
  Heart,
  DollarSign,
  Activity,
  Globe,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  overview: {
    total_users: number;
    active_users_today: number;
    total_bookmarks: number;
    bookmarks_today: number;
    total_views: number;
    views_today: number;
    total_likes: number;
    likes_today: number;
    revenue_monthly: number;
    revenue_growth: number;
  };
  userGrowth: {
    date: string;
    new_users: number;
    active_users: number;
  }[];
  contentGrowth: {
    date: string;
    bookmarks: number;
    collections: number;
  }[];
  engagement: {
    metric: string;
    value: number;
    change: number;
  }[];
  topContent: {
    id: string;
    title: string;
    views: number;
    likes: number;
    type: 'bookmark' | 'collection';
  }[];
  topUsers: {
    id: string;
    email: string;
    bookmarks_count: number;
    followers_count: number;
  }[];
  subscriptionBreakdown: {
    tier: string;
    count: number;
    revenue: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (error) {
      toast.error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="container max-w-7xl py-8">
        <p className="text-center text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const { overview } = analytics;

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Comprehensive analytics and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_users.toLocaleString()}</div>
            <p className="mt-1 text-xs text-green-600">
              +{overview.active_users_today} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Total Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_bookmarks.toLocaleString()}</div>
            <p className="mt-1 text-xs text-green-600">
              +{overview.bookmarks_today} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_views.toLocaleString()}</div>
            <p className="mt-1 text-xs text-green-600">
              +{overview.views_today} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${overview.revenue_monthly.toLocaleString()}
            </div>
            <p className={`mt-1 text-xs ${overview.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overview.revenue_growth >= 0 ? '+' : ''}{overview.revenue_growth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Analytics Views */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">
            <TrendingUp className="mr-2 h-4 w-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Activity className="mr-2 h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="mr-2 h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="top-content">
            <BarChart3 className="mr-2 h-4 w-4" />
            Top Content
          </TabsTrigger>
        </TabsList>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.userGrowth.slice(0, 7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                      <div className="flex gap-4">
                        <span className="text-sm">
                          <span className="font-medium text-green-600">{item.new_users}</span> new
                        </span>
                        <span className="text-sm">
                          <span className="font-medium text-blue-600">{item.active_users}</span> active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Growth</CardTitle>
                <CardDescription>Bookmarks and collections created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.contentGrowth.slice(0, 7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                      <div className="flex gap-4">
                        <span className="text-sm">
                          <span className="font-medium text-purple-600">{item.bookmarks}</span> bookmarks
                        </span>
                        <span className="text-sm">
                          <span className="font-medium text-amber-600">{item.collections}</span> collections
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User engagement and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.engagement.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.metric}</p>
                        <p className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change}% change
                        </p>
                      </div>
                      <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Users</CardTitle>
                <CardDescription>Most active users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topUsers.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">#{index + 1}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.bookmarks_count} bookmarks</p>
                        <p className="text-xs text-muted-foreground">
                          {user.followers_count} followers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Revenue by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.subscriptionBreakdown.map((sub, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium capitalize">{sub.tier}</p>
                          <p className="text-xs text-muted-foreground">{sub.count} subscribers</p>
                        </div>
                        <p className="text-lg font-bold">${sub.revenue.toLocaleString()}</p>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            sub.tier === 'premium'
                              ? 'bg-purple-600'
                              : sub.tier === 'pro'
                              ? 'bg-blue-600'
                              : 'bg-gray-400'
                          }`}
                          style={{
                            width: `${
                              (sub.revenue /
                                analytics.subscriptionBreakdown.reduce((acc, s) => acc + s.revenue, 0)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">Total MRR</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      ${overview.revenue_monthly.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {overview.revenue_growth >= 0 ? '+' : ''}{overview.revenue_growth}% growth
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ARR (Projected)</span>
                      <span className="font-medium">
                        ${(overview.revenue_monthly * 12).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ARPU</span>
                      <span className="font-medium">
                        ${(overview.revenue_monthly / overview.total_users).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="top-content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most viewed and liked content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topContent.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {item.likes.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
