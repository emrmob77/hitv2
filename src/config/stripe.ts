/**
 * Stripe Configuration
 *
 * This file contains Stripe configuration and pricing plans.
 * Currently in DUMMY/MOCK mode - will work with real Stripe API when keys are added.
 */

import { SubscriptionTier } from '@/lib/features/feature-gate';

export interface StripePlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceIdMonthly?: string; // Will be filled when Stripe is connected
  stripePriceIdYearly?: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

/**
 * Stripe Plan Definitions
 */
export const STRIPE_PLANS: StripePlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '20 bookmarks',
      '3 collections',
      'Public bookmark sharing',
      'Follow users & tags',
      'Basic search & filters',
      'Community features',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    description: 'For content creators and influencers',
    monthlyPrice: 29,
    yearlyPrice: 290, // 2 months free (17% discount)
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    features: [
      'Unlimited bookmarks & collections',
      'Premium posts (URL-free content)',
      'Link groups (Linktree-style)',
      'Affiliate links & tracking',
      'Advanced analytics & insights',
      'Subscriber system',
      'Custom branding',
      'Priority support',
    ],
    highlighted: true,
    ctaText: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    description: 'For teams and businesses',
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    features: [
      'Everything in Pro',
      'API access (coming soon)',
      'Team collaboration',
      'Custom domain (coming soon)',
      'White-label options (coming soon)',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
    ],
    ctaText: 'Contact Sales',
  },
];

/**
 * Check if Stripe is configured (API keys are set)
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_SECRET_KEY
  );
}

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): StripePlan | undefined {
  return STRIPE_PLANS.find((plan) => plan.id === planId);
}

/**
 * Get plan by tier
 */
export function getPlanByTier(tier: SubscriptionTier): StripePlan | undefined {
  return STRIPE_PLANS.find((plan) => plan.tier === tier);
}

/**
 * Map Stripe price ID to subscription tier
 * Used in webhook handlers
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  for (const plan of STRIPE_PLANS) {
    if (
      plan.stripePriceIdMonthly === priceId ||
      plan.stripePriceIdYearly === priceId
    ) {
      return plan.tier;
    }
  }

  // Default to free if not found
  return 'free';
}

/**
 * Calculate yearly discount percentage
 */
export function getYearlyDiscount(plan: StripePlan): number {
  if (plan.monthlyPrice === 0) return 0;

  const yearlyTotal = plan.monthlyPrice * 12;
  const savings = yearlyTotal - plan.yearlyPrice;
  return Math.round((savings / yearlyTotal) * 100);
}
