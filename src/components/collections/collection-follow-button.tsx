'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CollectionFollowButtonProps {
  collectionId: string;
  initialFollowerCount: number;
  initialIsFollowing: boolean;
}

export function CollectionFollowButton({
  collectionId,
  initialFollowerCount,
  initialIsFollowing,
}: CollectionFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleFollow = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/collections/${collectionId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Unable to update follow state');
      }

      setIsFollowing(Boolean(result.isFollowing));
      setFollowerCount(typeof result.followerCount === 'number' ? result.followerCount : followerCount);
    } catch (error) {
      console.error('Failed to toggle collection follow:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unexpected error while following collection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant={isFollowing ? 'secondary' : 'default'}
        size="sm"
        className="rounded-full"
        onClick={toggleFollow}
        disabled={isLoading}
      >
        {isLoading ? 'Updating…' : isFollowing ? 'Following' : 'Follow Collection'}
      </Button>
      <p className="text-xs text-neutral-500">
        {new Intl.NumberFormat().format(followerCount)} follower{followerCount === 1 ? '' : 's'}
      </p>
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
