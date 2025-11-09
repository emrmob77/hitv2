'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  collection_id?: string;
  is_public: boolean;
  is_premium: boolean;
}

export interface RealtimeBookmarkUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  bookmark: Bookmark;
  old?: Bookmark;
}

export function useRealtimeBookmarks(userId: string | null, onUpdate?: (update: RealtimeBookmarkUpdate) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        // Subscribe to bookmark changes for the current user
        channel = supabase
          .channel(`bookmarks:user_id=eq.${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'bookmarks',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Bookmark inserted:', payload);
              onUpdate?.({
                type: 'INSERT',
                bookmark: payload.new as Bookmark,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'bookmarks',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Bookmark updated:', payload);
              onUpdate?.({
                type: 'UPDATE',
                bookmark: payload.new as Bookmark,
                old: payload.old as Bookmark,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'bookmarks',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Bookmark deleted:', payload);
              onUpdate?.({
                type: 'DELETE',
                bookmark: payload.old as Bookmark,
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
