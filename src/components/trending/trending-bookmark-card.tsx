"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark as BookmarkIcon, Heart, Share2, ExternalLink } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

interface TrendingBookmarkCardProps {
  rank?: number;
  trendLabel?: string;
  bookmark: {
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
  };
  detailUrl: string;
  visitUrl: string;
  currentUserId?: string;
}

export function TrendingBookmarkCard({
  rank,
  trendLabel,
  bookmark,
  detailUrl,
  visitUrl,
  currentUserId,
}: TrendingBookmarkCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [liked, setLiked] = useState(bookmark.isLiked);
  const [likes, setLikes] = useState(bookmark.likes);
  const [saved, setSaved] = useState(bookmark.isSaved);
  const [saves, setSaves] = useState(bookmark.saves);
  const [shares, setShares] = useState(bookmark.shares);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);

  const ensureAuthenticated = useCallback(
    () => {
      if (currentUserId) {
        return true;
      }

      toast({
        title: "Authentication required",
        description: "Please sign in to interact with bookmarks.",
        variant: "destructive",
      });
      return false;
    },
    [currentUserId, toast]
  );

  const formatNumber = useCallback(
    (value: number) => new Intl.NumberFormat("en-US").format(value),
    []
  );

  const handleLike = async () => {
    if (!ensureAuthenticated()) {
      return;
    }

    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikes((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
    setIsLikeLoading(true);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "bookmark",
          content_id: bookmark.id,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof data.isLiked === "boolean") {
          setLiked(data.isLiked);
        }
        if (typeof data.likeCount === "number") {
          setLikes(Math.max(0, data.likeCount));
        }
        router.refresh();
      } else {
        setLiked(previousLiked);
        setLikes(previousLikes);
        toast({
          title: "Error",
          description: data.error || "Unable to update like right now.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Trending like toggle failed:", error);
      setLiked(previousLiked);
      setLikes(previousLikes);
      toast({
        title: "Error",
        description: "Something went wrong while updating like.",
        variant: "destructive",
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!ensureAuthenticated()) {
      return;
    }

    const previousSaved = saved;
    const previousSaves = saves;
    const nextSaved = !saved;

    setSaved(nextSaved);
    setSaves((prev) => Math.max(0, prev + (nextSaved ? 1 : -1)));
    setIsSaveLoading(true);

    try {
      const response = await fetch("/api/saved-bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookmark_id: bookmark.id,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof data.isSaved === "boolean") {
          setSaved(data.isSaved);
        }
        if (typeof data.saveCount === "number") {
          setSaves(Math.max(0, data.saveCount));
        }
        toast({
          title: data.isSaved ? "Saved!" : "Removed",
          description: data.isSaved
            ? "Bookmark added to your saved items."
            : "Bookmark removed from your saved items.",
        });
        router.refresh();
      } else {
        setSaved(previousSaved);
        setSaves(previousSaves);
        toast({
          title: "Error",
          description: data.error || "Unable to update saved state.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Trending save toggle failed:", error);
      setSaved(previousSaved);
      setSaves(previousSaves);
      toast({
        title: "Error",
        description: "Something went wrong while updating saved state.",
        variant: "destructive",
      });
    } finally {
      setIsSaveLoading(false);
    }
  };

  const recordShare = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}/visit`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof data.clickCount === "number") {
          setShares(Math.max(0, data.clickCount));
        }
      }
    } catch (error) {
      console.error("Failed to record share visit:", error);
    }
  }, [bookmark.id]);

  const incrementShares = useCallback(() => {
    setShares((prev) => prev + 1);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("bookmark-share", {
          detail: { bookmarkId: bookmark.id },
        })
      );
    }
    void recordShare().finally(() => {
      router.refresh();
    });
  }, [bookmark.id, recordShare, router]);

  const handleShare = async () => {
    if (isShareLoading) {
      return;
    }

    setIsShareLoading(true);

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: bookmark.title,
            text: bookmark.description ?? bookmark.title,
            url: detailUrl,
          });
          incrementShares();
        } catch (error) {
          setIsShareLoading(false);
          if ((error as Error)?.name === "AbortError") {
            return;
          }
          toast({
            title: "Share cancelled",
            description: "We couldn't complete the share action.",
            variant: "destructive",
          });
          return;
        }
      } else {
        await navigator.clipboard.writeText(detailUrl);
        toast({
          title: "Link copied",
          description: "Bookmark link copied to clipboard.",
        });
        incrementShares();
      }
    } catch (error) {
      console.error("Trending share failed:", error);
      toast({
        title: "Error",
        description: "We couldn't share this bookmark right now.",
        variant: "destructive",
      });
    } finally {
      setIsShareLoading(false);
    }
  };

  useEffect(() => {
    setLiked(bookmark.isLiked);
    setLikes(bookmark.likes);
    setSaved(bookmark.isSaved);
    setSaves(bookmark.saves);
    setShares(bookmark.shares);
  }, [bookmark]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-shrink-0">
          {bookmark.imageUrl ? (
            <img
              src={bookmark.imageUrl}
              alt={bookmark.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-500">
              Preview
            </div>
          )}
        </div>
        <div className="flex-1">
          {(typeof rank === "number" || trendLabel) && (
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              {typeof rank === "number" && (
                <span className="rounded bg-neutral-900 px-2 py-1 text-xs font-semibold text-white">
                  #{rank}
                </span>
              )}
              {trendLabel && <span className="text-neutral-500">{trendLabel}</span>}
            </div>
          )}
          <Link
            href={`/bookmark/${bookmark.id}/${bookmark.slug}`}
            className="mb-2 block text-lg font-semibold text-neutral-900 hover:text-neutral-700"
          >
            {bookmark.title}
          </Link>
          {bookmark.description && (
            <p className="mb-3 text-sm text-neutral-600 line-clamp-2">{bookmark.description}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-600">
                {bookmark.author.avatarUrl ? (
                  <img
                    src={bookmark.author.avatarUrl}
                    alt={bookmark.author.displayName ?? bookmark.author.username}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                    {(bookmark.author.displayName ?? bookmark.author.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <Link
                  href={`/${bookmark.author.username}`}
                  className="text-sm text-neutral-600 underline-offset-2 hover:underline"
                >
                  {bookmark.author.displayName ?? bookmark.author.username}
                </Link>
              </div>
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3 text-neutral-500">
              <button
                type="button"
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                  liked ? "bg-red-50 text-red-600" : "hover:bg-neutral-100"
                }`}
                aria-pressed={liked}
              >
                <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
                <span>{formatNumber(likes)}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaveLoading}
                className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                  saved ? "bg-blue-50 text-blue-600" : "hover:bg-neutral-100"
                }`}
                aria-pressed={saved}
              >
                <BookmarkIcon className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                <span>{formatNumber(saves)}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={isShareLoading}
                className="flex items-center gap-1 rounded-full px-3 py-1 transition hover:bg-neutral-100"
              >
                <Share2 className="h-4 w-4" />
                <span>{formatNumber(shares)}</span>
              </button>
              <Link
                href={visitUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-1 rounded-full px-3 py-1 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
