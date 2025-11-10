import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { visualSearchService } from '@/lib/search/visual-search';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, action } = body; // action: 'analyze', 'search', 'ocr', 'tags'

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'analyze':
        // Analyze image and return all features
        result = await visualSearchService.analyzeImage(imageUrl);
        break;

      case 'search':
        // Find similar images
        result = await visualSearchService.searchSimilarImages(imageUrl, 10);
        break;

      case 'ocr':
        // Extract text from image
        const text = await visualSearchService.extractText(imageUrl);
        result = { text };
        break;

      case 'tags':
        // Generate searchable tags
        const tags = await visualSearchService.generateImageTags(imageUrl);
        result = { tags };
        break;

      case 'safe':
        // Check if image is safe
        const isSafe = await visualSearchService.isSafeImage(imageUrl);
        result = { isSafe };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log visual search usage
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'visual_search',
      metadata: {
        action,
        image_url: imageUrl,
      },
    });

    return NextResponse.json({
      action,
      result,
    });
  } catch (error) {
    console.error('Error in visual search:', error);
    return NextResponse.json(
      {
        error: 'Visual search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Get image analysis for a bookmark
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const searchParams = request.nextUrl.searchParams;
    const bookmarkId = searchParams.get('bookmarkId');

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    // Get bookmark
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', bookmarkId)
      .single();

    if (error || !bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Check if bookmark has image metadata
    const metadata = bookmark.metadata as any;
    const imageUrl = metadata?.image_url || metadata?.og_image;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image found for this bookmark' }, { status: 404 });
    }

    // Analyze image
    const analysis = await visualSearchService.analyzeImage(imageUrl);

    return NextResponse.json({
      bookmark_id: bookmarkId,
      image_url: imageUrl,
      analysis,
    });
  } catch (error) {
    console.error('Error getting image analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
