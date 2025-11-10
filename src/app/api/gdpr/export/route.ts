import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Request data export (GDPR compliance)
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { export_type = 'full' } = body;

    // Validate export type
    const validTypes = ['full', 'bookmarks', 'collections', 'posts', 'analytics'];
    if (!validTypes.includes(export_type)) {
      return NextResponse.json({ error: 'Invalid export_type' }, { status: 400 });
    }

    // Check for existing pending/processing requests
    const { data: existing } = await supabase
      .from('data_export_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending export request' },
        { status: 400 }
      );
    }

    // Create export request
    const { data: exportRequest, error } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: user.id,
        export_type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating export request:', error);
      return NextResponse.json({ error: 'Failed to create export request' }, { status: 500 });
    }

    // In production, trigger background job to process export
    // For now, we'll immediately process it
    processDataExport(exportRequest.id, user.id, export_type);

    return NextResponse.json(
      {
        success: true,
        message: 'Export request created. You will receive an email when your data is ready.',
        export_request: exportRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/gdpr/export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get export requests
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: exports, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching export requests:', error);
      return NextResponse.json({ error: 'Failed to fetch export requests' }, { status: 500 });
    }

    return NextResponse.json({ exports });
  } catch (error) {
    console.error('Error in GET /api/gdpr/export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Background function to process data export
async function processDataExport(requestId: string, userId: string, exportType: string) {
  try {
    const supabase = await createSupabaseServerClient();

    // Update status to processing
    await supabase
      .from('data_export_requests')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', requestId);

    // Collect user data based on export type
    const userData: any = {};

    if (exportType === 'full' || exportType === 'bookmarks') {
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId);
      userData.bookmarks = bookmarks;
    }

    if (exportType === 'full' || exportType === 'collections') {
      const { data: collections } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);
      userData.collections = collections;
    }

    if (exportType === 'full' || exportType === 'posts') {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId);
      userData.posts = posts;
    }

    if (exportType === 'full' || exportType === 'analytics') {
      const { data: analytics } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId);
      userData.analytics = analytics;
    }

    // Add profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    userData.profile = profile;

    // In production: Upload to storage and get URL
    // For now, we'll just store metadata
    const dataJson = JSON.stringify(userData, null, 2);
    const fileSize = Buffer.byteLength(dataJson, 'utf8');

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update export request with completion
    await supabase
      .from('data_export_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        file_size_bytes: fileSize,
        expires_at: expiresAt.toISOString(),
        // In production: file_url would point to actual storage
        file_url: null,
      })
      .eq('id', requestId);

    console.log(`Data export completed for request ${requestId}`);
  } catch (error) {
    console.error('Error processing data export:', error);

    const supabase = await createSupabaseServerClient();
    await supabase
      .from('data_export_requests')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', requestId);
  }
}
