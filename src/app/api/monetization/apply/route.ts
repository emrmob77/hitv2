import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreatorEligibilityChecker, type CreatorMetrics } from '@/lib/monetization/creator-eligibility';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an application
    const { data: existingApplication } = await supabase
      .from('creator_monetization')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending application' },
          { status: 400 }
        );
      }
      if (existingApplication.status === 'approved') {
        return NextResponse.json(
          { error: 'You are already approved for monetization' },
          { status: 400 }
        );
      }
    }

    // Fetch user metrics
    const metrics = await fetchUserMetrics(user.id);

    // Check eligibility
    const eligibility = CreatorEligibilityChecker.checkEligibility(metrics);

    if (!eligibility.isEligible) {
      return NextResponse.json(
        {
          error: 'You do not meet the minimum requirements',
          eligibility,
        },
        { status: 400 }
      );
    }

    // Calculate revenue share based on quality
    const revenueShare = CreatorEligibilityChecker.calculateRevenueShare(eligibility.qualityScore);

    // Create or update application
    const applicationData = {
      user_id: user.id,
      status: 'pending',
      application_date: new Date().toISOString(),
      total_followers: metrics.totalFollowers,
      total_bookmarks: metrics.totalBookmarks,
      total_collections: metrics.totalCollections,
      total_views: metrics.totalViews,
      total_engagements: metrics.totalLikes + metrics.totalComments,
      engagement_rate: CreatorEligibilityChecker.calculateEngagementRate(metrics) * 100,
      quality_score: eligibility.qualityScore,
      revenue_share_percentage: revenueShare,
    };

    let result;
    if (existingApplication) {
      // Update existing (if rejected before)
      const { data, error } = await supabase
        .from('creator_monetization')
        .update(applicationData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('creator_monetization')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'monetization_application',
      title: 'Monetization Application Submitted',
      message: 'Your creator monetization application has been submitted and is pending review.',
      data: {
        application_id: result.id,
        quality_score: eligibility.qualityScore,
        revenue_share: revenueShare,
      },
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      application: result,
      eligibility,
    });
  } catch (error: any) {
    console.error('[Monetization Apply Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's application status
    const { data: application } = await supabase
      .from('creator_monetization')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch current metrics
    const metrics = await fetchUserMetrics(user.id);

    // Check current eligibility
    const eligibility = CreatorEligibilityChecker.checkEligibility(metrics);

    // Get requirements progress
    const progress = CreatorEligibilityChecker.getRequirementsProgress(metrics);

    return NextResponse.json({
      application,
      eligibility,
      progress,
      metrics,
    });
  } catch (error: any) {
    console.error('[Monetization Status Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch monetization status' },
      { status: 500 }
    );
  }
}

/**
 * Fetch user metrics for eligibility checking
 */
async function fetchUserMetrics(userId: string): Promise<CreatorMetrics> {
  const supabase = await createSupabaseServerClient();

  // Get follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  // Get bookmark count and total views/likes
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, click_count, like_count')
    .eq('user_id', userId);

  const totalBookmarks = bookmarks?.length || 0;
  const totalViews = bookmarks?.reduce((sum, b) => sum + (b.click_count || 0), 0) || 0;
  const totalLikes = bookmarks?.reduce((sum, b) => sum + (b.like_count || 0), 0) || 0;

  // Get collection count
  const { count: collectionCount } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get total comments
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get account age
  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  const accountAgeInDays = profile
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    totalFollowers: followerCount || 0,
    totalBookmarks,
    totalCollections: collectionCount || 0,
    totalViews,
    totalLikes,
    totalComments: commentCount || 0,
    accountAgeInDays,
  };
}
