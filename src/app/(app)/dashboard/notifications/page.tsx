import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { NotificationCenter } from '@/components/notifications/notification-center';
import type { NotificationRecord } from '@/components/notifications/utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Notifications • Dashboard',
};

export default async function DashboardNotificationsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, data, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Dashboard notifications: failed to fetch notifications', error);
  }

  const notifications: NotificationRecord[] = (data ?? []).map((notification) => ({
    ...notification,
    message: notification.message ?? undefined,
    data: (notification.data as NotificationRecord['data']) ?? {},
  }));

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <NotificationCenter
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
