import { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  TrendingUpIcon,
  MousePointerClickIcon,
  DollarSignIcon,
  PercentIcon,
} from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Affiliate Analytics • HitTags',
  description: 'Detailed analytics for your affiliate links',
};

export default async function AffiliateAnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all affiliate links
  const { data: affiliateLinks } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('user_id', user.id);

  // Fetch all clicks with date grouping
  const { data: clicksData } = await supabase
    .from('affiliate_clicks')
    .select('id, affiliate_link_id, converted, conversion_value, created_at')
    .in(
      'affiliate_link_id',
      affiliateLinks?.map((l) => l.id) || []
    )
    .order('created_at', { ascending: false });

  // Calculate metrics
  const totalClicks = clicksData?.length || 0;
  const totalConversions = clicksData?.filter((c) => c.converted).length || 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const totalEarnings =
    affiliateLinks?.reduce((sum, link) => sum + (link.total_earnings || 0), 0) || 0;

  // Group clicks by date (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const clicksByDate = last30Days.map((date) => {
    const count = clicksData?.filter((c) => c.created_at.startsWith(date)).length || 0;
    const conversions =
      clicksData?.filter((c) => c.created_at.startsWith(date) && c.converted).length || 0;
    return { date, clicks: count, conversions };
  });

  // Top performing links
  const topLinks = affiliateLinks
    ?.map((link) => ({
      ...link,
      clicks: clicksData?.filter((c) => c.affiliate_link_id === link.id).length || 0,
      conversions:
        clicksData?.filter((c) => c.affiliate_link_id === link.id && c.converted).length || 0,
    }))
    .sort((a, b) => b.total_earnings - a.total_earnings)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/affiliate">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Affiliate Links
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Analytics</h1>
        <p className="text-neutral-600">
          Track your performance and optimize your affiliate strategy
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClickIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-neutral-500">All-time clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-neutral-500">Successful conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <PercentIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-neutral-500">CVR across all links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-neutral-500">All-time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Click Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Click Trends (Last 30 Days)</CardTitle>
          <CardDescription>Daily click and conversion activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clicksByDate
              .filter((day) => day.clicks > 0)
              .reverse()
              .slice(0, 10)
              .map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-24 text-xs text-neutral-600">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 rounded bg-blue-500"
                        style={{ width: `${(day.clicks / Math.max(...clicksByDate.map((d) => d.clicks))) * 100}%` }}
                      />
                      <span className="text-sm font-medium">{day.clicks} clicks</span>
                    </div>
                    {day.conversions > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="h-4 rounded bg-green-500"
                          style={{
                            width: `${(day.conversions / Math.max(...clicksByDate.map((d) => d.conversions))) * 100}%`,
                          }}
                        />
                        <span className="text-xs text-neutral-600">{day.conversions} conversions</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Links</CardTitle>
          <CardDescription>Your highest earning affiliate links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLinks && topLinks.length > 0 ? (
              topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{link.title || 'Untitled'}</p>
                      <p className="text-xs text-neutral-600">
                        {link.clicks} clicks • {link.conversions} conversions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${link.total_earnings.toFixed(2)}</p>
                    <p className="text-xs text-neutral-600">
                      {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}% CVR
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-neutral-500">
                No data available yet. Start generating clicks to see analytics.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
