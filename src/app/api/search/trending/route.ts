import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TrendingSystem } from '@/lib/search/trending-topics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;

    const type = searchParams.get('type') || 'topics'; // topics, bookmarks, collections
    const timeWindow = (searchParams.get('window') || '7d') as '24h' | '7d' | '30d';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Check if user is authenticated for personalized trending
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let data;

    switch (type) {
      case 'topics':
        data = await TrendingSystem.getTrendingTopics(limit);
        break;

      case 'bookmarks':
        if (user && searchParams.get('personalized') === 'true') {
          data = await TrendingSystem.getPersonalizedTrending(user.id, limit);
        } else {
          data = await TrendingSystem.getTrendingBookmarks(timeWindow, limit);
        }
        break;

      case 'collections':
        data = await TrendingSystem.getTrendingCollections(limit);
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({
      type,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Error getting trending content:', error);
    return NextResponse.json(
      { error: 'Failed to get trending content' },
      { status: 500 }
    );
  }
}

// Update trending topics (cron job endpoint)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await TrendingSystem.updateTrendingTopics();

    return NextResponse.json({ message: 'Trending topics updated successfully' });
  } catch (error) {
    console.error('Error updating trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to update trending topics' },
      { status: 500 }
    );
  }
}
