/**
 * Admin Moderation Action API
 * POST - Take action on a report
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { action } = await request.json();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get report details
    const { data: report } = await supabase
      .from('content_reports')
      .select('content_type, content_id, reported_user_id')
      .eq('id', params.id)
      .single();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Take action based on type
    switch (action) {
      case 'delete_content':
        // Delete the content
        if (report.content_type === 'bookmark') {
          await supabase.from('bookmarks').delete().eq('id', report.content_id);
        } else if (report.content_type === 'collection') {
          await supabase.from('collections').delete().eq('id', report.content_id);
        }
        break;

      case 'suspend_user':
        // Suspend the reported user
        await supabase
          .from('profiles')
          .update({ is_suspended: true })
          .eq('id', report.reported_user_id);
        break;

      case 'warn_user':
        // In a real system, you'd send a warning email or notification
        break;

      case 'dismiss':
        // Just dismiss the report
        break;
    }

    // Update report status
    await supabase
      .from('content_reports')
      .update({
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        action_taken: action,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error taking action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
