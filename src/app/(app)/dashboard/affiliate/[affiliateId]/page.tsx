import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSignIcon,
  MousePointerClickIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affiliate Link Details • HitTags',
};

type PageParams = {
  affiliateId: string;
};

interface AffiliateLinkDetail {
  id: string;
  bookmark_id: string;
  original_url: string;
  affiliate_url: string;
  commission_rate: number;
  total_clicks: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
}

export default async function AffiliateLinkDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { affiliateId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch affiliate link
  const { data: affiliateLink, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('id', affiliateId)
    .eq('user_id', user.id)
    .single();

  if (error || !affiliateLink) {
    console.error('Affiliate link fetch error:', error);
    notFound();
  }

  // Fetch bookmark
  const { data: bookmark } = await supabase
    .from('bookmarks')
    .select('id, title, url, description')
    .eq('id', affiliateLink.bookmark_id)
    .single();

  const link = affiliateLink as AffiliateLinkDetail;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/affiliate">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Affiliate Links
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {bookmark?.title || 'Affiliate Link Details'}
          </h1>
          <p className="text-neutral-600">
            Track performance and manage your affiliate link
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/affiliate/${affiliateId}/edit`}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClickIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{link.total_clicks || 0}</div>
            <p className="text-xs text-neutral-500">
              Lifetime clicks on this link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(link.total_earnings || 0).toFixed(2)}</div>
            <p className="text-xs text-neutral-500">
              Commission earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{link.commission_rate}%</div>
            <p className="text-xs text-neutral-500">
              Per conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Link Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Link Information</CardTitle>
            <CardDescription>
              Details about your affiliate tracking link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium text-neutral-700">Affiliate URL</p>
              <a
                href={link.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 break-all text-sm text-blue-600 hover:underline"
              >
                {link.affiliate_url}
                <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-neutral-700">Original URL</p>
              <a
                href={link.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 break-all text-sm text-neutral-600 hover:underline"
              >
                {link.original_url}
                <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <CalendarIcon className="h-3 w-3" />
              <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {bookmark && (
          <Card>
            <CardHeader>
              <CardTitle>Associated Bookmark</CardTitle>
              <CardDescription>
                The bookmark this affiliate link is attached to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-neutral-700">Title</p>
                <p className="text-sm text-neutral-900">{bookmark.title}</p>
              </div>

              {bookmark.description && (
                <div>
                  <p className="mb-1 text-sm font-medium text-neutral-700">Description</p>
                  <p className="text-sm text-neutral-600">{bookmark.description}</p>
                </div>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/bookmarks/${bookmark.id}`}>
                  View Bookmark Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <TrendingUpIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="mb-1 text-sm font-medium text-blue-900">
                Track Your Performance
              </p>
              <p className="text-xs text-blue-700">
                Click and earning data is updated in real-time. Check back regularly to monitor
                your affiliate link performance and optimize your content strategy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
