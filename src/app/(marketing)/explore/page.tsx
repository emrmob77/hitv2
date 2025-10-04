import { Metadata } from 'next';
import Link from 'next/link';
import { Grid3x3, List } from 'lucide-react';

import { ExploreBookmarkCard } from '@/components/explore/explore-bookmark-card';
import { ExploreBookmarkListItem } from '@/components/explore/explore-bookmark-list-item';
import { ExploreFilters } from '@/components/explore/explore-filters';
import { SuggestedUsers } from '@/components/explore/suggested-users';
import { TrendingTags } from '@/components/explore/trending-tags';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Explore Bookmarks',
  description: 'Discover popular content curated by the community',
};

type RawBookmark = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  bookmark_tags: Array<{
    tags: {
      name: string;
      slug: string;
    } | null;
  }> | null;
};

type ExploreBookmark = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
};

type TrendingTag = {
  name: string;
  slug: string;
  count: number;
};

type SuggestedUser = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type ExploreSearchParams = Record<string, string | string[] | undefined>;

const FALLBACK_VIEW = 'list' as const;

function normaliseSlug(source: string): string {
  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getPublicBookmarks(): Promise<ExploreBookmark[]> {
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
      .order('created_at', { ascending: false })
      .limit(12);

    if (error || !Array.isArray(bookmarks)) {
      return [];
    }

    return bookmarks.map((bookmark: RawBookmark) => {
      const generatedSlug = normaliseSlug(bookmark.title);
      const slugCandidate = bookmark.slug && bookmark.slug.trim().length > 0
        ? bookmark.slug
        : generatedSlug;
      const slug = slugCandidate && slugCandidate.length > 0 ? slugCandidate : bookmark.id;

      const tags = (bookmark.bookmark_tags ?? [])
        .map((bt) => bt?.tags)
        .filter((tag): tag is { name: string; slug: string } => Boolean(tag))
        .map((tag) => ({ name: tag.name, slug: tag.slug }));

      return {
        id: bookmark.id,
        title: bookmark.title,
        slug,
        description: bookmark.description,
        imageUrl: bookmark.image_url,
        author: {
          username: bookmark.profiles?.username ?? 'unknown',
          displayName: bookmark.profiles?.display_name ?? null,
          avatarUrl: bookmark.profiles?.avatar_url ?? null,
        },
        tags,
      } satisfies ExploreBookmark;
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

async function getTrendingTags(): Promise<TrendingTag[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: tags, error } = await supabase
      .from('tags')
      .select('name, slug, usage_count')
      .order('usage_count', { ascending: false })
      .limit(8);

    if (error || !Array.isArray(tags)) {
      return [];
    }

    return tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      count: Number(tag.usage_count) || 0,
    }));
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return [];
  }
}

async function getSuggestedUsers(): Promise<SuggestedUser[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, bio, bookmark_count')
      .order('bookmark_count', { ascending: false })
      .limit(3);

    if (error || !Array.isArray(users)) {
      return [];
    }

    return users.map((user) => ({
      username: user.username,
      displayName: user.display_name ?? null,
      avatarUrl: user.avatar_url ?? null,
      bio: user.bio ?? null,
    }));
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<ExploreSearchParams | undefined>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const viewParam = resolvedSearchParams.view;
  const viewValue = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const view = viewValue === 'grid' ? 'grid' : FALLBACK_VIEW;

  const [bookmarks, trendingTags, suggestedUsers] = await Promise.all([
    getPublicBookmarks(),
    getTrendingTags(),
    getSuggestedUsers(),
  ]);

  return (
    <main className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-neutral-900">
                  Explore Bookmarks
                </h1>
                <p className="text-neutral-600">
                  Discover popular content curated by the community
                </p>
              </div>
              {/* View Toggle */}
              <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                <Link
                  href="/explore"
                  scroll={false}
                  className={`flex items-center justify-center rounded-full px-3 py-2 transition ${
                    view === 'list'
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <List className="h-4 w-4" />
                </Link>
                <Link
                  href="/explore?view=grid"
                  scroll={false}
                  className={`flex items-center justify-center rounded-full px-3 py-2 transition ${
                    view === 'grid'
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {bookmarks.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                <p className="text-neutral-600">No bookmarks found</p>
              </div>
            ) : view === 'list' ? (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <ExploreBookmarkListItem
                    key={bookmark.id}
                    id={bookmark.id}
                    title={bookmark.title}
                    slug={bookmark.slug}
                    description={bookmark.description}
                    imageUrl={bookmark.imageUrl}
                    author={bookmark.author}
                    tags={bookmark.tags}
                    likes={24}
                    isLiked={false}
                    isBookmarked={false}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((bookmark) => (
                  <ExploreBookmarkCard
                    key={bookmark.id}
                    id={bookmark.id}
                    title={bookmark.title}
                    slug={bookmark.slug}
                    description={bookmark.description}
                    imageUrl={bookmark.imageUrl}
                    author={bookmark.author}
                    tags={bookmark.tags}
                    likes={24}
                    isLiked={false}
                    isBookmarked={false}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar - Sağda */}
          <aside className="w-80 flex-shrink-0 space-y-6">
            <ExploreFilters />
            <TrendingTags tags={trendingTags} />
            <SuggestedUsers users={suggestedUsers} />
          </aside>
        </div>
      </div>
    </main>
  );
}
