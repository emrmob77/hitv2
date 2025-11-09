import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PersonalizedFeedGenerator } from '@/lib/feed/personalized-feed';

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
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeFollowing = searchParams.get('includeFollowing') !== 'false';
    const includePublic = searchParams.get('includePublic') !== 'false';
    const contentTypes = searchParams.get('contentTypes')?.split(',') as
      | Array<'bookmark' | 'post' | 'collection'>
      | undefined;

    // Generate personalized feed
    const feedItems = await PersonalizedFeedGenerator.generateFeed({
      userId: user.id,
      limit,
      offset,
      includeFollowing,
      includePublic,
      contentTypes,
    });

    return NextResponse.json({
      items: feedItems,
      count: feedItems.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error generating personalized feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    );
  }
}
