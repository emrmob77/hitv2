import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { TagHeader } from '@/components/tags/tag-header';
import { TagFilters } from '@/components/tags/tag-filters';
import { TagBookmarkCard } from '@/components/tags/tag-bookmark-card';
import { TagSidebar } from '@/components/tags/tag-sidebar';
import { Button } from '@/components/ui/button';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  usage_count: number;
  is_trending: boolean;
  created_at: string;
}

interface Bookmark {
  id: string;
  title: string;
  description: string | null;
  url: string;
  slug: string | null;
  domain: string | null;
  favicon_url: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    id: string;
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

async function getTagData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tags/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching tag:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getTagData(params.slug);

  if (!data || !data.tag) {
    return {
      title: 'Tag Not Found | HitTags',
    };
  }

  return MetadataGenerator.generateTagPageMetadata(data.tag);
}

export default async function TagDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getTagData(params.slug);

  if (!data || !data.tag) {
    notFound();
  }

  const { tag, bookmarks } = data;
  const structuredData = StructuredDataGenerator.generateTagCollectionSchema(
    tag,
    bookmarks || []
  );

  // Mock data for sidebar (replace with real data from API)
  const sidebarData = {
    statistics: {
      totalBookmarks: tag.usage_count || 0,
      thisWeek: 234,
      followers: 1234,
      avgLikes: 45,
    },
    relatedTags: [
      { name: 'ui-design', slug: 'ui-design', bookmarkCount: 1456 },
      { name: 'ux-research', slug: 'ux-research', bookmarkCount: 987 },
      { name: 'figma', slug: 'figma', bookmarkCount: 1234 },
      { name: 'prototyping', slug: 'prototyping', bookmarkCount: 765 },
    ],
    topContributors: [
      {
        username: 'sarahchen',
        displayName: 'Sarah Chen',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=456',
        bookmarkCount: 127,
      },
      {
        username: 'alexrivera',
        displayName: 'Alex Rivera',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=789',
        bookmarkCount: 98,
      },
      {
        username: 'emmathompson',
        displayName: 'Emma Thompson',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=321',
        bookmarkCount: 76,
      },
    ],
    popularDomains: [
      { domain: 'dribbble.com', bookmarkCount: 234 },
      { domain: 'behance.net', bookmarkCount: 189 },
      { domain: 'figma.com', bookmarkCount: 156 },
      { domain: 'uxdesign.cc', bookmarkCount: 98 },
    ],
  };

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
            bookmarkCount={tag.usage_count || 0}
            followerCount={1234}
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
                    {bookmarks.map((bookmark: Bookmark) => (
                      <TagBookmarkCard
                        key={bookmark.id}
                        id={bookmark.id}
                        title={bookmark.title}
                        slug={bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                        description={bookmark.description}
                        domain={bookmark.domain}
                        imageUrl={bookmark.image_url}
                        createdAt={bookmark.created_at}
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
            <TagSidebar {...sidebarData} />
          </div>
        </div>
      </main>
    </>
  );
}
