import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AlertCircle, Crown } from 'lucide-react';

import { BookmarkCreateForm } from '@/components/bookmarks/bookmark-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FeatureGate } from '@/lib/features/feature-gate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Add Bookmark',
};

export default async function NewBookmarkPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile with subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, is_premium, bookmark_count')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/dashboard');
  }

  // Check feature gate
  const featureGate = FeatureGate.fromProfile(profile);
  const currentCount = profile.bookmark_count || 0;
  const { allowed, limit, remaining } = featureGate.canCreate('bookmarks', currentCount);

  return (
    <div className="space-y-6 pt-2 pb-12 lg:pt-0">
      <nav className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/dashboard" className="font-medium text-neutral-500 transition hover:text-neutral-700">
          Dashboard
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="font-semibold text-neutral-900">Add bookmark</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-900">Add new bookmark</h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          Capture must-read links, enrich them with metadata, and ship them into collections your audience will love.
        </p>
      </header>

      {/* Limit Warning */}
      {!featureGate.isPremium() && remaining <= 5 && remaining > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Approaching limit</AlertTitle>
          <AlertDescription>
            You have {remaining} bookmark{remaining !== 1 ? 's' : ''} remaining on your free plan.
            <Link href="/pricing" className="ml-1 font-medium underline">
              Upgrade to Pro
            </Link>{' '}
            for unlimited bookmarks.
          </AlertDescription>
        </Alert>
      )}

      {/* Limit Reached - Block Access */}
      {!allowed ? (
        <Alert variant="destructive">
          <Crown className="h-4 w-4" />
          <AlertTitle>Bookmark limit reached</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{featureGate.getLimitMessage('bookmarks')}</p>
            <div className="flex gap-3">
              <Button asChild size="sm">
                <Link href="/pricing">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/bookmarks">View My Bookmarks</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <BookmarkCreateForm />
      )}
    </div>
  );
}
