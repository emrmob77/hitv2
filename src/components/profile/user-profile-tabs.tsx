'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Folder, Heart, Users } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';
import { CollectionCard } from '@/components/collections/collection-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/profile/follow-button';

interface UserProfileTabsProps {
  username: string;
  userId: string;
  isOwnProfile: boolean;
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
  currentUserId,
}: UserProfileTabsProps) {
  const [bookmarks, setBookmarks] = useState<ProfileBookmark[]>([]);
  const [collections, setCollections] = useState<ProfileCollection[]>([]);
  const [likedBookmarks, setLikedBookmarks] = useState<ProfileBookmark[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

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
        ]);

        const bookmarksRaw = bookmarksResponse.data || [];
        const collectionsRaw = collectionsResponse.data || [];
        const likesRaw = likesResponse.data || [];
        const followingRaw = followingResponse.data || [];

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

        if (!isMounted) {
          return;
        }

        setBookmarks(mappedBookmarks);
        setCollections((collectionsRaw as ProfileCollection[]) || []);
        setLikedBookmarks(mappedLikedBookmarks);
        setFollowingUsers(mappedFollowing);
      } catch (error) {
        console.error('Failed to load profile content', error);
        if (!isMounted) {
          return;
        }
        setBookmarks([]);
        setCollections([]);
        setLikedBookmarks([]);
        setFollowingUsers([]);
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
    <Tabs defaultValue="bookmarks" className="w-full">
      <TabsList className="mb-6 w-full justify-start rounded-xl border border-neutral-200 bg-white p-0">
        <TabsTrigger
          value="bookmarks"
          className="rounded-l-xl data-[state=active]:bg-neutral-100"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Bookmarks
        </TabsTrigger>
        <TabsTrigger value="collections" className="data-[state=active]:bg-neutral-100">
          <Folder className="mr-2 h-4 w-4" />
          Collections
        </TabsTrigger>
        <TabsTrigger value="likes" className="data-[state=active]:bg-neutral-100">
          <Heart className="mr-2 h-4 w-4" />
          Likes
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="rounded-r-xl data-[state=active]:bg-neutral-100"
        >
          <Users className="mr-2 h-4 w-4" />
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bookmarks" className="space-y-4">
        {loading ? (
          <div className="text-center text-neutral-500">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">No bookmarks yet</h3>
            <p className="text-sm text-neutral-600">
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
          <div className="text-center text-neutral-500">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Folder className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">No collections yet</h3>
            <p className="text-sm text-neutral-600">
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
          <div className="text-center text-neutral-500">Loading liked bookmarks...</div>
        ) : likedBookmarks.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">No liked bookmarks yet</h3>
            <p className="text-sm text-neutral-600">
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
          <div className="text-center text-neutral-500">Loading following list...</div>
        ) : followingUsers.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">Not following anyone yet</h3>
            <p className="text-sm text-neutral-600">
              {isOwnProfile
                ? 'Discover creators to follow from the explore page'
                : `${username} isn’t following anyone yet`}
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
    </Tabs>
  );
}
