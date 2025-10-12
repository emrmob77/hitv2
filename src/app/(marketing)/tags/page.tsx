import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { Hash, TrendingUp, Search as SearchIcon } from 'lucide-react';

import { TagsSearch } from '@/components/tags-directory/tags-search';
import { TagsGrid } from '@/components/tags-directory/tags-grid';
import { TagsList } from '@/components/tags-directory/tags-list';
import { TagsFilters } from '@/components/tags-directory/tags-filters';
import { FeaturedTags } from '@/components/tags-directory/featured-tags';
import { TrendingTagsSidebar } from '@/components/tags-directory/trending-tags-sidebar';
import { TagStatistics } from '@/components/tags-directory/tag-statistics';
import { CategoryPills } from '@/components/tags-directory/category-pills';
import { RecentActivityTimeline } from '@/components/tags-directory/recent-activity-timeline';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MetadataGenerator } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  title: 'Browse All Tags | HitTags - Discover Topics & Interests',
  description: 'Explore 24,000+ curated bookmark tags. Find resources in web development, design, marketing, productivity, and more. Join the community.',
  keywords: [
    'tags',
    'topics',
    'bookmarks',
    'categories',
    'web development',
    'design',
    'productivity',
    'discover content',
  ],
  openGraph: {
    title: 'Browse All Tags | HitTags',
    description: 'Explore curated bookmark tags across all topics.',
    url: 'https://hittags.com/tags',
    siteName: 'HitTags',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 saat

type TagRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  usage_count: number;
  follower_count?: number;
  is_trending: boolean;
  is_featured: boolean;
  created_at: string;
};

type TagWithEngagement = TagRecord & {
  isFollowing?: boolean;
  growthRate?: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS = new Set(['popular', 'trending', 'recent', 'alphabetical', 'most-bookmarks']);
const VIEW_OPTIONS = new Set(['grid', 'list']);
const CATEGORY_MAP = new Map([
  ['all', 'All Categories'],
  ['web-development', 'Web Development'],
  ['design', 'Design'],
  ['marketing', 'Marketing'],
  ['productivity', 'Productivity'],
  ['business', 'Business'],
  ['technology', 'Technology'],
  ['education', 'Education'],
  ['creative', 'Creative'],
]);

function normalizeFilters(searchParams: SearchParams) {
  const sortParam = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort;
  const viewParam = Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view;
  const categoryParam = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category;
  const searchQuery = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;

  const sort = sortParam && SORT_OPTIONS.has(sortParam.toLowerCase()) ? sortParam.toLowerCase() : 'popular';
  const view = viewParam && VIEW_OPTIONS.has(viewParam.toLowerCase()) ? viewParam.toLowerCase() as 'grid' | 'list' : 'grid';
  const category = categoryParam?.toLowerCase() ?? 'all';
  const q = searchQuery?.trim() ?? '';

  return { sort, view, category, q };
}

async function getAllTags(filters: {
  sort: string;
  category: string;
  searchQuery: string;
}, currentUserId?: string): Promise<{
  tags: TagWithEngagement[];
  totalCount: number;
  statistics: {
    totalTags: number;
    activeToday: number;
    newThisWeek: number;
    totalBookmarks: number;
  };
}> {
  noStore();

  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return {
        tags: [],
        totalCount: 0,
        statistics: {
          totalTags: 0,
          activeToday: 0,
          newThisWeek: 0,
          totalBookmarks: 0,
        },
      };
    }

    // Get all tags
    let query = supabase
      .from('tags')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (filters.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    // Apply category filter (this would need a category field in tags table)
    // For now, we'll skip this as the schema doesn't have categories

    // Apply sorting
    switch (filters.sort) {
      case 'trending':
        query = query.eq('is_trending', true).order('usage_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'alphabetical':
        query = query.order('name', { ascending: true });
        break;
      case 'most-bookmarks':
        query = query.order('usage_count', { ascending: false });
        break;
      case 'popular':
      default:
        query = query.order('usage_count', { ascending: false });
        break;
    }

    query = query.limit(100);

    const { data: tags, error, count } = await query;

    if (error || !tags) {
      console.error('Error fetching tags:', error);
      return {
        tags: [],
        totalCount: 0,
        statistics: {
          totalTags: 0,
          activeToday: 0,
          newThisWeek: 0,
          totalBookmarks: 0,
        },
      };
    }

    // Get follower counts if tag_followers table exists
    const tagIds = tags.map(tag => tag.id);
    const followerCounts = new Map<string, number>();

    if (tagIds.length > 0) {
      try {
        const { data: followers } = await supabase
          .from('tag_followers')
          .select('tag_id')
          .in('tag_id', tagIds);

        if (followers) {
          followers.forEach(f => {
            const count = followerCounts.get(f.tag_id) ?? 0;
            followerCounts.set(f.tag_id, count + 1);
          });
        }
      } catch (err) {
        console.warn('tag_followers table might not exist:', err);
      }
    }

    // Check which tags user is following
    const followingSet = new Set<string>();
    if (currentUserId && tagIds.length > 0) {
      try {
        const { data: following } = await supabase
          .from('tag_followers')
          .select('tag_id')
          .eq('user_id', currentUserId)
          .in('tag_id', tagIds);

        if (following) {
          following.forEach(f => followingSet.add(f.tag_id));
        }
      } catch (err) {
        console.warn('Could not fetch user following data:', err);
      }
    }

    // Calculate statistics
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const statistics = {
      totalTags: count ?? tags.length,
      activeToday: tags.filter(tag => {
        const created = new Date(tag.created_at).getTime();
        return created >= oneDayAgo;
      }).length,
      newThisWeek: tags.filter(tag => {
        const created = new Date(tag.created_at).getTime();
        return created >= oneWeekAgo;
      }).length,
      totalBookmarks: tags.reduce((sum, tag) => sum + (tag.usage_count ?? 0), 0),
    };

    // Enrich tags with engagement data
    const enrichedTags: TagWithEngagement[] = tags.map(tag => ({
      ...tag,
      follower_count: followerCounts.get(tag.id) ?? 0,
      isFollowing: followingSet.has(tag.id),
      growthRate: tag.is_trending ? Math.floor(Math.random() * 300) + 50 : 0, // Mock growth rate
    }));

    return {
      tags: enrichedTags,
      totalCount: count ?? tags.length,
      statistics,
    };
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return {
      tags: [],
      totalCount: 0,
      statistics: {
        totalTags: 0,
        activeToday: 0,
        newThisWeek: 0,
        totalBookmarks: 0,
      },
    };
  }
}

async function getFeaturedTags(): Promise<TagRecord[]> {
  noStore();

  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
      .limit(3);

    if (error || !tags) {
      return [];
    }

    return tags;
  } catch (error) {
    console.error('Error fetching featured tags:', error);
    return [];
  }
}

async function getTrendingTags(): Promise<TagRecord[]> {
  noStore();

  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_trending', true)
      .order('usage_count', { ascending: false })
      .limit(10);

    if (error || !tags) {
      return [];
    }

    return tags;
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return [];
  }
}

type Activity = {
  id: string;
  type: 'like' | 'save' | 'follow' | 'tag' | 'comment';
  user: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  target: {
    type: 'bookmark' | 'tag' | 'user';
    id: string;
    name: string;
    slug?: string;
  };
  createdAt: string;
};

async function getRecentActivity(): Promise<Activity[]> {
  noStore();

  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    // Get recent likes
    const { data: likes } = await supabase
      .from('likes')
      .select(`
        id,
        created_at,
        likeable_id,
        likeable_type,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        ),
        bookmarks:likeable_id (
          id,
          title,
          slug
        )
      `)
      .eq('likeable_type', 'bookmark')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent saves
    const { data: saves } = await supabase
      .from('saved_bookmarks')
      .select(`
        id,
        created_at,
        bookmark_id,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        ),
        bookmarks:bookmark_id (
          id,
          title,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent tag followers
    const { data: tagFollows } = await supabase
      .from('tag_followers')
      .select(`
        id,
        created_at,
        tag_id,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        ),
        tags:tag_id (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const activities: Activity[] = [];

    // Process likes
    if (likes) {
      likes.forEach((like: any) => {
        if (like.profiles && like.bookmarks) {
          activities.push({
            id: `like-${like.id}`,
            type: 'like',
            user: {
              username: like.profiles.username,
              displayName: like.profiles.display_name,
              avatarUrl: like.profiles.avatar_url,
            },
            target: {
              type: 'bookmark',
              id: like.bookmarks.id,
              name: like.bookmarks.title,
              slug: like.bookmarks.slug,
            },
            createdAt: like.created_at,
          });
        }
      });
    }

    // Process saves
    if (saves) {
      saves.forEach((save: any) => {
        if (save.profiles && save.bookmarks) {
          activities.push({
            id: `save-${save.id}`,
            type: 'save',
            user: {
              username: save.profiles.username,
              displayName: save.profiles.display_name,
              avatarUrl: save.profiles.avatar_url,
            },
            target: {
              type: 'bookmark',
              id: save.bookmarks.id,
              name: save.bookmarks.title,
              slug: save.bookmarks.slug,
            },
            createdAt: save.created_at,
          });
        }
      });
    }

    // Process tag follows
    if (tagFollows) {
      tagFollows.forEach((follow: any) => {
        if (follow.profiles && follow.tags) {
          activities.push({
            id: `tag-${follow.id}`,
            type: 'tag',
            user: {
              username: follow.profiles.username,
              displayName: follow.profiles.display_name,
              avatarUrl: follow.profiles.avatar_url,
            },
            target: {
              type: 'tag',
              id: follow.tags.id,
              name: follow.tags.name,
              slug: follow.tags.slug,
            },
            createdAt: follow.created_at,
          });
        }
      });
    }

    // Sort by date and return top 10
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export default async function TagsDirectoryPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const filters = normalizeFilters(searchParams);

  // Get current user
  const supabaseForUser = await createSupabaseServerClient({ strict: false });
  let currentUserId: string | undefined;

  if (supabaseForUser) {
    const { data: { user } } = await supabaseForUser.auth.getUser();
    currentUserId = user?.id ?? undefined;
  }

  // Fetch data in parallel
  const [
    { tags, totalCount, statistics },
    featuredTags,
    trendingTags,
    recentActivity,
  ] = await Promise.all([
    getAllTags(
      {
        sort: filters.sort,
        category: filters.category,
        searchQuery: filters.q,
      },
      currentUserId
    ),
    getFeaturedTags(),
    getTrendingTags(),
    getRecentActivity(),
  ]);

  const categories = Array.from(CATEGORY_MAP.entries()).map(([slug, label]) => ({
    slug,
    label,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-white/10 p-4 backdrop-blur-sm">
              <Hash className="h-12 w-12 text-white" />
            </div>
            <h1 className="mb-4 text-5xl font-extrabold text-white">
              Discover Tags & Topics
            </h1>
            <p className="mb-8 text-xl text-white/90">
              Explore curated bookmarks by topic and interest
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <TagsSearch initialQuery={filters.q} />
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">
                  {statistics.totalTags.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">Total Tags</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">
                  {statistics.totalBookmarks.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">Bookmarks</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">
                  {statistics.activeToday.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">Active Today</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">
                  {statistics.newThisWeek.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">New This Week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-700">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Tags</span>
        </nav>

        {/* Category Pills */}
        <div className="mb-8">
          <CategoryPills
            categories={categories}
            activeCategory={filters.category}
          />
        </div>

        {/* Featured Tags Section */}
        {featuredTags.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-neutral-900">
              <span className="mr-2">⭐</span>
              Featured Tags
            </h2>
            <FeaturedTags tags={featuredTags} currentUserId={currentUserId} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="mb-6">
              <TagsFilters
                initialSort={filters.sort}
                initialView={filters.view}
                totalCount={totalCount}
              />
            </div>

            {/* Tags Display */}
            {tags.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                <SearchIcon className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  No tags found
                </h3>
                <p className="mb-6 text-sm text-neutral-600">
                  Try adjusting your search or filters
                </p>
                <Link
                  href="/tags"
                  className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <>
                {filters.view === 'grid' ? (
                  <TagsGrid tags={tags} currentUserId={currentUserId} />
                ) : (
                  <TagsList tags={tags} currentUserId={currentUserId} />
                )}
              </>
            )}

            {/* Pagination Info */}
            {tags.length > 0 && (
              <div className="mt-6 text-center text-sm text-neutral-600">
                Showing {tags.length} of {totalCount} tags
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Recent Activity Timeline */}
            <RecentActivityTimeline activities={recentActivity} />

            {/* Trending Tags */}
            <TrendingTagsSidebar
              tags={trendingTags}
              currentUserId={currentUserId}
            />

            {/* Statistics */}
            <TagStatistics statistics={statistics} />
          </aside>
        </div>
      </div>
    </main>
  );
}
