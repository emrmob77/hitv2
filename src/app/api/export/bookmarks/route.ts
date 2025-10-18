/**
 * Export Bookmarks API Endpoint
 * POST /api/export/bookmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { exportBookmarks, type ExportOptions } from '@/lib/export/export-service';

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

    // Parse request body
    const body = await request.json();
    const {
      format = 'json',
      include_tags = true,
      include_collections = true,
      include_metadata = true,
      collection_id,
      tag_ids,
      date_from,
      date_to,
    } = body;

    // Validate format
    const validFormats = ['json', 'csv', 'html', 'netscape_bookmark'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        {
          error: `Invalid format. Supported formats: ${validFormats.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Build export options
    const options: ExportOptions = {
      format,
      include_tags,
      include_collections,
      include_metadata,
      collection_id,
      tag_ids: tag_ids ? (Array.isArray(tag_ids) ? tag_ids : [tag_ids]) : undefined,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined,
    };

    // Perform export
    const exportResult = await exportBookmarks(user.id, options);

    if (!exportResult.success) {
      return NextResponse.json(
        {
          error: exportResult.error || 'Export failed',
        },
        { status: 400 }
      );
    }

    // Return file as downloadable response
    return new NextResponse(exportResult.file_content, {
      status: 200,
      headers: {
        'Content-Type': exportResult.mime_type,
        'Content-Disposition': `attachment; filename="${exportResult.file_name}"`,
        'X-Total-Bookmarks': exportResult.total_bookmarks.toString(),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
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
