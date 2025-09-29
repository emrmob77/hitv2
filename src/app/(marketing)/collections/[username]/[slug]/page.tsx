import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import Link from 'next/link';

interface Props {
  params: {
    username: string;
    slug: string;
  };
}

async function getCollectionData(username: string, slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(
      `${baseUrl}/api/collections/${username}/${slug}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCollectionData(params.username, params.slug);

  if (!data || !data.collection) {
    return {
      title: 'Collection Not Found | HitTags',
    };
  }

  const { collection } = data;
  return MetadataGenerator.generateCollectionMetadata(
    collection,
    params.username,
    collection.user?.display_name
  );
}

export default async function CollectionPage({ params }: Props) {
  const data = await getCollectionData(params.username, params.slug);

  if (!data || !data.collection) {
    notFound();
  }

  const { collection, bookmarks } = data;
  const structuredData = StructuredDataGenerator.generateCollectionSchema(
    collection,
    params.username,
    collection.user?.display_name,
    bookmarks || []
  );

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Collection Header */}
        <div className="mb-8">
          {/* Cover Image */}
          {collection.cover_image_url && (
            <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-6">
              <img
                src={collection.cover_image_url}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Collection Info */}
          <div className="flex items-start gap-4 mb-4">
            {collection.user?.avatar_url && (
              <img
                src={collection.user.avatar_url}
                alt={collection.user.username}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Link
                  href={`/users/${params.username}`}
                  className="hover:underline"
                >
                  by {collection.user?.display_name || params.username}
                </Link>
                <span>•</span>
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
            </div>
          </div>

          {collection.description && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              {collection.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Follow Collection
            </button>
            <button className="px-6 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Share
            </button>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark: any) => (
              <Link
                key={bookmark.id}
                href={`/bookmarks/${bookmark.id}/${bookmark.slug || bookmark.id}`}
                className="block group"
              >
                <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-md">
                  {bookmark.image_url && (
                    <img
                      src={bookmark.image_url}
                      alt={bookmark.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    {bookmark.favicon_url && (
                      <img
                        src={bookmark.favicon_url}
                        alt=""
                        className="w-5 h-5 rounded mt-1 flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {bookmark.title}
                      </h3>
                      {bookmark.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {bookmark.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    {bookmark.domain && <span>{bookmark.domain}</span>}
                    <span>•</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {bookmark.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {bookmark.view_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400">
              No bookmarks in this collection yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
}