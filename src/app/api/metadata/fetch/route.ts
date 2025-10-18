/**
 * Metadata Fetch API Endpoint
 * POST /api/metadata/fetch
 * Fetches OpenGraph and metadata for a given URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchMetadata } from '@/lib/import/metadata-fetcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch metadata
    const metadata = await fetchMetadata(url);

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metadata',
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
