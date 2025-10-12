"use client";

import { useRouter } from 'next/navigation';
import { Hash, Users, BookmarkIcon, TrendingUp } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TagCardProps {
  tag: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    usage_count: number;
    follower_count?: number;
    is_trending: boolean;
    isFollowing?: boolean;
    growthRate?: number;
  };
  currentUserId?: string;
}

export function TagCard({ tag, currentUserId }: TagCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(tag.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(tag.follower_count ?? 0);

  const handleCardClick = () => {
    router.push(`/tag/${tag.slug}`);
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow tags.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tags/${tag.slug}/follow`, {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to follow tag');
        }

        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);

        toast({
          title: data.isFollowing ? "Tag Followed!" : "Tag Unfollowed",
          description: data.isFollowing
            ? "You'll see bookmarks from this tag in your feed."
            : "Tag removed from your followed list.",
        });
      } catch (error) {
        console.error('Failed to toggle tag follow:', error);
        toast({
          title: "Error",
          description: "Failed to update follow status.",
          variant: "destructive",
        });
      }
    });
  };

  const tagColor = tag.color || '#6B7280';

  return (
    <div
      onClick={handleCardClick}
      className="group relative block cursor-pointer"
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Trending Badge */}
        {tag.is_trending && tag.growthRate && tag.growthRate > 0 && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            <TrendingUp className="h-3 w-3" />
            +{tag.growthRate}%
          </div>
        )}

        {/* Tag Icon */}
        <div className="mb-4 flex items-center justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${tagColor} 0%, ${tagColor}dd 100%)`,
            }}
          >
            <Hash className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Tag Name */}
        <h3 className="mb-2 text-center text-xl font-bold text-neutral-900 group-hover:text-indigo-600">
          #{tag.name}
        </h3>

        {/* Description */}
        {tag.description && (
          <p className="mb-4 line-clamp-2 text-center text-sm text-neutral-600">
            {tag.description}
          </p>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center justify-center gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-1">
            <BookmarkIcon className="h-4 w-4" />
            <span className="font-medium">{tag.usage_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="font-medium">{followerCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tag/${tag.slug}`);
            }}
          >
            View Tag
          </Button>
          <Button
            size="sm"
            className={
              isFollowing
                ? "flex-1 bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                : "flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
            }
            onClick={handleFollow}
            disabled={isPending}
          >
            {isFollowing ? "Following" : "+ Follow"}
          </Button>
        </div>
      </div>
    </div>
  );
}
