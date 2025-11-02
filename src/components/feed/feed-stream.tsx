'use client';

import { useEffect, useMemo, useState } from 'react';

import { BookmarkCard } from '@/components/bookmarks/bookmark-card';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface FeedBookmark {
  id: string;
  created_at: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  bookmark_tags?: Array<{
    tags: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }> | null;
  [key: string]: unknown;
}

interface FeedStreamProps {
  initialBookmarks: FeedBookmark[];
  followingIds: string[];
  emptyState: React.ReactNode;
}

const MAX_FEED_ITEMS = 50;

export function FeedStream({ initialBookmarks, followingIds, emptyState }: FeedStreamProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  useEffect(() => {
    if (!supabase || followingIds.length === 0) {
      return;
    }

    const channels = followingIds.map((profileId) =>
      supabase
        .channel(`feed-bookmarks-${profileId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${profileId}`,
          },
          async (payload) => {
            const { data, error } = await supabase
              .from('bookmarks')
              .select(
                `
                *,
                profiles (
                  id,
                  username,
                  display_name,
                  avatar_url
                ),
                bookmark_tags (
                  tags (
                    id,
                    name,
                    slug
                  )
                )
              `
              )
              .eq('id', payload.new.id)
              .maybeSingle();

            if (error || !data) {
              return;
            }

            setBookmarks((current) => {
              if (current.some((item) => item.id === data.id)) {
                return current;
              }

              const next = [data as FeedBookmark, ...current];
              if (next.length > MAX_FEED_ITEMS) {
                next.length = MAX_FEED_ITEMS;
              }
              return next;
            });
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, followingIds]);

  if (bookmarks.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} showAuthor />
      ))}
    </div>
  );
}
