"use client";

import type { ReactNode } from "react";
import { Bell, Bookmark, Heart, MessageCircle, UserPlus } from "lucide-react";

export interface NotificationDataPayload {
  content_type?: string;
  content_id?: string;
  bookmark_slug?: string;
  collection_slug?: string;
  sender_username?: string;
  [key: string]: unknown;
}

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  data: NotificationDataPayload;
  is_read: boolean;
  created_at: string;
}

export const getNotificationIcon = (type: string): ReactNode => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
    case "comment_reply":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "bookmark_saved":
      return <Bookmark className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-neutral-500" />;
  }
};

export const resolveNotificationLink = (notification: NotificationRecord): string => {
  const { data, type } = notification;

  const { content_type, content_id, bookmark_slug, collection_slug, sender_username } = data;

  if (type === "follow" && sender_username) {
    return `/${sender_username}`;
  }

  if (content_type === "bookmark" && content_id && bookmark_slug) {
    return `/bookmark/${content_id}/${bookmark_slug}`;
  }

  if (content_type === "collection" && collection_slug) {
    return `/collections/${collection_slug}`;
  }

  if ((type === "comment" || type === "comment_reply") && content_type && content_id) {
    if (content_type === "bookmark" && bookmark_slug) {
      return `/bookmark/${content_id}/${bookmark_slug}`;
    }

    if (content_type === "collection" && collection_slug) {
      return `/collections/${collection_slug}`;
    }
  }

  return "#";
};

export const resolveNotificationText = (notification: NotificationRecord): string => {
  return notification.title;
};
