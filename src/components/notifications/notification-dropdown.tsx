'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  getNotificationIcon,
  resolveNotificationLink,
  resolveNotificationText,
  type NotificationRecord,
} from '@/components/notifications/utils';

type NotificationType = 'like' | 'comment' | 'comment_reply' | 'follow' | 'bookmark_saved';

type Notification = NotificationRecord & {
  type: NotificationType;
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  const enrichNotification = useCallback(async (notification: Notification) => {
    const enrichedData = { ...notification.data };

    if (
      notification.data.sender_id &&
      (!enrichedData.sender_username || enrichedData.sender_username === null)
    ) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('username, display_name')
        .eq('id', notification.data.sender_id as string)
        .single();
      if (profile) {
        enrichedData.sender_username = profile.username;
        enrichedData.sender_display_name = profile.display_name;
      }
    }

    if (
      notification.data.content_type === 'bookmark' &&
      notification.data.content_id &&
      !enrichedData.bookmark_slug
    ) {
      const { data: bookmark } = await supabaseClient
        .from('bookmarks')
        .select('slug')
        .eq('id', notification.data.content_id as string)
        .single();
      if (bookmark) {
        enrichedData.bookmark_slug = bookmark.slug;
      }
    }

    if (
      notification.data.content_type === 'collection' &&
      notification.data.content_id &&
      !enrichedData.collection_slug
    ) {
      const { data: collection } = await supabaseClient
        .from('collections')
        .select('slug, user_id')
        .eq('id', notification.data.content_id as string)
        .single();
      if (collection) {
        enrichedData.collection_slug = collection.slug;
        if (!enrichedData.collection_owner_username && collection.user_id) {
          const { data: ownerProfile } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('id', collection.user_id)
            .single();
          if (ownerProfile) {
            enrichedData.collection_owner_username = ownerProfile.username;
          }
        }
      }
    }

    return {
      ...notification,
      data: enrichedData,
    };
  }, [supabaseClient]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=10');
      const data = await response.json();

      if (response.ok) {
        const enrichedNotifications = await Promise.all(
          (data.notifications || []).map(enrichNotification)
        );

        setNotifications(enrichedNotifications);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Notifications error:', data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enrichNotification]);

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for notifications
    const supabase = supabaseClient;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            try {
              const enriched = await enrichNotification(payload.new as Notification);
              setNotifications((prev) => [enriched, ...prev]);
              setUnreadCount((prev) => prev + 1);
            } catch (error) {
              console.error('Error enriching notification (realtime):', error);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [enrichNotification, supabaseClient, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const wasUnread = notifications.find((n) => n.id === notificationId)
          ?.is_read === false;

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full px-1 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-neutral-600 hover:text-neutral-900"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No notifications</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative flex items-start gap-3 p-4 hover:bg-neutral-50 ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <Link
                  href={resolveNotificationLink(notification)}
                  className="flex flex-1 items-start gap-3"
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      {resolveNotificationText(notification)}
                    </p>
                    {notification.message && (
                      <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-neutral-500" />
                </Button>

                {!notification.is_read && (
                  <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/notifications"
                className="w-full cursor-pointer text-center text-sm text-neutral-600 hover:text-neutral-900"
                onClick={() => setIsOpen(false)}
              >
                See all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
