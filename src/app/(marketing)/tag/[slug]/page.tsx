import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ChevronRight } from 'lucide-react';

import { TagFilters } from '@/components/tags/tag-filters';
import { TagHeader } from '@/components/tags/tag-header';
import { TagSidebar } from '@/components/tags/tag-sidebar';
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';
import { siteConfig } from '@/config/site';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type TagRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  usage_count: number;
  is_trending: boolean;
  created_at: string;
};

type BookmarkRecord = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  slug: string | null;
  domain: string | null;
  image_url: string | null;
  created_at: string;
  like_count: number | null;
  save_count: number | null;
  click_count: number | null;
  profiles: {
    id: string;
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
  meta_data: Record<string, unknown> | null;
};

type TagBookmarkCardData = {
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
  domain: string | null;
  domainValue: string | null;
  contentType: string | null;
  contentTypeValue: string | null;
  author: {
    id?: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  tags: Array<{ name: string; slug: string }>;
};

type SidebarData = {
  statistics: {
    totalBookmarks: number;
    thisWeek: number;
    followers: number;
    avgLikes: number;
  };
  relatedTags: Array<{ name: string; slug: string; bookmarkCount: number }>;
  topContributors: Array<{
    userId?: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bookmarkCount: number;
    isFollowing?: boolean;
  }>;
  popularDomains: Array<{ domain: string; bookmarkCount: number }>;
};

type TagPageData = {
  tag: TagRecord;
  bookmarks: TagBookmarkCardData[];
  sidebar: SidebarData;
  structuredBookmarks: Array<{
    id: string;
    title: string;
    description: string | null;
    url: string;
    created_at: string;
    user?: {
      username: string;
      display_name: string | null;
    };
  }>;
  filters: {
    applied: TagFilterParams;
    options: {
      domains: TagFilterOption[];
      types: TagFilterOption[];
    };
  };
  followSupported: boolean;
};

type TagFilterParams = {
  sortBy: 'popular' | 'recent' | 'liked' | 'oldest';
  dateRange: 'all' | 'week' | 'month' | 'year';
  type: string;
  domain: string;
};

type TagFilterOption = {
  value: string;
  label: string;
};

const DEFAULT_TAG_FILTERS: TagFilterParams = {
  sortBy: 'recent',
  dateRange: 'all',
  type: 'all',
  domain: 'all',
};

const SORT_OPTIONS = new Set<TagFilterParams['sortBy']>(['popular', 'recent', 'liked', 'oldest']);
const DATE_RANGE_OPTIONS = new Set<TagFilterParams['dateRange']>(['all', 'week', 'month', 'year']);

const TAG_FOLLOWERS_MISSING_MESSAGE =
  'Tag followers feature is not configured. Please run migration 008_create_tag_followers.sql.';

function isMissingTagFollowersTableError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (typeof error === 'string') {
    return isMissingTagFollowersTableError({ message: error });
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: string }).message === 'string') {
    const message = (error as { message: string }).message.toLowerCase();
    return (
      message.includes('tag_followers') && (message.includes('does not exist') || message.includes('schema cache'))
    );
  }

  return false;
}

function logMissingTagFollowersWarning() {
  console.warn(TAG_FOLLOWERS_MISSING_MESSAGE);
}

function normaliseTagFilters(input: Partial<TagFilterParams> | undefined): TagFilterParams {
  const sortBy = input?.sortBy && SORT_OPTIONS.has(input.sortBy as TagFilterParams['sortBy'])
    ? (input.sortBy as TagFilterParams['sortBy'])
    : DEFAULT_TAG_FILTERS.sortBy;

  const dateRange = input?.dateRange && DATE_RANGE_OPTIONS.has(input.dateRange as TagFilterParams['dateRange'])
    ? (input.dateRange as TagFilterParams['dateRange'])
    : DEFAULT_TAG_FILTERS.dateRange;

  const type = input?.type ? String(input.type).toLowerCase() : DEFAULT_TAG_FILTERS.type;
  const domain = input?.domain ? String(input.domain).toLowerCase() : DEFAULT_TAG_FILTERS.domain;

  return {
    sortBy,
    dateRange,
    type: type || DEFAULT_TAG_FILTERS.type,
    domain: domain || DEFAULT_TAG_FILTERS.domain,
  } satisfies TagFilterParams;
}

function formatTrendLabel(createdAt: string): string {
  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return '';
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - createdTime);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    const minutesLabel = diffMinutes === 1 ? 'minute' : 'minutes';
    return `${diffMinutes} ${minutesLabel} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const hoursLabel = diffHours === 1 ? 'hour' : 'hours';
    return `${diffHours} ${hoursLabel} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    const daysLabel = diffDays === 1 ? 'day' : 'days';
    return `${diffDays} ${daysLabel} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    const weeksLabel = diffWeeks === 1 ? 'week' : 'weeks';
    return `${diffWeeks} ${weeksLabel} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    const months = diffMonths || 1;
    const monthsLabel = months === 1 ? 'month' : 'months';
    return `${months} ${monthsLabel} ago`;
  }

  const diffYears = Math.floor(diffDays / 365);
  const years = diffYears || 1;
  const yearsLabel = years === 1 ? 'year' : 'years';
  return `${years} ${yearsLabel} ago`;
}

const getTagPageData = cache(async (slug: string, filtersKey: string): Promise<TagPageData | null> => {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return null;
    }

    let filters: TagFilterParams = DEFAULT_TAG_FILTERS;
    try {
      filters = normaliseTagFilters(JSON.parse(filtersKey));
    } catch {
      filters = DEFAULT_TAG_FILTERS;
    }

    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (tagError || !tag) {
      return null;
    }

    const { data: bookmarkRows, error: bookmarksError } = await supabase
      .from('bookmark_tags')
      .select(
        `
        bookmarks (
          id,
          title,
          description,
          url,
          slug,
          domain,
          image_url,
          created_at,
          privacy_level,
          like_count,
          save_count,
          click_count,
          meta_data,
          profiles (
            id,
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
        )
      `
      )
      .eq('tag_id', tag.id)
      .order('created_at', { ascending: false, foreignTable: 'bookmarks' })
      .limit(80);

    if (bookmarksError) {
      console.error('Failed to load bookmarks for tag:', bookmarksError.message);
      return {
        tag,
        bookmarks: [],
        sidebar: {
          statistics: {
            totalBookmarks: tag.usage_count ?? 0,
            thisWeek: 0,
            followers: 0,
            avgLikes: 0,
          },
          relatedTags: [],
          topContributors: [],
          popularDomains: [],
        },
        structuredBookmarks: [],
        filters: {
          applied: filters,
          options: {
            domains: [],
            types: [],
          },
        },
        followSupported: true,
      } satisfies TagPageData;
    }

    const bookmarkList = (bookmarkRows ?? [])
      .map((row) => row.bookmarks)
      .filter((bookmark): bookmark is BookmarkRecord & { privacy_level: string } => {
        return Boolean(bookmark && bookmark.privacy_level === 'public');
      });

    const uniqueBookmarksMap = new Map<string, BookmarkRecord & { privacy_level: string }>();
    for (const bookmark of bookmarkList) {
      uniqueBookmarksMap.set(bookmark.id, bookmark);
    }

    const uniqueBookmarks = Array.from(uniqueBookmarksMap.values());

    const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const relatedTagMap = new Map<string, { name: string; count: number }>();
    const contributorMap = new Map<
      string,
      { userId?: string; username: string; displayName: string | null; avatarUrl: string | null; count: number }
    >();
    const domainMap = new Map<string, number>();
    const domainOptionMap = new Map<string, string>();
    const typeOptionMap = new Map<string, string>();

    let totalLikes = 0;
    let thisWeek = 0;

    const cardBookmarks: TagBookmarkCardData[] = uniqueBookmarks.map((bookmark) => {
      const normalizedSlug =
        bookmark.slug && bookmark.slug.trim().length > 0
          ? bookmark.slug
          : bookmark.title
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || bookmark.id;

      const tags = (bookmark.bookmark_tags ?? [])
        .map((relation) => relation?.tags)
        .filter((tagRelation): tagRelation is { name: string; slug: string } => Boolean(tagRelation))
        .map((tagRelation) => ({ name: tagRelation.name, slug: tagRelation.slug }));

      const author = {
        id: bookmark.profiles?.id ?? undefined,
        username: bookmark.profiles?.username ?? 'unknown',
        displayName: bookmark.profiles?.display_name ?? null,
        avatarUrl: bookmark.profiles?.avatar_url ?? null,
      };

      const likeCount = bookmark.like_count ?? 0;
      totalLikes += likeCount;

      if (new Date(bookmark.created_at) >= weekCutoff) {
        thisWeek += 1;
      }

      if (author.username !== 'unknown') {
        const existing = contributorMap.get(author.username);
        if (existing) {
          existing.count += 1;
        } else {
          contributorMap.set(author.username, {
            userId: author.id,
            username: author.username,
            displayName: author.displayName,
            avatarUrl: author.avatarUrl,
            count: 1,
          });
        }
      }

      if (bookmark.domain) {
        const domainKey = bookmark.domain.toLowerCase();
        domainMap.set(bookmark.domain, (domainMap.get(bookmark.domain) ?? 0) + 1);
        if (!domainOptionMap.has(domainKey)) {
          domainOptionMap.set(domainKey, bookmark.domain);
        }
      }

      const metaData = bookmark.meta_data && typeof bookmark.meta_data === 'object' ? bookmark.meta_data : null;
      const rawContentType = metaData && 'content_type' in metaData && typeof metaData.content_type === 'string'
        ? metaData.content_type
        : metaData && 'type' in metaData && typeof metaData.type === 'string'
          ? metaData.type
          : null;

      if (rawContentType) {
        const typeKey = rawContentType.toLowerCase();
        if (!typeOptionMap.has(typeKey)) {
          typeOptionMap.set(typeKey, rawContentType);
        }
      }

      for (const relatedTag of tags) {
        if (relatedTag.slug !== tag.slug) {
          const existing = relatedTagMap.get(relatedTag.slug);
          if (existing) {
            existing.count += 1;
          } else {
            relatedTagMap.set(relatedTag.slug, {
              name: relatedTag.name,
              count: 1,
            });
          }
        }
      }

      return {
        id: bookmark.id,
        title: bookmark.title,
        slug: normalizedSlug,
        description: bookmark.description,
        imageUrl: bookmark.image_url,
        createdAt: bookmark.created_at,
        likes: likeCount,
        saves: bookmark.save_count ?? 0,
        shares: bookmark.click_count ?? 0,
        isLiked: false,
        isSaved: false,
        domain: bookmark.domain,
        domainValue: bookmark.domain ? bookmark.domain.toLowerCase() : null,
        contentType: rawContentType,
        contentTypeValue: rawContentType ? rawContentType.toLowerCase() : null,
        author,
        tags,
      } satisfies TagBookmarkCardData;
    });

    const domainOptions: TagFilterOption[] = Array.from(domainOptionMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const typeOptions: TagFilterOption[] = Array.from(typeOptionMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    let filteredBookmarks = cardBookmarks;

    if (filters.domain !== 'all') {
      filteredBookmarks = filteredBookmarks.filter((bookmark) => bookmark.domainValue === filters.domain);
    }

    if (filters.type !== 'all') {
      filteredBookmarks = filteredBookmarks.filter((bookmark) => bookmark.contentTypeValue === filters.type);
    }

    if (filters.dateRange !== 'all') {
      const now = Date.now();
      let threshold = 0;
      if (filters.dateRange === 'week') {
        threshold = now - 7 * 24 * 60 * 60 * 1000;
      } else if (filters.dateRange === 'month') {
        threshold = now - 30 * 24 * 60 * 60 * 1000;
      } else if (filters.dateRange === 'year') {
        threshold = now - 365 * 24 * 60 * 60 * 1000;
      }

      if (threshold > 0) {
        filteredBookmarks = filteredBookmarks.filter((bookmark) => {
          const created = new Date(bookmark.createdAt).getTime();
          return !Number.isNaN(created) && created >= threshold;
        });
      }
    }

    filteredBookmarks = [...filteredBookmarks].sort((a, b) => {
      if (filters.sortBy === 'popular') {
        const aScore = a.likes + a.saves + a.shares;
        const bScore = b.likes + b.saves + b.shares;
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (filters.sortBy === 'liked') {
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const structuredBookmarks = filteredBookmarks.map((bookmark) => ({
      id: bookmark.id,
      title: bookmark.title,
      description: bookmark.description,
      url: uniqueBookmarksMap.get(bookmark.id)?.url ?? '',
      created_at: bookmark.createdAt,
      user:
        bookmark.author.username !== 'unknown'
          ? {
              username: bookmark.author.username,
              display_name: bookmark.author.displayName,
            }
          : undefined,
    }));

    const followerEstimate = contributorMap.size;
    const avgLikes = cardBookmarks.length
      ? Math.round(totalLikes / cardBookmarks.length)
      : 0;

    const relatedTags = Array.from(relatedTagMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([slugValue, value]) => ({
        name: value.name,
        slug: slugValue,
        bookmarkCount: value.count,
      }));

    const topContributors = Array.from(contributorMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([, contributor]) => ({
        userId: contributor.userId,
        username: contributor.username,
        displayName: contributor.displayName,
        avatarUrl: contributor.avatarUrl,
        bookmarkCount: contributor.count,
      }));

    const popularDomains = Array.from(domainMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, bookmarkCount: count }));

    let followerCount = followerEstimate;
    let isFollowSupported = true;
    const {
      count: followerCountRaw,
      error: followerCountError,
    } = await supabase
      .from('tag_followers')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tag.id);

    if (followerCountError) {
      if (isMissingTagFollowersTableError(followerCountError)) {
        logMissingTagFollowersWarning();
        isFollowSupported = false;
      } else {
        console.error('Failed to retrieve tag follower count:', followerCountError);
      }
    } else if (typeof followerCountRaw === 'number') {
      followerCount = followerCountRaw;
    }

    return {
      tag,
      bookmarks: filteredBookmarks,
      sidebar: {
        statistics: {
          totalBookmarks: tag.usage_count ?? cardBookmarks.length,
          thisWeek,
          followers: followerCount,
          avgLikes,
        },
        relatedTags,
        topContributors,
        popularDomains,
      },
      structuredBookmarks,
      filters: {
        applied: filters,
        options: {
          domains: domainOptions,
          types: typeOptions,
        },
      },
      followSupported: isFollowSupported,
    } satisfies TagPageData;
  } catch (error) {
    console.error('Failed to build tag page data:', error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getTagPageData(params.slug, JSON.stringify(DEFAULT_TAG_FILTERS));

  if (!data) {
    return {
      title: 'Tag Not Found',
    };
  }

  return MetadataGenerator.generateTagPageMetadata({
    ...data.tag,
    color: data.tag.color ?? '#6b7280',
  });
}

export default async function TagDetailsPage({
  params,
  searchParams = {},
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sortParam = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort;
  const timeParam = Array.isArray(searchParams.time) ? searchParams.time[0] : searchParams.time;
  const typeParam = Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type;
  const domainParam = Array.isArray(searchParams.domain) ? searchParams.domain[0] : searchParams.domain;

  const filters = normaliseTagFilters({
    sortBy: sortParam ? (sortParam.toString().toLowerCase() as TagFilterParams['sortBy']) : undefined,
    dateRange: timeParam ? (timeParam.toString().toLowerCase() as TagFilterParams['dateRange']) : undefined,
    type: typeParam ? typeParam.toString().toLowerCase() : undefined,
    domain: domainParam ? domainParam.toString().toLowerCase() : undefined,
  });

  const filtersKey = JSON.stringify(filters);

  const supabaseForUser = await createSupabaseServerClient({ strict: false });
  let currentUserId: string | undefined;

  if (supabaseForUser) {
    try {
      const {
        data: { user },
      } = await supabaseForUser.auth.getUser();
      currentUserId = user?.id ?? undefined;
    } catch (error) {
      console.error('Failed to resolve current user for tag page:', error);
    }
  }

  const data = await getTagPageData(params.slug, filtersKey);

  if (!data) {
    notFound();
  }

  const { tag, structuredBookmarks, filters: filterState, followSupported } = data;
  let sidebar = data.sidebar;
  let bookmarks = data.bookmarks;
  let tagFollowersAvailable = followSupported;

  if (supabaseForUser && bookmarks.length > 0) {
    const bookmarkIds = bookmarks.map((bookmark) => bookmark.id);

    try {
      const [{ data: likeRowsAll }, { data: saveRowsAll }] = await Promise.all([
        supabaseForUser
          .from('likes')
          .select('likeable_id')
          .eq('likeable_type', 'bookmark')
          .in('likeable_id', bookmarkIds),
        supabaseForUser.from('saved_bookmarks').select('bookmark_id').in('bookmark_id', bookmarkIds),
      ]);

      let likedIds = new Set<string>();
      let savedIds = new Set<string>();

      if (currentUserId) {
        const [{ data: likeRowsForUser }, { data: saveRowsForUser }] = await Promise.all([
          supabaseForUser
            .from('likes')
            .select('likeable_id')
            .eq('likeable_type', 'bookmark')
            .eq('user_id', currentUserId)
            .in('likeable_id', bookmarkIds),
          supabaseForUser
            .from('saved_bookmarks')
            .select('bookmark_id')
            .eq('user_id', currentUserId)
            .in('bookmark_id', bookmarkIds),
        ]);

        likedIds = new Set((likeRowsForUser ?? []).map((row) => row.likeable_id as string));
        savedIds = new Set((saveRowsForUser ?? []).map((row) => row.bookmark_id as string));
      }

      const likeCounts = new Map<string, number>();
      const saveCounts = new Map<string, number>();

      (likeRowsAll ?? []).forEach((row) => {
        const id = row.likeable_id as string;
        likeCounts.set(id, (likeCounts.get(id) ?? 0) + 1);
      });

      (saveRowsAll ?? []).forEach((row) => {
        const id = row.bookmark_id as string;
        saveCounts.set(id, (saveCounts.get(id) ?? 0) + 1);
      });

      bookmarks = bookmarks.map((bookmark) => ({
        ...bookmark,
        likes: likeCounts.get(bookmark.id) ?? bookmark.likes,
        saves: saveCounts.get(bookmark.id) ?? bookmark.saves,
        isLiked: likedIds.has(bookmark.id),
        isSaved: savedIds.has(bookmark.id),
      }));
    } catch (error) {
      console.error('Failed to enhance tag bookmarks with engagement data:', error);
    }
  }

  let isFollowingTag = false;
  const relatedTagFollowSet = new Set<string>();
  const contributorFollowSet = new Set<string>();

  if (supabaseForUser && currentUserId) {
    if (tagFollowersAvailable) {
      const {
        data: tagFollowRow,
        error: tagFollowError,
      } = await supabaseForUser
        .from('tag_followers')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('tag_id', tag.id)
        .maybeSingle();

      if (tagFollowError) {
        if (isMissingTagFollowersTableError(tagFollowError)) {
          tagFollowersAvailable = false;
          logMissingTagFollowersWarning();
        } else {
          console.error('Failed to resolve follow state for tag page:', tagFollowError);
        }
      } else {
        isFollowingTag = Boolean(tagFollowRow);
      }

      if (tagFollowersAvailable && sidebar.relatedTags.length > 0) {
        const {
          data: relatedFollowRows,
          error: relatedFollowError,
        } = await supabaseForUser
          .from('tag_followers')
          .select('tags!inner(slug)')
          .eq('user_id', currentUserId)
          .in(
            'tags.slug',
            sidebar.relatedTags.map((item) => item.slug)
          );

        if (relatedFollowError) {
          if (isMissingTagFollowersTableError(relatedFollowError)) {
            tagFollowersAvailable = false;
            logMissingTagFollowersWarning();
          } else {
            console.error('Failed to resolve follow state for related tags:', relatedFollowError);
          }
        } else {
          (relatedFollowRows ?? []).forEach((row) => {
            const slugValue = row?.tags?.slug;
            if (slugValue) {
              relatedTagFollowSet.add(slugValue);
            }
          });
        }
      }
    }

    if (sidebar.topContributors.length > 0) {
      const contributorIds = sidebar.topContributors
        .map((contributor) => contributor.userId)
        .filter((value): value is string => Boolean(value));

      if (contributorIds.length > 0) {
        const {
          data: contributorFollowRows,
          error: contributorFollowError,
        } = await supabaseForUser
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId)
          .in('following_id', contributorIds);

        if (contributorFollowError) {
          console.error('Failed to resolve follow state for contributors:', contributorFollowError);
        } else {
          (contributorFollowRows ?? []).forEach((row) => {
            if (row?.following_id) {
              contributorFollowSet.add(row.following_id as string);
            }
          });
        }
      }
    }
  }

  sidebar = {
    ...sidebar,
    relatedTags: sidebar.relatedTags.map((item) => ({
      ...item,
      isFollowing: relatedTagFollowSet.has(item.slug),
    })),
    topContributors: sidebar.topContributors.map((contributor) => ({
      ...contributor,
      isFollowing: contributor.userId ? contributorFollowSet.has(contributor.userId) : false,
    })),
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
  const shareUrl = `${baseUrl}/tag/${tag.slug}`;

  const structuredData = StructuredDataGenerator.generateTagCollectionSchema(
    {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      usage_count: tag.usage_count ?? bookmarks.length,
    },
    structuredBookmarks.map((bookmark) => ({
      ...bookmark,
      user: bookmark.user,
    }))
  );

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tags" className="hover:text-neutral-700">
              Tags
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neutral-900">#{tag.name}</span>
          </nav>

          {/* Tag Header */}
          <TagHeader
            name={tag.name}
            description={tag.description}
            bookmarkCount={sidebar.statistics.totalBookmarks}
            followerCount={sidebar.statistics.followers}
            createdAt={tag.created_at}
            color={tag.color || '#6b7280'}
            tagSlug={tag.slug}
            isFollowing={isFollowingTag}
            currentUserId={currentUserId}
            shareUrl={shareUrl}
            followSupported={tagFollowersAvailable}
          />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3">
              {/* Filters */}
              <div className="mb-6">
                <TagFilters
                  initialFilters={filterState.applied}
                  options={filterState.options}
                />
              </div>

              {/* Bookmarks List */}
              <section className="space-y-4">
                {bookmarks && bookmarks.length > 0 ? (
                  <div className="space-y-4">
                    {bookmarks.map((bookmark) => (
                      <TrendingBookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        detailUrl={`/bookmark/${bookmark.id}/${bookmark.slug}`}
                        visitUrl={`/out/bookmark/${bookmark.id}`}
                        trendLabel={formatTrendLabel(bookmark.createdAt)}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                    <p className="text-neutral-600">
                      No bookmarks found for this tag yet.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <TagSidebar
              tagSlug={tag.slug}
              statistics={sidebar.statistics}
              relatedTags={sidebar.relatedTags}
              topContributors={sidebar.topContributors}
              popularDomains={sidebar.popularDomains}
              currentUserId={currentUserId}
              followSupported={tagFollowersAvailable}
            />
          </div>
        </div>
      </main>
    </>
  );
}
