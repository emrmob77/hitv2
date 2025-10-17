import { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Popular Bookmark Collections',
  description:
    'Discover curated bookmark collections. Find organized resources for any topic or project.',
  alternates: {
    canonical: `${siteConfig.url}/collections`,
  },
  openGraph: {
    title: `Popular Bookmark Collections | ${siteConfig.name}`,
    description:
      'Discover curated bookmark collections. Find organized resources for any topic or project.',
    url: `${siteConfig.url}/collections`,
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Popular Bookmark Collections | ${siteConfig.name}`,
    description:
      'Discover curated bookmark collections. Find organized resources for any topic or project.',
  },
};

export const revalidate = 1800; // Revalidate every 30 minutes

async function getCollections() {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      console.warn('Supabase client not available');
      return [];
    }

    const { data: collections, error } = await supabase
      .from('collections')
      .select(
        `
        id,
        name,
        slug,
        description,
        cover_image_url,
        bookmark_count,
        is_collaborative,
        privacy_level,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
        `
      )
      .eq('privacy_level', 'public')
      .order('bookmark_count', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching collections:', error.message || error);
      return [];
    }

    return collections || [];
  } catch (error) {
    console.error('Error fetching collections (catch):', error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Popular Collections</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Discover curated bookmark collections from the community
        </p>
      </div>

      {/* Collections Grid */}
      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection: any) => (
            <Link
              key={collection.id}
              href={`/c/${collection.profiles?.username}/${collection.slug}`}
              className="block group"
            >
              <div className="h-full p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-md">
                {/* Cover Image */}
                {collection.cover_image_url && (
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                    <img
                      src={collection.cover_image_url}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Collection Info */}
                <div className="flex items-start gap-3 mb-3">
                  {collection.profiles?.avatar_url && (
                    <img
                      src={collection.profiles.avatar_url}
                      alt={collection.profiles.username}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>
                    {collection.bookmark_count} bookmark
                    {collection.bookmark_count !== 1 ? 's' : ''}
                  </span>
                  {collection.is_collaborative && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">Collaborative</span>
                    </>
                  )}
                </div>

                {/* Creator */}
                {collection.profiles && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500">
                      by{' '}
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {collection.profiles.display_name ||
                          collection.profiles.username}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">
            No collections found.
          </p>
        </div>
      )}
    </div>
  );
}
