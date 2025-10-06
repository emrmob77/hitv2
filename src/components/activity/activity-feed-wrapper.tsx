'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { ActivityFeed } from './activity-feed';
import { useRouter } from 'next/navigation';

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
  content_details?: {
    id: string;
    title?: string;
    slug?: string;
    url?: string;
    description?: string;
  } | null;
}

interface ActivityFeedWrapperProps {
  initialActivities: Activity[];
  userId: string;
}

export function ActivityFeedWrapper({ initialActivities, userId }: ActivityFeedWrapperProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Subscribe to new activities from followed users
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
        },
        async (payload) => {
          const newActivity = payload.new as any;

          // Fetch profile and content details for the new activity
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', newActivity.user_id)
            .single();

          let contentDetails = null;
          if (newActivity.object_id && newActivity.object_type) {
            if (newActivity.object_type === 'bookmark') {
              const { data: bookmark } = await supabase
                .from('bookmarks')
                .select('id, title, url, description, slug')
                .eq('id', newActivity.object_id)
                .single();
              contentDetails = bookmark;
            } else if (newActivity.object_type === 'collection') {
              const { data: collection } = await supabase
                .from('collections')
                .select('id, title, slug, description')
                .eq('id', newActivity.object_id)
                .single();
              contentDetails = collection;
            }
          }

          const enrichedActivity = {
            ...newActivity,
            profiles: profile,
            content_details: contentDetails,
          };

          // Add to the list if it's from a user we follow or ourselves
          setActivities((prev) => [enrichedActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return <ActivityFeed activities={activities} />;
}
