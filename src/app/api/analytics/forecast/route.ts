import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PredictiveAnalytics } from '@/lib/analytics/predictive-analytics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const metric = searchParams.get('metric'); // 'earnings', 'bookmarks', 'clicks'
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30', 10);

    let forecast;

    switch (metric) {
      case 'earnings':
        forecast = await PredictiveAnalytics.forecastAffiliateEarnings(user.id, daysAhead);
        break;
      case 'bookmarks':
        forecast = await PredictiveAnalytics.forecastBookmarkGrowth(user.id, daysAhead);
        break;
      default:
        return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    return NextResponse.json({
      metric,
      forecast,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}
