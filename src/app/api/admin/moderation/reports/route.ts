/**
 * Admin Moderation Reports API
 * GET - List all content reports
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

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

    // Fetch all reports
    const { data: reports, error } = await supabase
      .from('content_reports')
      .select(
        `
        id,
        content_type,
        content_id,
        reason,
        description,
        status,
        created_at,
        reviewed_at,
        action_taken,
        reporter_id,
        reported_user_id
      `
      )
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Error fetching reports:', error);
      // If table doesn't exist, return empty array
      return NextResponse.json({ reports: [] });
    }

    // Get reporter and reported user emails
    const reporterIds = [...new Set(reports?.map((r) => r.reporter_id) || [])];
    const reportedUserIds = [...new Set(reports?.map((r) => r.reported_user_id) || [])];
    const allUserIds = [...new Set([...reporterIds, ...reportedUserIds])];

    const { data: users } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', allUserIds);

    const userMap = (users || []).reduce((acc, u) => {
      acc[u.id] = u.email;
      return acc;
    }, {} as Record<string, string>);

    // Get content titles
    const bookmarkIds = reports?.filter((r) => r.content_type === 'bookmark').map((r) => r.content_id) || [];
    const collectionIds = reports?.filter((r) => r.content_type === 'collection').map((r) => r.content_id) || [];

    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('id, title')
      .in('id', bookmarkIds);

    const { data: collections } = await supabase
      .from('collections')
      .select('id, name')
      .in('id', collectionIds);

    const contentTitleMap: Record<string, string> = {};
    bookmarks?.forEach((b) => {
      contentTitleMap[b.id] = b.title;
    });
    collections?.forEach((c) => {
      contentTitleMap[c.id] = c.name;
    });

    // Enrich reports
    const enrichedReports = reports?.map((report) => ({
      ...report,
      content_title: contentTitleMap[report.content_id] || 'Unknown',
      reporter_email: userMap[report.reporter_id] || 'Unknown',
      reported_user_email: userMap[report.reported_user_id] || 'Unknown',
    }));

    return NextResponse.json({ reports: enrichedReports || [] });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ reports: [] });
  }
}
