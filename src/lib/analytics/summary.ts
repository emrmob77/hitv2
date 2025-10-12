import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

type Supabase = SupabaseClient<Database>;

type PageViewRecord = {
  id: string;
  viewable_id: string;
  viewable_type: 'bookmark' | 'collection' | 'profile' | 'tag' | 'link_group';
  created_at: string;
  country: string | null;
  device_type: string | null;
  referrer: string | null;
};

type BookmarkRecord = {
  id: string;
  title: string;
  slug: string | null;
  privacy_level: string | null;
  like_count: number | null;
  view_count: number | null;
};

type CollectionRecord = {
  id: string;
  name: string;
  slug: string;
  bookmark_count: number | null;
  follower_count: number | null;
};

type LinkGroupRecord = {
  id: string;
  name: string;
  slug: string;
  view_count: number | null;
  click_count: number | null;
};

type PostRecord = {
  id: string;
  view_count: number | null;
  like_count: number | null;
};

type ProfileRecord = {
  id: string;
  username: string;
  display_name: string | null;
  follower_count: number | null;
  following_count: number | null;
  total_likes_received: number | null;
};

export type DailyViewEntry = { date: string; value: number };
export type DeviceBreakdownEntry = { name: string; value: number };
export type GeoEntry = { country: string; value: number };
export type ReferrerEntry = { source: string; value: number };

export type RecentViewEntry = {
  id: string;
  createdAt: string;
  viewableType: PageViewRecord['viewable_type'];
  viewableId: string;
  country: string | null;
  device: string | null;
  referrer: string | null;
  label: string;
  url?: string;
};

export interface TrafficSummary {
  currentViews: number;
  previousViews: number;
  change: number;
  dailyViews: DailyViewEntry[];
  deviceBreakdown: DeviceBreakdownEntry[];
  geoDistribution: GeoEntry[];
  topReferrers: ReferrerEntry[];
  recentPageViews: RecentViewEntry[];
  ownedContentIds: {
    bookmark: string[];
    collection: string[];
    link_group: string[];
    profile: string;
  };
  contentMeta: {
    bookmark: Array<{ id: string; title: string; slug: string }>;
    collection: Array<{ id: string; title: string; slug: string }>;
    link_group: Array<{ id: string; title: string; slug: string }>;
    profile: { id: string; title: string; username: string } | null;
  };
}

export interface AnalyticsSummary {
  bookmarks: {
    total: number;
    public: number;
    private: number;
    totalLikes: number;
    totalViews: number;
  };
  collections: {
    total: number;
    totalBookmarks: number;
    totalFollowers: number;
    totalViews: number;
  };
  posts: {
    total: number;
    totalViews: number;
    totalLikes: number;
  };
  linkGroups: {
    total: number;
    totalViews: number;
    totalClicks: number;
  };
  social: {
    followers: number;
    following: number;
    totalLikesReceived: number;
    username: string;
    displayName: string;
  };
  traffic: TrafficSummary;
}

function normaliseDevice(device: string | null): 'Mobile' | 'Desktop' | 'Tablet' | 'Other' {
  const value = (device || '').toLowerCase();
  if (value.includes('mobile')) return 'Mobile';
  if (value.includes('tablet') || value.includes('ipad')) return 'Tablet';
  if (value.includes('desktop') || value.includes('mac') || value.includes('windows')) return 'Desktop';
  return 'Other';
}

function normaliseCountry(country: string | null): string {
  if (!country) return 'Unknown';
  return country.toUpperCase();
}

function normaliseReferrer(referrer: string | null): string {
  if (!referrer) return 'Direct';
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '') || 'Direct';
  } catch {
    return referrer.replace(/^www\./, '') || 'Direct';
  }
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function computeChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

async function fetchPageViews(
  supabase: Supabase,
  ids: string[],
  type: PageViewRecord['viewable_type'],
  since: string
) {
  if (ids.length === 0) {
    return [] as PageViewRecord[];
  }

  const { data } = await supabase
    .from('page_views')
    .select('id, viewable_id, viewable_type, created_at, country, device_type, referrer')
    .eq('viewable_type', type)
    .in('viewable_id', ids)
    .gte('created_at', since)
    .limit(5000);

  return (data as PageViewRecord[]) || [];
}

export async function getAnalyticsSummary(supabase: Supabase, userId: string): Promise<AnalyticsSummary> {
  const [
    { data: bookmarks },
    { data: collections },
    { data: posts },
    { data: linkGroups },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('id, title, slug, privacy_level, like_count, view_count')
      .eq('user_id', userId),
    supabase
      .from('collections')
      .select('id, name, slug, bookmark_count, follower_count')
      .eq('user_id', userId),
    supabase
      .from('exclusive_posts')
      .select('id, view_count, like_count')
      .eq('user_id', userId),
    supabase
      .from('link_groups')
      .select('id, name, slug, view_count, click_count')
      .eq('user_id', userId),
    supabase
      .from('profiles')
      .select('id, username, display_name, follower_count, following_count, total_likes_received')
      .eq('id', userId)
      .single(),
  ]);

  const bookmarkList = (bookmarks as BookmarkRecord[]) || [];
  const collectionList = (collections as CollectionRecord[]) || [];
  const postList = (posts as PostRecord[]) || [];
  const linkGroupList = (linkGroups as LinkGroupRecord[]) || [];
  const profileRecord = profile as ProfileRecord | null;

  const bookmarkLookup = new Map(
    bookmarkList.map((bookmark) => [
      bookmark.id,
      { title: bookmark.title, slug: bookmark.slug ?? bookmark.id },
    ])
  );

  const collectionLookup = new Map(
    collectionList.map((collection) => [
      collection.id,
      { title: collection.name, slug: collection.slug },
    ])
  );

  const linkGroupLookup = new Map(
    linkGroupList.map((group) => [
      group.id,
      { title: group.name, slug: group.slug },
    ])
  );

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sinceIso = fourteenDaysAgo.toISOString();

  const [bookmarkViews, collectionViews, linkGroupViews, profileViews] = await Promise.all([
    fetchPageViews(supabase, bookmarkList.map((bookmark) => bookmark.id), 'bookmark', sinceIso),
    fetchPageViews(supabase, collectionList.map((collection) => collection.id), 'collection', sinceIso),
    fetchPageViews(supabase, linkGroupList.map((group) => group.id), 'link_group', sinceIso),
    fetchPageViews(supabase, [userId], 'profile', sinceIso),
  ]);

  const allViews: PageViewRecord[] = [
    ...bookmarkViews,
    ...collectionViews,
    ...linkGroupViews,
    ...profileViews,
  ];

  const viewsByDate = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();

  let currentViews = 0;
  let previousViews = 0;
  let bookmarkViewTotal = 0;
  let collectionViewTotal = 0;
  let linkGroupViewTotal = 0;

  allViews.forEach((view) => {
    const createdAt = new Date(view.created_at);
    const dateKey = formatDateKey(createdAt);
    viewsByDate.set(dateKey, (viewsByDate.get(dateKey) ?? 0) + 1);

    if (createdAt >= sevenDaysAgo) {
      currentViews += 1;
    } else if (createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo) {
      previousViews += 1;
    }

    const device = normaliseDevice(view.device_type);
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);

    const country = normaliseCountry(view.country);
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);

    const referrer = normaliseReferrer(view.referrer);
    referrerCounts.set(referrer, (referrerCounts.get(referrer) ?? 0) + 1);

    if (view.viewable_type === 'bookmark') {
      bookmarkViewTotal += 1;
    }

    if (view.viewable_type === 'collection') {
      collectionViewTotal += 1;
    }

    if (view.viewable_type === 'link_group') {
      linkGroupViewTotal += 1;
    }
  });

  const dailyViews: DailyViewEntry[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = formatDateKey(day);
    dailyViews.push({
      date: key,
      value: viewsByDate.get(key) ?? 0,
    });
  }

  const deviceBreakdown: DeviceBreakdownEntry[] = Array.from(deviceCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const geoDistribution: GeoEntry[] = Array.from(countryCounts.entries())
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const topReferrers: ReferrerEntry[] = Array.from(referrerCounts.entries())
    .map(([source, value]) => ({ source, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recentPageViews: RecentViewEntry[] = [...allViews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map((view) => {
      let label = 'New activity';
      let url: string | undefined;

      if (view.viewable_type === 'bookmark') {
        const bookmark = bookmarkLookup.get(view.viewable_id);
        if (bookmark) {
          label = `Bookmark view • ${bookmark.title}`;
          url = `/bookmark/${view.viewable_id}/${bookmark.slug}`;
        }
      } else if (view.viewable_type === 'collection') {
        const collection = collectionLookup.get(view.viewable_id);
        if (collection && profileRecord) {
          label = `Collection view • ${collection.title}`;
          url = `/c/${profileRecord.username}/${collection.slug}`;
        }
      } else if (view.viewable_type === 'link_group') {
        const group = linkGroupLookup.get(view.viewable_id);
        if (group && profileRecord) {
          label = `Link group view • ${group.title}`;
          url = `/l/${profileRecord.username}/${group.slug}`;
        }
      } else if (view.viewable_type === 'profile' && profileRecord) {
        label = `Profile view • ${profileRecord.display_name || profileRecord.username}`;
        url = `/${profileRecord.username}`;
      }

      return {
        id: view.id,
        createdAt: view.created_at,
        viewableType: view.viewable_type,
        viewableId: view.viewable_id,
        country: view.country,
        device: view.device_type,
        referrer: view.referrer,
        label,
        url,
      };
    });

  const trafficSummary: TrafficSummary = {
    currentViews,
    previousViews,
    change: computeChange(currentViews, previousViews),
    dailyViews,
    deviceBreakdown,
    geoDistribution,
    topReferrers,
    recentPageViews,
    ownedContentIds: {
      bookmark: bookmarkList.map((bookmark) => bookmark.id),
      collection: collectionList.map((collection) => collection.id),
      link_group: linkGroupList.map((group) => group.id),
      profile: userId,
    },
    contentMeta: {
      bookmark: bookmarkList.map((bookmark) => ({
        id: bookmark.id,
        title: bookmark.title,
        slug: bookmark.slug ?? bookmark.id,
      })),
      collection: collectionList.map((collection) => ({
        id: collection.id,
        title: collection.name,
        slug: collection.slug,
      })),
      link_group: linkGroupList.map((group) => ({
        id: group.id,
        title: group.name,
        slug: group.slug,
      })),
      profile: profileRecord
        ? {
            id: profileRecord.id,
            title: profileRecord.display_name || profileRecord.username,
            username: profileRecord.username,
          }
        : null,
    },
  };

  const bookmarkStats = {
    total: bookmarkList.length,
    public: bookmarkList.filter((bookmark) => bookmark.privacy_level === 'public').length,
    private: bookmarkList.filter((bookmark) => bookmark.privacy_level === 'private').length,
    totalLikes: bookmarkList.reduce((sum, bookmark) => sum + (bookmark.like_count ?? 0), 0),
    totalViews: bookmarkViewTotal,
  };

  const collectionStats = {
    total: collectionList.length,
    totalBookmarks: collectionList.reduce((sum, collection) => sum + (collection.bookmark_count ?? 0), 0),
    totalFollowers: collectionList.reduce((sum, collection) => sum + (collection.follower_count ?? 0), 0),
    totalViews: collectionViewTotal,
  };

  const postStats = {
    total: postList.length,
    totalViews: postList.reduce((sum, post) => sum + (post.view_count ?? 0), 0),
    totalLikes: postList.reduce((sum, post) => sum + (post.like_count ?? 0), 0),
  };

  const linkGroupStats = {
    total: linkGroupList.length,
    totalViews: linkGroupViewTotal || linkGroupList.reduce((sum, group) => sum + (group.view_count ?? 0), 0),
    totalClicks: linkGroupList.reduce((sum, group) => sum + (group.click_count ?? 0), 0),
  };

  const socialStats = {
    followers: profileRecord?.follower_count ?? 0,
    following: profileRecord?.following_count ?? 0,
    totalLikesReceived: profileRecord?.total_likes_received ?? 0,
    username: profileRecord?.username ?? '',
    displayName: profileRecord?.display_name ?? profileRecord?.username ?? '',
  };

  return {
    bookmarks: bookmarkStats,
    collections: collectionStats,
    posts: postStats,
    linkGroups: linkGroupStats,
    social: socialStats,
    traffic: trafficSummary,
  };
}
