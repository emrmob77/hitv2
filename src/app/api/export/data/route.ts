import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('*, bookmark_tags(tags(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch collections
    const { data: collections } = await supabase
      .from('collections')
      .select('*, collection_bookmarks(bookmarks(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (format === 'json') {
      const exportData = {
        export_date: new Date().toISOString(),
        user: {
          email: user.email,
          created_at: user.created_at,
        },
        profile,
        bookmarks,
        collections,
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="hittags-data-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    } else if (format === 'csv') {
      // CSV export for bookmarks
      const csvHeader = 'Title,URL,Description,Domain,Created At,Tags\n';
      const csvRows = bookmarks
        ?.map((bookmark) => {
          const tags = bookmark.bookmark_tags
            ?.map((bt: any) => bt.tags?.name)
            .filter(Boolean)
            .join('; ');
          return `"${bookmark.title}","${bookmark.url}","${bookmark.description || ''}","${bookmark.domain || ''}","${bookmark.created_at}","${tags || ''}"`;
        })
        .join('\n');

      const csvContent = csvHeader + (csvRows || '');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="hittags-bookmarks-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}
