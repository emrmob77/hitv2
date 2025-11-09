import { describe, it, expect } from 'vitest';
import { FeatureGate, type SubscriptionTier } from '../feature-gate';

describe('FeatureGate', () => {
  describe('Tier Configuration', () => {
    it('should create FeatureGate with free tier by default', () => {
      const gate = new FeatureGate();
      expect(gate.getTier()).toBe('free');
      expect(gate.isPremium()).toBe(false);
    });

    it('should create FeatureGate with specified tier', () => {
      const proGate = new FeatureGate('pro');
      expect(proGate.getTier()).toBe('pro');
      expect(proGate.isPremium()).toBe(true);

      const enterpriseGate = new FeatureGate('enterprise');
      expect(enterpriseGate.getTier()).toBe('enterprise');
      expect(enterpriseGate.isPremium()).toBe(true);
    });
  });

  describe('Feature Access - Free Tier', () => {
    const freeGate = new FeatureGate('free');

    it('should not have access to premium features', () => {
      expect(freeGate.hasFeature('unlimited_bookmarks')).toBe(false);
      expect(freeGate.hasFeature('premium_posts')).toBe(false);
      expect(freeGate.hasFeature('link_groups')).toBe(false);
      expect(freeGate.hasFeature('affiliate_links')).toBe(false);
    });

    it('should have correct limits', () => {
      const limits = freeGate.getLimits();
      expect(limits.bookmarks).toBe(20);
      expect(limits.collections).toBe(3);
      expect(limits.linkGroups).toBe(0);
      expect(limits.affiliateLinks).toBe(0);
      expect(limits.premiumPosts).toBe(0);
    });

    it('should return empty features array', () => {
      const features = freeGate.getFeatures();
      expect(features).toHaveLength(0);
    });
  });

  describe('Feature Access - Pro Tier', () => {
    const proGate = new FeatureGate('pro');

    it('should have access to pro features', () => {
      expect(proGate.hasFeature('unlimited_bookmarks')).toBe(true);
      expect(proGate.hasFeature('premium_posts')).toBe(true);
      expect(proGate.hasFeature('link_groups')).toBe(true);
      expect(proGate.hasFeature('affiliate_links')).toBe(true);
      expect(proGate.hasFeature('advanced_analytics')).toBe(true);
      expect(proGate.hasFeature('subscriber_system')).toBe(true);
      expect(proGate.hasFeature('custom_branding')).toBe(true);
    });

    it('should not have access to enterprise-only features', () => {
      expect(proGate.hasFeature('api_access')).toBe(false);
      expect(proGate.hasFeature('team_collaboration')).toBe(false);
      expect(proGate.hasFeature('custom_domain')).toBe(false);
      expect(proGate.hasFeature('white_label')).toBe(false);
      expect(proGate.hasFeature('priority_support')).toBe(false);
      expect(proGate.hasFeature('sla_guarantee')).toBe(false);
    });

    it('should have unlimited limits', () => {
      const limits = proGate.getLimits();
      expect(limits.bookmarks).toBe(-1);
      expect(limits.collections).toBe(-1);
      expect(limits.linkGroups).toBe(-1);
      expect(limits.affiliateLinks).toBe(-1);
      expect(limits.premiumPosts).toBe(-1);
    });

    it('should have correct number of features', () => {
      const features = proGate.getFeatures();
      expect(features).toHaveLength(8);
    });
  });

  describe('Feature Access - Enterprise Tier', () => {
    const enterpriseGate = new FeatureGate('enterprise');

    it('should have access to all features', () => {
      expect(enterpriseGate.hasFeature('unlimited_bookmarks')).toBe(true);
      expect(enterpriseGate.hasFeature('api_access')).toBe(true);
      expect(enterpriseGate.hasFeature('team_collaboration')).toBe(true);
      expect(enterpriseGate.hasFeature('custom_domain')).toBe(true);
      expect(enterpriseGate.hasFeature('white_label')).toBe(true);
      expect(enterpriseGate.hasFeature('priority_support')).toBe(true);
      expect(enterpriseGate.hasFeature('sla_guarantee')).toBe(true);
    });

    it('should have unlimited limits', () => {
      const limits = enterpriseGate.getLimits();
      expect(limits.bookmarks).toBe(-1);
      expect(limits.collections).toBe(-1);
      expect(limits.linkGroups).toBe(-1);
    });

    it('should have all 14 features', () => {
      const features = enterpriseGate.getFeatures();
      expect(features).toHaveLength(14);
    });
  });

  describe('Creation Limits', () => {
    describe('Free Tier Limits', () => {
      const freeGate = new FeatureGate('free');

      it('should allow creation when under limit', () => {
        const result = freeGate.canCreate('bookmarks', 10);
        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(20);
        expect(result.remaining).toBe(10);
      });

      it('should block creation when at limit', () => {
        const result = freeGate.canCreate('bookmarks', 20);
        expect(result.allowed).toBe(false);
        expect(result.limit).toBe(20);
        expect(result.remaining).toBe(0);
      });

      it('should block creation when over limit', () => {
        const result = freeGate.canCreate('bookmarks', 25);
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
      });

      it('should block creation for zero-limit features', () => {
        const result = freeGate.canCreate('linkGroups', 0);
        expect(result.allowed).toBe(false);
        expect(result.limit).toBe(0);
        expect(result.remaining).toBe(0);
      });
    });

    describe('Pro Tier Limits', () => {
      const proGate = new FeatureGate('pro');

      it('should always allow creation for unlimited features', () => {
        const result = proGate.canCreate('bookmarks', 1000);
        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(-1);
        expect(result.remaining).toBe(-1);
      });

      it('should handle large numbers correctly', () => {
        const result = proGate.canCreate('collections', 999999);
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('Limit Messages', () => {
    const freeGate = new FeatureGate('free');
    const proGate = new FeatureGate('pro');

    it('should return correct message for limited features', () => {
      const message = freeGate.getLimitMessage('bookmarks');
      expect(message).toContain('20');
      expect(message).toContain('free');
    });

    it('should return correct message for unlimited features', () => {
      const message = proGate.getLimitMessage('bookmarks');
      expect(message).toContain('unlimited');
    });

    it('should return correct message for zero-limit features', () => {
      const message = freeGate.getLimitMessage('linkGroups');
      expect(message).toContain('not available');
      expect(message).toContain('Upgrade');
    });
  });

  describe('Static Methods', () => {
    it('should create FeatureGate from profile with subscription_tier', () => {
      const profile = { subscription_tier: 'pro', is_premium: true };
      const gate = FeatureGate.fromProfile(profile);
      expect(gate.getTier()).toBe('pro');
    });

    it('should create FeatureGate from profile with is_premium fallback', () => {
      const profile = { subscription_tier: null, is_premium: true };
      const gate = FeatureGate.fromProfile(profile);
      expect(gate.getTier()).toBe('pro');
    });

    it('should default to free tier for non-premium profile', () => {
      const profile = { subscription_tier: null, is_premium: false };
      const gate = FeatureGate.fromProfile(profile);
      expect(gate.getTier()).toBe('free');
    });

    it('should return correct tier display names', () => {
      expect(FeatureGate.getTierDisplayName('free')).toBe('Free');
      expect(FeatureGate.getTierDisplayName('pro')).toBe('Pro');
      expect(FeatureGate.getTierDisplayName('enterprise')).toBe('Enterprise');
    });

    it('should return correct tier badge colors', () => {
      expect(FeatureGate.getTierBadgeColor('free')).toContain('neutral');
      expect(FeatureGate.getTierBadgeColor('pro')).toContain('amber');
      expect(FeatureGate.getTierBadgeColor('enterprise')).toContain('purple');
    });
  });

  describe('Edge Cases', () => {
    it('should handle exact limit boundary', () => {
      const gate = new FeatureGate('free');
      const result = gate.canCreate('bookmarks', 19);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should not mutate limits object', () => {
      const gate = new FeatureGate('free');
      const limits1 = gate.getLimits();
      const limits2 = gate.getLimits();

      limits1.bookmarks = 100;
      expect(limits2.bookmarks).toBe(20);
    });

    it('should handle negative current count (edge case)', () => {
      const gate = new FeatureGate('free');
      const result = gate.canCreate('bookmarks', -5);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(25); // 20 - (-5)
    });
  });
});
