'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RecentViewEntry, TrafficSummary } from '@/lib/analytics/summary';

const MAX_EVENTS = 20;

type OwnedContentIds = TrafficSummary['ownedContentIds'];
type ContentMeta = TrafficSummary['contentMeta'];

interface RealtimeAnalyticsFeedProps {
  initialEvents: RecentViewEntry[];
  ownedContentIds: OwnedContentIds;
  contentMeta: ContentMeta;
}

type IncomingEvent = {
  id: string;
  viewable_id: string;
  viewable_type: RecentViewEntry['viewableType'];
  created_at: string;
  country: string | null;
  device_type: string | null;
  referrer: string | null;
};

function formatReferrer(referrer: string | null) {
  if (!referrer) return 'Direct';
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '') || 'Direct';
  } catch {
    return referrer.replace(/^www\./, '') || 'Direct';
  }
}

function formatDevice(device: string | null) {
  if (!device) return 'Unknown device';
  const value = device.toLowerCase();
  if (value.includes('mobile')) return 'Mobile';
  if (value.includes('tablet') || value.includes('ipad')) return 'Tablet';
  if (value.includes('desktop') || value.includes('mac') || value.includes('windows')) {
    return 'Desktop';
  }
  return device;
}

export function RealtimeAnalyticsFeed({ initialEvents, ownedContentIds, contentMeta }: RealtimeAnalyticsFeedProps) {
  const [events, setEvents] = useState<RecentViewEntry[]>(initialEvents);

  const bookmarkSet = useMemo(() => new Set(ownedContentIds.bookmark), [ownedContentIds.bookmark]);
  const collectionSet = useMemo(() => new Set(ownedContentIds.collection), [ownedContentIds.collection]);
  const linkGroupSet = useMemo(() => new Set(ownedContentIds.link_group), [ownedContentIds.link_group]);

  const bookmarkMeta = useMemo(() => new Map(contentMeta.bookmark.map((item) => [item.id, item])), [contentMeta.bookmark]);
  const collectionMeta = useMemo(() => new Map(contentMeta.collection.map((item) => [item.id, item])), [contentMeta.collection]);
  const linkGroupMeta = useMemo(() => new Map(contentMeta.link_group.map((item) => [item.id, item])), [contentMeta.link_group]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel('realtime-page-views')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_views' }, (payload) => {
        const view = payload.new as IncomingEvent;

        const isOwned =
          (view.viewable_type === 'bookmark' && bookmarkSet.has(view.viewable_id)) ||
          (view.viewable_type === 'collection' && collectionSet.has(view.viewable_id)) ||
          (view.viewable_type === 'link_group' && linkGroupSet.has(view.viewable_id)) ||
          (view.viewable_type === 'profile' && view.viewable_id === ownedContentIds.profile);

        if (!isOwned) {
          return;
        }

        const mapped: RecentViewEntry = mapIncomingEvent(view, {
          bookmarkMeta,
          collectionMeta,
          linkGroupMeta,
          profileMeta: contentMeta.profile,
        });

        setEvents((prev) => {
          const existing = prev.find((item) => item.id === mapped.id);
          if (existing) {
            return prev;
          }

          return [mapped, ...prev].slice(0, MAX_EVENTS);
        });
      });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookmarkSet, collectionSet, linkGroupSet, ownedContentIds.profile, bookmarkMeta, collectionMeta, linkGroupMeta, contentMeta.profile]);

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
        No activity yet. Keep sharing links to see live engagement.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={`${event.id}-${event.createdAt}`} className="rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-900">{event.label}</span>
            <span className="text-neutral-500">
              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
            <span>{formatDevice(event.device)}</span>
            <span>{event.country ? `Region • ${event.country}` : 'Region • Unknown'}</span>
            <span>Source • {formatReferrer(event.referrer)}</span>
          </div>
          {event.url && (
            <div className="mt-3 text-xs">
              <Link href={event.url} className="inline-flex items-center font-medium text-blue-600 transition hover:text-blue-700">
                View content
              </Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function mapIncomingEvent(
  view: IncomingEvent,
  lookups: {
    bookmarkMeta: Map<string, { id: string; title: string; slug: string }>;
    collectionMeta: Map<string, { id: string; title: string; slug: string }>;
    linkGroupMeta: Map<string, { id: string; title: string; slug: string }>;
    profileMeta: { id: string; title: string; username: string } | null;
  }
): RecentViewEntry {
  if (view.viewable_type === 'bookmark') {
    const meta = lookups.bookmarkMeta.get(view.viewable_id);
    return {
      id: view.id,
      createdAt: view.created_at,
      viewableType: view.viewable_type,
      viewableId: view.viewable_id,
      country: view.country,
      device: view.device_type,
      referrer: view.referrer,
      label: meta ? `Bookmark view • ${meta.title}` : 'Bookmark view',
      url: meta ? `/bookmark/${view.viewable_id}/${meta.slug}` : undefined,
    };
  }

  if (view.viewable_type === 'collection') {
    const meta = lookups.collectionMeta.get(view.viewable_id);
    return {
      id: view.id,
      createdAt: view.created_at,
      viewableType: view.viewable_type,
      viewableId: view.viewable_id,
      country: view.country,
      device: view.device_type,
      referrer: view.referrer,
      label: meta ? `Collection view • ${meta.title}` : 'Collection view',
      url:
        meta && lookups.profileMeta
          ? `/c/${lookups.profileMeta.username}/${meta.slug}`
          : undefined,
    };
  }

  if (view.viewable_type === 'link_group') {
    const meta = lookups.linkGroupMeta.get(view.viewable_id);
    return {
      id: view.id,
      createdAt: view.created_at,
      viewableType: view.viewable_type,
      viewableId: view.viewable_id,
      country: view.country,
      device: view.device_type,
      referrer: view.referrer,
      label: meta ? `Link group view • ${meta.title}` : 'Link group view',
      url:
        meta && lookups.profileMeta
          ? `/l/${lookups.profileMeta.username}/${meta.slug}`
          : undefined,
    };
  }

  return {
    id: view.id,
    createdAt: view.created_at,
    viewableType: view.viewable_type,
    viewableId: view.viewable_id,
    country: view.country,
    device: view.device_type,
    referrer: view.referrer,
    label: lookups.profileMeta
      ? `Profile view • ${lookups.profileMeta.title}`
      : 'Profile view',
    url: lookups.profileMeta ? `/${lookups.profileMeta.username}` : undefined,
  };
}
