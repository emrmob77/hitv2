import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Bookmark as BookmarkIcon,
  Flame,
  Heart,
  Share2,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Trending Bookmarks Today',
  description: "See what's trending across the HitTags community right now. Discover the most popular bookmarks, tags, and creators.",
  alternates: {
    canonical: `${siteConfig.url}/trending`,
  },
  openGraph: {
    title: `Trending Bookmarks Today | ${siteConfig.name}`,
    description: "See what's trending across the HitTags community right now. Discover the most popular bookmarks, tags, and creators.",
    url: `${siteConfig.url}/trending`,
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Trending Bookmarks Today | ${siteConfig.name}`,
    description: "See what's trending across the HitTags community right now. Discover the most popular bookmarks, tags, and creators.",
  },
};

type TrendingStats = {
  trendingToday: number;
  totalLikes: number;
  totalSaves: number;
  totalShares: number;
};

type TrendingBookmark = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  likes: number;
  saves: number;
  shares: number;
  createdAt: string;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  tags: Array<{ name: string; slug: string }>;
};

type PopularTag = {
  name: string;
  slug: string;
  usage: number;
};

type RisingUser = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number;
  bookmarkCount: number;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function normaliseSlug(source: string): string {
  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getTrendingStats(): Promise<TrendingStats> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return {
        trendingToday: 0,
        totalLikes: 0,
        totalSaves: 0,
        totalShares: 0,
      };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ count: trendingToday = 0 }, { data: aggregates = [] }] = await Promise.all([
      supabase
        .from('bookmarks')
        .select('id', { count: 'exact', head: true })
        .eq('privacy_level', 'public')
        .gte('created_at', since),
      supabase
        .from('bookmarks')
        .select('like_count, save_count, click_count')
        .eq('privacy_level', 'public'),
    ]);

    const totals = aggregates.reduce(
      (acc, item) => {
        const likeCount = item.like_count ?? 0;
        const saveCount = item.save_count ?? 0;
        const shareCount = item.click_count ?? 0;

        acc.totalLikes += likeCount;
        acc.totalSaves += saveCount;
        acc.totalShares += shareCount;
        return acc;
      },
      { totalLikes: 0, totalSaves: 0, totalShares: 0 }
    );

    return {
      trendingToday,
      ...totals,
    };
  } catch (error) {
    console.error('Failed to load trending stats', error);
    return {
      trendingToday: 0,
      totalLikes: 0,
      totalSaves: 0,
      totalShares: 0,
    };
  }
}

async function getTrendingBookmarks(): Promise<TrendingBookmark[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        title,
        slug,
        description,
        image_url,
        created_at,
        like_count,
        save_count,
        click_count,
        profiles (
          username,
          display_name,
          avatar_url
        ),
        bookmark_tags (
          tags (
            name,
            slug
          )
        )
      `
      )
      .eq('privacy_level', 'public')
      .order('like_count', { ascending: false })
      .limit(6);

    if (error || !Array.isArray(bookmarks)) {
      return [];
    }

    return bookmarks.map((bookmark) => {
      const generatedSlug = normaliseSlug(bookmark.title);
      const slugCandidate = bookmark.slug && bookmark.slug.trim().length > 0 ? bookmark.slug : generatedSlug;
      const slug = slugCandidate.length > 0 ? slugCandidate : bookmark.id;

      const tags = (bookmark.bookmark_tags ?? [])
        .map((tagRelation) => tagRelation?.tags)
        .filter((tag): tag is { name: string; slug: string } => Boolean(tag))
        .map((tag) => ({ name: tag.name, slug: tag.slug }));

      return {
        id: bookmark.id,
        title: bookmark.title,
        slug,
        description: bookmark.description,
        imageUrl: bookmark.image_url,
        likes: bookmark.like_count ?? 0,
        saves: bookmark.save_count ?? 0,
        shares: bookmark.click_count ?? 0,
        createdAt: bookmark.created_at,
        author: {
          username: bookmark.profiles?.username ?? 'unknown',
          displayName: bookmark.profiles?.display_name ?? null,
          avatarUrl: bookmark.profiles?.avatar_url ?? null,
        },
        tags,
      } satisfies TrendingBookmark;
    });
  } catch (error) {
    console.error('Failed to load trending bookmarks', error);
    return [];
  }
}

async function getPopularTags(): Promise<PopularTag[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: tags, error } = await supabase
      .from('tags')
      .select('name, slug, usage_count')
      .order('usage_count', { ascending: false })
      .limit(10);

    if (error || !Array.isArray(tags)) {
      return [];
    }

    return tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      usage: tag.usage_count ?? 0,
    }));
  } catch (error) {
    console.error('Failed to load popular tags', error);
    return [];
  }
}

async function getRisingUsers(): Promise<RisingUser[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, follower_count, bookmark_count')
      .order('follower_count', { ascending: false })
      .limit(6);

    if (error || !Array.isArray(users)) {
      return [];
    }

    return users.map((user) => ({
      username: user.username,
      displayName: user.display_name ?? null,
      avatarUrl: user.avatar_url ?? null,
      followerCount: user.follower_count ?? 0,
      bookmarkCount: user.bookmark_count ?? 0,
    }));
  } catch (error) {
    console.error('Failed to load rising users', error);
    return [];
  }
}

function getTrendLabel(bookmark: TrendingBookmark): string {
  const createdAt = new Date(bookmark.createdAt);
  const hoursSince = (Date.now() - createdAt.getTime()) / 36e5;

  if (hoursSince < 24) {
    return 'New entry';
  }

  const momentum = Math.max(1, Math.round(bookmark.likes / 25));
  return `↑ ${momentum} positions`;
}

export default async function TrendingPage() {
  const [stats, bookmarks, tags, users] = await Promise.all([
    getTrendingStats(),
    getTrendingBookmarks(),
    getPopularTags(),
    getRisingUsers(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Trending Bookmarks',
    description: "Discover what's trending across the HitTags community right now.",
    itemListOrder: 'Descending',
    itemListElement: bookmarks.slice(0, 10).map((bookmark, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/bookmark/${bookmark.id}/${bookmark.slug}`,
      name: bookmark.title,
      description: bookmark.description ?? undefined,
      author: bookmark.author.username !== 'unknown'
        ? {
            '@type': 'Person',
            name: bookmark.author.displayName || bookmark.author.username,
            url: `${siteUrl}/${bookmark.author.username}`,
          }
        : undefined,
    })),
  };

  return (
    <main className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">Trending Bookmarks</h1>
          <p className="text-neutral-600">Discover what&apos;s popular and trending in the community</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-neutral-700">Time period:</label>
            <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
              <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm">Today</button>
              <button className="rounded-md px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100">This Week</button>
              <button className="rounded-md px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100">This Month</button>
              <button className="rounded-md px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100">All Time</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <TrendingStatCard
                icon={<Flame className="h-5 w-5" />}
                label="Trending Today"
                value={stats.trendingToday}
              />
              <TrendingStatCard
                icon={<Heart className="h-5 w-5" />}
                label="Total Likes"
                value={stats.totalLikes}
              />
              <TrendingStatCard
                icon={<BookmarkIcon className="h-5 w-5" />}
                label="Total Saves"
                value={stats.totalSaves}
              />
              <TrendingStatCard
                icon={<Share2 className="h-5 w-5" />}
                label="Total Shares"
                value={stats.totalShares}
              />
            </section>

            <section className="space-y-4">
              {bookmarks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
                  There are no trending bookmarks yet. Save and share bookmarks to populate this section.
                </div>
              ) : (
                bookmarks.map((bookmark, index) => (
                  <TrendingBookmarkCard
                    key={bookmark.id}
                    rank={index + 1}
                    trendLabel={getTrendLabel(bookmark)}
                    bookmark={bookmark}
                  />
                ))
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Popular Tags Today</h3>
              <div className="space-y-3">
                {tags.length === 0 ? (
                  <p className="text-sm text-neutral-500">No tags available yet.</p>
                ) : (
                  tags.map((tag) => (
                    <div key={tag.slug} className="flex items-center justify-between">
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 transition hover:bg-neutral-200"
                      >
                        #{tag.name}
                      </Link>
                      <span className="text-sm text-neutral-500">+{formatNumber(tag.usage)}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Rising Creators</h3>
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-sm text-neutral-500">No creators to highlight yet.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.avatarUrl} alt={user.displayName ?? user.username} className="h-9 w-9 rounded-full object-cover" />
                          </>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                            {(user.displayName ?? user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link href={`/${user.username}`} className="block text-sm font-medium text-neutral-900 hover:text-neutral-700">
                            {user.displayName ?? user.username}
                          </Link>
                          <p className="text-xs text-neutral-500">
                            {formatNumber(user.followerCount)} followers • {formatNumber(user.bookmarkCount)} bookmarks
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-neutral-900">Share something great</h3>
              <p className="mb-4 text-sm text-neutral-600">
                Save a bookmark or publish a premium post to reach the trending list faster.
              </p>
              <div className="space-y-2">
                <Link
                  href="/dashboard/bookmarks/new"
                  className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  Add Bookmark
                </Link>
                <Link
                  href="/dashboard/posts/new"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  <TrendingUp className="h-4 w-4" />
                  Create Premium Post
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TrendingStatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center">
        <div className="mr-4 rounded-lg bg-neutral-100 p-3 text-neutral-700">{icon}</div>
        <div>
          <div className="text-2xl font-semibold text-neutral-900">{formatNumber(value)}</div>
          <div className="text-sm text-neutral-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TrendingBookmarkCard({
  rank,
  trendLabel,
  bookmark,
}: {
  rank: number;
  trendLabel: string;
  bookmark: TrendingBookmark;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-shrink-0">
          {bookmark.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bookmark.imageUrl}
                alt={bookmark.title}
                className="h-16 w-16 rounded-lg object-cover"
              />
            </>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-500">
              Preview
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded bg-neutral-900 px-2 py-1 text-xs font-semibold text-white">#{rank}</span>
            <span className="text-neutral-500">{trendLabel}</span>
          </div>
          <Link href={`/bookmark/${bookmark.id}/${bookmark.slug}`} className="mb-2 block text-lg font-semibold text-neutral-900 hover:text-neutral-700">
            {bookmark.title}
          </Link>
          {bookmark.description && (
            <p className="mb-3 text-sm text-neutral-600 line-clamp-2">{bookmark.description}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-600">
                {bookmark.author.avatarUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bookmark.author.avatarUrl}
                      alt={bookmark.author.displayName ?? bookmark.author.username}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  </>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                    {(bookmark.author.displayName ?? bookmark.author.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{bookmark.author.displayName ?? bookmark.author.username}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-4 text-neutral-500">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {formatNumber(bookmark.likes)}
              </span>
              <span className="flex items-center gap-1">
                <BookmarkIcon className="h-4 w-4" />
                {formatNumber(bookmark.saves)}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                {formatNumber(bookmark.shares)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
