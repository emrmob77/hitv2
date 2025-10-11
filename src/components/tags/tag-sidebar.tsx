"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

import { useToast } from "@/hooks/use-toast";

const TAG_FOLLOWERS_MISSING_MESSAGE =
  "Tag followers feature is not configured. Please run migration 008_create_tag_followers.sql.";

interface RelatedTag {
  name: string;
  slug: string;
  bookmarkCount: number;
  isFollowing?: boolean;
}

interface TopContributor {
  userId?: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bookmarkCount: number;
  isFollowing?: boolean;
}

interface PopularDomain {
  domain: string;
  bookmarkCount: number;
}

interface TagSidebarProps {
  tagSlug: string;
  statistics: {
    totalBookmarks: number;
    thisWeek: number;
    followers: number;
    avgLikes: number;
  };
  relatedTags: RelatedTag[];
  topContributors: TopContributor[];
  popularDomains: PopularDomain[];
  currentUserId?: string;
  followSupported?: boolean;
}

export function TagSidebar({
  tagSlug,
  statistics,
  relatedTags,
  topContributors,
  popularDomains,
  currentUserId,
  followSupported = true,
}: TagSidebarProps) {
  const { toast } = useToast();
  const [isTagFollowPending, startTagTransition] = useTransition();
  const [isUserFollowPending, startUserTransition] = useTransition();

  const [followerCount, setFollowerCount] = useState(statistics.followers);
  const [tagFollowSupported, setTagFollowSupported] = useState(followSupported);
  const [tagFollowMap, setTagFollowMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    relatedTags.forEach((tag) => {
      initial[tag.slug] = Boolean(tag.isFollowing);
    });
    return initial;
  });

  const [userFollowMap, setUserFollowMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    topContributors.forEach((contributor) => {
      if (contributor.userId) {
        initial[contributor.userId] = Boolean(contributor.isFollowing);
      }
    });
    return initial;
  });

  useEffect(() => {
    setFollowerCount(statistics.followers);
  }, [statistics.followers]);

  useEffect(() => {
    setTagFollowSupported(followSupported);
  }, [followSupported]);

  useEffect(() => {
    setTagFollowMap(() => {
      if (!followSupported) {
        return {};
      }

      const next: Record<string, boolean> = {};
      relatedTags.forEach((tag) => {
        next[tag.slug] = Boolean(tag.isFollowing);
      });
      return next;
    });
  }, [followSupported, relatedTags]);

  useEffect(() => {
    setUserFollowMap(() => {
      const next: Record<string, boolean> = {};
      topContributors.forEach((contributor) => {
        if (contributor.userId) {
          next[contributor.userId] = Boolean(contributor.isFollowing);
        }
      });
      return next;
    });
  }, [topContributors]);

  useEffect(() => {
    const handleFollowUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug: string; followerCount: number }>;
      if (customEvent.detail?.slug === tagSlug) {
        setFollowerCount(customEvent.detail.followerCount);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("tag-follow-updated", handleFollowUpdate as EventListener);
      return () => {
        window.removeEventListener("tag-follow-updated", handleFollowUpdate as EventListener);
      };
    }

    return undefined;
  }, [tagSlug]);

  const ensureAuthenticated = useCallback(() => {
    if (!tagFollowSupported) {
      toast({
        title: "Follow unavailable",
        description: TAG_FOLLOWERS_MISSING_MESSAGE,
        variant: "destructive",
      });
      return false;
    }

    if (currentUserId) {
      return true;
    }

    toast({
      title: "Sign in required",
      description: "Please sign in to follow tags and creators.",
      variant: "destructive",
    });
    return false;
  }, [currentUserId, tagFollowSupported, toast]);

  const toggleTagFollow = (slug: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    startTagTransition(async () => {
      try {
        const response = await fetch(`/api/tags/${slug}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 503) {
            setTagFollowSupported(false);
            setTagFollowMap((prev) => ({
              ...prev,
              [slug]: false,
            }));
          }

          throw new Error(data.error || "Unable to update tag follow state.");
        }

        setTagFollowMap((prev) => ({
          ...prev,
          [slug]: Boolean(data.isFollowing),
        }));

        if (slug === tagSlug && typeof data.followerCount === "number") {
          setFollowerCount(data.followerCount);
        }

        toast({
          title: data.isFollowing ? "Followed" : "Unfollowed",
          description: data.isFollowing
            ? "Tag added to your followed list."
            : "Tag removed from your followed list.",
        });
      } catch (error) {
        console.error("Failed to toggle related tag follow:", error);
        if (error instanceof Error && error.message.includes("migration 008_create_tag_followers.sql")) {
          setTagFollowSupported(false);
          setTagFollowMap((prev) => ({
            ...prev,
            [slug]: false,
          }));
        }

        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unable to update tag follow state.",
          variant: "destructive",
        });
      }
    });
  };

  const toggleUserFollow = (userId?: string) => {
    if (!userId || !ensureAuthenticated()) {
      return;
    }

    startUserTransition(async () => {
      try {
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ following_id: userId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to update follow state.");
        }

        setUserFollowMap((prev) => ({
          ...prev,
          [userId]: Boolean(data.isFollowing),
        }));

        toast({
          title: data.isFollowing ? "Followed" : "Unfollowed",
          description: data.isFollowing
            ? "Creator added to your followed list."
            : "Creator removed from your followed list.",
        });
      } catch (error) {
        console.error("Failed to toggle creator follow:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unable to update follow state.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <aside className="space-y-6">
      {/* Tag Statistics */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Tag Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Total Bookmarks</span>
            <span className="text-sm font-semibold text-neutral-900">
              {statistics.totalBookmarks.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">This Week</span>
            <span className="text-sm font-semibold text-neutral-900">
              +{statistics.thisWeek}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Followers</span>
            <span className="text-sm font-semibold text-neutral-900">
              {followerCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Avg. Likes</span>
            <span className="text-sm font-semibold text-neutral-900">
              {statistics.avgLikes}
            </span>
          </div>
        </div>
      </div>

      {/* Related Tags */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Related Tags
        </h3>
        <div className="space-y-3">
          {relatedTags.map((tag) => (
            <div
              key={tag.slug}
              className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 hover:bg-neutral-100"
            >
              <Link
                href={`/tag/${tag.slug}`}
                className="flex items-center space-x-3"
              >
                <span className="text-sm font-medium text-neutral-900">
                  #{tag.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {tag.bookmarkCount.toLocaleString()} bookmarks
                </span>
              </Link>
              <button
                type="button"
                onClick={() => toggleTagFollow(tag.slug)}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-800"
                disabled={isTagFollowPending || !tagFollowSupported}
              >
                {tagFollowSupported ? (tagFollowMap[tag.slug] ? "Following" : "Follow") : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Top Contributors
        </h3>
        <div className="space-y-4">
          {topContributors.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center space-x-3"
            >
              {contributor.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.displayName || contributor.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
                  <span className="text-sm font-semibold text-neutral-600">
                    {(contributor.displayName || contributor.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/${contributor.username}`}
                  className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                >
                  {contributor.displayName || contributor.username}
                </Link>
              <div className="text-xs text-neutral-500">
                {contributor.bookmarkCount} bookmarks
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleUserFollow(contributor.userId)}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-800"
              disabled={isUserFollowPending || !contributor.userId}
            >
              {contributor.userId && userFollowMap[contributor.userId] ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>

      {/* Popular Domains */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Popular Domains
        </h3>
        <div className="space-y-3">
          {popularDomains.map((item) => (
            <div
              key={item.domain}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-neutral-700">{item.domain}</span>
              <span className="text-xs text-neutral-500">
                {item.bookmarkCount} bookmarks
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
