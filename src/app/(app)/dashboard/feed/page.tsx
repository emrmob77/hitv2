import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookmarkCard } from '@/components/bookmarks/bookmark-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Feed - HitTags',
  description: 'Discover bookmarks from people you follow',
};

async function getFeedBookmarks(userId: string) {
  const supabase = await createSupabaseServerClient();

  // Get users that current user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map((f) => f.following_id) || [];

  if (followingIds.length === 0) {
    return [];
  }

  // Get bookmarks from followed users
  const { data: bookmarks, error } = await supabase
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
    .in('user_id', followingIds)
    .eq('privacy_level', 'public')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching feed:', error);
    return [];
  }

  return bookmarks || [];
}

async function getFollowingCount(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  return count || 0;
}

async function getSuggestedUsers(userId: string) {
  const supabase = await createSupabaseServerClient();

  // Get users that current user is not following, ordered by follower count
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map((f) => f.following_id) || [];

  let query = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, follower_count')
    .neq('id', userId)
    .order('follower_count', { ascending: false })
    .limit(5);

  if (followingIds.length > 0) {
    query = query.not('id', 'in', `(${followingIds.join(',')})`);
  }

  const { data } = await query;
  return data || [];
}

export default async function FeedPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [bookmarks, followingCount, suggestedUsers] = await Promise.all([
    getFeedBookmarks(user.id),
    getFollowingCount(user.id),
    getSuggestedUsers(user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900">Your Feed</h1>
            <p className="mt-2 text-neutral-600">
              Discover bookmarks from {followingCount} people you follow
            </p>
          </div>

          {bookmarks.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                No bookmarks in your feed
              </h3>
              <p className="mt-2 text-neutral-600">
                {followingCount === 0
                  ? 'Start following people to see their bookmarks here'
                  : 'The people you follow haven\'t shared any bookmarks yet'}
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/explore">
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Find People to Follow
                  </Button>
                </Link>
                <Link href="/trending">
                  <Button variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Explore Trending
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark: any) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} showAuthor />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Suggested Users */}
            {suggestedUsers.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                  Suggested Users
                </h3>
                <div className="space-y-4">
                  {suggestedUsers.map((profile: any) => (
                    <div
                      key={profile.id}
                      className="flex items-start justify-between"
                    >
                      <Link
                        href={`/${profile.username}`}
                        className="flex items-start space-x-3 flex-1 min-w-0"
                      >
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.display_name || profile.username}
                            className="h-10 w-10 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-300">
                            <span className="text-sm font-semibold text-neutral-600">
                              {(profile.display_name || profile.username)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {profile.display_name || profile.username}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            @{profile.username}
                          </p>
                          {profile.bio && (
                            <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                              {profile.bio}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-neutral-500">
                            {profile.follower_count} followers
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <Link href="/explore" className="mt-4 block">
                  <Button variant="outline" className="w-full" size="sm">
                    See More
                  </Button>
                </Link>
              </div>
            )}

            {/* Quick Links */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/trending"
                  className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <TrendingUp className="mr-2 inline-block h-4 w-4" />
                  Trending Bookmarks
                </Link>
                <Link
                  href="/explore"
                  className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <Users className="mr-2 inline-block h-4 w-4" />
                  Explore Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
