'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, UserPlus, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
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
  content_details?: {
    id: string;
    title?: string;
    slug?: string;
    url?: string;
    description?: string;
  } | null;
}

interface ActivityFeedProps {
  activities: Activity[];
}

type ActivityFilter = 'all' | 'like' | 'comment' | 'follow' | 'create';

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const tabs = [
    { id: 'all' as ActivityFilter, label: 'All Activity', icon: Sparkles, count: activities.length },
    { id: 'like' as ActivityFilter, label: 'Likes', icon: Heart, count: activities.filter(a => a.action === 'like').length },
    { id: 'comment' as ActivityFilter, label: 'Comments', icon: MessageCircle, count: activities.filter(a => a.action === 'comment').length },
    { id: 'create' as ActivityFilter, label: 'Bookmarks', icon: Bookmark, count: activities.filter(a => a.action === 'create').length },
    { id: 'follow' as ActivityFilter, label: 'Follows', icon: UserPlus, count: activities.filter(a => a.action === 'follow').length },
  ];

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(activity => activity.action === filter);

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

  const getContentLink = (activity: Activity) => {
    if (!activity.object_id || !activity.object_type) return null;

    // For all actions (like, comment, create), link to the content
    if (activity.object_type === 'bookmark' && activity.content_details?.slug) {
      return `/bookmark/${activity.object_id}/${activity.content_details.slug}`;
    } else if (activity.object_type === 'collection' && activity.content_details?.slug) {
      return `/collections/${activity.content_details.slug}`;
    }

    return null;
  };

  const getActivityText = (activity: Activity) => {
    const displayName = activity.profiles.display_name || activity.profiles.username;
    const username = activity.profiles.username;
    const contentTitle = activity.content_details?.title || activity.content_title;

    switch (activity.action) {
      case 'like':
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            liked {contentTitle ? (
              <span className="font-medium">"{contentTitle}"</span>
            ) : (
              `a ${activity.object_type || 'post'}`
            )}
          </>
        );
      case 'comment':
        return (
          <>
            <Link href={`/${username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>{' '}
            commented on {contentTitle ? (
              <span className="font-medium">"{contentTitle}"</span>
            ) : (
              `a ${activity.object_type || 'post'}`
            )}
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
            {contentTitle && (
              <>
                : <span className="font-medium">"{contentTitle}"</span>
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
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200 bg-white rounded-t-xl">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap
                  border-b-2 transition-all flex-shrink-0
                  ${isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-neutral-100 text-neutral-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-900">No {filter} activity</h3>
          <p className="mt-2 text-neutral-600">
            {filter === 'all'
              ? 'Activity from people you follow will appear here'
              : `No ${filter} activity yet from people you follow`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
        const contentLink = getContentLink(activity);
        const contentDetails = activity.content_details;
        const contentTitle = contentDetails?.title;
        const contentUrl = contentDetails?.url;
        const contentDescription = contentDetails?.description;

        return (
          <div
            key={activity.id}
            className="rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-md hover:border-neutral-300 overflow-hidden"
          >
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.action)}</div>

              <Link
                href={`/${activity.profiles.username}`}
                className="flex-shrink-0"
              >
                {activity.profiles.avatar_url ? (
                  <img
                    src={activity.profiles.avatar_url}
                    alt={activity.profiles.display_name || activity.profiles.username}
                    className="h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-neutral-300 transition-all"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 hover:from-neutral-300 hover:to-neutral-400 transition-all">
                    <span className="text-sm font-semibold text-neutral-700">
                      {(activity.profiles.display_name || activity.profiles.username)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {getActivityText(activity)}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>

                  {contentLink && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <Link
                        href={contentLink}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        View {activity.object_type}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bookmark/Collection Card */}
            {contentDetails && contentLink && (
              <Link
                href={contentLink}
                className="block border-t border-neutral-100 bg-neutral-50 p-4 hover:bg-neutral-100 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {contentTitle && (
                      <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {contentTitle}
                      </h4>
                    )}
                    {contentDescription && (
                      <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                        {contentDescription}
                      </p>
                    )}
                    {contentUrl && activity.object_type === 'bookmark' && (
                      <div className="flex items-center gap-1 mt-2">
                        <ExternalLink className="h-3 w-3 text-neutral-400" />
                        <p className="text-xs text-neutral-500 truncate">
                          {new URL(contentUrl).hostname}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {activity.object_type === 'bookmark' ? (
                      <Bookmark className="h-5 w-5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    ) : (
                      <div className="h-5 w-5 rounded bg-neutral-200 group-hover:bg-blue-600 transition-colors" />
                    )}
                  </div>
                </div>
              </Link>
            )}
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
}
