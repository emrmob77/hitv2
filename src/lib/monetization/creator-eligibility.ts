/**
 * Creator Eligibility and Quality Score Calculator
 * Evaluates if a creator meets requirements for monetization
 */

export interface CreatorMetrics {
  totalFollowers: number;
  totalBookmarks: number;
  totalCollections: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  accountAgeInDays: number;
}

export interface EligibilityResult {
  isEligible: boolean;
  qualityScore: number;
  reasons: string[];
  recommendations: string[];
}

// Minimum requirements for monetization
const MINIMUM_REQUIREMENTS = {
  followers: 100,
  bookmarks: 20,
  totalViews: 1000,
  totalEngagements: 100,
  accountAgeDays: 30,
  qualityScore: 60,
};

export class CreatorEligibilityChecker {
  /**
   * Check if creator meets minimum requirements
   */
  static checkEligibility(metrics: CreatorMetrics): EligibilityResult {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let isEligible = true;

    // Calculate quality score first
    const qualityScore = this.calculateQualityScore(metrics);

    // Check minimum followers
    if (metrics.totalFollowers < MINIMUM_REQUIREMENTS.followers) {
      isEligible = false;
      reasons.push(
        `Need at least ${MINIMUM_REQUIREMENTS.followers} followers (currently ${metrics.totalFollowers})`
      );
      recommendations.push('Share quality content consistently to grow your follower base');
    }

    // Check minimum bookmarks
    if (metrics.totalBookmarks < MINIMUM_REQUIREMENTS.bookmarks) {
      isEligible = false;
      reasons.push(
        `Need at least ${MINIMUM_REQUIREMENTS.bookmarks} bookmarks (currently ${metrics.totalBookmarks})`
      );
      recommendations.push('Create more high-quality bookmarks with detailed descriptions');
    }

    // Check total views
    if (metrics.totalViews < MINIMUM_REQUIREMENTS.totalViews) {
      isEligible = false;
      reasons.push(
        `Need at least ${MINIMUM_REQUIREMENTS.totalViews} total views (currently ${metrics.totalViews})`
      );
      recommendations.push('Promote your content on social media to increase visibility');
    }

    // Check total engagements
    const totalEngagements = metrics.totalLikes + metrics.totalComments;
    if (totalEngagements < MINIMUM_REQUIREMENTS.totalEngagements) {
      isEligible = false;
      reasons.push(
        `Need at least ${MINIMUM_REQUIREMENTS.totalEngagements} total engagements (currently ${totalEngagements})`
      );
      recommendations.push('Engage with your community and create interactive content');
    }

    // Check account age
    if (metrics.accountAgeInDays < MINIMUM_REQUIREMENTS.accountAgeDays) {
      isEligible = false;
      reasons.push(
        `Account must be at least ${MINIMUM_REQUIREMENTS.accountAgeDays} days old (currently ${metrics.accountAgeInDays} days)`
      );
      recommendations.push('Continue building your presence - time is required for trust');
    }

    // Check quality score
    if (qualityScore < MINIMUM_REQUIREMENTS.qualityScore) {
      isEligible = false;
      reasons.push(`Quality score must be at least ${MINIMUM_REQUIREMENTS.qualityScore} (currently ${qualityScore})`);
      recommendations.push('Focus on content quality and community engagement');
    }

    // Success message
    if (isEligible) {
      reasons.push('Congratulations! You meet all requirements for creator monetization');
    }

    return {
      isEligible,
      qualityScore,
      reasons,
      recommendations,
    };
  }

  /**
   * Calculate quality score (0-100)
   * Based on engagement rate, content quality, and consistency
   */
  static calculateQualityScore(metrics: CreatorMetrics): number {
    let score = 0;

    // Engagement Rate (40 points max)
    const engagementRate = this.calculateEngagementRate(metrics);
    score += Math.min(40, engagementRate * 400); // 10% engagement = 40 points

    // Content Quantity (20 points max)
    const contentScore = Math.min(20, (metrics.totalBookmarks / 100) * 20);
    score += contentScore;

    // Follower Growth (20 points max)
    const followerScore = Math.min(20, (metrics.totalFollowers / 500) * 20);
    score += followerScore;

    // View Performance (20 points max)
    const viewScore = Math.min(20, (metrics.totalViews / 5000) * 20);
    score += viewScore;

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate engagement rate
   */
  static calculateEngagementRate(metrics: CreatorMetrics): number {
    if (metrics.totalViews === 0) return 0;

    const totalEngagements = metrics.totalLikes + metrics.totalComments;
    return totalEngagements / metrics.totalViews;
  }

  /**
   * Calculate estimated revenue share based on quality score
   */
  static calculateRevenueShare(qualityScore: number): number {
    // Base: 60%, Max: 80% based on quality
    const baseShare = 60;
    const bonusShare = (qualityScore / 100) * 20;
    return Math.round(baseShare + bonusShare);
  }

  /**
   * Get requirements progress for UI display
   */
  static getRequirementsProgress(metrics: CreatorMetrics) {
    return {
      followers: {
        current: metrics.totalFollowers,
        required: MINIMUM_REQUIREMENTS.followers,
        percentage: Math.min(100, (metrics.totalFollowers / MINIMUM_REQUIREMENTS.followers) * 100),
      },
      bookmarks: {
        current: metrics.totalBookmarks,
        required: MINIMUM_REQUIREMENTS.bookmarks,
        percentage: Math.min(100, (metrics.totalBookmarks / MINIMUM_REQUIREMENTS.bookmarks) * 100),
      },
      views: {
        current: metrics.totalViews,
        required: MINIMUM_REQUIREMENTS.totalViews,
        percentage: Math.min(100, (metrics.totalViews / MINIMUM_REQUIREMENTS.totalViews) * 100),
      },
      engagements: {
        current: metrics.totalLikes + metrics.totalComments,
        required: MINIMUM_REQUIREMENTS.totalEngagements,
        percentage: Math.min(
          100,
          ((metrics.totalLikes + metrics.totalComments) / MINIMUM_REQUIREMENTS.totalEngagements) * 100
        ),
      },
      accountAge: {
        current: metrics.accountAgeInDays,
        required: MINIMUM_REQUIREMENTS.accountAgeDays,
        percentage: Math.min(100, (metrics.accountAgeInDays / MINIMUM_REQUIREMENTS.accountAgeDays) * 100),
      },
    };
  }
}
