'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface LikeButtonProps {
  contentType: 'bookmark' | 'collection' | 'comment' | 'exclusive_post';
  contentId: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
}

export function LikeButton({
  contentType,
  contentId,
  initialLikeCount = 0,
  initialIsLiked = false,
  size = 'default',
  showCount = true,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check authentication status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    // Fetch initial like status
    fetchLikeStatus();
  }, [contentType, contentId]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(
        `/api/likes?content_type=${contentType}&content_id=${contentId}`
      );
      const data = await response.json();

      if (response.ok) {
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like this content',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to like content',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-xs',
    default: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  const iconSizes = {
    sm: 14,
    default: 16,
    lg: 18,
  };

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      className={`${sizeClasses[size]} gap-1.5 ${
        isLiked
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'hover:bg-red-50 hover:text-red-500'
      }`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart
        size={iconSizes[size]}
        className={`${isLiked ? 'fill-current' : ''} transition-all`}
      />
      {showCount && <span>{likeCount}</span>}
    </Button>
  );
}
