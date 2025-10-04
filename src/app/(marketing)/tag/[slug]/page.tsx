import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ChevronRight } from 'lucide-react';

import { TagBookmarkCard } from '@/components/tags/tag-bookmark-card';
import { TagFilters } from '@/components/tags/tag-filters';
import { TagHeader } from '@/components/tags/tag-header';
import { TagSidebar } from '@/components/tags/tag-sidebar';
import { Button } from '@/components/ui/button';
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

type TagBookmarkCardData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  domain: string | null;
  imageUrl: string | null;
  createdAt: string;
  likes: number;
  author: {
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
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bookmarkCount: number;
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
};

const getTagPageData = cache(async (slug: string): Promise<TagPageData | null> => {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return null;
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
        )
      `
      )
      .eq('tag_id', tag.id)
      .order('created_at', { ascending: false, foreignTable: 'bookmarks' })
      .limit(40);

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
      };
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
      { username: string; displayName: string | null; avatarUrl: string | null; count: number }
    >();
    const domainMap = new Map<string, number>();

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
            username: author.username,
            displayName: author.displayName,
            avatarUrl: author.avatarUrl,
            count: 1,
          });
        }
      }

      if (bookmark.domain) {
        domainMap.set(bookmark.domain, (domainMap.get(bookmark.domain) ?? 0) + 1);
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
        domain: bookmark.domain,
        imageUrl: bookmark.image_url,
        createdAt: bookmark.created_at,
        likes: likeCount,
        author,
        tags,
      } satisfies TagBookmarkCardData;
    });

    const structuredBookmarks = cardBookmarks.map((bookmark) => ({
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

    const followers = contributorMap.size;
    const avgLikes = cardBookmarks.length
      ? Math.round(totalLikes / cardBookmarks.length)
      : 0;

    const relatedTags = Array.from(relatedTagMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([slug, value]) => ({
        name: value.name,
        slug,
        bookmarkCount: value.count,
      }));

    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((contributor) => ({
        username: contributor.username,
        displayName: contributor.displayName,
        avatarUrl: contributor.avatarUrl,
        bookmarkCount: contributor.count,
      }));

    const popularDomains = Array.from(domainMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, bookmarkCount: count }));

    return {
      tag,
      bookmarks: cardBookmarks,
      sidebar: {
        statistics: {
          totalBookmarks: tag.usage_count ?? cardBookmarks.length,
          thisWeek,
          followers,
          avgLikes,
        },
        relatedTags,
        topContributors,
        popularDomains,
      },
      structuredBookmarks,
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
  const data = await getTagPageData(params.slug);

  if (!data) {
    return {
      title: 'Tag Not Found | HitTags',
    };
  }

  return MetadataGenerator.generateTagPageMetadata({
    ...data.tag,
    color: data.tag.color ?? '#6b7280',
  });
}

export default async function TagDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getTagPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { tag, bookmarks, sidebar, structuredBookmarks } = data;
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
          />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3">
              {/* Filters */}
              <div className="mb-6">
                <TagFilters />
              </div>

              {/* Bookmarks List */}
              <section className="space-y-4">
                {bookmarks && bookmarks.length > 0 ? (
                  <>
                    {bookmarks.map((bookmark) => (
                      <TagBookmarkCard
                        key={bookmark.id}
                        id={bookmark.id}
                        title={bookmark.title}
                        slug={bookmark.slug}
                        description={bookmark.description}
                        domain={bookmark.domain}
                        imageUrl={bookmark.imageUrl}
                        createdAt={bookmark.createdAt}
                        author={bookmark.author}
                        tags={bookmark.tags}
                        likes={bookmark.likes}
                        isLiked={false}
                        isBookmarked={false}
                      />
                    ))}

                    <div className="flex justify-center py-8">
                      <Button className="rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-800">
                        Load More Bookmarks
                      </Button>
                    </div>
                  </>
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
            <TagSidebar {...sidebar} />
          </div>
        </div>
      </main>
    </>
  );
}
