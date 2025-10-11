import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';

import { ExploreFilters } from '@/components/explore/explore-filters';
import { SuggestedUsers } from '@/components/explore/suggested-users';
import { TrendingTags } from '@/components/explore/trending-tags';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';

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
  like_count: number | null;
  save_count: number | null;
  click_count: number | null;
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
  createdAt: string;
  likes: number;
  saves: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
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
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type ExploreSearchParams = Record<string, string | string[] | undefined>;
const TIME_PERIOD_OPTIONS = new Set(['all', 'today', 'week', 'month', 'year']);
const SORT_OPTIONS = new Set(['popular', 'recent', 'liked', 'saved']);

function normaliseSlug(source: string): string {
  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getTrendLabelForBookmark(createdAt: string): string {
  const createdDate = new Date(createdAt);
  const diffMs = Date.now() - createdDate.getTime();
  const diffHours = Math.floor(diffMs / 36e5);

  if (diffHours < 1) {
    return 'Published within the last hour';
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Published yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  const months = diffMonths || 1;
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

async function getPublicBookmarks(
  filters: {
    category: string;
    timePeriod: string;
    sortBy: string;
  },
  currentUserId?: string
): Promise<{
  bookmarks: ExploreBookmark[];
  categories: Array<{ slug: string; label: string }>;
  appliedCategory: string;
}> {
  noStore();

  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return { bookmarks: [], categories: [], appliedCategory: 'all' };
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
      .order('created_at', { ascending: false })
      .limit(36);

    if (error || !Array.isArray(bookmarks) || bookmarks.length === 0) {
      return { bookmarks: [], categories: [], appliedCategory: 'all' };
    }

    const bookmarkIds = bookmarks.map((bookmark: RawBookmark) => bookmark.id);
    let likedIds = new Set<string>();
    let savedIds = new Set<string>();
    const likeCounts = new Map<string, number>();
    const saveCounts = new Map<string, number>();

    if (bookmarkIds.length > 0) {
      if (currentUserId) {
        const [{ data: userLikes }, { data: userSaves }, { data: allLikes }, { data: allSaves }] = await Promise.all([
          supabase
            .from('likes')
            .select('likeable_id')
            .eq('likeable_type', 'bookmark')
            .eq('user_id', currentUserId)
            .in('likeable_id', bookmarkIds),
          supabase
            .from('saved_bookmarks')
            .select('bookmark_id')
            .eq('user_id', currentUserId)
            .in('bookmark_id', bookmarkIds),
          supabase
            .from('likes')
            .select('likeable_id')
            .eq('likeable_type', 'bookmark')
            .in('likeable_id', bookmarkIds),
          supabase
            .from('saved_bookmarks')
            .select('bookmark_id')
            .in('bookmark_id', bookmarkIds),
        ]);

        likedIds = new Set((userLikes ?? []).map((row) => row.likeable_id as string));
        savedIds = new Set((userSaves ?? []).map((row) => row.bookmark_id as string));

        (allLikes ?? []).forEach((row) => {
          const id = row.likeable_id as string;
          likeCounts.set(id, (likeCounts.get(id) ?? 0) + 1);
        });

        (allSaves ?? []).forEach((row) => {
          const id = row.bookmark_id as string;
          saveCounts.set(id, (saveCounts.get(id) ?? 0) + 1);
        });
      } else {
        const [{ data: allLikes }, { data: allSaves }] = await Promise.all([
          supabase
            .from('likes')
            .select('likeable_id')
            .eq('likeable_type', 'bookmark')
            .in('likeable_id', bookmarkIds),
          supabase
            .from('saved_bookmarks')
            .select('bookmark_id')
            .in('bookmark_id', bookmarkIds),
        ]);

        (allLikes ?? []).forEach((row) => {
          const id = row.likeable_id as string;
          likeCounts.set(id, (likeCounts.get(id) ?? 0) + 1);
        });

        (allSaves ?? []).forEach((row) => {
          const id = row.bookmark_id as string;
          saveCounts.set(id, (saveCounts.get(id) ?? 0) + 1);
        });
      }
    }

    const categoryMap = new Map<string, string>();

    const mapped = bookmarks.map((bookmark: RawBookmark) => {
      const generatedSlug = normaliseSlug(bookmark.title);
      const slugCandidate = bookmark.slug && bookmark.slug.trim().length > 0
        ? bookmark.slug
        : generatedSlug;
      const slug = slugCandidate && slugCandidate.length > 0 ? slugCandidate : bookmark.id;

      const tags = (bookmark.bookmark_tags ?? [])
        .map((bt) => bt?.tags)
        .filter((tag): tag is { name: string; slug: string } => Boolean(tag))
        .map((tag) => {
          const slugLower = tag.slug.toLowerCase();
          if (!categoryMap.has(slugLower)) {
            categoryMap.set(slugLower, tag.name);
          }
          return { name: tag.name, slug: tag.slug };
        });

      return {
        id: bookmark.id,
        title: bookmark.title,
        slug,
        description: bookmark.description,
        imageUrl: bookmark.image_url,
        createdAt: bookmark.created_at,
        likes: likeCounts.get(bookmark.id) ?? bookmark.like_count ?? 0,
        saves: saveCounts.get(bookmark.id) ?? bookmark.save_count ?? 0,
        shares: bookmark.click_count ?? 0,
        isLiked: likedIds.has(bookmark.id),
        isSaved: savedIds.has(bookmark.id),
        author: {
          username: bookmark.profiles?.username ?? 'unknown',
          displayName: bookmark.profiles?.display_name ?? null,
          avatarUrl: bookmark.profiles?.avatar_url ?? null,
        },
        tags,
      } satisfies ExploreBookmark;
    });

    const normalizedCategory = filters.category.toLowerCase();
    const effectiveCategory = categoryMap.has(normalizedCategory) ? normalizedCategory : 'all';

    const filtered = mapped.filter((bookmark) => {
      const matchesCategory =
        effectiveCategory === 'all' ||
        bookmark.tags.some((tag) => {
          const slugLower = tag.slug.toLowerCase();
          const nameLower = tag.name.toLowerCase();
          return slugLower === effectiveCategory || nameLower === effectiveCategory;
        });

      const matchesTime = (() => {
        if (filters.timePeriod === 'all') {
          return true;
        }

        const createdDate = new Date(bookmark.createdAt);
        const diffMs = Date.now() - createdDate.getTime();
        const diffHours = diffMs / 36e5;

        switch (filters.timePeriod) {
          case 'today':
            return diffHours <= 24;
          case 'week':
            return diffHours <= 24 * 7;
          case 'month':
            return diffHours <= 24 * 30;
          case 'year':
            return diffHours <= 24 * 365;
          default:
            return true;
        }
      })();

      return matchesCategory && matchesTime;
    });

    const sorted = filtered.sort((a, b) => {
      const aTotal = a.likes + a.saves + a.shares;
      const bTotal = b.likes + b.saves + b.shares;

      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'liked':
          return b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'saved':
          return b.saves - a.saves || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
        default:
          return bTotal - aTotal || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const categories = Array.from(categoryMap.entries())
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return {
      bookmarks: sorted.slice(0, 24),
      categories,
      appliedCategory: effectiveCategory,
    };
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return { bookmarks: [], categories: [], appliedCategory: 'all' };
  }
}

async function getTrendingTags(): Promise<TrendingTag[]> {
  noStore();
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

async function getSuggestedUsers(currentUserId?: string): Promise<SuggestedUser[]> {
  noStore();
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio, bookmark_count')
      .order('bookmark_count', { ascending: false })
      .limit(10);

    if (error || !Array.isArray(users)) {
      return [];
    }

    const excludedIds = new Set<string>();

    if (currentUserId) {
      excludedIds.add(currentUserId);

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      (following ?? []).forEach((row) => {
        const followingId = row?.following_id as string | undefined;
        if (followingId) {
          excludedIds.add(followingId);
        }
      });
    }

    const filtered = users
      .filter((user) => user?.id && !excludedIds.has(user.id))
      .slice(0, 3);

    return filtered.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.display_name ?? null,
      avatarUrl: user.avatar_url ?? null,
      bio: user.bio ?? null,
      isFollowing: false,
    }));
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExplorePage({
  searchParams = {},
}: {
  searchParams?: ExploreSearchParams;
}) {

  const categoryParam = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const timePeriodParam = Array.isArray(searchParams.time)
    ? searchParams.time[0]
    : searchParams.time;
  const sortParam = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort;

  const categoryInput = categoryParam?.toLowerCase() ?? 'all';
  const timePeriodInput = timePeriodParam?.toLowerCase() ?? 'all';
  const sortInput = sortParam?.toLowerCase() ?? 'popular';

  const timePeriod = TIME_PERIOD_OPTIONS.has(timePeriodInput) ? timePeriodInput : 'all';
  const sortBy = SORT_OPTIONS.has(sortInput) ? sortInput : 'popular';

  const supabaseForUser = await createSupabaseServerClient({ strict: false });
  let currentUserId: string | undefined;

  if (supabaseForUser) {
    const {
      data: { user },
    } = await supabaseForUser.auth.getUser();
    currentUserId = user?.id ?? undefined;
  }

  const [{ bookmarks, categories, appliedCategory }, trendingTags, suggestedUsers] = await Promise.all([
    getPublicBookmarks(
      { category: categoryInput, timePeriod, sortBy },
      currentUserId
    ),
    getTrendingTags(),
    getSuggestedUsers(currentUserId),
  ]);

  const categoryOptionMap = new Map<string, string>();
  categories.forEach((category) => {
    categoryOptionMap.set(category.slug.toLowerCase(), category.label);
  });
  trendingTags.forEach((tag) => {
    const slugLower = tag.slug.toLowerCase();
    if (!categoryOptionMap.has(slugLower)) {
      categoryOptionMap.set(slugLower, tag.name);
    }
  });

  const availableCategories = [
    { slug: 'all', label: 'All Categories' },
    ...Array.from(categoryOptionMap.entries())
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const activeCategory = availableCategories.some((option) => option.slug === appliedCategory)
    ? appliedCategory
    : 'all';

  return (
    <main className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
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
            </div>

            {bookmarks.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                <p className="text-neutral-600">No bookmarks found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <TrendingBookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    detailUrl={`/bookmark/${bookmark.id}/${bookmark.slug}`}
                    visitUrl={`/out/bookmark/${bookmark.id}`}
                    currentUserId={currentUserId}
                    trendLabel={getTrendLabelForBookmark(bookmark.createdAt)}
                    layout="list"
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="w-80 flex-shrink-0 space-y-6">
            <ExploreFilters
              categories={availableCategories}
              initialCategory={activeCategory}
              initialTimePeriod={timePeriod}
              initialSortBy={sortBy}
            />
            <TrendingTags tags={trendingTags} />
            <SuggestedUsers users={suggestedUsers} />
          </aside>
        </div>
      </div>
    </main>
  );
}
