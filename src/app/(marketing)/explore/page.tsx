import { Metadata } from 'next';
import Link from 'next/link';
import { Grid3x3, List } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ExploreFilters } from '@/components/explore/explore-filters';
import { ExploreBookmarkCard } from '@/components/explore/explore-bookmark-card';
import { ExploreBookmarkListItem } from '@/components/explore/explore-bookmark-list-item';
import { TrendingTags } from '@/components/explore/trending-tags';
import { SuggestedUsers } from '@/components/explore/suggested-users';

export const metadata: Metadata = {
  title: 'Explore Bookmarks | HitTags',
  description: 'Discover popular content curated by the community',
};

type SearchParams = {
  view?: string;
};

interface Bookmark {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  bookmark_tags?: Array<{
    tags: {
      name: string;
      slug: string;
    };
  }>;
}

async function getPublicBookmarks() {
  try {
    const supabase = await createSupabaseServerClient();

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

    if (error || !bookmarks) {
      return [];
    }

    return bookmarks;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

async function getTrendingTags() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: tags, error } = await supabase
      .from('tags')
      .select('name, slug, usage_count')
      .order('usage_count', { ascending: false })
      .limit(8);

    if (error || !tags) {
      return [];
    }

    return tags;
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return [];
  }
}

async function getSuggestedUsers() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get users with most public bookmarks
    const { data: users, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, bio')
      .limit(3);

    if (error || !users) {
      return [];
    }

    return users;
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = params.view === 'grid' ? 'grid' : 'list';

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
                {bookmarks.map((bookmark: Bookmark) => (
                  <ExploreBookmarkListItem
                    key={bookmark.id}
                    id={bookmark.id}
                    title={bookmark.title}
                    slug={
                      bookmark.slug ||
                      bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }
                    description={bookmark.description}
                    imageUrl={bookmark.image_url}
                    author={{
                      username: bookmark.profiles?.username || 'unknown',
                      displayName: bookmark.profiles?.display_name || null,
                      avatarUrl: bookmark.profiles?.avatar_url || null,
                    }}
                    tags={
                      bookmark.bookmark_tags?.map((bt) => ({
                        name: bt.tags.name,
                        slug: bt.tags.slug,
                      })) || []
                    }
                    likes={24}
                    isLiked={false}
                    isBookmarked={false}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((bookmark: Bookmark) => (
                  <ExploreBookmarkCard
                    key={bookmark.id}
                    id={bookmark.id}
                    title={bookmark.title}
                    slug={
                      bookmark.slug ||
                      bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }
                    description={bookmark.description}
                    imageUrl={bookmark.image_url}
                    author={{
                      username: bookmark.profiles?.username || 'unknown',
                      displayName: bookmark.profiles?.display_name || null,
                      avatarUrl: bookmark.profiles?.avatar_url || null,
                    }}
                    tags={
                      bookmark.bookmark_tags?.map((bt) => ({
                        name: bt.tags.name,
                        slug: bt.tags.slug,
                      })) || []
                    }
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
