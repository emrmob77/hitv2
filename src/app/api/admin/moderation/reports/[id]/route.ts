/**
 * Admin Moderation Report Update API
 * PATCH - Update report status
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { status } = await request.json();

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

    // Update report status
    const { error } = await supabase
      .from('content_reports')
      .update({
        status,
        reviewed_at: status !== 'pending' ? new Date().toISOString() : null,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Error updating report:', error);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
