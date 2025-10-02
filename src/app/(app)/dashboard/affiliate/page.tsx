import { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSignIcon,
  MousePointerClickIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
  PlusIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affiliate Links • HitTags',
  description: 'Manage your affiliate links and track earnings',
};

interface AffiliateLink {
  id: string;
  bookmark_id: string;
  original_url: string;
  affiliate_url: string;
  commission_rate: number;
  total_clicks: number;
  total_earnings: number;
  created_at: string;
  bookmark?: {
    title: string;
    url: string;
  };
}

export default async function AffiliatePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please login</div>;
  }

  // Check if user is premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, subscription_tier')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.is_premium || profile?.subscription_tier !== 'free';

  // Fetch affiliate links
  const { data: affiliateLinksRaw } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch bookmarks separately
  const affiliateLinks = affiliateLinksRaw ? await Promise.all(
    affiliateLinksRaw.map(async (link) => {
      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('title, url')
        .eq('id', link.bookmark_id)
        .single();

      return {
        ...link,
        bookmark: bookmark || null,
      };
    })
  ) : [];

  // Calculate totals
  const totalClicks = affiliateLinks?.reduce((sum, link) => sum + (link.total_clicks || 0), 0) || 0;
  const totalEarnings = affiliateLinks?.reduce((sum, link) => sum + (link.total_earnings || 0), 0) || 0;
  const averageCommission = affiliateLinks?.length
    ? affiliateLinks.reduce((sum, link) => sum + link.commission_rate, 0) / affiliateLinks.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Links</h1>
          <p className="text-neutral-600">
            Track your affiliate links and earnings
          </p>
        </div>
        {isPremium && (
          <Button asChild>
            <Link href="/dashboard/affiliate/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Affiliate Link
            </Link>
          </Button>
        )}
      </div>

      {/* Premium Gate */}
      {!isPremium && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-blue-600" />
              Premium Feature
            </CardTitle>
            <CardDescription>
              Upgrade to Pro to unlock affiliate link tracking and start earning commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {isPremium && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClickIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
              <p className="text-xs text-neutral-500">
                Across all affiliate links
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-neutral-500">
                Commission earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Commission</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCommission.toFixed(1)}%</div>
              <p className="text-xs text-neutral-500">
                Average commission rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Affiliate Links List */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Your Affiliate Links</CardTitle>
            <CardDescription>
              {affiliateLinks?.length || 0} active affiliate links
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!affiliateLinks || affiliateLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSignIcon className="mb-4 h-12 w-12 text-neutral-400" />
                <h3 className="mb-2 text-lg font-semibold">No affiliate links yet</h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Start monetizing your bookmarks by adding affiliate links
                </p>
                <Button asChild>
                  <Link href="/dashboard/affiliate/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Your First Affiliate Link
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {affiliateLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-neutral-50"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-neutral-900">
                        {link.bookmark?.title || 'Untitled'}
                      </h4>
                      <a
                        href={link.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        {link.affiliate_url.substring(0, 60)}...
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                      <div className="mt-2 flex gap-4 text-xs text-neutral-600">
                        <span>{link.total_clicks || 0} clicks</span>
                        <span>•</span>
                        <span>{link.commission_rate}% commission</span>
                        <span>•</span>
                        <span className="font-medium text-green-600">
                          ${(link.total_earnings || 0).toFixed(2)} earned
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/affiliate/${link.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
