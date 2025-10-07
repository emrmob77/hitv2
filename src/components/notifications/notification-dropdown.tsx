'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus, Check, Trash2, Bookmark } from 'lucide-react';
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

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'comment_reply' | 'follow';
  title: string;
  message?: string;
  data: {
    sender_id?: string;
    content_type?: string;
    content_id?: string;
    bookmark_slug?: string;
    collection_slug?: string;
    sender_username?: string;
  };
  is_read: boolean;
  created_at: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for notifications
    const supabase = createSupabaseBrowserClient();

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
          (payload) => {
            // Add new notification to the list
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10');
      const data = await response.json();

      console.log('Notifications response:', data);

      if (response.ok) {
        // Enrich notifications with content details
        const enrichedNotifications = await Promise.all(
          (data.notifications || []).map(async (notification: Notification) => {
            const enrichedData = { ...notification.data };

            // Fetch bookmark slug if needed
            if (notification.data.content_type === 'bookmark' && notification.data.content_id) {
              const supabase = createSupabaseBrowserClient();
              const { data: bookmark } = await supabase
                .from('bookmarks')
                .select('slug')
                .eq('id', notification.data.content_id)
                .single();
              if (bookmark) {
                enrichedData.bookmark_slug = bookmark.slug;
              }
            }

            // Fetch collection slug if needed
            if (notification.data.content_type === 'collection' && notification.data.content_id) {
              const supabase = createSupabaseBrowserClient();
              const { data: collection } = await supabase
                .from('collections')
                .select('slug')
                .eq('id', notification.data.content_id)
                .single();
              if (collection) {
                enrichedData.collection_slug = collection.slug;
              }
            }

            // Fetch sender username for follow notifications
            if (notification.type === 'follow' && notification.data.sender_id) {
              const supabase = createSupabaseBrowserClient();
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', notification.data.sender_id)
                .single();
              if (profile) {
                enrichedData.sender_username = profile.username;
              }
            }

            return {
              ...notification,
              data: enrichedData,
            };
          })
        );

        setNotifications(enrichedNotifications);
        setUnreadCount(data.unreadCount || 0);
        console.log('Set notifications:', enrichedNotifications, 'Unread count:', data.unreadCount);
      } else {
        console.error('Notifications error:', data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
      case 'comment_reply':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'bookmark_saved':
        return <Bookmark className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    return notification.title;
  };

  const getNotificationLink = (notification: Notification) => {
    const { content_type, content_id, bookmark_slug, collection_slug, sender_username } = notification.data;

    // Follow notification - link to sender's profile
    if (notification.type === 'follow' && sender_username) {
      return `/${sender_username}`;
    }

    // Bookmark notification - link to bookmark detail page
    if (content_type === 'bookmark' && content_id && bookmark_slug) {
      return `/bookmark/${content_id}/${bookmark_slug}`;
    }

    // Collection notification - link to collection page
    if (content_type === 'collection' && collection_slug) {
      return `/collections/${collection_slug}`;
    }

    // Comment notification - link to the content that was commented on
    if ((notification.type === 'comment' || notification.type === 'comment_reply') && content_type && content_id) {
      if (content_type === 'bookmark' && bookmark_slug) {
        return `/bookmark/${content_id}/${bookmark_slug}`;
      }
      if (content_type === 'collection' && collection_slug) {
        return `/collections/${collection_slug}`;
      }
    }

    // Default fallback
    return '#';
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
                  href={getNotificationLink(notification)}
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
                      {getNotificationText(notification)}
                    </p>
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
                href="/notifications"
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
