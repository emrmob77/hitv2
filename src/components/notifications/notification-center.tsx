"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2, Check, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getNotificationIcon,
  resolveNotificationLink,
  resolveNotificationText,
  type NotificationRecord,
} from "@/components/notifications/utils";

interface NotificationCenterProps {
  initialNotifications: NotificationRecord[];
  initialUnreadCount: number;
}

type FilterValue = "all" | "unread";

export function NotificationCenter({
  initialNotifications,
  initialUnreadCount,
}: NotificationCenterProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() =>
    initialNotifications.map((notification) => ({
      ...notification,
      data: notification.data ?? {},
    }))
  );
  const [filter, setFilter] = useState<FilterValue>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  const enrichNotification = useCallback(
    async (notification: NotificationRecord): Promise<NotificationRecord> => {
      const enrichedData = { ...(notification.data ?? {}) };

      if (
        notification.data?.sender_id &&
        (!enrichedData.sender_username || enrichedData.sender_username === null)
      ) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("username, display_name")
          .eq("id", notification.data.sender_id as string)
          .single();
        if (profile) {
          enrichedData.sender_username = profile.username;
          enrichedData.sender_display_name = profile.display_name;
        }
      }

      if (
        notification.data?.content_type === "bookmark" &&
        notification.data?.content_id &&
        !enrichedData.bookmark_slug
      ) {
        const { data: bookmark } = await supabaseClient
          .from("bookmarks")
          .select("slug")
          .eq("id", notification.data.content_id as string)
          .single();
        if (bookmark) {
          enrichedData.bookmark_slug = bookmark.slug;
        }
      }

      if (
        notification.data?.content_type === "collection" &&
        notification.data?.content_id &&
        !enrichedData.collection_slug
      ) {
        const { data: collection } = await supabaseClient
          .from("collections")
          .select("slug, user_id")
          .eq("id", notification.data.content_id as string)
          .single();
        if (collection) {
          enrichedData.collection_slug = collection.slug;

          if (!enrichedData.collection_owner_username && collection.user_id) {
            const { data: ownerProfile } = await supabaseClient
              .from("profiles")
              .select("username")
              .eq("id", collection.user_id)
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
    },
    [supabaseClient]
  );

  useEffect(() => {
    const needsEnrichment = initialNotifications.some((notification) => {
      const data = notification.data || {};

      if (data.sender_id && !data.sender_username) {
        return true;
      }

      if (data.content_type === "bookmark" && !data.bookmark_slug) {
        return true;
      }

      if (data.content_type === "collection" && !data.collection_slug) {
        return true;
      }

      return false;
    });

    if (!needsEnrichment) {
      return;
    }

    let isMounted = true;
    (async () => {
      const enriched = await Promise.all(
        initialNotifications.map(async (notification) => {
          const enrichedNotification = await enrichNotification(notification);
          return enrichedNotification;
        })
      );

      if (isMounted) {
        setNotifications(enriched);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [initialNotifications, enrichNotification]);

  const fetchLatestNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=50");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch notifications.");
      }

      const enriched = await Promise.all(
        (data.notifications || []).map((notification: NotificationRecord) => enrichNotification(notification))
      );

      setNotifications(enriched);
      if (typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  }, [enrichNotification]);

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabaseClient.channel> | null = null;

    const handleRefresh = () => {
      void fetchLatestNotifications();
    };

    const intervalId = window.setInterval(() => {
      void fetchLatestNotifications();
    }, 20000);

    window.addEventListener("notifications:refresh", handleRefresh as EventListener);
    void fetchLatestNotifications();

    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (!isMounted || !user) {
        return;
      }

      channel = supabaseClient
        .channel('notifications-center')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const inserted = payload.new as NotificationRecord;
            const enriched = await enrichNotification(inserted);
            setNotifications((prev) => {
              const existing = prev.some((item) => item.id === enriched.id);
              if (existing) {
                return prev;
              }
              const next = [enriched, ...prev];
              return next.slice(0, 200);
            });
            if (!inserted.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const updated = payload.new as NotificationRecord;
            const previous = payload.old as NotificationRecord | null;

            const enriched = await enrichNotification(updated);

            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === enriched.id
                  ? { ...notification, ...enriched, data: enriched.data ?? {} }
                  : notification
              )
            );

            const wasUnread = previous?.is_read === false;
            const isUnreadNow = enriched.is_read === false;

            if (wasUnread && !isUnreadNow) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            } else if (!wasUnread && isUnreadNow) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const removed = payload.old as NotificationRecord | null;
            setNotifications((prev) => prev.filter((notification) => notification.id !== removed?.id));
            if (removed?.is_read === false) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    });

    return () => {
      isMounted = false;
      if (channel) {
        supabaseClient.removeChannel(channel);
      }
      window.clearInterval(intervalId);
      window.removeEventListener("notifications:refresh", handleRefresh as EventListener);
    };
  }, [enrichNotification, supabaseClient, fetchLatestNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    return notifications;
  }, [filter, notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    setPendingId(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Could not mark the notification as read.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setPendingId(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      const deletedNotification = notifications.find((n) => n.id === notificationId);
      const wasUnread = deletedNotification?.is_read === false;

      setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast({
        title: "Notification removed",
        description: "The notification has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Could not delete the notification.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setMarkingAll(true);
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      toast({
        title: "All caught up!",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Could not mark notifications as read.",
        variant: "destructive",
      });
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-neutral-900">
            Notifications
          </CardTitle>
          <CardDescription className="text-neutral-600">
            Stay informed about new activity related to your bookmarks, collections, and followers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">Unread</p>
              <p className="text-sm text-neutral-500">
                {unreadCount === 0 ? "You're all caught up" : `${unreadCount} notifications`}
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as FilterValue)}
            >
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="outline" className="ml-2 rounded-full px-2 text-[11px]">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" disabled={notifications.length === 0}>
                  Unread
                  <Badge variant="outline" className="ml-2 rounded-full px-2 text-[11px]">
                    {unreadCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              disabled={unreadCount === 0 || markingAll}
              onClick={handleMarkAllAsRead}
            >
              {markingAll ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Marking…
                </>
              ) : (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Mark all read
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={filter}>
        <TabsContent value="all">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            pendingId={pendingId}
          />
        </TabsContent>
        <TabsContent value="unread">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            pendingId={pendingId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationListProps {
  notifications: NotificationRecord[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  pendingId: string | null;
}

function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  pendingId,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <Inbox className="h-6 w-6 text-neutral-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">No notifications</p>
            <p className="mt-1 text-sm text-neutral-500">
              When you receive new notifications, they will show up here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-neutral-100 p-0">
        {notifications.map((notification) => {
          const isPending = pendingId === notification.id;
          const isUnread = !notification.is_read;
          const link = resolveNotificationLink(notification);
          const text = resolveNotificationText(notification);

          return (
            <div
              key={notification.id}
              className={`flex flex-col gap-3 p-5 transition-colors hover:bg-neutral-50 md:flex-row md:items-center ${
                isUnread ? "bg-blue-50/40" : ""
              }`}
            >
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={link}
                      className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                      onClick={() => {
                        if (isUnread) {
                          onMarkAsRead(notification.id);
                        }
                      }}
                    >
                      {text}
                    </Link>
                    {isUnread && (
                      <Badge variant="default" className="rounded-full bg-blue-500 px-2 text-[11px]">
                        New
                      </Badge>
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-sm text-neutral-600 line-clamp-2">{notification.message}</p>
                  )}
                  <p className="text-xs text-neutral-400">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-neutral-600 hover:text-neutral-900"
                  disabled={!isUnread || isPending}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  {isPending && isUnread ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>Mark read</>
                  )}
                </Button>
                <Separator orientation="vertical" className="hidden h-6 md:block" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-neutral-600 hover:text-red-500"
                  disabled={isPending}
                  onClick={() => onDelete(notification.id)}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
