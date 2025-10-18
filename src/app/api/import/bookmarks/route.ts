/**
 * Import Bookmarks API Endpoint
 * POST /api/import/bookmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BrowserBookmarkParser } from '@/lib/import/browser-bookmark-parser';
import { importBrowserBookmarks, type ImportOptions } from '@/lib/import/import-service';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optionsJson = formData.get('options') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only HTML files are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Parse options
    let options: ImportOptions = {
      skip_duplicates: true,
      auto_tag: true,
      preserve_folders: true,
      default_privacy: 'public',
    };

    if (optionsJson) {
      try {
        options = { ...options, ...JSON.parse(optionsJson) };
      } catch (error) {
        return NextResponse.json({ error: 'Invalid options format' }, { status: 400 });
      }
    }

    // Step 1: Parse the HTML file
    const html = await file.text();
    const parser = new BrowserBookmarkParser(html);
    const parseResult = parser.parse();

    if (parseResult.parse_errors.length > 0 && parseResult.total_count === 0) {
      return NextResponse.json(
        {
          error: 'Failed to parse bookmark file',
          details: parseResult.parse_errors,
        },
        { status: 400 }
      );
    }

    // Step 2: Import bookmarks into database
    const importResult = await importBrowserBookmarks(user.id, parseResult, options);

    // Step 3: Return result
    return NextResponse.json(
      {
        success: importResult.success,
        message: `Import completed. ${importResult.progress.successful} bookmarks imported successfully.`,
        parse_result: {
          source_type: parseResult.source_type,
          total_count: parseResult.total_count,
          parse_errors: parseResult.parse_errors,
        },
        import_result: {
          progress: importResult.progress,
          imported_bookmark_ids: importResult.imported_bookmark_ids,
          created_tag_ids: importResult.created_tag_ids,
          created_collection_ids: importResult.created_collection_ids,
          errors: importResult.errors.slice(0, 10), // Return first 10 errors only
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
