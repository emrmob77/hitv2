import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DollarSign, TrendingUp, Users, Eye, Heart, MessageCircle, Crown, CheckCircle, XCircle, Clock } from 'lucide-react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MonetizationApplicationForm } from '@/components/monetization/application-form';

export const metadata: Metadata = {
  title: 'Creator Monetization',
  description: 'Apply for creator monetization and start earning',
};

export default async function MonetizationPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch monetization application
  const { data: application } = await supabase
    .from('creator_monetization')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Fetch user metrics
  const [followerResult, bookmarkResult, collectionResult] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id),
    supabase.from('bookmarks').select('id, click_count, like_count').eq('user_id', user.id),
    supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const metrics = {
    followers: followerResult.count || 0,
    bookmarks: bookmarkResult.data?.length || 0,
    views: bookmarkResult.data?.reduce((sum, b) => sum + (b.click_count || 0), 0) || 0,
    likes: bookmarkResult.data?.reduce((sum, b) => sum + (b.like_count || 0), 0) || 0,
    collections: collectionResult.count || 0,
  };

  const requirements = {
    followers: { required: 100, current: metrics.followers },
    bookmarks: { required: 20, current: metrics.bookmarks },
    views: { required: 1000, current: metrics.views },
    engagements: { required: 100, current: metrics.likes },
  };

  const getProgress = (current: number, required: number) => Math.min(100, (current / required) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Creator Monetization</h1>
          {application?.status === 'approved' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" />
              Approved
            </span>
          )}
        </div>
        <p className="max-w-2xl text-sm text-neutral-600">
          Start earning from your content through our creator monetization program
        </p>
      </header>

      {/* Application Status */}
      {application && (
        <Alert className={
          application.status === 'approved' ? 'border-green-200 bg-green-50' :
          application.status === 'rejected' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'
        }>
          {application.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {application.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
          {application.status === 'pending' && <Clock className="h-4 w-4 text-blue-600" />}
          <AlertTitle>
            Application {application.status === 'pending' ? 'Pending Review' : application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </AlertTitle>
          <AlertDescription>
            {application.status === 'approved' && `Congratulations! You can now earn revenue from your content. Revenue share: ${application.revenue_share_percentage}%`}
            {application.status === 'rejected' && `${application.rejection_reason || 'Your application was rejected. Please improve your metrics and try again.'}`}
            {application.status === 'pending' && 'Your application is being reviewed by our team. This usually takes 2-3 business days.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.followers}</div>
            <Progress value={getProgress(metrics.followers, 100)} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.followers >= 100 ? '✓ Requirement met' : `${100 - metrics.followers} more needed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bookmarks}</div>
            <Progress value={getProgress(metrics.bookmarks, 20)} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.bookmarks >= 20 ? '✓ Requirement met' : `${20 - metrics.bookmarks} more needed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.views.toLocaleString()}</div>
            <Progress value={getProgress(metrics.views, 1000)} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.views >= 1000 ? '✓ Requirement met' : `${1000 - metrics.views} more needed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagements</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.likes.toLocaleString()}</div>
            <Progress value={getProgress(metrics.likes, 100)} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.likes >= 100 ? '✓ Requirement met' : `${100 - metrics.likes} more needed`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Form or Info */}
      {!application || application.status === 'rejected' ? (
        <MonetizationApplicationForm
          currentMetrics={metrics}
          requirements={requirements}
        />
      ) : application.status === 'approved' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Monetization Benefits
            </CardTitle>
            <CardDescription>
              You're earning {application.revenue_share_percentage}% revenue share
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium text-neutral-900">Revenue Sources</h3>
                <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                  <li>• Sponsored content placements</li>
                  <li>• Brand partnerships</li>
                  <li>• Affiliate commissions</li>
                  <li>• Premium collection views</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium text-neutral-900">Payment Schedule</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Minimum payout: ${application.minimum_payout_amount}
                </p>
                <p className="text-sm text-neutral-600">
                  Payment cycle: Monthly (NET 30)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <a href="/dashboard/monetization/earnings">View Earnings</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/monetization/sponsored">Sponsored Content</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Requirements Info */}
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Requirements</CardTitle>
          <CardDescription>
            Meet these minimum requirements to apply for monetization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Content Requirements</h3>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li className={metrics.bookmarks >= 20 ? 'text-green-600' : ''}>
                  {metrics.bookmarks >= 20 ? '✓' : '○'} At least 20 quality bookmarks
                </li>
                <li className={metrics.collections >= 1 ? 'text-green-600' : ''}>
                  {metrics.collections >= 1 ? '✓' : '○'} At least 1 collection
                </li>
                <li className={metrics.views >= 1000 ? 'text-green-600' : ''}>
                  {metrics.views >= 1000 ? '✓' : '○'} 1,000+ total content views
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Community Requirements</h3>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li className={metrics.followers >= 100 ? 'text-green-600' : ''}>
                  {metrics.followers >= 100 ? '✓' : '○'} 100+ followers
                </li>
                <li className={metrics.likes >= 100 ? 'text-green-600' : ''}>
                  {metrics.likes >= 100 ? '✓' : '○'} 100+ total engagements
                </li>
                <li>✓ Account older than 30 days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
