/**
 * Feature Gate System
 * Controls access to premium features based on subscription tier
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type Feature =
  | 'unlimited_bookmarks'
  | 'unlimited_collections'
  | 'premium_posts'
  | 'link_groups'
  | 'affiliate_links'
  | 'advanced_analytics'
  | 'subscriber_system'
  | 'custom_branding'
  | 'api_access'
  | 'team_collaboration'
  | 'custom_domain'
  | 'white_label'
  | 'priority_support'
  | 'sla_guarantee';

export interface SubscriptionLimits {
  bookmarks: number; // -1 means unlimited
  collections: number; // -1 means unlimited
  linkGroups: number; // -1 means unlimited
  affiliateLinks: number; // -1 means unlimited
  premiumPosts: number; // -1 means unlimited
}

export interface FeatureAccess {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  features: Set<Feature>;
}

/**
 * Feature gate configuration for each tier
 */
const TIER_CONFIG: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    tier: 'free',
    limits: {
      bookmarks: 20,
      collections: 3,
      linkGroups: 0,
      affiliateLinks: 0,
      premiumPosts: 0,
    },
    features: new Set([]),
  },
  pro: {
    tier: 'pro',
    limits: {
      bookmarks: -1, // unlimited
      collections: -1,
      linkGroups: -1,
      affiliateLinks: -1,
      premiumPosts: -1,
    },
    features: new Set([
      'unlimited_bookmarks',
      'unlimited_collections',
      'premium_posts',
      'link_groups',
      'affiliate_links',
      'advanced_analytics',
      'subscriber_system',
      'custom_branding',
    ]),
  },
  enterprise: {
    tier: 'enterprise',
    limits: {
      bookmarks: -1,
      collections: -1,
      linkGroups: -1,
      affiliateLinks: -1,
      premiumPosts: -1,
    },
    features: new Set([
      'unlimited_bookmarks',
      'unlimited_collections',
      'premium_posts',
      'link_groups',
      'affiliate_links',
      'advanced_analytics',
      'subscriber_system',
      'custom_branding',
      'api_access',
      'team_collaboration',
      'custom_domain',
      'white_label',
      'priority_support',
      'sla_guarantee',
    ]),
  },
};

export class FeatureGate {
  private tierConfig: FeatureAccess;

  constructor(tier: SubscriptionTier = 'free') {
    this.tierConfig = TIER_CONFIG[tier];
  }

  /**
   * Check if user has access to a specific feature
   */
  hasFeature(feature: Feature): boolean {
    return this.tierConfig.features.has(feature);
  }

  /**
   * Check if user can create more items based on limits
   */
  canCreate(
    type: keyof SubscriptionLimits,
    currentCount: number
  ): { allowed: boolean; limit: number; remaining: number } {
    const limit = this.tierConfig.limits[type];

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, remaining: -1 };
    }

    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount);

    return { allowed, limit, remaining };
  }

  /**
   * Get all limits for current tier
   */
  getLimits(): SubscriptionLimits {
    return { ...this.tierConfig.limits };
  }

  /**
   * Get tier info
   */
  getTier(): SubscriptionTier {
    return this.tierConfig.tier;
  }

  /**
   * Check if this is a premium tier (Pro or Enterprise)
   */
  isPremium(): boolean {
    return this.tierConfig.tier !== 'free';
  }

  /**
   * Get all available features for this tier
   */
  getFeatures(): Feature[] {
    return Array.from(this.tierConfig.features);
  }

  /**
   * Get user-friendly error message when limit is reached
   */
  getLimitMessage(type: keyof SubscriptionLimits): string {
    const limit = this.tierConfig.limits[type];
    const typeLabel = type.replace(/([A-Z])/g, ' $1').toLowerCase();

    if (limit === -1) {
      return `You have unlimited ${typeLabel}`;
    }

    if (limit === 0) {
      return `${typeLabel} is not available on the ${this.tierConfig.tier} plan. Upgrade to unlock this feature.`;
    }

    return `You've reached your limit of ${limit} ${typeLabel} on the ${this.tierConfig.tier} plan. Upgrade for unlimited access.`;
  }

  /**
   * Static helper: Create FeatureGate from user profile
   */
  static fromProfile(profile: {
    subscription_tier?: string | null;
    is_premium?: boolean | null;
  }): FeatureGate {
    // Determine tier from profile
    let tier: SubscriptionTier = 'free';

    if (profile.subscription_tier) {
      tier = profile.subscription_tier as SubscriptionTier;
    } else if (profile.is_premium) {
      tier = 'pro'; // Fallback: if is_premium is true, assume Pro
    }

    return new FeatureGate(tier);
  }

  /**
   * Static helper: Get tier display name
   */
  static getTierDisplayName(tier: SubscriptionTier): string {
    const names: Record<SubscriptionTier, string> = {
      free: 'Free',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };
    return names[tier];
  }

  /**
   * Static helper: Get tier badge color
   */
  static getTierBadgeColor(tier: SubscriptionTier): string {
    const colors: Record<SubscriptionTier, string> = {
      free: 'bg-neutral-100 text-neutral-700',
      pro: 'bg-amber-100 text-amber-700',
      enterprise: 'bg-purple-100 text-purple-700',
    };
    return colors[tier];
  }
}

/**
 * React Hook for Feature Gates (can be used in components)
 */
export function useFeatureGate(tier: SubscriptionTier = 'free') {
  const gate = new FeatureGate(tier);

  return {
    hasFeature: (feature: Feature) => gate.hasFeature(feature),
    canCreate: (type: keyof SubscriptionLimits, currentCount: number) =>
      gate.canCreate(type, currentCount),
    getLimits: () => gate.getLimits(),
    getTier: () => gate.getTier(),
    isPremium: () => gate.isPremium(),
    getFeatures: () => gate.getFeatures(),
    getLimitMessage: (type: keyof SubscriptionLimits) => gate.getLimitMessage(type),
  };
}
