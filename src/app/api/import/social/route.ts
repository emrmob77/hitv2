import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SocialImportManager } from '@/lib/import/social-platform-importer';

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
    const { platform, credentials } = body;

    // Validate platform
    if (!['twitter', 'reddit', 'pocket'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Import from platform
    const importResult = await SocialImportManager.importFromPlatform(
      platform as 'twitter' | 'reddit' | 'pocket',
      credentials
    );

    // If import was successful, save bookmarks to database
    if (importResult.items.length > 0) {
      const bookmarksToInsert = importResult.items.map((item) => ({
        user_id: user.id,
        url: item.url,
        title: item.title,
        description: item.description,
        tags: item.tags || [],
        is_public: false, // Imported items are private by default
        created_at: item.created_at || new Date(),
        metadata: {
          imported_from: item.platform,
          ...item.metadata,
        },
      }));

      const { data: insertedBookmarks, error } = await supabase
        .from('bookmarks')
        .insert(bookmarksToInsert)
        .select();

      if (error) {
        console.error('Error saving imported bookmarks:', error);
        return NextResponse.json(
          {
            error: 'Failed to save imported bookmarks',
            import_result: importResult,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Import successful',
        import_result: importResult,
        saved_bookmarks: insertedBookmarks.length,
      });
    }

    return NextResponse.json({
      message: 'Import completed with no items',
      import_result: importResult,
    });
  } catch (error) {
    console.error('Error importing from social platform:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get OAuth URL for platforms that require it
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const consumerKey = searchParams.get('consumerKey');
    const redirectUri = searchParams.get('redirectUri');

    if (platform === 'pocket' && consumerKey && redirectUri) {
      const { PocketImporter } = await import('@/lib/import/social-platform-importer');
      const authUrl = await PocketImporter.getAuthUrl(consumerKey, redirectUri);

      return NextResponse.json({ auth_url: authUrl });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error getting OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to get OAuth URL' },
      { status: 500 }
    );
  }
}
