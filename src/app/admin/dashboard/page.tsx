import { Metadata } from 'next';
import { Users, Bookmark, TrendingUp, DollarSign, Bell, Download, Mail, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch statistics
  const [
    { count: totalUsers },
    { count: totalBookmarks },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id, username, display_name, email, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Mock data for demonstration
  const stats = {
    totalUsers: totalUsers || 0,
    totalBookmarks: totalBookmarks || 0,
    activeSessions: 0, // This would require session tracking
    revenue: 0, // This would require Stripe integration
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Dashboard Overview</h1>
        <p className="text-neutral-600">Monitor your platform performance and manage operations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-neutral-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookmarks.toLocaleString()}</div>
            <p className="text-xs text-neutral-600">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions.toLocaleString()}</div>
            <p className="text-xs text-neutral-600">-3% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-neutral-600">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* User Activity Chart */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Last 7 days activity</CardDescription>
            </div>
            <select className="rounded-lg border border-neutral-300 px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-100">
              <span className="text-neutral-500">Activity Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers?.map((user) => {
                const avatarUrl =
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${user.id}`;
                const timeAgo = new Date(user.created_at).toLocaleDateString();

                return (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUrl}
                        alt={user.username}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-xs text-neutral-600">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Moderation, System Health, Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Content Moderation */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Content Moderation</CardTitle>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
              3 pending
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">Reported Bookmark</span>
                  <span className="text-xs text-neutral-600">High Priority</span>
                </div>
                <p className="mb-3 text-xs text-neutral-600">Inappropriate content reported by user</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="default">
                    Remove
                  </Button>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">Spam Report</span>
                  <span className="text-xs text-neutral-600">Medium Priority</span>
                </div>
                <p className="mb-3 text-xs text-neutral-600">Multiple spam bookmarks detected</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="default">
                    Remove
                  </Button>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Server Status</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-neutral-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-neutral-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">API Response</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm text-neutral-600">Slow</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Storage</span>
                <span className="text-sm text-neutral-600">78% used</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="default">
                <Users className="mr-2 h-4 w-4" />
                Create Admin User
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Announcement
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
