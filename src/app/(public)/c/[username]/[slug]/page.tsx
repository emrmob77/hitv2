import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import { FolderIcon, CalendarIcon, ClockIcon, EyeIcon, UsersIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface PublicBookmarkCardData {
  id: string;
  detailUrl: string;
  visitUrl: string;
  likes: number;
  saves: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  title: string;
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
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const collection = await fetchPublicCollection(username, slug);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  const metaDescription =
    collection.description ||
    `Explore ${collection.name} - A curated collection of quality bookmarks by @${collection.user.username} on ${siteConfig.name}`;

  return {
    title: `${collection.name} - Collection by @${collection.user.username}`,
    description: metaDescription,
    keywords: ['collection', 'bookmarks', collection.name, collection.user.username, 'curated'],
    openGraph: {
      title: `${collection.name} by @${collection.user.username}`,
      description: metaDescription,
      images: collection.cover_image_url ? [collection.cover_image_url] : undefined,
      url: `${BASE_URL}/c/${collection.user.username}/${collection.slug}`,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collection.name} by @${collection.user.username}`,
      description: metaDescription,
      images: collection.cover_image_url ? [collection.cover_image_url] : undefined,
      creator: `@${collection.user.username}`,
    },
    alternates: {
      canonical: `${BASE_URL}/c/${collection.user.username}/${collection.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const collection = await fetchPublicCollection(username, slug);

  if (!collection) {
    notFound();
  }

  const bookmarks = await fetchCollectionBookmarks(collection.id);

  const normalizedBookmarks: PublicBookmarkCardData[] = bookmarks.map((bookmark) => ({
    id: bookmark.id,
    title: bookmark.title,
    description: bookmark.description,
    imageUrl: bookmark.image_url,
    likes: bookmark.like_count ?? 0,
    saves: bookmark.save_count ?? 0,
    shares: bookmark.click_count ?? 0,
    isLiked: false,
    isSaved: false,
    createdAt: bookmark.created_at,
    detailUrl: `/bookmark/${bookmark.id}/${bookmark.slug ?? ''}`,
    visitUrl: bookmark.url,
    author: {
      username: bookmark.author?.username ?? collection.user.username,
      displayName: bookmark.author?.display_name ?? collection.user.display_name,
      avatarUrl: bookmark.author?.avatar_url ?? collection.user.avatar_url,
    },
    tags: bookmark.tags?.map((tag) => ({ name: tag.name, slug: tag.slug })) ?? [],
  }));

  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description || `A curated collection by ${collection.user.display_name || collection.user.username}`,
    url: `${BASE_URL}/c/${collection.user.username}/${collection.slug}`,
    author: {
      '@type': 'Person',
      name: collection.user.display_name || collection.user.username,
      url: `${BASE_URL}/${collection.user.username}`,
    },
    dateCreated: collection.created_at,
    dateModified: collection.updated_at,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.bookmark_count,
      itemListElement: bookmarks.slice(0, 10).map((bookmark, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: bookmark.title,
          description: bookmark.description,
          url: bookmark.url,
        },
      })),
    },
  };

  return (
    <div className="bg-neutral-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-700">
              Home
            </Link>
            <span className="text-xs">›</span>
            <Link href={`/${collection.user.username}`} className="hover:text-neutral-700">
              {collection.user.display_name || collection.user.username}
            </Link>
            <span className="text-xs">›</span>
            <span className="text-neutral-900">{collection.name}</span>
          </nav>

          {/* Collection Header */}
          <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-8">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <FolderIcon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-neutral-900">{collection.name}</h1>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      Public
                    </span>
                  </div>
                  {collection.description && (
                    <p className="mb-4 max-w-3xl text-neutral-600">{collection.description}</p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-neutral-600">
                    <div className="flex items-center space-x-2">
                      {collection.user.avatar_url ? (
                        <img
                          src={collection.user.avatar_url}
                          alt={collection.user.username}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-neutral-200" />
                      )}
                      <Link
                        href={`/${collection.user.username}`}
                        className="cursor-pointer text-neutral-900 hover:text-neutral-700"
                      >
                        {collection.user.display_name || collection.user.username}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="rounded-lg bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-700">
                  <UsersIcon className="mr-2 inline-block h-4 w-4" />
                  Follow
                </button>
                <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                  <ShareIcon className="mr-2 inline-block h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-8 border-t border-neutral-200 pt-6">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-neutral-900">{collection.bookmark_count}</div>
                <div className="text-sm text-neutral-600">Bookmarks</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-neutral-900">-</div>
                <div className="text-sm text-neutral-600">Views</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-neutral-900">-</div>
                <div className="text-sm text-neutral-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-neutral-900">-</div>
                <div className="text-sm text-neutral-600">Saves</div>
              </div>
            </div>
          </section>

          {/* Bookmarks Section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <section className="space-y-4">
                {normalizedBookmarks.length === 0 ? (
                  <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                    <FolderIcon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600">This collection is empty.</p>
                  </div>
                ) : (
                  normalizedBookmarks.map((bookmark, index) => (
                    <TrendingBookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      detailUrl={bookmark.detailUrl}
                      visitUrl={bookmark.visitUrl}
                      rank={index + 1}
                      layout="list"
                    />
                  ))
                )}
              </section>
            </div>
          </div>
        </div>
    </div>
  );
}

async function fetchPublicCollection(
  username: string,
  slug: string
): Promise<Collection | null> {
  const supabase = await createSupabaseServerClient();

  // First get the user by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('username', username)
    .single();

  if (!profile) return null;

  // Then get the collection
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, cover_image_url, bookmark_count, created_at, updated_at')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .eq('privacy_level', 'public')
    .single();

  if (error || !data) {
    console.error('Public collection fetch error:', error);
    return null;
  }

  return {
    ...data,
    user: profile,
  };
}

async function fetchCollectionBookmarks(collectionId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('collection_bookmarks')
    .select(`
      bookmarks (
        id,
        title,
        description,
        url,
        domain,
        favicon_url,
        image_url,
        created_at,
        slug,
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
    `)
    .eq('collection_id', collectionId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Collection bookmarks fetch error:', error);
    return [];
  }

  if (!data) return [];

  return data
    .map((item: any) => (
      item.bookmarks
        ? {
            id: item.bookmarks.id,
            title: item.bookmarks.title,
            description: item.bookmarks.description,
            url: item.bookmarks.url,
            domain: item.bookmarks.domain,
            image_url: item.bookmarks.image_url ?? item.bookmarks.favicon_url,
            slug: item.bookmarks.slug,
            created_at: item.bookmarks.created_at,
            like_count: item.bookmarks.like_count,
            save_count: item.bookmarks.save_count,
            click_count: item.bookmarks.click_count,
            author: item.bookmarks.profiles,
            tags: item.bookmarks.bookmark_tags?.map((entry: any) => entry.tags).filter(Boolean) ?? [],
          }
        : null
    ))
    .filter(Boolean);
}
