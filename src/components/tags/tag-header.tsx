"use client";

import { Hash, Users, Calendar, Plus, Share2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const TAG_FOLLOWERS_MISSING_MESSAGE =
  "Tag followers feature is not configured. Please run migration 008_create_tag_followers.sql.";

interface TagHeaderProps {
  name: string;
  description: string | null;
  bookmarkCount: number;
  followerCount: number;
  createdAt: string;
  color: string;
  tagSlug: string;
  isFollowing: boolean;
  shareUrl: string;
  currentUserId?: string;
  followSupported?: boolean;
}

export function TagHeader({
  name,
  description,
  bookmarkCount,
  followerCount,
  createdAt,
  color,
  tagSlug,
  isFollowing,
  shareUrl,
  currentUserId,
  followSupported = true,
}: TagHeaderProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSharing, setIsSharing] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [followerTotal, setFollowerTotal] = useState(followerCount);
  const [isFollowSupported, setIsFollowSupported] = useState(followSupported);

  useEffect(() => {
    setIsFollowSupported(followSupported);
  }, [followSupported]);

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const ensureAuthenticated = useCallback(() => {
    if (!isFollowSupported) {
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
      description: "Please sign in to follow tags.",
      variant: "destructive",
    });
    return false;
  }, [currentUserId, isFollowSupported, toast]);

  const handleFollow = () => {
    if (!ensureAuthenticated()) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tags/${tagSlug}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 503) {
            setIsFollowSupported(false);
            setFollowing(false);
          }

          throw new Error(data.error || "Unable to update follow state.");
        }

        if (typeof data.isFollowing === "boolean") {
          setFollowing(data.isFollowing);
        }
        if (typeof data.followerCount === "number") {
          setFollowerTotal(data.followerCount);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("tag-follow-updated", {
                detail: {
                  slug: tagSlug,
                  followerCount: data.followerCount,
                  isFollowing: data.isFollowing,
                },
              })
            );
          }
        }

        toast({
          title: data.isFollowing ? "Followed" : "Unfollowed",
          description: data.isFollowing
            ? "Tag added to your followed list."
            : "Tag removed from your followed list.",
        });
      } catch (error) {
        console.error("Failed to toggle tag follow:", error);
        if (error instanceof Error && error.message.includes("migration 008_create_tag_followers.sql")) {
          setIsFollowSupported(false);
          setFollowing(false);
        }

        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unable to update follow state.",
          variant: "destructive",
        });
      }
    });
  };

  const handleShare = async () => {
    if (isSharing) {
      return;
    }

    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `#${name} on HitTags`,
          text: description ?? `Discover the best bookmarks tagged with #${name}.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Tag link copied to clipboard.",
        });
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error("Failed to share tag:", error);
        toast({
          title: "Error",
          description: "We couldn't share this tag right now.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: color }}
          >
            <Hash className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-neutral-900">
              #{name}
            </h1>
            {description && (
              <p className="mb-4 max-w-2xl text-neutral-600">{description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-neutral-500">
              <span className="flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                {bookmarkCount.toLocaleString()} bookmarks
              </span>
              <span className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {followerTotal.toLocaleString()} followers
              </span>
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created {formattedDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            onClick={handleFollow}
            disabled={isPending || !isFollowSupported}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isFollowSupported ? (following ? "Following" : "Follow Tag") : "Follow Unavailable"}
          </Button>
          <Button
            variant="outline"
            className="rounded-lg border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </section>
  );
}
