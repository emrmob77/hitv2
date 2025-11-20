'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bookmark, Folder, Heart, Users, Lock, Sparkles } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';
import { CollectionCard } from '@/components/collections/collection-card';
import { PremiumPostCard } from '@/components/posts/premium-post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/profile/follow-button';
import { SubscriptionButton } from '@/components/profile/subscription-button';

interface UserProfileTabsProps {
  username: string;
  userId: string;
  isOwnProfile: boolean;
  isSubscribed: boolean;
  isPremiumCreator: boolean;
  premiumPostCount: number;
  currentUserId?: string;
}

type ProfileBookmark = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  likes: number;
  saves: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  createdAt: string | null;
  likedAt?: string | null;
};

type ProfileCollection = {
  id: string;
  [key: string]: any;
};

type FollowingUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followedAt: string | null;
  isViewerFollowing: boolean;
};

type PremiumPost = {
  id: string;
  title: string;
  slug: string;
  visibility: 'public' | 'subscribers' | 'premium' | 'private';
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  teaser: string;
};

function normaliseSlug(source: string | null | undefined): string {
  if (!source) {
    return '';
  }

  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function UserProfileTabs({
  username,
  userId,
  isOwnProfile,
  isSubscribed,
  isPremiumCreator,
  premiumPostCount,
  currentUserId,
}: UserProfileTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam && ['bookmarks', 'collections', 'likes', 'following', 'premium', 'followers', 'subscribers', 'link-groups'].includes(tabParam)
    ? tabParam
    : 'bookmarks';

  const [bookmarks, setBookmarks] = useState<ProfileBookmark[]>([]);
  const [collections, setCollections] = useState<ProfileCollection[]>([]);
  const [likedBookmarks, setLikedBookmarks] = useState<ProfileBookmark[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [premiumPosts, setPremiumPosts] = useState<PremiumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const showPremiumTab = isPremiumCreator || premiumPostCount > 0;
  const visiblePremiumPosts = isOwnProfile
    ? premiumPosts
    : premiumPosts.filter((post) => post.visibility !== 'private');
  const hasHiddenPremiumPosts =
    !isOwnProfile && premiumPosts.length > 0 && visiblePremiumPosts.length === 0;

  const createExcerpt = (content: string, limit = 160) => {
    const condensed = content
      .replace(/[#>*_`~/]/g, ' ')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (condensed.length <= limit) {
      return condensed;
    }

    return `${condensed.slice(0, limit - 1).trimEnd()}…`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);

      try {
        const supabase = createSupabaseBrowserClient();

        const [
          bookmarksResponse,
          collectionsResponse,
          likesResponse,
          followingResponse,
          premiumPostsResponse,
        ] = await Promise.all([
          supabase
            .from('bookmarks')
            .select(
              `
                id,
                title,
                slug,
                description,
                image_url,
                like_count,
                save_count,
                click_count,
                created_at,
                profiles (
                  username,
                  display_name,
                  avatar_url
                ),
                bookmark_tags (
                  tags (
                    name,
                    slug
                  )
                )
              `
            )
            .eq('user_id', userId)
            .eq('privacy_level', 'public')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('collections')
            .select('*, profiles(username, display_name, avatar_url)')
            .eq('user_id', userId)
            .eq('privacy_level', 'public')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('likes')
            .select('likeable_id, created_at')
            .eq('user_id', userId)
            .eq('likeable_type', 'bookmark')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('follows')
            .select(
              `
                created_at,
                following:profiles!follows_following_id_fkey (
                  id,
                  username,
                  display_name,
                  avatar_url,
                  bio
                )
              `
            )
            .eq('follower_id', userId)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('exclusive_posts')
            .select(
              `
                id,
                title,
                slug,
                content,
                visibility,
                created_at,
                like_count,
                comment_count,
                view_count
              `
            )
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(24),
        ]);

        const bookmarksRaw = bookmarksResponse.data || [];
        const collectionsRaw = collectionsResponse.data || [];
        const likesRaw = likesResponse.data || [];
        const followingRaw = followingResponse.data || [];
        const premiumPostsRaw = premiumPostsResponse?.data || [];

        const bookmarkIds = bookmarksRaw.map((bookmark: any) => bookmark.id);
        const likedBookmarkIds = likesRaw
          .map((like: { likeable_id?: string }) => like.likeable_id)
          .filter(Boolean) as string[];
        const allBookmarkIds = Array.from(new Set([...bookmarkIds, ...likedBookmarkIds]));

        const followingTargetIds = followingRaw
          .map((entry: { following?: { id?: string } | null }) => entry.following?.id)
          .filter(Boolean) as string[];

        let viewerLikedIds = new Set<string>();
        let viewerSavedIds = new Set<string>();
        let viewerFollowingIds = new Set<string>();

        if (currentUserId && allBookmarkIds.length > 0) {
          const [{ data: viewerLikes }, { data: viewerSaves }] = await Promise.all([
            supabase
              .from('likes')
              .select('likeable_id')
              .eq('likeable_type', 'bookmark')
              .eq('user_id', currentUserId)
              .in('likeable_id', allBookmarkIds),
            supabase
              .from('saved_bookmarks')
              .select('bookmark_id')
              .eq('user_id', currentUserId)
              .in('bookmark_id', allBookmarkIds),
          ]);

          viewerLikedIds = new Set(
            (viewerLikes || [])
              .map((row: { likeable_id?: string }) => row.likeable_id)
              .filter(Boolean) as string[]
          );
          viewerSavedIds = new Set(
            (viewerSaves || [])
              .map((row: { bookmark_id?: string }) => row.bookmark_id)
              .filter(Boolean) as string[]
          );
        }

        if (currentUserId && followingTargetIds.length > 0) {
          const { data: viewerFollowRows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUserId)
            .in('following_id', followingTargetIds);

          viewerFollowingIds = new Set(
            (viewerFollowRows || [])
              .map((row: { following_id?: string }) => row.following_id)
              .filter(Boolean) as string[]
          );
        }

        const mapBookmarkRecord = (bookmark: any): ProfileBookmark => {
          const rawTags =
            bookmark.bookmark_tags
              ?.map((bt: { tags?: { name: string; slug: string } | null }) => bt?.tags)
              .filter(Boolean) || [];

          const tags = rawTags.map((tag: { name: string; slug: string }) => ({
            name: tag.name,
            slug: tag.slug,
          }));

          const derivedSlug =
            bookmark.slug ||
            normaliseSlug(bookmark.title) ||
            normaliseSlug(bookmark.profiles?.username) ||
            bookmark.id;

          return {
            id: bookmark.id,
            title: bookmark.title,
            slug: derivedSlug,
            description: bookmark.description,
            imageUrl: bookmark.image_url,
            likes: bookmark.like_count ?? 0,
            saves: bookmark.save_count ?? 0,
            shares: bookmark.click_count ?? 0,
            isLiked: viewerLikedIds.has(bookmark.id),
            isSaved: viewerSavedIds.has(bookmark.id),
            author: {
              username: bookmark.profiles?.username ?? username,
              displayName: bookmark.profiles?.display_name ?? null,
              avatarUrl: bookmark.profiles?.avatar_url ?? null,
            },
            tags,
            createdAt: bookmark.created_at,
          };
        };

        const mappedBookmarks = (bookmarksRaw || []).map(mapBookmarkRecord);

        let mappedLikedBookmarks: ProfileBookmark[] = [];
        if (likedBookmarkIds.length > 0) {
          const { data: likedBookmarkDetails } = await supabase
            .from('bookmarks')
            .select(
              `
                id,
                title,
                slug,
                description,
                image_url,
                like_count,
                save_count,
                click_count,
                created_at,
                profiles (
                  username,
                  display_name,
                  avatar_url
                ),
                bookmark_tags (
                  tags (
                    name,
                    slug
                  )
                )
              `
            )
            .in('id', likedBookmarkIds)
            .eq('privacy_level', 'public');

          const likedLookup = new Map(
            (likedBookmarkDetails || []).map((bookmark: any) => [bookmark.id, bookmark])
          );

          mappedLikedBookmarks = likesRaw
            .map((like: { likeable_id?: string; created_at?: string }) => {
              if (!like.likeable_id) {
                return null;
              }
              const bookmarkRecord = likedLookup.get(like.likeable_id);
              if (!bookmarkRecord) {
                return null;
              }

              return {
                ...mapBookmarkRecord(bookmarkRecord),
                likedAt: like.created_at ?? null,
              };
            })
            .filter(Boolean) as ProfileBookmark[];
        }

        const mappedFollowing = (followingRaw || [])
          .map((entry: { created_at?: string; following?: any }) => {
            if (!entry.following) {
              return null;
            }

            return {
              id: entry.following.id,
              username: entry.following.username,
              displayName: entry.following.display_name ?? null,
              avatarUrl: entry.following.avatar_url ?? null,
              bio: entry.following.bio ?? null,
              followedAt: entry.created_at ?? null,
              isViewerFollowing: viewerFollowingIds.has(entry.following.id),
            } satisfies FollowingUser;
          })
          .filter(Boolean) as FollowingUser[];

        const mappedPremiumPosts: PremiumPost[] = (premiumPostsRaw || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: normaliseSlug(post.slug) || post.id,
          visibility: post.visibility,
          createdAt: post.created_at,
          likeCount: post.like_count ?? 0,
          commentCount: post.comment_count ?? 0,
          viewCount: post.view_count ?? 0,
          teaser: createExcerpt(post.content || '', 220),
        }));

        if (!isMounted) {
          return;
        }

        setBookmarks(mappedBookmarks);
        setCollections((collectionsRaw as ProfileCollection[]) || []);
        setLikedBookmarks(mappedLikedBookmarks);
        setFollowingUsers(mappedFollowing);
        setPremiumPosts(mappedPremiumPosts);
      } catch (error) {
        console.error('Failed to load profile content', error);
        if (!isMounted) {
          return;
        }
        setBookmarks([]);
        setCollections([]);
        setLikedBookmarks([]);
        setFollowingUsers([]);
        setPremiumPosts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, currentUserId, username]);

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-8 inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <TabsTrigger
          value="bookmarks"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          <Bookmark className="h-4 w-4" strokeWidth={2} />
          Bookmarks
        </TabsTrigger>
        <TabsTrigger
          value="collections"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          <Folder className="h-4 w-4" strokeWidth={2} />
          Collections
        </TabsTrigger>
        <TabsTrigger
          value="likes"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          <Heart className="h-4 w-4" strokeWidth={2} />
          Likes
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          <Users className="h-4 w-4" strokeWidth={2} />
          Following
        </TabsTrigger>
        {showPremiumTab && (
          <TabsTrigger
            value="premium"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all text-amber-700 hover:bg-amber-50 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Lock className="h-4 w-4" strokeWidth={2} />
            Premium
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="bookmarks" className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-600 font-medium">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <Bookmark className="h-10 w-10 text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No bookmarks yet</h3>
            <p className="text-base text-gray-600">
              {isOwnProfile
                ? 'Start adding bookmarks to build your collection'
                : `${username} hasn't added any public bookmarks yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <TrendingBookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                detailUrl={`/bookmark/${bookmark.id}/${bookmark.slug}`}
                visitUrl={`/out/bookmark/${bookmark.id}`}
                currentUserId={currentUserId}
                trendLabel={
                  bookmark.createdAt
                    ? `${formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}`
                    : undefined
                }
                layout="list"
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="collections" className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-600 font-medium">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <Folder className="h-10 w-10 text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No collections yet</h3>
            <p className="text-base text-gray-600">
              {isOwnProfile
                ? 'Create collections to organize your bookmarks'
                : `${username} hasn't created any public collections yet`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="likes" className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-600 font-medium">Loading liked bookmarks...</div>
        ) : likedBookmarks.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <Heart className="h-10 w-10 text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No liked bookmarks yet</h3>
            <p className="text-base text-gray-600">
              {isOwnProfile
                ? 'Start liking bookmarks to see them listed here'
                : `${username} hasn't liked any public bookmarks yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {likedBookmarks.map((bookmark) => (
              <TrendingBookmarkCard
                key={`liked-${bookmark.id}`}
                bookmark={bookmark}
                detailUrl={`/bookmark/${bookmark.id}/${bookmark.slug}`}
                visitUrl={`/out/bookmark/${bookmark.id}`}
                currentUserId={currentUserId}
                trendLabel={
                  bookmark.likedAt
                    ? `Liked ${formatDistanceToNow(new Date(bookmark.likedAt), { addSuffix: true })}`
                    : bookmark.createdAt
                      ? formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })
                      : undefined
                }
                layout="list"
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="following" className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-600 font-medium">Loading following list...</div>
        ) : followingUsers.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <Users className="h-10 w-10 text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Not following anyone yet</h3>
            <p className="text-base text-gray-600">
              {isOwnProfile
                ? 'Discover creators to follow from the explore page'
                : `${username} isn't following anyone yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <Link href={`/${user.username}`} className="flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName ?? user.username} />
                      <AvatarFallback className="text-sm">
                        {(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/${user.username}`}
                      className="block text-sm font-semibold text-neutral-900 hover:text-neutral-700"
                    >
                      {user.displayName || user.username}
                    </Link>
                    <p className="text-xs text-neutral-500">@{user.username}</p>
                    {user.bio && (
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{user.bio}</p>
                    )}
                    {user.followedAt && (
                      <p className="mt-2 text-xs text-neutral-500">
                        Following since {formatDistanceToNow(new Date(user.followedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                {currentUserId && currentUserId !== user.id && (
                  <FollowButton
                    profileId={user.id}
                    currentUserId={currentUserId}
                    isFollowing={user.isViewerFollowing || currentUserId === userId}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {showPremiumTab && (
        <TabsContent value="premium" className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-gray-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
                  <Sparkles className="h-5 w-5" strokeWidth={2.5} />
                  Premium feed
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {isOwnProfile
                    ? 'Curate premium drops and track engagement'
                    : `Exclusive content from ${username}`}
                </h3>
                <p className="text-sm text-neutral-600">
                  {isOwnProfile
                    ? 'Draft subscriber-only insights, gated resources and weekly drops. Subscribers see everything immediately.'
                    : 'Subscribe to unlock the full archive, gated resources and every new premium drop as soon as it lands.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Button asChild>
                    <Link href="/dashboard/posts/new">Create premium post</Link>
                  </Button>
                ) : currentUserId ? (
                  <SubscriptionButton creatorId={userId} isSubscribed={isSubscribed} />
                ) : (
                  <Button asChild>
                    <Link href="/login">Sign in to subscribe</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-600 font-medium">Loading premium posts...</div>
          ) : visiblePremiumPosts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
                <Lock className="h-10 w-10 text-amber-600" strokeWidth={2.5} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {hasHiddenPremiumPosts ? 'Premium posts are locked' : 'No premium drops yet'}
              </h3>
              <p className="text-base text-gray-600">
                {hasHiddenPremiumPosts
                  ? 'Subscribe to unlock the full archive of premium content.'
                  : isOwnProfile
                  ? 'Publish your first premium post to give subscribers something special.'
                  : `${username} hasn't published any premium posts yet.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visiblePremiumPosts.map((post) => (
                <PremiumPostCard
                  key={post.id}
                  username={username}
                  post={post}
                  isLockedView={!isOwnProfile && !isSubscribed && post.visibility !== 'public'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
