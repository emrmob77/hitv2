import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { RecommendationEngine } from '@/lib/ml/recommendation-engine';

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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const type = searchParams.get('type'); // 'users', 'content', or null for all

    if (type === 'users') {
      // Get similar users
      const similarUsers = await RecommendationEngine.getSimilarUsers(user.id, limit);

      return NextResponse.json({
        type: 'users',
        recommendations: similarUsers,
        count: similarUsers.length,
      });
    }

    // Get content recommendations
    const recommendations = await RecommendationEngine.getRecommendations(user.id, limit);

    return NextResponse.json({
      type: 'content',
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

// Mark recommendation as shown/clicked
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recommendation_id, action } = body; // action: 'shown', 'clicked', 'dismissed'

    const updates: any = {};

    switch (action) {
      case 'shown':
        updates.was_shown = true;
        updates.shown_at = new Date().toISOString();
        break;
      case 'clicked':
        updates.was_clicked = true;
        updates.interacted_at = new Date().toISOString();
        break;
      case 'dismissed':
        updates.was_dismissed = true;
        updates.interacted_at = new Date().toISOString();
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_recommendations')
      .update(updates)
      .eq('id', recommendation_id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Recommendation updated successfully' });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
