'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, Check, AlertCircle, CreditCard, Settings, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FeatureGate, SubscriptionTier } from '@/lib/features/feature-gate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BillingHistorySection } from './billing-history-section';
import { openCustomerPortal } from '@/lib/stripe/client';
import { useToast } from '@/hooks/use-toast';

interface BillingSubscriptionSectionProps {
  currentTier: SubscriptionTier;
  bookmarkCount: number;
  collectionCount: number;
}

export function BillingSubscriptionSection({
  currentTier,
  bookmarkCount,
  collectionCount,
}: BillingSubscriptionSectionProps) {
  const featureGate = new FeatureGate(currentTier);
  const limits = featureGate.getLimits();
  const isPremium = featureGate.isPremium();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const { toast } = useToast();

  // Calculate if approaching limits
  const bookmarkLimit = featureGate.canCreate('bookmarks', bookmarkCount);
  const collectionLimit = featureGate.canCreate('collections', collectionCount);
  const isApproachingLimit =
    (bookmarkLimit.remaining <= 5 && bookmarkLimit.remaining > 0) ||
    (collectionLimit.remaining <= 2 && collectionLimit.remaining > 0);

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);

    try {
      const result = await openCustomerPortal();

      if (!result.success) {
        toast({
          title: 'Failed to open portal',
          description: result.error || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-neutral-900">
              {FeatureGate.getTierDisplayName(currentTier)} Plan
            </p>
            {isPremium && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${FeatureGate.getTierBadgeColor(currentTier)}`}>
                <Crown className="h-3 w-3" />
                {FeatureGate.getTierDisplayName(currentTier)}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600">
            {currentTier === 'free' && 'Start with essential bookmarking features'}
            {currentTier === 'pro' && 'Unlimited bookmarks and premium features'}
            {currentTier === 'enterprise' && 'Full platform access with team features'}
          </p>
        </div>
        <div className="flex gap-2">
          {currentTier === 'free' && (
            <Button asChild>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
          {isPremium && (
            <>
              <Button variant="outline" asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Usage Alert */}
      {!isPremium && isApproachingLimit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Approaching your plan limits</AlertTitle>
          <AlertDescription>
            Consider upgrading to Pro for unlimited access to all features.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Usage */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900">Current Usage</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700">Bookmarks</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {bookmarkCount}
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  {limits.bookmarks === -1
                    ? 'Unlimited'
                    : `of ${limits.bookmarks} available`}
                </p>
              </div>
              {bookmarkLimit.remaining > 0 && bookmarkLimit.remaining <= 5 && (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700">Collections</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {collectionCount}
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  {limits.collections === -1
                    ? 'Unlimited'
                    : `of ${limits.collections} available`}
                </p>
              </div>
              {collectionLimit.remaining > 0 && collectionLimit.remaining <= 2 && (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Included */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900">Features Included</h3>
        <div className="space-y-2">
          {currentTier === 'free' && (
            <>
              <FeatureItem text="20 bookmarks" included />
              <FeatureItem text="3 collections" included />
              <FeatureItem text="Basic analytics" included />
              <FeatureItem text="Unlimited bookmarks" included={false} />
              <FeatureItem text="Premium posts" included={false} />
              <FeatureItem text="Link groups" included={false} />
              <FeatureItem text="Affiliate tracking" included={false} />
            </>
          )}
          {currentTier === 'pro' && (
            <>
              <FeatureItem text="Unlimited bookmarks" included />
              <FeatureItem text="Unlimited collections" included />
              <FeatureItem text="Premium posts" included />
              <FeatureItem text="Link groups" included />
              <FeatureItem text="Affiliate tracking" included />
              <FeatureItem text="Advanced analytics" included />
              <FeatureItem text="Subscriber system" included />
              <FeatureItem text="Custom branding" included />
            </>
          )}
          {currentTier === 'enterprise' && (
            <>
              <FeatureItem text="All Pro features" included />
              <FeatureItem text="API access" included />
              <FeatureItem text="Team collaboration" included />
              <FeatureItem text="Custom domain" included />
              <FeatureItem text="White label" included />
              <FeatureItem text="Priority support" included />
              <FeatureItem text="SLA guarantee" included />
            </>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium text-neutral-900">Billing History</h3>
        <BillingHistorySection isPremium={isPremium} />
      </div>
    </div>
  );
}

function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-neutral-300" />
      )}
      <span className={included ? 'text-neutral-700' : 'text-neutral-400'}>
        {text}
      </span>
    </div>
  );
}
