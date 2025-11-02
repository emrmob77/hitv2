import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  UsersIcon,
  FolderIcon,
} from "lucide-react";
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  bookmark_count: number;
  view_count: number | null;
  follower_count: number | null;
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

  const totalSaves = normalizedBookmarks.reduce((acc, item) => acc + item.saves, 0);
  const viewCount = collection.view_count ?? 0;

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
          <section className="mb-10 overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-8 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 flex-col gap-6">
                <div>
                  <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-green-700">
                      Public Collection
                    </span>
                    <span className="inline-flex items-center gap-2 text-neutral-500">
                      <EyeIcon className="h-4 w-4" />
                      {viewCount}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="mt-3 max-w-3xl text-lg text-neutral-600">
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <Link href={`/${collection.user.username}`} className="flex items-center gap-2">
                    {collection.user.avatar_url ? (
                      <img
                        src={collection.user.avatar_url}
                        alt={collection.user.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-500">
                        {(collection.user.display_name || collection.user.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-neutral-900">
                        {collection.user.display_name || collection.user.username}
                      </span>
                      <span className="ml-2 text-neutral-500">@{collection.user.username}</span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800">
                  <UsersIcon className="h-4 w-4" />
                  Follow Collection
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100">
                  <ShareIcon className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-neutral-200 bg-white p-6 sm:grid-cols-4">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Bookmarks</span>
                <span className="text-2xl font-semibold text-neutral-900">
                  {collection.bookmark_count}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Views</span>
                <span className="text-2xl font-semibold text-neutral-900">{viewCount}</span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Followers</span>
                <span className="text-2xl font-semibold text-neutral-900">{collection.follower_count ?? 0}</span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Saves</span>
                <span className="text-2xl font-semibold text-neutral-900">{totalSaves}</span>
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
    .select('id, name, description, slug, cover_image_url, bookmark_count, view_count, created_at, updated_at, follower_count')
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
