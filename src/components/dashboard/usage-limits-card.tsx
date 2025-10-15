import Link from 'next/link';
import { Crown, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FeatureGate, SubscriptionTier } from '@/lib/features/feature-gate';

interface UsageLimitsCardProps {
  tier: SubscriptionTier;
  bookmarkCount: number;
  collectionCount: number;
}

export function UsageLimitsCard({ tier, bookmarkCount, collectionCount }: UsageLimitsCardProps) {
  const featureGate = new FeatureGate(tier);
  const limits = featureGate.getLimits();

  const bookmarkLimit = featureGate.canCreate('bookmarks', bookmarkCount);
  const collectionLimit = featureGate.canCreate('collections', collectionCount);

  // Calculate usage percentage for progress bars
  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const bookmarkPercentage = getUsagePercentage(bookmarkCount, limits.bookmarks);
  const collectionPercentage = getUsagePercentage(collectionCount, limits.collections);

  // Determine alert status
  const isApproachingLimit =
    (bookmarkLimit.remaining <= 5 && bookmarkLimit.remaining > 0) ||
    (collectionLimit.remaining <= 2 && collectionLimit.remaining > 0);

  const hasReachedLimit = !bookmarkLimit.allowed || !collectionLimit.allowed;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Usage & Limits
              {tier !== 'free' && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  tier === 'pro'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  <Crown className="h-3 w-3" />
                  {FeatureGate.getTierDisplayName(tier)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {tier === 'free'
                ? 'Track your usage against free plan limits'
                : 'You have unlimited access to premium features'}
            </CardDescription>
          </div>
          {tier === 'free' && (
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert for approaching or reached limits */}
        {tier === 'free' && (isApproachingLimit || hasReachedLimit) && (
          <div className={`flex items-start gap-3 rounded-lg border p-3 ${
            hasReachedLimit
              ? 'border-red-200 bg-red-50'
              : 'border-amber-200 bg-amber-50'
          }`}>
            <AlertCircle className={`h-4 w-4 mt-0.5 ${
              hasReachedLimit ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1 space-y-1">
              <p className={`text-sm font-medium ${
                hasReachedLimit ? 'text-red-900' : 'text-amber-900'
              }`}>
                {hasReachedLimit ? 'Limit reached' : 'Approaching limit'}
              </p>
              <p className={`text-xs ${
                hasReachedLimit ? 'text-red-700' : 'text-amber-700'
              }`}>
                {hasReachedLimit
                  ? 'Upgrade to Pro for unlimited bookmarks and collections'
                  : 'Consider upgrading to avoid interruptions'}
              </p>
            </div>
          </div>
        )}

        {/* Bookmarks Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">Bookmarks</span>
            <span className="text-neutral-600">
              {limits.bookmarks === -1
                ? `${bookmarkCount} (Unlimited)`
                : `${bookmarkCount} / ${limits.bookmarks}`}
            </span>
          </div>
          {limits.bookmarks !== -1 && (
            <>
              <Progress value={bookmarkPercentage} className="h-2" />
              <p className="text-xs text-neutral-500">
                {bookmarkLimit.remaining} remaining
              </p>
            </>
          )}
        </div>

        {/* Collections Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">Collections</span>
            <span className="text-neutral-600">
              {limits.collections === -1
                ? `${collectionCount} (Unlimited)`
                : `${collectionCount} / ${limits.collections}`}
            </span>
          </div>
          {limits.collections !== -1 && (
            <>
              <Progress value={collectionPercentage} className="h-2" />
              <p className="text-xs text-neutral-500">
                {collectionLimit.remaining} remaining
              </p>
            </>
          )}
        </div>

        {/* Premium Features Info */}
        {tier === 'free' && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs font-medium text-neutral-700 mb-2">
              Unlock with Pro:
            </p>
            <ul className="space-y-1 text-xs text-neutral-600">
              <li>• Unlimited bookmarks & collections</li>
              <li>• Premium posts & link groups</li>
              <li>• Advanced analytics</li>
              <li>• Subscriber system</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
