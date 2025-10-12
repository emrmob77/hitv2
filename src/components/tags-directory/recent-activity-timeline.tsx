"use client";

import Link from 'next/link';
import { Clock, Heart, Bookmark, UserPlus, Hash, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ActivityType = 'like' | 'save' | 'follow' | 'tag' | 'comment';

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  target: {
    type: 'bookmark' | 'tag' | 'user';
    id: string;
    name: string;
    slug?: string;
  };
  createdAt: string;
}

interface RecentActivityTimelineProps {
  activities: Activity[];
}

const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: typeof Heart;
  color: string;
  bgColor: string;
  text: (activity: Activity) => string;
}> = {
  like: {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    text: (activity) => `liked "${activity.target.name}"`,
  },
  save: {
    icon: Bookmark,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    text: (activity) => `saved "${activity.target.name}"`,
  },
  follow: {
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    text: (activity) => `followed @${activity.target.name}`,
  },
  tag: {
    icon: Hash,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    text: (activity) => `added tag #${activity.target.name}`,
  },
  comment: {
    icon: MessageCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    text: (activity) => `commented on "${activity.target.name}"`,
  },
};

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActivityUrl(activity: Activity): string {
  switch (activity.target.type) {
    case 'bookmark':
      return `/bookmark/${activity.target.id}/${activity.target.slug || ''}`;
    case 'tag':
      return `/tag/${activity.target.slug || activity.target.id}`;
    case 'user':
      return `/${activity.target.slug || activity.target.name}`;
    default:
      return '#';
  }
}

function ActivityItem({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;
  const userInitial = activity.user.displayName?.[0] || activity.user.username[0] || '?';

  return (
    <div className="relative flex gap-3 pb-6">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-4 top-8 h-full w-0.5 bg-gradient-to-b from-neutral-200 to-transparent" />
      )}

      {/* Avatar */}
      <Link
        href={`/${activity.user.username}`}
        className="relative z-10 flex-shrink-0"
      >
        <Avatar className="h-8 w-8 border-2 border-white shadow-sm transition-transform hover:scale-110">
          <AvatarImage src={activity.user.avatarUrl || undefined} alt={activity.user.username} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white">
            {userInitial.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {/* Activity Icon */}
          <div className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${config.bgColor}`}>
            <Icon className={`h-3 w-3 ${config.color}`} />
          </div>

          {/* Activity Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-700">
              <Link
                href={`/${activity.user.username}`}
                className="font-semibold text-neutral-900 hover:text-indigo-600"
              >
                {activity.user.displayName || activity.user.username}
              </Link>
              <span className="mx-1 text-neutral-500">
                {config.text(activity)}
              </span>
            </p>

            {/* Target Link */}
            {(activity.target.type === 'bookmark' || activity.target.type === 'tag') && (
              <Link
                href={getActivityUrl(activity)}
                className="mt-1 block truncate text-xs text-neutral-500 hover:text-indigo-600"
              >
                {activity.target.type === 'tag' && '#'}
                {activity.target.name}
              </Link>
            )}

            {/* Timestamp */}
            <p className="mt-1 text-xs text-neutral-400">
              {formatTimeAgo(activity.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-neutral-400" />
          <h3 className="text-lg font-bold text-neutral-900">Recent Activity</h3>
        </div>
        <p className="text-center text-sm text-neutral-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-neutral-900">Recent Activity</h3>
        </div>
        <span className="text-xs text-neutral-500">Live</span>
      </div>

      <div className="space-y-0">
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            isLast={index === activities.length - 1}
          />
        ))}
      </div>

      {activities.length >= 10 && (
        <Link
          href="/activity"
          className="mt-4 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All Activity →
        </Link>
      )}
    </div>
  );
}
