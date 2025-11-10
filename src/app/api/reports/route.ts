import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Create a new report
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
    const { content_type, content_id, reported_user_id, reason, description } = body;

    // Validate required fields
    if (!content_type || !content_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: content_type, content_id, reason' },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = ['bookmark', 'collection', 'post', 'comment', 'user', 'link_group'];
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 });
    }

    // Validate reason
    const validReasons = [
      'spam',
      'harassment',
      'inappropriate_content',
      'copyright_violation',
      'misinformation',
      'hate_speech',
      'violence',
      'other',
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    // Check if user already reported this content
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .eq('status', 'pending')
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      );
    }

    // Create the report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id,
        content_type,
        content_id,
        reason,
        description,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get reports (for moderators or user's own reports)
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const content_type = searchParams.get('content_type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Check if user is moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(id, username, display_name, avatar_url),
        reported_user:profiles!reports_reported_user_id_fkey(id, username, display_name, avatar_url),
        moderator:profiles!reports_moderator_id_fkey(id, username, display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // If not moderator, only show user's own reports
    if (!profile?.is_moderator) {
      query = query.eq('reporter_id', user.id);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (content_type) {
      query = query.eq('content_type', content_type);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
