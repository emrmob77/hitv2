import Link from 'next/link';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  TrendingUpIcon,
  PlusIcon,
  Crown,
  Sparkles,
  Link2,
  BarChart3
} from 'lucide-react';
import { UsageLimitsCard } from '@/components/dashboard/usage-limits-card';
import { FeatureGate } from '@/lib/features/feature-gate';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const EMPTY_DASHBOARD_STATS = {
  bookmarkCount: 0,
  publicBookmarks: 0,
  privateBookmarks: 0,
  collectionCount: 0,
  publicCollections: 0,
  tagCount: 0,
  totalViews: 0,
} as const;

export default async function DashboardPage() {
  const stats = await fetchDashboardStats();
  const recentBookmarks = await fetchRecentBookmarks();
  const userProfile = await fetchUserProfile();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Welcome back! Here&apos;s an overview of your activity.
        </p>
      </header>

      {/* Usage Limits Card */}
      {userProfile && (
        <UsageLimitsCard
          tier={userProfile.subscription_tier}
          bookmarkCount={stats.bookmarkCount}
          collectionCount={stats.collectionCount}
        />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookmarkCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publicBookmarks} public, {stats.privateBookmarks} private
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publicCollections} public
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Used</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tagCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all bookmarks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              On public bookmarks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Upgrade Card (for free users) */}
      {userProfile && userProfile.subscription_tier === 'free' && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  Upgrade to Pro
                </CardTitle>
                <CardDescription className="mt-1">
                  Unlock unlimited bookmarks, premium features, and more
                </CardDescription>
              </div>
              <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
                <Link href="/pricing">
                  <Sparkles className="mr-2 h-4 w-4" />
                  View Plans
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-2">
                <BookmarkIcon className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Unlimited</p>
                  <p className="text-xs text-neutral-600">Bookmarks & Collections</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Link2 className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Link Groups</p>
                  <p className="text-xs text-neutral-600">Linktree-style pages</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Analytics</p>
                  <p className="text-xs text-neutral-600">Advanced insights</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Premium Posts</p>
                  <p className="text-xs text-neutral-600">URL-free content</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/bookmarks/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Bookmark
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/collections/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Collection
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/bookmarks">
                View All Bookmarks
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/collections">
                View All Collections
              </Link>
            </Button>
            {userProfile && userProfile.subscription_tier !== 'free' && (
              <>
                <Button asChild variant="outline">
                  <Link href="/dashboard/link-groups">
                    <Link2 className="mr-2 h-4 w-4" />
                    Link Groups
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/affiliate">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Affiliate Links
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookmarks */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookmarks</CardTitle>
            <CardDescription>Your latest saved links</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookmarks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No bookmarks yet. Start by adding your first bookmark!
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookmarks.map((bookmark) => (
                  <Link
                    key={bookmark.id}
                    href={`/dashboard/bookmarks/${bookmark.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-neutral-900 line-clamp-1">
                          {bookmark.title}
                        </h3>
                        {bookmark.description && (
                          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                            {bookmark.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-neutral-500">
                          {bookmark.domain} • {new Date(bookmark.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {bookmark.favicon_url && (
                        <img
                          src={bookmark.favicon_url}
                          alt=""
                          className="h-8 w-8 rounded"
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function fetchDashboardStats() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('No user found');
    return EMPTY_DASHBOARD_STATS;
  }

  console.log('User ID:', user.id);

  // Fetch bookmark stats
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('id, privacy_level')
    .eq('user_id', user.id);

  if (bookmarksError) {
    console.error('Bookmarks fetch error:', bookmarksError?.message ?? bookmarksError);
    return EMPTY_DASHBOARD_STATS;
  }
  console.log('Bookmarks fetched:', bookmarks?.length || 0);

  const bookmarkCount = bookmarks?.length || 0;
  const publicBookmarks = bookmarks?.filter(b => b.privacy_level === 'public').length || 0;
  const privateBookmarks = bookmarks?.filter(b => b.privacy_level === 'private').length || 0;
  const totalViews = 0; // Using click_count instead: bookmarks don't have view_count column

  // Fetch collection stats
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select('privacy_level')
    .eq('user_id', user.id);

  if (collectionsError) {
    console.error('Collections fetch error:', collectionsError?.message ?? collectionsError);
  }
  console.log('Collections fetched:', collections?.length || 0);

  const collectionCount = collections?.length || 0;
  const publicCollections = collections?.filter(c => c.privacy_level === 'public').length || 0;

  // Fetch tag count (unique tags used)
  let tagCount = 0;
  const bookmarkIds = bookmarks?.map(b => b.id).filter(Boolean) || [];
  console.log('Bookmark IDs for tag fetch:', bookmarkIds.length);

  if (bookmarkIds.length > 0) {
    const { data: bookmarkTags, error: bookmarkTagsError } = await supabase
      .from('bookmark_tags')
      .select('tag_id')
      .in('bookmark_id', bookmarkIds);

    if (bookmarkTagsError) {
      console.error('Bookmark tags fetch error:', bookmarkTagsError?.message ?? bookmarkTagsError);
    } else {
      console.log('Bookmark tags fetched:', bookmarkTags?.length || 0);
      tagCount = new Set(bookmarkTags?.map(bt => bt.tag_id) || []).size;
      console.log('Unique tag count:', tagCount);
    }
  } else {
    console.log('No bookmarks found, skipping tag fetch');
  }

  return {
    bookmarkCount,
    publicBookmarks,
    privateBookmarks,
    collectionCount,
    publicCollections,
    tagCount,
    totalViews,
  };
}

async function fetchRecentBookmarks() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('bookmarks')
    .select('id, title, description, domain, created_at, favicon_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

async function fetchUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, is_premium')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  // Determine tier from profile
  const featureGate = FeatureGate.fromProfile(profile);

  return {
    subscription_tier: featureGate.getTier(),
  };
}
