import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  usage_count: number;
  is_trending: boolean;
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

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Tag Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-lg"
              style={{ backgroundColor: tag.color }}
            />
            <div>
              <h1 className="text-4xl font-bold">{tag.name}</h1>
              {tag.is_trending && (
                <span className="text-sm text-orange-500 font-medium">
                  🔥 Trending
                </span>
              )}
            </div>
          </div>
          {tag.description && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {tag.description}
            </p>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            {tag.usage_count} bookmark{tag.usage_count !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark: Bookmark) => (
              <a
                key={bookmark.id}
                href={`/bookmarks/${bookmark.id}/${bookmark.slug || bookmark.id}`}
                className="block p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
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
                      className="w-5 h-5 rounded mt-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                      {bookmark.title}
                    </h3>
                    {bookmark.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  {bookmark.domain && <span>{bookmark.domain}</span>}
                  {bookmark.profiles && (
                    <>
                      <span>•</span>
                      <span>
                        @
                        {bookmark.profiles.display_name ||
                          bookmark.profiles.username}
                      </span>
                    </>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400">
              No bookmarks found for this tag yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
