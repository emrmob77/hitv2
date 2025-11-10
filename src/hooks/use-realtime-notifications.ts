'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface RealtimeNotificationUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  notification: Notification;
}

export function useRealtimeNotifications(userId: string | null, onUpdate?: (update: RealtimeNotificationUpdate) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        // First, get initial unread count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (count !== null) {
          setUnreadCount(count);
        }

        // Subscribe to notification changes
        channel = supabase
          .channel(`notifications:user_id=eq.${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Notification inserted:', payload);
              const notification = payload.new as Notification;

              if (!notification.is_read) {
                setUnreadCount((prev) => prev + 1);
              }

              onUpdate?.({
                type: 'INSERT',
                notification,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Notification updated:', payload);
              const notification = payload.new as Notification;
              const oldNotification = payload.old as Notification;

              // Update unread count
              if (oldNotification.is_read !== notification.is_read) {
                setUnreadCount((prev) => notification.is_read ? prev - 1 : prev + 1);
              }

              onUpdate?.({
                type: 'UPDATE',
                notification,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Notification deleted:', payload);
              const notification = payload.old as Notification;

              if (!notification.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }

              onUpdate?.({
                type: 'DELETE',
                notification,
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setError(new Error('Failed to connect to realtime channel'));
            }
          });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsConnected(false);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, onUpdate, supabase]);

  return { isConnected, error, unreadCount };
}
