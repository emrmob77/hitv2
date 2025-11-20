import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { UserProfileHeader } from '@/components/profile/user-profile-header';
import { UserProfileTabs } from '@/components/profile/user-profile-tabs';
import { UserProfileSidebar } from '@/components/profile/user-profile-sidebar';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio, avatar_url')
    .eq('username', username)
    .single();

  if (!profile) {
    return {
      title: 'User Not Found',
    };
  }

  const displayName = profile.display_name || profile.username;
  const title = `${displayName} (@${profile.username})`;
  const description = profile.bio || `Check out ${displayName}'s bookmarks and collections on HitTags`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createSupabaseServerClient();

  // Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  // Get bookmark stats
  const { count: bookmarkCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('privacy_level', 'public');

  // Get collection stats
  const { count: collectionCount } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('privacy_level', 'public');

  // Get follower counts
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  const { count: premiumPostCount } = await supabase
    .from('exclusive_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  // Check if current user follows this profile
  let isFollowing = false;
  let isSubscribed = false;
  if (user) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single();
    isFollowing = !!followData;

    const { data: subscriptionData } = await supabase
      .from('subscriptions_user')
      .select('status')
      .eq('subscriber_id', user.id)
      .eq('creator_id', profile.id)
      .maybeSingle();

    isSubscribed = subscriptionData?.status === 'active';
  }

  const { count: subscriberCount } = await supabase
    .from('subscriptions_user')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', profile.id)
    .eq('status', 'active');

  const stats = {
    bookmarks: bookmarkCount || 0,
    collections: collectionCount || 0,
    followers: followerCount || 0,
    following: followingCount || 0,
    likes: profile.total_likes_received || 0,
    subscribers: subscriberCount || 0,
    premiumPosts: premiumPostCount || 0,
  };

  const isOwnProfile = user?.id === profile.id;
  const subscriptionTier = profile.subscription_tier || profile.plan_type || 'free';
  const isPremiumCreator =
    (typeof profile.is_premium === 'boolean' ? profile.is_premium : undefined) ??
    subscriptionTier !== 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <UserProfileHeader
          profile={profile}
          stats={stats}
          isFollowing={isFollowing}
          isSubscribed={isSubscribed}
          isOwnProfile={isOwnProfile}
          currentUserId={user?.id}
        />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <UserProfileTabs
              username={username}
              userId={profile.id}
              isOwnProfile={isOwnProfile}
              isSubscribed={isSubscribed}
              isPremiumCreator={isPremiumCreator}
              premiumPostCount={stats.premiumPosts}
              currentUserId={user?.id}
            />
          </div>

          <div className="lg:col-span-1">
            <UserProfileSidebar
              profile={profile}
              stats={stats}
              isOwnProfile={isOwnProfile}
              isSubscribed={isSubscribed}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
