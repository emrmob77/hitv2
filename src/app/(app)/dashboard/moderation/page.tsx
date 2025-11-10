import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ModerationDashboard } from '@/components/moderation/moderation-dashboard';

export const metadata: Metadata = {
  title: 'Moderation Dashboard',
  description: 'Review and moderate reported content',
};

export default async function ModerationPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is a moderator
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_moderator')
    .eq('id', user.id)
    .single();

  if (!profile?.is_moderator) {
    redirect('/dashboard');
  }

  // Fetch pending reports
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, username, display_name, avatar_url),
      reported_user:profiles!reports_reported_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch statistics
  const { count: pendingCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: reviewingCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'reviewing');

  const { count: resolvedTodayCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')
    .gte('resolved_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const stats = {
    pending: pendingCount || 0,
    reviewing: reviewingCount || 0,
    resolvedToday: resolvedTodayCount || 0,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-neutral-900">Moderation Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Review and moderate reported content
        </p>
      </header>

      <ModerationDashboard initialReports={reports || []} stats={stats} />
    </div>
  );
}
