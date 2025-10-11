'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionButtonProps {
  creatorId: string;
  isSubscribed: boolean;
}

export function SubscriptionButton({ creatorId, isSubscribed: initialState }: SubscriptionButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const toggleSubscription = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Subscription update failed');
      }

      setIsSubscribed(Boolean(data.isSubscribed));
      router.refresh();

      toast({
        title: data.isSubscribed ? 'Subscribed' : 'Subscription cancelled',
        description: data.isSubscribed
          ? 'You will receive premium updates from this creator.'
          : 'You will no longer receive subscriber-only updates.',
      });
    } catch (error: any) {
      console.error('Subscription toggle error:', error);
      toast({
        title: 'Action failed',
        description: error?.message || 'Unable to update subscription right now.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [creatorId, loading, router, toast]);

  return (
    <Button
      onClick={toggleSubscription}
      disabled={loading}
      variant={isSubscribed ? 'secondary' : 'default'}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Crown className="h-4 w-4" />
      )}
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
