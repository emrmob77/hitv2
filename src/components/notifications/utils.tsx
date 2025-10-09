"use client";

import type { ReactNode } from "react";
import { Bell, Bookmark, Heart, MessageCircle, UserPlus } from "lucide-react";

export interface NotificationDataPayload {
  content_type?: string;
  content_id?: string;
  bookmark_id?: string;
  bookmark_slug?: string;
  collection_slug?: string;
  collection_owner_username?: string;
  sender_id?: string;
  sender_username?: string | null;
  sender_display_name?: string | null;
  parent_comment_id?: string | null;
  comment_id?: string | null;
  action?: string | null;
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

const getSenderName = (notification: NotificationRecord): string => {
  const displayName = notification.data.sender_display_name;
  const username = notification.data.sender_username;

  if (typeof displayName === "string" && displayName.trim().length > 0) {
    return displayName.trim();
  }

  if (typeof username === "string" && username.trim().length > 0) {
    return username.trim();
  }

  return "Someone";
};

export const resolveNotificationLink = (notification: NotificationRecord): string => {
  const { data, type } = notification;

  const {
    content_type,
    content_id,
    bookmark_slug,
    bookmark_id,
    collection_slug,
    collection_owner_username,
    sender_username,
    comment_id,
  } = data;

  if (type === "follow" && sender_username) {
    return `/${sender_username}`;
  }

  if (content_type === "bookmark") {
    const targetId = typeof bookmark_id === "string" && bookmark_id.length > 0
      ? bookmark_id
      : typeof content_id === "string"
        ? content_id
        : "";

    if (targetId && typeof bookmark_slug === "string" && bookmark_slug.length > 0) {
      const anchor = comment_id ? `#comment-${comment_id}` : "";
      return `/bookmark/${targetId}/${bookmark_slug}${anchor}`;
    }

    if (targetId) {
      return `/bookmark/${targetId}`;
    }
  }

  if (content_type === "collection") {
    const ownerUsername = typeof collection_owner_username === "string" && collection_owner_username.length > 0
      ? collection_owner_username
      : undefined;

    if (ownerUsername && typeof collection_slug === "string" && collection_slug.length > 0) {
      const anchor = comment_id ? `#comment-${comment_id}` : "";
      return `/c/${ownerUsername}/${collection_slug}${anchor}`;
    }

    if (typeof collection_slug === "string" && collection_slug.length > 0) {
      return `/c/${collection_slug}`;
    }
  }

  if ((type === "comment" || type === "comment_reply") && content_type && content_id) {
    if (content_type === "bookmark" && typeof bookmark_slug === "string" && bookmark_slug.length > 0) {
      const anchor = comment_id ? `#comment-${comment_id}` : "";
      return `/bookmark/${content_id}/${bookmark_slug}${anchor}`;
    }

    if (content_type === "collection" && typeof collection_slug === "string" && collection_slug.length > 0) {
      const ownerUsername = typeof collection_owner_username === "string" ? collection_owner_username : undefined;
      const anchor = comment_id ? `#comment-${comment_id}` : "";
      if (ownerUsername) {
        return `/c/${ownerUsername}/${collection_slug}${anchor}`;
      }
      return `/c/${collection_slug}${anchor}`;
    }
  }

  return "#";
};

export const resolveNotificationText = (notification: NotificationRecord): string => {
  const sender = getSenderName(notification);

  switch (notification.type) {
    case "bookmark_saved":
      return `${sender} saved your bookmark`;
    case "comment":
      if (notification.data.content_type === "collection") {
        return `${sender} commented on your collection`;
      }
      return `${sender} commented on your bookmark`;
    case "comment_reply":
      return `${sender} replied to your comment`;
    case "follow":
      return `${sender} started following you`;
    default:
      return notification.title || "New notification";
  }
};
