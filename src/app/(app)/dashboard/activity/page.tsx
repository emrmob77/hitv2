import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ActivityFeed } from '@/components/activity/activity-feed';

export const metadata = {
  title: 'Activity - HitTags',
  description: 'See what people you follow are doing',
};

// Disable caching for real-time updates
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getFollowingActivities(userId: string) {
  const supabase = await createSupabaseServerClient();

  // Get users that current user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map((f) => f.following_id) || [];

  // Include current user's own activities
  const userIds = [...followingIds, userId];

  // Get activities from followed users and self
  const { data: activities } = await supabase
    .from('activities')
    .select(
      `
      *,
      profiles!activities_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .in('user_id', userIds)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50);

  // Enrich activities with content details
  const enrichedActivities = await Promise.all(
    (activities || []).map(async (activity) => {
      let contentDetails = null;

      if (activity.object_id && activity.object_type) {
        if (activity.object_type === 'bookmark') {
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id, title, url, description, slug')
            .eq('id', activity.object_id)
            .single();
          contentDetails = bookmark;
        } else if (activity.object_type === 'collection') {
          const { data: collection } = await supabase
            .from('collections')
            .select('id, title, slug, description')
            .eq('id', activity.object_id)
            .single();
          contentDetails = collection;
        }
      }

      return {
        ...activity,
        content_details: contentDetails,
      };
    })
  );

  return enrichedActivities;
}

export default async function ActivityPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const activities = await getFollowingActivities(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Activity</h1>
        <p className="mt-2 text-neutral-600">
          Your recent activities and updates from people you follow
        </p>
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}
