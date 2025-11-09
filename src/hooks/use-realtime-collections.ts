'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealtimeCollectionUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  collection: Collection;
  old?: Collection;
}

export function useRealtimeCollections(userId: string | null, onUpdate?: (update: RealtimeCollectionUpdate) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        channel = supabase
          .channel(`collections:user_id=eq.${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'collections',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Collection inserted:', payload);
              onUpdate?.({
                type: 'INSERT',
                collection: payload.new as Collection,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'collections',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Collection updated:', payload);
              onUpdate?.({
                type: 'UPDATE',
                collection: payload.new as Collection,
                old: payload.old as Collection,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'collections',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Collection deleted:', payload);
              onUpdate?.({
                type: 'DELETE',
                collection: payload.old as Collection,
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setError(new Error('Failed to connect to realtime channel'));
            }
          });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsConnected(false);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, onUpdate, supabase]);

  return { isConnected, error };
}
