"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Heart, Bookmark, Share2, ExternalLink, Eye, Calendar, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface BookmarkDetailPreviewProps {
  id: string;
  title: string;
  description: string | null;
  url: string;
  domain: string | null;
  imageUrl: string | null;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio?: string | null;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  isLiked?: boolean;
  isBookmarked?: boolean;
  currentUserId?: string;
  authorId: string;
  saveCount: number;
}

export function BookmarkDetailPreview({
  id,
  title,
  description,
  url,
  domain,
  imageUrl,
  createdAt,
  viewCount,
  likeCount,
  author,
  tags,
  isLiked = false,
  isBookmarked = false,
  currentUserId,
  authorId,
  saveCount,
}: BookmarkDetailPreviewProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(likeCount);
  const [saves, setSaves] = useState(saveCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState(currentUserId);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { toast } = useToast();

  useEffect(() => {
    setActiveUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikes(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setSaves(saveCount);
  }, [saveCount]);

  useEffect(() => {
    if (currentUserId) {
      return;
    }

    let isMounted = true;

    const resolveUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) {
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!isMounted) {
          return;
        }

        if (profile) {
          setActiveUserId(user.id);
        } else {
          setActiveUserId(undefined);
        }
      } catch (error) {
        console.error('Error resolving current user for bookmark preview:', error);
      }
    };

    resolveUser();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, supabase]);

  useEffect(() => {
    if (currentUserId || !activeUserId) {
      return;
    }

    let isMounted = true;

    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(
          `/api/likes?content_type=bookmark&content_id=${id}`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (typeof data.isLiked === 'boolean') {
          setLiked(data.isLiked);
        }
        if (typeof data.likeCount === 'number') {
          setLikes(data.likeCount);
        }
      } catch (error) {
        console.error('Error refreshing like status:', error);
      }
    };

    fetchLikeStatus();

    return () => {
      isMounted = false;
    };
  }, [activeUserId, currentUserId, id]);

  const checkFollowStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/follows/${authorId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setIsFollowing(Boolean(data.isFollowing));
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }, [authorId]);

  // Check if following
  useEffect(() => {
    if (activeUserId && authorId && activeUserId !== authorId) {
      checkFollowStatus();
    }
  }, [activeUserId, authorId, checkFollowStatus]);

  const handleLike = async () => {
    if (!activeUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like bookmarks',
        variant: 'destructive',
      });
      return;
    }

    const previousLiked = liked;
    const previousLikes = likes;
    const nextLikedState = !liked;

    setLiked(nextLikedState);
    setLikes((prev) => Math.max(0, prev + (nextLikedState ? 1 : -1)));
    setIsLoading(true);

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof data.isLiked === 'boolean') {
          setLiked(data.isLiked);
        }
        if (typeof data.likeCount === 'number') {
          setLikes(data.likeCount);
        }
      } else {
        setLiked(previousLiked);
        setLikes(previousLikes);
        toast({
          title: 'Error',
          description: data.error || 'Failed to update like',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(previousLiked);
      setLikes(previousLikes);
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!activeUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save bookmarks',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/saved-bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookmark_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookmarked(data.isSaved);
        if (typeof data.saveCount === 'number') {
          setSaves(Math.max(0, data.saveCount));
        } else {
          setSaves((prev) =>
            Math.max(0, prev + (data.isSaved ? 1 : -1))
          );
        }
        toast({
          title: data.isSaved ? 'Saved!' : 'Removed',
          description: data.isSaved
            ? 'Bookmark saved to your collection'
            : 'Bookmark removed from your collection',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save bookmark',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to save bookmark',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!activeUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow users',
        variant: 'destructive',
      });
      return;
    }

    const previousFollowState = isFollowing;
    const nextFollowState = !isFollowing;

    setIsFollowing(nextFollowState);
    setIsLoading(true);

    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          following_id: authorId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const resolvedFollowState =
          typeof data.isFollowing === 'boolean' ? data.isFollowing : nextFollowState;

        setIsFollowing(resolvedFollowState);
        toast({
          title: resolvedFollowState ? 'Followed!' : 'Unfollowed',
          description: resolvedFollowState
            ? `You are now following ${author.displayName || author.username}`
            : `You unfollowed ${author.displayName || author.username}`,
        });

        await checkFollowStatus();
      } else {
        setIsFollowing(previousFollowState);
        toast({
          title: 'Error',
          description: data.error || 'Failed to update follow status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setIsFollowing(previousFollowState);
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || title,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link copied!',
          description: 'Bookmark link copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to copy link',
          variant: 'destructive',
        });
      }
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-8">
      <div className="mb-6">
        <div className="mb-6 h-80 w-full overflow-hidden rounded-lg bg-neutral-300">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg text-neutral-600">Website Preview</span>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-3 text-3xl font-bold text-neutral-900">{title}</h1>
            {description && (
              <p className="mb-4 text-lg text-neutral-600">{description}</p>
            )}
            <div className="mb-6 flex items-center space-x-4 text-sm text-neutral-500">
              {domain && (
                <span className="flex items-center">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {domain}
                </span>
              )}
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Added {timeAgo(createdAt)}
              </span>
              <span className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                {viewCount} views
              </span>
            </div>
            {tags && tags.length > 0 && (
              <div className="mb-6 flex items-center space-x-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <div className="flex items-center space-x-4">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.displayName || author.username}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
              <span className="text-sm font-semibold text-neutral-600">
                {(author.displayName || author.username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <Link
              href={`/${author.username}`}
              className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
            >
              {author.displayName || author.username}
            </Link>
            {author.bio && (
              <div className="text-xs text-neutral-500">{author.bio}</div>
            )}
          </div>
          {activeUserId && activeUserId !== authorId && (
            <Button
              onClick={handleFollow}
              disabled={isLoading}
              className={`rounded-lg px-4 py-2 text-sm ${
                isFollowing
                  ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-all ${
                liked
                  ? "bg-red-50 text-red-600"
                  : "bg-neutral-100 hover:bg-neutral-200"
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart
                className="h-4 w-4"
                fill={liked ? "currentColor" : "none"}
              />
              <span className="text-sm">{likes}</span>
            </button>
            <button
              onClick={handleBookmark}
              disabled={isLoading}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-all ${
                bookmarked
                  ? "bg-blue-50 text-blue-600"
                  : "bg-neutral-100 hover:bg-neutral-200"
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={bookmarked ? "currentColor" : "none"}
              />
              <span className="text-sm">{saves}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 rounded-lg bg-neutral-100 px-4 py-2 hover:bg-neutral-200 transition-all"
            >
              <Share2 className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-700">Share</span>
            </button>
          </div>
          <Link
            href={`/out/bookmark/${id}`}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-800"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit Site</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
