"use client";

import { useRouter } from 'next/navigation';
import { Hash, Users, BookmarkIcon, TrendingUp } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TagsListProps {
  tags: Array<{
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
  }>;
  currentUserId?: string;
}

function TagListItem({ tag, currentUserId }: {
  tag: TagsListProps['tags'][0];
  currentUserId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(tag.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(tag.follower_count ?? 0);

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
    <div className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Tag Icon */}
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: tagColor }}
      >
        <Hash className="h-6 w-6 text-white" />
      </div>

      {/* Tag Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/tag/${tag.slug}`)}
            className="text-lg font-semibold text-neutral-900 hover:text-indigo-600"
          >
            #{tag.name}
          </button>
          {tag.is_trending && tag.growthRate && tag.growthRate > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
              <TrendingUp className="h-3 w-3" />
              +{tag.growthRate}%
            </span>
          )}
        </div>
        {tag.description && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-600">
            {tag.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <BookmarkIcon className="h-4 w-4" />
            {tag.usage_count.toLocaleString()} bookmarks
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {followerCount.toLocaleString()} followers
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-neutral-300 text-neutral-700"
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
              ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          }
          onClick={handleFollow}
          disabled={isPending}
        >
          {isFollowing ? "Following" : "+ Follow"}
        </Button>
      </div>
    </div>
  );
}

export function TagsList({ tags, currentUserId }: TagsListProps) {
  return (
    <div className="space-y-4">
      {tags.map((tag) => (
        <TagListItem key={tag.id} tag={tag} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
