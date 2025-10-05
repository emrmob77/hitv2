'use client';

import Link from 'next/link';
import { Heart, MessageCircle, UserPlus, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  action: 'like' | 'comment' | 'follow' | 'create';
  object_type: string | null;
  object_id: string | null;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  // Additional content info if needed
  content_title?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'create':
        return <Bookmark className="h-5 w-5 text-purple-500" />;
      default:
        return <Bookmark className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const displayName = activity.profiles.display_name || activity.profiles.username;
    const username = activity.profiles.username;

    switch (activity.action) {
      case 'like':
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            liked a {activity.object_type || 'post'}
          </>
        );
      case 'comment':
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            commented on a {activity.object_type || 'post'}
          </>
        );
      case 'follow':
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            started following someone
          </>
        );
      case 'create':
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            saved a new bookmark
            {activity.content_title && (
              <>
                : <span className="font-medium">{activity.content_title}</span>
              </>
            )}
          </>
        );
      default:
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            did something
          </>
        );
    }
  };

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-neutral-300" />
        <h3 className="mt-4 text-lg font-semibold text-neutral-900">No activity yet</h3>
        <p className="mt-2 text-neutral-600">
          Activity from people you follow will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex-shrink-0">{getActivityIcon(activity.action)}</div>

          <Link
            href={`/${activity.profiles.username}`}
            className="flex-shrink-0"
          >
            {activity.profiles.avatar_url ? (
              <img
                src={activity.profiles.avatar_url}
                alt={activity.profiles.display_name || activity.profiles.username}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
                <span className="text-sm font-semibold text-neutral-600">
                  {(activity.profiles.display_name || activity.profiles.username)
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-700">{getActivityText(activity)}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
