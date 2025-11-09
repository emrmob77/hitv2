import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Update a report (moderators only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', user.id)
      .single();

    if (!profile?.is_moderator) {
      return NextResponse.json({ error: 'Forbidden - Moderator access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status, moderator_notes, resolution } = body;

    // Validate status
    if (status && !['pending', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update the report
    const updateData: any = {
      moderator_id: user.id,
    };

    if (status) updateData.status = status;
    if (moderator_notes !== undefined) updateData.moderator_notes = moderator_notes;
    if (resolution !== undefined) updateData.resolution = resolution;

    const { data: report, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error in PATCH /api/reports/[reportId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get a single report
export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(id, username, display_name, avatar_url),
        reported_user:profiles!reports_reported_user_id_fkey(id, username, display_name, avatar_url),
        moderator:profiles!reports_moderator_id_fkey(id, username, display_name)
      `)
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', user.id)
      .single();

    const isModerator = profile?.is_moderator;
    const isReporter = report.reporter_id === user.id;

    if (!isModerator && !isReporter) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error in GET /api/reports/[reportId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
